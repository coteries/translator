import { display } from './display'

export type MissingKeys = { [lang: string]: string[] }

export const reportMissingKeys = (mk: MissingKeys) => {
  if (Object.keys(mk).length > 0) {
    display.warning(`There are missing keys for some languages:
        ${JSON.stringify(mk, null, 2)}
`)
  } else {
    display.success('No missing key found. Good Job !')
  }
}
