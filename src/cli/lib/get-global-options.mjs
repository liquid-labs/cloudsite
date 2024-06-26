import commandLineArgs from 'command-line-args'

import { checkFormat } from './check-format'
import { globalOptionsSpec } from '../constants'

let globalOptionsCache

const getGlobalOptions = ({ db }) => {
  if (globalOptionsCache !== undefined) {
    return globalOptionsCache
  } // else

  const defaultOptions = db?.account?.localSettings || {}

  const overrideOptions = commandLineArgs(globalOptionsSpec, { partial : true })
  delete overrideOptions._unknown // don't need or want this

  const globalOptions = Object.assign({}, defaultOptions, overrideOptions)
  if (overrideOptions['sso-profile'] !== undefined) {
    globalOptions.ssoCLIOverride = true
  }

  const { format, verbose } = globalOptions

  checkFormat(format)

  let { quiet } = globalOptions
  // process.stdin.isTTY =~ shell program (true) or pipe (false)
  quiet = quiet || (verbose !== true && (format === 'json' || format === 'yaml' || !process.stdin.isTTY))
  globalOptions.quiet = quiet

  globalOptionsCache = globalOptions

  return globalOptions
}

export { getGlobalOptions }
