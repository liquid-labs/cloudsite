import yaml from 'js-yaml'

import { ACMClient } from '@aws-sdk/client-acm'
import { CloudFormationClient, DescribeStacksCommand, GetTemplateCommand } from '@aws-sdk/client-cloudformation'

import { getAccountID } from '../shared/get-account-id'
import { getCredentials } from '../shared/authentication-lib'
import { findBucketByTags } from '../shared/find-bucket-by-tags'
import { findCertificate } from './lib/find-certificate'
import * as plugins from '../plugins'
import { progressLogger } from '../shared/progress-logger'

const doImportSite = async ({ apexDomain, commonLogsBucket, db, globalOptions, region, sourcePath, sourceType, stackName }) => {
  const siteInfo = { apexDomain, stackName, region, sourcePath, sourceType }
  const credentials = getCredentials(globalOptions)

  const acmClient = new ACMClient({ credentials, region : 'us-east-1' }) // certificates are always in us-east-1
  const { certificateArn } = await findCertificate({ apexDomain, acmClient })
  siteInfo.certificateArn = certificateArn

  const accountID = await getAccountID({ credentials })
  db.account.accountID = accountID

  progressLogger?.write(`Examining stack '${stackName}' outputs...\n`)
  const cloudFormationClient = new CloudFormationClient({ credentials, region })
  const describeStacksCommand = new DescribeStacksCommand({ StackName : stackName })
  const stacksInfo = await cloudFormationClient.send(describeStacksCommand)

  const getTemplateCommand = new GetTemplateCommand({ StackName : stackName })
  const templateBody = (await cloudFormationClient.send(getTemplateCommand)).TemplateBody
  const template = yaml.load(templateBody)

  siteInfo.oacName = template.Resources.SiteCloudFrontOriginAccessControl.Properties.OriginAccessControlConfig.Name

  const stackOutputs = stacksInfo.Stacks[0].Outputs || []
  for (const { OutputKey: key, OutputValue: value } of stackOutputs) {
    if (key === 'SiteS3Bucket') {
      siteInfo.siteBucketName = value

      if (commonLogsBucket === undefined) {
        commonLogsBucket = await findBucketByTags({
          credentials,
          description : 'common logs',
          tags        : [
            { key : 'site', value : apexDomain },
            { key : 'function', value : 'common logs storage' }
          ]
        })
      }
      if (commonLogsBucket !== undefined && commonLogsBucket !== 'NONE') {
        siteInfo.commonLogsBucket = commonLogsBucket
      }
    } else if (key === 'SiteCloudFrontDistribution') {
      siteInfo.cloudFrontDistributionID = value
    }
  } // for (... of stackOutputs)

  progressLogger?.write('Loading plugins data...\n')

  const pluginsData = {}
  siteInfo.plugins = pluginsData

  for (const pluginName of Object.keys(plugins)) {
    progressLogger?.write(`Importing plugin settings for '${pluginName}'...\n`)
    const { importHandler } = plugins[pluginName]
    if (importHandler === undefined) {
      throw new Error(`Plugin '${pluginName}' does not define 'importHandler'; cannot  continue with import.`)
    }

    await importHandler({ credentials, name : pluginName, pluginsData, siteInfo, template })
  }

  return siteInfo
}

export { doImportSite }
