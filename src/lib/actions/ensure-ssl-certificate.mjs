import { ACMClient, RequestCertificateCommand } from '@aws-sdk/client-acm'

import { Questioner } from 'question-and-answer'

import { findCertificate } from './lib/find-certificate'
import { getCredentials } from '../shared/authentication-lib'
import { progressLogger } from '../shared/progress-logger'

const ensureSSLCertificate = async ({ apexDomain, globalOptions, siteInfo }) => {
  const credentials = getCredentials(globalOptions)

  const acmClient = new ACMClient({
    credentials,
    region : 'us-east-1' // N. Virginia; required for certificate request
  })

  let certCreated = false
  let { certificateArn, status } = await findCertificate({ acmClient, apexDomain })
  if (certificateArn === null) {
    progressLogger.write(`Creating wildcard certificate for '${apexDomain}'...`)
    certificateArn = await createCertificate({ acmClient, apexDomain })
    status = 'PENDING_VALIDATION'
    certCreated = true
  }
  siteInfo.certificateArn = certificateArn

  if (status === 'PENDING_VALIDATION') {
    const interrogationBundle = {
      actions : [
        { statement : `\n<warn>Attention!<rst>\nAn SSL certificate for ${apexDomain} was ${certCreated === true ? 'created' : 'found'}, but it requires validation.\n` },
        {
          prompt    : 'Are you using Route 53 for domain name services for this domain?',
          parameter : 'USES_ROUTE_53',
          paramType : 'boolean'
        }
      ]
    }

    const questioner = new Questioner({ interrogationBundle, output : progressLogger })
    await questioner.question()
    const usesRoute53 = questioner.get('USES_ROUTE_53')

    const accountLocalCertID = certificateArn.replace(/[^/]+\/(.+)/, '$1')
    const certificateConsoleURL =
      `https://us-east-1.console.aws.amazon.com/acm/home?region=us-east-1#/certificates/${accountLocalCertID}`

    if (usesRoute53 === true) {
      progressLogger.writeWithOptions({ breakSpacesOnly : true }, `\nTo validate the certificate, navigate to the following URL and click the 'Create records in Route 53' button.\n\n<em>${certificateConsoleURL}<rst>\n\nSubsequent validation may take up to 30 minutes or more. For further documentation see:\n\nhttps://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html\n`)
    } else {
      progressLogger.writeWithOptions({ breakSpacesOnly : true }, `\nTo validate the certificate, navigate to the following URL:\n\n<em>${certificateConsoleURL}<rst>\n\nClick on the domain certificate that was just created. You will need to go to your DNS provider and create CNAME records for the domain, copying the names and values as they appear on the certificate detail page.\n\nSubsequent validation may take up to 30 minutes or more.\n`)
    }

    throw new Error(apexDomain + ' certificate must be verified.', { cause : 'setup required' })
  }
}

const createCertificate = async ({ acmClient, apexDomain }) => {
  progressLogger.write(`Creating wildcard certificate for '${apexDomain}'...`)
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

export { ensureSSLCertificate }
