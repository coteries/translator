import { describe, expect, it, jest, xit } from '@jest/globals'
import { Context } from '../src/context'
import fs from 'fs'
import { serializeTree } from '../src/serializer'

jest.mock('fs')

const context = new Context({
  spreadSheetID: 'test',
  sheetTitle: 'string',
  outputDir: 'dist-test',
  emptyKey: 'empty',
  format: 'key-value'
})

const iosContext = new Context({
  spreadSheetID: 'test',
  sheetTitle: 'string',
  outputDir: 'dist-test',
  emptyKey: 'empty',
  format: 'key-value',
  outputFormat: 'ios'
})
const androidContext = new Context({
  spreadSheetID: 'test',
  sheetTitle: 'string',
  outputDir: 'dist-test',
  emptyKey: 'empty',
  format: 'key-value',
  outputFormat: 'android'
})

const treeToSerialize = {
  en: {
    key: 'valueEN',
    first_name: 'Firstname',
    last_name: 'Lastname'
  },
  fr: {
    key: 'valueFR',
    first_name: 'Prénom',
    last_name: 'Nom de famille'
  },
  de: {
    key: 'valueDE',
    first_name: 'Vorname',
    last_name: 'Nachname'
  }
}

const complexTreeToSerialize = {
  en: {
    domain: { key: 'valueEN' },
    user: { name: 'name', gender: 'gender' }
  },
  fr: {
    domain: { key: 'valueFR' },
    user: { name: 'nom', gender: 'sexe' }
  },
  de: {
    domain: { key: 'valueDE' },
    user: { name: 'vorname', gender: 'Sex' }
  }
}

const androidSpecialtreeToSerialize = {
  en: {
    key: `Don't`
  },
  fr: {
    key: 'machin & machin'
  },
  de: {
    key: 'value'
  }
}

describe('serializer', () => {
  it('should serialize json', () => {
    serializeTree(context, treeToSerialize)
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/`, { recursive: true })
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/en.json`,
      JSON.stringify(treeToSerialize.en, null, 2)
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/fr.json`,
      JSON.stringify(treeToSerialize.fr, null, 2)
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/de.json`,
      JSON.stringify(treeToSerialize.de, null, 2)
    )
  })

  it('should serialize any tree in json', () => {
    serializeTree(context, complexTreeToSerialize)
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/en`, { recursive: true })
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/fr`, { recursive: true })
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/de`, { recursive: true })
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/en/domain.json`,
      JSON.stringify(complexTreeToSerialize.en.domain, null, 2)
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/en/user.json`,
      JSON.stringify(complexTreeToSerialize.en.user, null, 2)
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/fr/domain.json`,
      JSON.stringify(complexTreeToSerialize.fr.domain, null, 2)
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/fr/user.json`,
      JSON.stringify(complexTreeToSerialize.fr.user, null, 2)
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/de/domain.json`,
      JSON.stringify(complexTreeToSerialize.de.domain, null, 2)
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/de/user.json`,
      JSON.stringify(complexTreeToSerialize.de.user, null, 2)
    )
  })

  it('should serialize a tree for ios', () => {
    serializeTree(iosContext, treeToSerialize)
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/en.lproj`, {
      recursive: true
    })
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/fr.lproj`, {
      recursive: true
    })
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/de.lproj`, {
      recursive: true
    })
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/en.lproj/Localizable.strings`,
      `"key"="valueEN";\n"first_name"="Firstname";\n"last_name"="Lastname";`
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/fr.lproj/Localizable.strings`,
      `"key"="valueFR";\n"first_name"="Prénom";\n"last_name"="Nom de famille";`
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/de.lproj/Localizable.strings`,
      `"key"="valueDE";\n"first_name"="Vorname";\n"last_name"="Nachname";`
    )
  })

  it('should serialize a tree for android', () => {
    // TODO test escaped characters
    serializeTree(androidContext, treeToSerialize)
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/values`, {
      recursive: true
    })
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/values-fr`, {
      recursive: true
    })
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/values-de`, {
      recursive: true
    })
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/values/strings.xml`,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="key">valueEN</string>
  <string name="first_name">Firstname</string>
  <string name="last_name">Lastname</string>
</resources>
`
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/values-fr/strings.xml`,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="key">valueFR</string>
  <string name="first_name">Prénom</string>
  <string name="last_name">Nom de famille</string>
</resources>
`
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/values-de/strings.xml`,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="key">valueDE</string>
  <string name="first_name">Vorname</string>
  <string name="last_name">Nachname</string>
</resources>
`
    )
  })

  it('should serialize a tree with special chars for android', () => {
    // TODO test escaped characters
    serializeTree(androidContext, androidSpecialtreeToSerialize)
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/values`, {
      recursive: true
    })
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/values-fr`, {
      recursive: true
    })
    expect(fs.mkdirSync as jest.Mock).toHaveBeenCalledWith(`dist-test/values-de`, {
      recursive: true
    })
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/values/strings.xml`,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="key">Don\\'t</string>
</resources>
`
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/values-fr/strings.xml`,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="key">machin &amp; machin</string>
</resources>
`
    )
    expect(fs.writeFileSync as jest.Mock).toHaveBeenCalledWith(
      `dist-test/values-de/strings.xml`,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="key">value</string>
</resources>
`
    )
  })
})
