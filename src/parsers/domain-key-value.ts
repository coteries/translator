import { Context } from '../context'
import { display } from '../display'
import { MissingKeys } from '../missing_keys'
import { Leaf } from '../tree'
import { ParseSheetResult } from './result'

type JsonTree = { [l: string]: { [d: string]: Leaf } }

export const asDomainKeyValue = (context: Context, sheet: string[][]): ParseSheetResult => {
  if (sheet.length === 0) {
    return {
      tree: {},
      missingKeys: {}
    }
  }
  const [header, ...rows] = sheet
  const [_, _2, ...langs] = header as string[]
  const langSize = langs.length
  const langRange = Array.from(Array(langSize).keys())
  if (header) {
    let missingKeys = {} as MissingKeys
    let domain = ''
    const tree = rows.reduce((acc, row) => {
      const [_domain, key, ...values] = row as string[]
      if (key) {
        if ((_domain ?? '').trim()) domain = _domain
        return langRange.reduce((acc2, idx) => {
          const lang = langs[idx]
          const value = values[idx]?.trim()
          const valueWithDefault = value || context.makeEmptyKey(key, lang)
          if (!value) {
            missingKeys = { ...missingKeys, [lang]: [...(missingKeys[lang] ?? []), key] }
          }
          return {
            ...acc2,
            [lang]: {
              ...(acc[lang] ?? {}),
              [domain]: {
                ...(acc?.[lang]?.[domain] || {}),
                [key]: valueWithDefault
              }
            }
          }
        }, acc)
      } else return acc
    }, {} as JsonTree)
    return { tree, missingKeys }
  } else {
    throw new Error('No tree')
  }
}
