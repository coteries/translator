import { describe, expect, it, xit } from '@jest/globals'
import { Context } from '../../src/context'
import { asDomainKeyValue } from '../../src/parsers/domain-key-value'

const context = new Context({
  spreadSheetID: 'test',
  sheetTitle: 'string',
  outputDir: 'string',
  emptyKey: 'empty',
  format: 'domain-key-value'
})

const contextWithEmptyKeyInterpolation = new Context({
  spreadSheetID: 'test',
  sheetTitle: 'string',
  outputDir: 'string',
  emptyKey: 'translate($0,$1)',
  format: 'domain-key-value'
})

const HEADER = ['domains', 'key', 'en', 'fr', 'de', 'it']
describe('domain-key-value parser', () => {
  it('should parse an empty sheet as json', () => {
    const result = asDomainKeyValue(context, [])
    expect(result.tree).toStrictEqual({})
  })
  it('should not produce anything if there is no key', () => {
    const result = asDomainKeyValue(context, [HEADER])
    expect(result.tree).toStrictEqual({})
  })
  it('should parse the header line as the languages', () => {
    const result = asDomainKeyValue(context, [
      HEADER,
      ['common', 'key', 'keyEn', 'keyFr', 'keyDe', 'keyIt']
    ])
    expect(result.tree).toStrictEqual({
      en: { common: { key: 'keyEn' } },
      fr: { common: { key: 'keyFr' } },
      de: { common: { key: 'keyDe' } },
      it: { common: { key: 'keyIt' } }
    })
  })

  it('should replace empty keys', () => {
    const result = asDomainKeyValue(context, [
      HEADER,
      ['common', 'key', 'keyEn', 'keyFr', 'keyDe', 'keyIt'],
      ['common', 'key2', 'keyEn', '', '', 'keyIt']
    ])
    expect(result.tree).toStrictEqual({
      en: { common: { key: 'keyEn', key2: 'keyEn' } },
      fr: { common: { key: 'keyFr', key2: 'empty' } },
      de: { common: { key: 'keyDe', key2: 'empty' } },
      it: { common: { key: 'keyIt', key2: 'keyIt' } }
    })
  })

  it('should send back missing keys', () => {
    const result = asDomainKeyValue(context, [
      HEADER,
      ['common', 'key', 'keyEn', 'keyFr', 'keyDe', 'keyIt'],
      ['common', 'key2', 'keyEn', '', '', 'keyIt']
    ])
    expect(result.missingKeys).toStrictEqual({
      fr: ['key2'],
      de: ['key2']
    })
  })

  it('should replace empty keys and interpolate', () => {
    const result = asDomainKeyValue(contextWithEmptyKeyInterpolation, [
      HEADER,
      ['common', 'key', 'keyEn', 'keyFr', 'keyDe', 'keyIt'],
      ['common', 'key2', 'keyEn', '', '', 'keyIt']
    ])
    expect(result.tree).toStrictEqual({
      en: { common: { key: 'keyEn', key2: 'keyEn' } },
      fr: { common: { key: 'keyFr', key2: 'translate(key2,fr)' } },
      de: { common: { key: 'keyDe', key2: 'translate(key2,de)' } },
      it: { common: { key: 'keyIt', key2: 'keyIt' } }
    })
  })

  it('should ignore keys for which there is no language', () => {
    const result = asDomainKeyValue(context, [
      HEADER,
      ['common', 'key', 'keyEn', 'keyFr', 'keyDe', 'keyIt'],
      ['common', 'key2', 'keyEn', '', '', 'keyIt', 'keyEs']
    ])
    expect(result.tree).toStrictEqual({
      en: { common: { key: 'keyEn', key2: 'keyEn' } },
      fr: { common: { key: 'keyFr', key2: 'empty' } },
      de: { common: { key: 'keyDe', key2: 'empty' } },
      it: { common: { key: 'keyIt', key2: 'keyIt' } }
    })
  })

  it('should trim values to remove useless spaces', () => {
    const result = asDomainKeyValue(context, [
      HEADER,
      ['common', 'key', 'keyEn', 'keyFr ', 'keyDe', 'keyIt'],
      ['common', 'key2', 'keyEn', ' ', ' ', 'keyIt ']
    ])
    expect(result.tree).toStrictEqual({
      en: { common: { key: 'keyEn', key2: 'keyEn' } },
      fr: { common: { key: 'keyFr', key2: 'empty' } },
      de: { common: { key: 'keyDe', key2: 'empty' } },
      it: { common: { key: 'keyIt', key2: 'keyIt' } }
    })
  })
  it('should remember last domain so that we do not have to specify it each row', () => {
    const result = asDomainKeyValue(context, [
      HEADER,
      ['common', 'key', 'keyEn', 'keyFr ', 'keyDe', 'keyIt'],
      ['', 'key2', 'keyEn', ' ', ' ', 'keyIt '],
      ['', 'key3', 'key3En', 'key3Fr', 'key3De ', 'key3It ']
    ])
    expect(result.tree).toStrictEqual({
      en: { common: { key: 'keyEn', key2: 'keyEn', key3: 'key3En' } },
      fr: { common: { key: 'keyFr', key2: 'empty', key3: 'key3Fr' } },
      de: { common: { key: 'keyDe', key2: 'empty', key3: 'key3De' } },
      it: { common: { key: 'keyIt', key2: 'keyIt', key3: 'key3It' } }
    })
  })

  it('should support several domains', () => {
    const result = asDomainKeyValue(context, [
      HEADER,
      ['common', 'key', 'keyEn', 'keyFr ', 'keyDe', 'keyIt'],
      ['', 'key2', 'keyEn', ' ', ' ', 'keyIt '],
      ['', 'key3', 'key3En', 'key3Fr', 'key3De ', 'key3It '],
      ['user', 'key4', 'key4En', 'key4Fr', 'key4De ', 'key4It '],
      ['', 'name', 'name', 'nom', 'name ', 'nome ']
    ])
    expect(result.tree).toStrictEqual({
      en: {
        common: { key: 'keyEn', key2: 'keyEn', key3: 'key3En' },
        user: { key4: 'key4En', name: 'name' }
      },
      fr: {
        common: { key: 'keyFr', key2: 'empty', key3: 'key3Fr' },
        user: { key4: 'key4Fr', name: 'nom' }
      },
      de: {
        common: { key: 'keyDe', key2: 'empty', key3: 'key3De' },
        user: { key4: 'key4De', name: 'name' }
      },
      it: {
        common: { key: 'keyIt', key2: 'keyIt', key3: 'key3It' },
        user: { key4: 'key4It', name: 'nome' }
      }
    })
  })
})
