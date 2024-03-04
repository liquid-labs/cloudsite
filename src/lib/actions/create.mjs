import { ACMClient, ListCertificatesCommand, RequestCertificateCommand } from '@aws-sdk/client-acm'
import { CloudFrontClient, GetDistributionCommand } from '@aws-sdk/client-cloudfront'
import {
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
  DescribeStacksCommand
} from '@aws-sdk/client-cloudformation'
import { Route53Client, ChangeResourceRecordSetsCommand, ListHostedZonesCommand } from '@aws-sdk/client-route-53'
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts'

import { getCredentials } from './lib/get-credentials'
import { SiteTemplate } from './lib/site-template'
import { syncSiteContent } from './lib/sync-site-content'

const RECHECK_WAIT_TIME = 2000 // ms
const STACK_CREATE_TIMEOUT = 15 // min; in recent testing, it takes about 7-8 min for stack creation to complete

const create = async ({
  noBuild,
  noDeleteOnFailure,
  siteInfo,
  ...downstreamOptions
}) => {
  const { apexDomain, bucketName } = siteInfo

  const credentials = getCredentials(downstreamOptions)

  const acmClient = new ACMClient({
    credentials,
    region : 'us-east-1' // N. Virginia; required for certificate request
  })

  let { certificateArn, status } = await findCertificate({ acmClient, apexDomain })
  if (certificateArn === null) {
    process.stdout.write(`Creating wildcard certificate for '${apexDomain}'...`)
    certificateArn = await createCertificate({ acmClient, apexDomain })
    status = 'PENDING_VALIDATION'
  }
  siteInfo.certificateArn = certificateArn

  if (status === 'PENDING_VALIDATION') {
    const accountLocalCertID = certificateArn.replace(/[^/]+\/(.+)/, '$1')
    const certificateConsoleURL =
      `https://us-east-1.console.aws.amazon.com/acm/home?region=us-east-1#/certificates/${accountLocalCertID}`
    throw new Error(`Wildcard certificate for '${apexDomain}' found, but requires validation. Please validate the certificate. To validate on S3 when using Route 53 for DNS service, try navigating to the folliwng URL and select 'Create records in Route 53'::\n\n${certificateConsoleURL}\n\nSubsequent validation may take up to 30 minutes. For further documentation:\n\nhttps://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html`)
  }

  await determineBucketName({ apexDomain, bucketName, credentials, siteInfo })
  const stackCreated = await createSiteStack({ credentials, noDeleteOnFailure, siteInfo })
  if (stackCreated === true) {
    await updateSiteInfo({ credentials, siteInfo }) // needed by createDNSRecords
    await Promise.all([
      createDNSRecords({ credentials, siteInfo }),
      syncSiteContent({ credentials, noBuild, siteInfo })
    ])

    process.stdout.write('Done!\n')
  } else {
    process.stdout.write('Stack creation error.\n')
  }
}

const createDNSRecords = async ({ credentials, siteInfo }) => {
  const { apexDomain, cloudFrontDistributionID, region } = siteInfo

  const cloudFrontClient = new CloudFrontClient({ credentials, region })
  const getDistributionCommand = new GetDistributionCommand({ Id : cloudFrontDistributionID })
  const distributionResponse = await cloudFrontClient.send(getDistributionCommand)
  const distributionDomainName = distributionResponse.Distribution.DomainName

  const route53Client = new Route53Client({ credentials, region })
  const hostedZoneID = await getHostedZoneID({ credentials, route53Client, siteInfo })

  const changeResourceRecordSetCommand = new ChangeResourceRecordSetsCommand({
    HostedZoneId : hostedZoneID,
    ChangeBatch  : {
      Comment : `Point '${apexDomain}' and 'www.${apexDomain}' to CloudFront distribution.`,
      Changes : [
        {
          Action            : 'CREATE',
          ResourceRecordSet : {
            Name        : apexDomain,
            AliasTarget : {
              DNSName              : distributionDomainName,
              EvaluateTargetHealth : false,
              HostedZoneId         : 'Z2FDTNDATAQYW2' // Static value specified by API for use with CloudFront aliases
            },
            Type : 'A'
          }
        },
        {
          Action            : 'CREATE',
          ResourceRecordSet : {
            Name        : 'www.' + apexDomain,
            AliasTarget : {
              DNSName              : distributionDomainName,
              EvaluateTargetHealth : false,
              HostedZoneId         : 'Z2FDTNDATAQYW2' // Static value specified by API for use with CloudFront aliases
            },
            Type : 'A'
          }
        }
      ]
    }
  })
  process.stdout.write('Creating Route 53 resource record sets/DNS entries...\n')
  await route53Client.send(changeResourceRecordSetCommand)
}

