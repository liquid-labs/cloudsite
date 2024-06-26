import { StringOut } from 'magic-print'

import { configureLogger } from '../../../../lib/shared/progress-logger'
import { handleConfigurationShow } from '../handle-configuration-show'

const settingsVal = 'hi'

jest.mock('node:fs/promises', () => ({
  readFile : () => settingsVal
}))

describe('handleConfigurationShow', () => {
  let stringOut
  beforeEach(() => {
    stringOut = new StringOut()
    configureLogger({ out : stringOut })
  })

  test('prints the file contents', async () => {
    const { data } = await handleConfigurationShow({ argv : [], db : { account : { localSettings : settingsVal } } })
    expect(data).toBe(settingsVal)
  })
})
