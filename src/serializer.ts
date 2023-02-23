import fs from 'fs'
import { Context, OutputFormat } from './context'
import { display } from './display'
import { Leaf, Tree } from './tree'

const escapeXMLValue = (str: string) => str.replace(/&/g, '&amp;').replace(/'/g, `\\'`)

type Serializer = {
  fileName: (key: string) => string
  serialize: (l: Leaf) => string
  computePrefix?: (key: string, prefix: string[]) => string
}
const JsonSerializer: Serializer = {
  fileName: k => `${k}.json`,
  serialize: l => JSON.stringify(l, null, 2)
}

const IOSSerializer: Serializer = {
  fileName: () => `Localizable.strings`,
  serialize: l =>
    Object.entries(l)
      .map(([k, v]) => `"${k}"="${v}";`)
      .join('\n'),
  computePrefix: (key: string, prefix: string[]) => {
    return [...prefix, `${key}.lproj`].join('/')
  }
}

const AndroidSerializer: Serializer = {
  fileName: () => `strings.xml`,
  serialize: l => `<?xml version="1.0" encoding="utf-8"?>
<resources>
${Object.entries(l)
  .map(([k, v]) => `  <string name="${k}">${escapeXMLValue(v)}</string>`)
  .join('\n')}
</resources>
`,
  computePrefix: (key: string, prefix: string[]) => {
    return [...prefix, `values${key === 'en' ? '' : `-${key}`}`].join('/')
  }
}

const Serializers: { [f in OutputFormat]: Serializer } = {
  json: JsonSerializer,
  ios: IOSSerializer,
  android: AndroidSerializer
}

export const serializeTree = (context: Context, tree: Tree) => {
  const serializer = Serializers[context.outputFormat]
  const isLeaf = (obj: Leaf | Tree) => !!Object.values(obj).find(v => typeof v === 'string')
  let createdDirs: string[] = []
  const travel = (t: Leaf | Tree, prefix: string[] = []) => {
    Object.entries(t).map(([k, v]) => {
      if (isLeaf(v)) {
        // write the file
        const dir = `${context.outputDir}/${
          serializer.computePrefix ? serializer.computePrefix(k, prefix) : prefix.join('/')
        }`
        if (!createdDirs.includes(dir)) {
          fs.mkdirSync(dir, { recursive: true })
          createdDirs = [...createdDirs, dir]
        }
        const file = `${dir}${dir.endsWith('/') ? '' : '/'}${serializer.fileName(k)}`
        display.success(`Creating ${file} with format: ${context.outputFormat}`)
        fs.writeFileSync(file, serializer.serialize(v as Leaf))
      } else {
        travel(v, [...prefix, k])
      }
    })
  }
  travel(tree)
}
