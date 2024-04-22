import { Questioner } from 'question-and-answer'

import { progressLogger } from '../../../lib/shared/progress-logger'

const handleConfigurationSetupLocal = async ({ db }) => {
  const defaultSSOProfile = db.account.localSettings['sso-profile']

  const interrogationBundle = {
    actions : [
      {
        prompt    : "Which local AWS SSO profile should be used for authentication? Enter '-' to use the configured 'default' account.",
        parameter : 'sso-profile',
        default   : defaultSSOProfile
      },
      {
        prompt    : 'Which default format would you prefer?',
        options   : ['json', 'text', 'terminal', 'yaml'],
        default   : 'terminal',
        parameter : 'format'
      },
      {
        prompt    : "In 'quiet' mode, you only get output when an command has completed. In 'non-quiet' mode, you will receive updates as the command is processed. Would you like to activate quiet mode?",
        type      : 'boolean',
        default   : false,
        parameter : 'quiet'
      },
      { review : 'questions' }
    ]
  }

  const questioner = new Questioner({ interrogationBundle, output : progressLogger })
  await questioner.question()

  db.account.localSettings = questioner.values

  return { success : true, userMessage : 'Settings updated.' }
}

export { handleConfigurationSetupLocal }