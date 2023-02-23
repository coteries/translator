export const Formats = ['key-value', 'domain-key-value'] as const
export const OutputFormats = ['json', 'ios', 'android'] as const

export type Format = (typeof Formats)[number]
export type OutputFormat = (typeof OutputFormats)[number]

const DEFAULT_EMPTY_KEY = 'Translate($0, $1)'
const DEFAULT_FORMAT: Format = 'key-value'
const DEFAULT_OUTPUT_FORMAT: OutputFormat = 'json'
class FormatError extends Error {
  constructor(msg: string) {
    super(msg)
  }
}
export class Context {
  readonly spreadSheetID: string
  readonly sheetTitle: string
  readonly outputDir: string
  readonly emptyKey: string
  readonly format: Format
  readonly outputFormat: OutputFormat

  constructor(descriptor: any) {
    const _getOrThrow = (key: string): string => {
      if (!descriptor[key] || typeof descriptor[key] !== 'string') {
        throw new FormatError(`Cannot parse ${key} from your descriptor`)
      } else {
        return descriptor[key] as string
      }
    }
    const _exists = (key: string): boolean => {
      return !!descriptor[key] && typeof descriptor[key] === 'string'
    }
    this.spreadSheetID = _getOrThrow('spreadSheetID')
    this.sheetTitle = _getOrThrow('sheetTitle')
    this.outputDir = _getOrThrow('outputDir')
    this.emptyKey = _exists('emptyKey') ? _getOrThrow('emptyKey') : DEFAULT_EMPTY_KEY

    if (_exists('format')) {
      const mbFormat = _getOrThrow('format') as Format
      if (Formats.includes(mbFormat)) {
        this.format = mbFormat
      } else {
        throw new FormatError(`invalid format, please use one in ${JSON.stringify(Formats)}`)
      }
    } else {
      this.format = DEFAULT_FORMAT
    }

    if (_exists('outputFormat')) {
      const mbFormat = _getOrThrow('outputFormat') as OutputFormat
      if (OutputFormats.includes(mbFormat)) {
        this.outputFormat = mbFormat
      } else {
        throw new FormatError(`invalid outputFormat, please use one in ${JSON.stringify(Formats)}`)
      }
    } else {
      this.outputFormat = DEFAULT_OUTPUT_FORMAT
    }
  }

  public makeEmptyKey(key: string, lang: string) {
    return this.emptyKey!.replace('$0', key).replace('$1', lang)
  }

  static parseJson(): Context {
    try {
      return new Context(require(process.cwd() + '/translator.json'))
    } catch (e) {
      if (!(e instanceof FormatError)) {
        throw new Error(`translator.json not found in ${process.cwd()}`)
      }
      throw e
    }
  }
}
