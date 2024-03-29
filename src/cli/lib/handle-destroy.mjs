import commandLineArgs from 'command-line-args'

import { cliSpec } from '../constants'
import { destroy } from '../../lib/actions/destroy'
import { errorOut } from './error-out'
import { getSiteInfo } from './get-site-info'
import { progressLogger } from '../../lib/shared/progress-logger'

const handleDestroy = async ({ argv, db }) => {
  const destroyOptionsSpec = cliSpec.commands.find(({ name }) => name === 'destroy').arguments
  const destroyOptions = commandLineArgs(destroyOptionsSpec, { argv })
  const apexDomain = destroyOptions['apex-domain']
  const { confirmed } = destroyOptions

  const siteInfo = getSiteInfo({ apexDomain, db })

  if (confirmed !== true) {
    errorOut("Interactive mode not yet implement. You must include the '--confirmed' option.\n", 3)
  }

  const deleted = await destroy({ db, siteInfo, verbose : true })

  if (deleted === true) {
    progressLogger.write(`\n${apexDomain} deleted.\nRemoving ${apexDomain} from local DB.\n`)
    delete db.sites[apexDomain]
  } else {
    progressLogger.write(`\nThe delete has failed, which is expected because the 'replicated Lambda functions' need to be cleared by AWS before all resources can be deleted. This can take 30 min to a few hours.\n\nThe site has been marked for cleanup and you can now create new sites using the '${apexDomain}' domain.\n\nYou can complete deletion by executing:\ncloudsite cleanup\n`)

    const now = new Date()
    const remindAfter = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    siteInfo.lastCleanupAttempt = now.toISOString()
    db.toCleanup[apexDomain] = siteInfo
    db.reminders.push({
      todo        : `Cleanup partially deleted site '${apexDomain}'. Try:\ncloudsite cleanup`,
      remindAfter : remindAfter.toISOString(),
      references  : apexDomain
    })
    delete db.sites[apexDomain]
  }
}

export { handleDestroy }
