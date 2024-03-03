import commandLineArgs from 'command-line-args'

import { cliSpec } from '../constants'
import * as optionHandlers from '../../lib/options'

const handleSetOption = async ({ argv, globalOptions, sitesInfo }) => {
  const setOptionOptionsSpec = cliSpec.commands.find(({ name }) => name === 'set-option').arguments
  const setOptionOptions = commandLineArgs(setOptionOptionsSpec, { argv })
  const apexDomain = setOptionOptions['apex-domain']
  const options = (setOptionOptions.option || []).map((spec) => {
    let [name, value] = spec.split(/(?!\\):/)
    value = value.replaceAll(/\\:/g, ':')

    return { name, value }
  })
  const { delete: doDelete, name, value } = setOptionOptions

  if (apexDomain === undefined) {
    process.stderr.write('Must specify site domain.\n')
    process.exit(2) // eslint-disable-line no-process-exit
  }

  if (doDelete === true && (value !== undefined || options.length > 0)) {
    process.stderr.write("The '--delete' option is incompatible with the '--value' and --name-value options.\n")
    process.exit(2) // eslint-disable-line no-process-exit
  } else if (doDelete === true && name === undefined) {
    process.stderr.write("You must specify a '--name' when '--delete' is set.\n")
    process.exit(2) // eslint-disable-line no-process-exit
  } else if (doDelete !== true) {
    if (name !== undefined && value !== undefined) {
      options.push({ name, value })
    } else if (name !== undefined && value === undefined) {
      process.stderr.write("You must specify a '--value' or '--delete' when '--name' is set.\n")
      process.exit(2) // eslint-disable-line no-process-exit
    } else if (name === undefined && value !== undefined) {
      process.stderr.write("You must specify a '--name' when '--value' is set.\n")
      process.exit(2) // eslint-disable-line no-process-exit
    }
  }

  if (doDelete !== true && options.length === 0) {
    process.stderr.write("Invalid options; specify '--name'+'--value', '--delete'/'--name', or one or more '--option' options.\n")
    process.exit(2) // eslint-disable-line no-process-exit
  }

  const siteInfo = sitesInfo[apexDomain]
  if (siteInfo === undefined) {
    process.stderr.write(`No such site '${apexDomain}' found.\n`)
    process.exit(1) // eslint-disable-line no-process-exit
  }

  const { options : siteOptions = {} } = siteInfo

  if (doDelete === true) {
    const { valueContainer, valueKey } = getValueContainerAndKey({ path : name, rootContainer : siteOptions })
    delete valueContainer[valueKey]

    if (Object.keys(siteOptions).length === 0) {
      delete siteInfo.options
    }
  } else {
    for (const { name, value } of options) {
      const [ option ] = name.split('.')
      if (!(option in optionHandlers)) {
        process.stderr.write(`No such option '${option}'; use one of: ${Object.keys(optionHandlers).join(', ')}.\n`)
        process.exit(1) // eslint-disable-line no-process-exit
      }

      const { valueContainer, valueKey } = getValueContainerAndKey({ path : name, rootContainer : siteOptions })
      valueContainer[valueKey] = smartConvert(value)
    }
  }

  siteInfo.options = siteOptions
}

const smartConvert = (value) => {
  if (value === 'true' || value === 'TRUE') {
    return true
  } else if (value === 'false' || value === 'FALSE') {
    return false
  } else if (value.match(/^\s*\d+\s*$/)) {
    return parseInt(value)
  } else if (value.match(/^\s*(?:\d+(?:\.\d+)|\.\d+)\s*$/)) {
    return parseFloat(value)
  } else {
    value = value.trim()
    if (value.startsWith('/')) {
      return value.slice(1)
    } else {
      return value
    }
  }
}

const getValueContainerAndKey = ({ path, rootContainer }) => {
  const pathBits = path.split('.')

  return pathBits.reduce((currContainer, bit, i) => {
    if (i === pathBits.length - 1) {
      return { valueKey : pathBits[i], valueContainer : currContainer }
    } else {
      const container = currContainer[bit]
      if (container === undefined) {
        currContainer[bit] = {}
      }
      return currContainer[bit]
    }
  }, rootContainer)
}

export { handleSetOption }