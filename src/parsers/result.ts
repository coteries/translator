import { MissingKeys } from '../missing_keys'
import { Tree } from '../tree'

export type ParseSheetResult = {
  tree: Tree
  missingKeys: MissingKeys
}
