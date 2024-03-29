import { getPrinter } from 'magic-print'

const progressLogger = {}

const configureLogger = (options) => {
  const print = getPrinter(options)

  progressLogger.write = (...chunk) => {
    // do options here so it'll react to changes
    const { quiet } = options

    if (quiet !== true) {
      print(...chunk)
    }
  }
}

export { configureLogger, progressLogger }