const findCertificate = async ({ apexDomain, acmClient, nextToken }) => {
  process.stdout.write('Searching for existing certificate...\n')
  const listCertificateInput = { CertificateStatuses : ['PENDING_VALIDATION', 'ISSUED'] }
  const listCertificatesCommand = new ListCertificatesCommand(listCertificateInput)
  const listResponse = await acmClient.send(listCertificatesCommand)

  const domain = '*.' + apexDomain
  for (const { CertificateArn, DomainName, Status } of listResponse.CertificateSummaryList) {
    if (DomainName === domain) {
      return { certificateArn : CertificateArn, status : Status }
    }
  }
  nextToken = listResponse.NextToken
  if (nextToken !== undefined) {
    return await findCertificate({ apexDomain, acmClient, nextToken })
  }
  // else
  return { certificateArn : null, status : null }
}

const convertDomainToBucketName = (domain) => domain.replaceAll(/\./g, '-').replaceAll(/[^a-z0-9-]/g, 'x')

const createCertificate = async ({ acmClient, apexDomain }) => {
  process.stdout.write(`Creating wildcard certificate for '${apexDomain}'...`)
  const input = { // RequestCertificateRequest
    DomainName              : '*.' + apexDomain, // TODO: support more narrow cert?
    ValidationMethod        : 'DNS', // TODO: support email
    SubjectAlternativeNames : [
      apexDomain, 'www.' + apexDomain
    ], /*
    // IdempotencyToken: "STRING_VALUE", TODO: should we use this?
    /* DomainValidationOptions: [ // DomainValidationOptionList : TODO: is this only used for email verification?
      { // DomainValidationOption
        DomainName: "STRING_VALUE", // required
        ValidationDomain: "STRING_VALUE", // required
      },
    ], */
    Options : { // CertificateOptions
      CertificateTransparencyLoggingPreference : 'ENABLED'
    },
    // CertificateAuthorityArn: "STRING_VALUE", TODO: only used for private certs, I think
    /* Tags: [ // TagList : TODO: support tags? tag with the website
      { // Tag
        Key: "STRING_VALUE", // required
        Value: "STRING_VALUE",
      },
    ], */
    KeyAlgorithm : 'RSA_2048' // TODO: support key options"RSA_1024" || "RSA_2048" || "RSA_3072" || "RSA_4096" || "EC_prime256v1" || "EC_secp384r1" || "EC_secp521r1",
  }
  // this method can safely be called multiple times; it'll  match  existing certs (by domain name I'd assume)
  const command = new RequestCertificateCommand(input)
  const response = await acmClient.send(command)

  const { CertificateArn } = response

  return CertificateArn
}

const determineBucketName = async ({ apexDomain, bucketName, credentials, siteInfo }) => {
  process.stdout.write('Getting effective account ID...\n')
  const response = await new STSClient({ credentials }).send(new GetCallerIdentityCommand({}))
  const accountID = response.Account
  siteInfo.accountID = accountID

  if (bucketName === undefined) {
    bucketName = siteInfo.bucketName || convertDomainToBucketName(apexDomain)
  }
  // else, we use the explicit bucketName provided
  process.stdout.write(`Checking bucket '${bucketName}' is free...\n`)

  const s3Client = new S3Client({ credentials })
  const input = { Bucket : bucketName, ExpectedBucketOwner : accountID }

  const command = new HeadBucketCommand(input)
  try {
    await s3Client.send(command)
    throw new Error(`Account already owns bucket '${bucketName}'; delete or specify alternate bucket name.`)
  } catch (e) {
    if (e.name === 'NotFound') {
      siteInfo.bucketName = bucketName
      return bucketName
    }
    // else
    throw e
  }
}

