import fs from 'fs'

const basedir = `${process.cwd()}/locales`
const langs = fs.readdirSync(basedir)
const tree = langs.reduce((acc, lang) => {
  const domainsFiles = fs.readdirSync(`${basedir}/${lang}`)
  const langs = fs.readdirSync(basedir)
  const domains = domainsFiles.reduce((acc, domainFile) => {
    const [domain, ext] = domainFile.split('.')
    return {
      ...acc,
      [domain]: JSON.parse(fs.readFileSync(`${basedir}/${lang}/${domainFile}`).toString())
    }
  }, {} as { [d: string]: { [k: string]: string } })
  return {
    ...acc,
    [lang]: domains
  }
}, {} as { [l: string]: { [d: string]: { [k: string]: string } } })
const otherLangs = Object.keys(tree).filter(l => l !== 'en')
const defaultLang = 'en'

console.log(`domain\tkey\t${defaultLang}\t${otherLangs.join('\t')}`)
Object.entries(tree[defaultLang]).map(([domain, translations]) => {
  Object.entries(translations).map(([key, value], i) => {
    console.log(
      `${i > 0 ? '' : domain}\t${key}\t"${value}"\t${otherLangs
        .map(l => `"${tree[l]?.[domain]?.[key] ?? ''}"`)
        .join('\t')}`
    )
  })
})
