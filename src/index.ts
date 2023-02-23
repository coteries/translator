#! /usr/bin/env node

import { google } from 'googleapis'
import { Context } from './context'
import { display } from './display'
import { serializeTree } from './serializer'
import { reportMissingKeys } from './missing_keys'
import { parseSheet } from './parsers'

const auth = new google.auth.GoogleAuth({
  keyFile: `${__dirname}/${process.env.SERVICE_ACCOUNT_FILE}`, //the key file
  //url to spreadsheets API
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
})

const main = async (context: Context) => {
  display.info(`Welcome to Coteries Translator v${process.env.VERSION}
Using descriptor:
${JSON.stringify(context, null, 2)}
`)

  const authClient = await auth.getClient()

  const googleSheetsInstance = google.sheets({
    version: 'v4',
    auth: authClient
  })

  const spreadsheet = await googleSheetsInstance.spreadsheets.values.get({
    spreadsheetId: context.spreadSheetID,
    range: context.sheetTitle
  })
  const sheet = spreadsheet

  if (sheet) {
    const grid: string[][] = sheet.data.values as string[][]
    const { tree, missingKeys } = parseSheet(context, grid)
    reportMissingKeys(missingKeys)
    serializeTree(context, tree)
  }
}

try {
  main(Context.parseJson())
} catch (e) {
  display.error(`Please make sure you have a translator.json file in your current folder.
For more info, please check https://coteries.eu.teamwork.com/spaces/coteries-dev/page/14524-translations 
`)
}