const createSiteStack = async ({ credentials, noDeleteOnFailure, siteInfo }) => {
  const { apexDomain, region } = siteInfo

  const siteTemplate = new SiteTemplate(siteInfo)

  // console.log(siteTemplate.render()) // DEBUG
  // process.exit(0) // DEBUG

  const cloudFormationTemplate = siteTemplate.render()

  const cloudFormationClient = new CloudFormationClient({ credentials, region })
  const stackName = convertDomainToBucketName(apexDomain) + '-stack'
  const createInput = {
    StackName        : stackName,
    TemplateBody     : cloudFormationTemplate,
    DisableRollback  : false,
    Capabilities     : ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
    TimeoutInMinutes : STACK_CREATE_TIMEOUT
  }
  const createCommand = new CreateStackCommand(createInput)
  const createResponse = await cloudFormationClient.send(createCommand)

  const { StackId } = createResponse

  siteInfo.stackName = stackName
  siteInfo.stackArn = StackId

  const stackCreated = await trackStackCreationStatus({ cloudFormationClient, noDeleteOnFailure, stackName })
  return stackCreated
}

const getHostedZoneID = async ({ markerToken, route53Client, siteInfo }) => {
  const listHostedZonesCommand = new ListHostedZonesCommand({ marker : markerToken })
  const listHostedZonesResponse = await route53Client.send(listHostedZonesCommand)

  for (const { Id, Name } of listHostedZonesResponse.HostedZones) {
    if (Name === siteInfo.apexDomain + '.') {
      return Id.replace(/\/[^/]+\/(.+)/, '$1') // /hostedzone/XXX -> XXX
    }
  }

  if (listHostedZonesResponse.IsTruncated === true) {
    return await getHostedZoneID({ markerToken : listHostedZonesResponse.NewMarker, route53Client, siteInfo })
  }
}

const trackStackCreationStatus = async ({ cloudFormationClient, noDeleteOnFailure, stackName }) => {
  let stackStatus, previousStatus
  do {
    const describeInput = { StackName : stackName }
    const describeCommand = new DescribeStacksCommand(describeInput)
    const describeResponse = await cloudFormationClient.send(describeCommand)

    stackStatus = describeResponse.Stacks[0].StackStatus

    if (stackStatus === 'CREATE_IN_PROGRESS' && previousStatus === undefined) {
      process.stdout.write('Creating stack')
    } else if (stackStatus === 'ROLLBACK_IN_PROGRESS' && previousStatus !== 'ROLLBACK_IN_PROGRESS') {
      process.stdout.write('\nRollback in progress')
    } else {
      process.stdout.write('.')
    }

    previousStatus = stackStatus
    await new Promise(resolve => setTimeout(resolve, RECHECK_WAIT_TIME))
  } while (stackStatus.match(/_IN_PROGRESS$/))

  if (stackStatus === 'ROLLBACK_COMPLETE' && noDeleteOnFailure !== true) {
    process.stdout.write(`\nDeleting stack '${stackName}'... `)
    const deleteInput = { StackName : stackName }
    const deleteCommand = new DeleteStackCommand(deleteInput)
    await cloudFormationClient.send(deleteCommand)

    process.stdout.write('done.\n')
  } else {
    process.stdout.write('\nStack status: ' + stackStatus + '\n')
  }

  return stackStatus === 'CREATE_COMPLETE'
}

const updateSiteInfo = async ({ credentials, siteInfo }) => {
  const { region, stackName } = siteInfo
  process.stdout.write('Gathering information from stack...\n')
  const cloudFormationClient = new CloudFormationClient({ credentials, region })
  const describeCommand = new DescribeStacksCommand({ StackName : stackName })
  const describeResponse = await cloudFormationClient.send(describeCommand)
  const cloudFrontDistributionID = describeResponse
    .Stacks[0].Outputs.find(({ OutputKey }) => OutputKey === 'CloudFrontDist').OutputValue

  siteInfo.cloudFrontDistributionID = cloudFrontDistributionID
}

export { create }
