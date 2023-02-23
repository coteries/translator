import { Context } from '../context'
import { asDomainKeyValue } from './domain-key-value'
import { asKeyValue } from './key-value'
import { ParseSheetResult } from './result'

export const parseSheet = (context: Context, sheet: string[][]): ParseSheetResult => {
  switch (context.format) {
    case 'key-value':
      return asKeyValue(context, sheet)
    case 'domain-key-value':
      return asDomainKeyValue(context, sheet)
  }
}
