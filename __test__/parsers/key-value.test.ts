import { describe, expect, it } from '@jest/globals'
import { Context } from '../../src/context'
import { asKeyValue } from '../../src/parsers/key-value'

const context = new Context({
  spreadSheetID: 'test',
  sheetTitle: 'string',
  outputDir: 'string',
  emptyKey: 'empty',
  format: 'key-value'
})

const contextWithEmptyKeyInterpolation = new Context({
  spreadSheetID: 'test',
  sheetTitle: 'string',
  outputDir: 'string',
  emptyKey: 'translate($0,$1)',
  format: 'key-value'
})
describe('json parser', () => {
  it('should parse an empty sheet as json', () => {
    const result = asKeyValue(context, [])
    expect(result.tree).toStrictEqual({})
  })
  it('should not produce anything if there is no key', () => {
    const result = asKeyValue(context, [['', 'en', 'fr', 'de', 'it']])
    expect(result.tree).toStrictEqual({})
  })
  it('should parse the header line as the languages', () => {
    const result = asKeyValue(context, [
      ['', 'en', 'fr', 'de', 'it'],
      ['key', 'keyEn', 'keyFr', 'keyDe', 'keyIt']
    ])
    expect(result.tree).toStrictEqual({
      en: { key: 'keyEn' },
      fr: { key: 'keyFr' },
      de: { key: 'keyDe' },
      it: { key: 'keyIt' }
    })
  })

  it('should replace empty keys', () => {
    const result = asKeyValue(context, [
      ['', 'en', 'fr', 'de', 'it'],
      ['key', 'keyEn', 'keyFr', 'keyDe', 'keyIt'],
      ['key2', 'keyEn', '', '', 'keyIt']
    ])
    expect(result.tree).toStrictEqual({
      en: { key: 'keyEn', key2: 'keyEn' },
      fr: { key: 'keyFr', key2: 'empty' },
      de: { key: 'keyDe', key2: 'empty' },
      it: { key: 'keyIt', key2: 'keyIt' }
    })
  })

  it('should send back missing keys', () => {
    const result = asKeyValue(context, [
      ['', 'en', 'fr', 'de', 'it'],
      ['key', 'keyEn', 'keyFr', 'keyDe', 'keyIt'],
      ['key2', 'keyEn', '', '', 'keyIt']
    ])
    expect(result.missingKeys).toStrictEqual({
      fr: ['key2'],
      de: ['key2']
    })
  })

  it('should replace empty keys and interpolate', () => {
    const result = asKeyValue(contextWithEmptyKeyInterpolation, [
      ['', 'en', 'fr', 'de', 'it'],
      ['key', 'keyEn', 'keyFr', 'keyDe', 'keyIt'],
      ['key2', 'keyEn', '', '', 'keyIt']
    ])
    expect(result.tree).toStrictEqual({
      en: { key: 'keyEn', key2: 'keyEn' },
      fr: { key: 'keyFr', key2: 'translate(key2,fr)' },
      de: { key: 'keyDe', key2: 'translate(key2,de)' },
      it: { key: 'keyIt', key2: 'keyIt' }
    })
  })

  it('should ignore keys for which there is no language', () => {
    const result = asKeyValue(context, [
      ['', 'en', 'fr', 'de', 'it'],
      ['key', 'keyEn', 'keyFr', 'keyDe', 'keyIt'],
      ['key2', 'keyEn', '', '', 'keyIt', 'keyEs']
    ])
    expect(result.tree).toStrictEqual({
      en: { key: 'keyEn', key2: 'keyEn' },
      fr: { key: 'keyFr', key2: 'empty' },
      de: { key: 'keyDe', key2: 'empty' },
      it: { key: 'keyIt', key2: 'keyIt' }
    })
  })

  it('should trim values to remove useless spaces', () => {
    const result = asKeyValue(context, [
      ['', 'en', 'fr', 'de', 'it'],
      ['key', 'keyEn', 'keyFr ', 'keyDe', 'keyIt'],
      ['key2', 'keyEn', ' ', ' ', 'keyIt ']
    ])
    expect(result.tree).toStrictEqual({
      en: { key: 'keyEn', key2: 'keyEn' },
      fr: { key: 'keyFr', key2: 'empty' },
      de: { key: 'keyDe', key2: 'empty' },
      it: { key: 'keyIt', key2: 'keyIt' }
    })
  })
})
