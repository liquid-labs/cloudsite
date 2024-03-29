import commandLineArgs from 'command-line-args'

import { checkFormat } from './check-format'
import { cliSpec } from '../constants'
import { getSiteInfo } from './get-site-info'
import { progressLogger } from '../../lib/shared/progress-logger'
import { verify } from '../../lib/actions/verify'

const handleVerify = async ({ argv, db }) => {
  const verifyOptionsSpec = cliSpec.commands.find(({ name }) => name === 'verify').arguments
  const verifyOptions = commandLineArgs(verifyOptionsSpec, { argv })
  const { format } = verifyOptions
  const apexDomain = verifyOptions['apex-domain']
  const checkContent = verifyOptions['check-content']
  const checkSiteUp = verifyOptions['check-site-up']
  const checkStack = verifyOptions['check-stack']

  checkFormat(format)

  const siteInfo = getSiteInfo({ apexDomain, db })

  const results =
    await verify({ checkContent, checkSiteUp, checkStack, db, siteInfo })
  const summaryStatus = results.reduce((acc, { status : s }) => {
    if (s === 'error') { return 'error' } else if (s === 'failed') { return 'failed' } else { return acc }
  }, 'success')

  const output = { 'overall status' : summaryStatus, checks : results }
  progressLogger.write({ output, format })
}

export { handleVerify }
