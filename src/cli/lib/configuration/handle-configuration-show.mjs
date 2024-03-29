import commandLineArgs from 'command-line-args'

import { cliSpec } from '../../constants'
import { getOptionsSpec } from '../get-options-spec'
import { progressLogger } from '../../../lib/shared/progress-logger'

const handleConfigurationShow = async ({ argv, db }) => {
  const myOptionsSpec = cliSpec
    .commands.find(({ name }) => name === 'configuration')
    .commands.find(({ name }) => name === 'show')
    .arguments || []
  console.log('myOptionsSpec:', myOptionsSpec) // DEBUG
  const showConfigurationCLISpec = getOptionsSpec({ optionsSpec: myOptionsSpec })
  const showConfigurationOptionsSpec = showConfigurationCLISpec.arguments
  const showConfigurationOptions = commandLineArgs(showConfigurationOptionsSpec, { argv })

  const accountSettings = db.account.settings || {}
  return { success: true, data: accountSettings }
}

export { handleConfigurationShow }
