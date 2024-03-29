const config = {
  options : {
    includeCookies : { default : false, validation : (v) => typeof v === 'boolean' }
  }
}

const importHandler = ({ /* credentials, */ name, pluginsData, /* siteInfo, */ template }) => {
  const cloudFrontLoggingConfig = template.Resources.SiteCloudFrontDistribution.Properties.DistributionConfig.Logging
  if (cloudFrontLoggingConfig !== undefined) {
    const settings = {
      includeCookies : cloudFrontLoggingConfig.IncludeCookies
    }
    pluginsData[name] = settings
  }
}

const preStackDestroyHandler = async ({ siteTemplate }) => {
  await siteTemplate.destroyCommonLogsBucket()
}

const stackConfig = async ({ siteTemplate, pluginData }) => {
  const { finalTemplate } = siteTemplate

  await siteTemplate.enableCommonLogsBucket()

  finalTemplate.Resources.SiteCloudFrontDistribution.Properties.DistributionConfig.Logging = {
    Bucket         : { 'Fn::GetAtt' : ['commonLogsBucket', 'DomainName'] },
    IncludeCookies : pluginData.settings.includeCookies,
    Prefix         : 'cloudfront-logs/'
  }
}

const cloudfrontLogs = { config, importHandler, preStackDestroyHandler, stackConfig }

export { cloudfrontLogs }
