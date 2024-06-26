import { getValueContainerAndKey } from './get-value-container-and-key'
import * as plugins from '../../lib/plugins'
import { progressLogger } from '../../lib/shared/progress-logger'
import { smartConvert } from './smart-convert'

const mapRawOptions = (rawOptions = []) =>
  rawOptions.map((spec) => {
    let [name, value] = spec.split(/(?!\\):/)
    value = value?.replaceAll(/\\:/g, ':') || 'true'
    value = smartConvert(value)

    return { name, value }
  })

const updatePluginSettings = ({ confirmed, doDelete, options, siteInfo }) => {
  if (siteInfo.plugins === undefined) {
    siteInfo.plugins = {}
  }

  for (const { name, value } of options) {
    const pathBits = name.split('.')
    const pluginName = pathBits.shift()

    if (pathBits.length === 0) { // then there are no options, the plugin is just enabled
      if (doDelete === true) {
        delete siteInfo.plugins[pluginName]
      } else {
        siteInfo.plugins[pluginName] = {}
      }
      continue
    }

    const plugin = plugins[pluginName]
    if (plugin === undefined) {
      throw new Error(`No such plugin '${pluginName}'; use one of: ${Object.keys(plugins).join(', ')}.\n`)
    }

    const pluginData = siteInfo.plugins[pluginName] || {}
    siteInfo.plugins[pluginName] = pluginData // in case we just created it
    const pluginSettings = siteInfo.plugins[pluginName].settings || {}
    siteInfo.plugins[pluginName].settings = pluginSettings // in case we just created it
    const spec = plugin.config.options

    const { valueContainer, valueKey } = getValueContainerAndKey({
      path           : pathBits,
      pathPrefix     : pluginName + '.',
      rootContainer  : pluginSettings,
      skipValueCheck : doDelete,
      spec,
      value
    })

    if (doDelete === true && valueKey === undefined) { // then we're deleting/disabling the entire plugin
      if (confirmed === true) {
        const pluginSettings = siteInfo.plugins[pluginName]
        delete siteInfo.plugins[pluginName]
        progressLogger.write(`Deleted plugin settings for '${pluginName}'; was:\n${JSON.stringify(pluginSettings, null, '  ')}\n`)
      } else {
        throw new Error("Interactive confirmation not yet enabled. Use the '--confirmed' option. Note, this will delete all plugin settings and data and cannot be recovered. You must run 'cloudsite update' for this change to take effect. To re-enable the plugin, you must re-initialize all required settings and update the site.\n", 3)
      }
    } else if (doDelete === true) {
      const wasValue = valueContainer[valueKey]
      delete valueContainer[valueKey]
      progressLogger.write(`Deleted option '${name}' (was: '${wasValue}').\n`)
    } else {
      valueContainer[valueKey] = value
      progressLogger.write(`Set '${name}' to '${value}'.\n`)
    }

    // delete settings object if empty
    // TODO: this is insufficient if we have a nested option that's empty, we could get something like:
    // { settings: { blah: {} }}; we need a recursive 'cleanEmptyObjects' or something.
    if (Object.keys(pluginSettings).length === 0) {
      delete siteInfo.plugins[plugin].settings
    }
  }
}

export { mapRawOptions, updatePluginSettings }
