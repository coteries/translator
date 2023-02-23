import { describe, expect, it } from '@jest/globals'
import { Context } from '../src/context'

describe('Context', () => {
  it('should ensure that a context file is present', () => {
    expect(() => {
      Context.parseJson()
    }).toThrow(/translator.json not found in/)
  })
  it('should throw an exception if translator json is invalid', () => {
    expect(
      () =>
        new Context({
          toto: 'tutu'
        })
    ).toThrow(/Cannot parse spreadSheetID from your descriptor/)
  })
  it('should throw an exception if format is invalid', () => {
    expect(
      () =>
        new Context({
          spreadSheetID: 'test',
          sheetTitle: 'string',
          outputDir: 'string',
          emptyKey: 'empty',
          format: 'invalid'
        })
    ).toThrow(/invalid format, please use one in /)
  })
  it('should return a valid context if everything is ok', () => {
    const context = new Context({
      spreadSheetID: 'test',
      sheetTitle: 'sheetTitle',
      outputDir: 'dist',
      emptyKey: 'empty',
      format: 'key-value',
      outputFormat: 'json'
    })
    expect(context.emptyKey).toBe('empty')
    expect(context.spreadSheetID).toBe('test')
    expect(context.sheetTitle).toBe('sheetTitle')
    expect(context.outputDir).toBe('dist')
    expect(context.emptyKey).toBe('empty')
    expect(context.format).toBe('key-value')
    expect(context.outputFormat).toBe('json')
  })

  it('should have default values', () => {
    const context = new Context({
      spreadSheetID: 'test',
      sheetTitle: 'sheetTitle',
      outputDir: 'dist',
      emptyKey: 'empty'
    })
    expect(context.emptyKey).toBe('empty')
    expect(context.spreadSheetID).toBe('test')
    expect(context.sheetTitle).toBe('sheetTitle')
    expect(context.outputDir).toBe('dist')
    expect(context.emptyKey).toBe('empty')
    expect(context.format).toBe('key-value')
    expect(context.outputFormat).toBe('json')
  })
})
