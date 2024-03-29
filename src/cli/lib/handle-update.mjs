import commandLineArgs from 'command-line-args'

import { cliSpec } from '../constants'
import { getSiteInfo } from './get-site-info'
import { update } from '../../lib/actions/update'

const handleUpdate = async ({ argv, db }) => {
  const updateOptionsSpec = cliSpec.commands.find(({ name }) => name === 'update').arguments
  const updateOptions = commandLineArgs(updateOptionsSpec, { argv })
  const apexDomain = updateOptions['apex-domain']
  const doBilling = updateOptions['do-billing']
  const doContent = updateOptions['do-content']
  const doDNS = updateOptions['do-dns']
  const doStack = updateOptions['do-stack']
  const noBuild = updateOptions['no-build']
  const noCacheInvalidation = updateOptions['no-cache-invalidation']

  const siteInfo = getSiteInfo({ apexDomain, db })

  await update({ db, doBilling, doContent, doDNS, doStack, noBuild, noCacheInvalidation, siteInfo })
}

export { handleUpdate }
