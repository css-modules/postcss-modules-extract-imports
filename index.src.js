import postcss from 'postcss'

const declWhitelist = ['extends'],
  declFilter = new RegExp(`^(${declWhitelist.join('|')})$`),
  matchImports = /^([\w ]+) from ("([^"]+)"|'([^']+)')$/

const processor = (css, result) => {
  let imports = {}
  css.eachDecl(declFilter, (decl) => {
    let matches = decl.value.match(matchImports)
    if (matches) {
      let [_, symbols, _, doubleQuotePath, singleQuotePath] = matches,
        path = doubleQuotePath || singleQuotePath
      imports[path] = imports[path] || {}
      let tmpSymbols = symbols.split(' ')
        .map(s => imports[path][s] = `__tmp_${s}_${processor.getRandomStr()}`)
      decl.value = tmpSymbols.join(' ')
    }
  })
  Object.keys(imports).forEach(path => {
    let pathImports = imports[path]
    console.log(pathImports)
    css.prepend(postcss.rule({
      selector: `:import("${path}")`,
      nodes: Object.keys(pathImports).map(importedSymbol => {
        return postcss.decl({prop: importedSymbol, value: pathImports[importedSymbol]})
      })
    }))
  })
}

processor.defaultRandomStr = () => Math.random().toString(36).substr(2, 8)
processor.getRandomStr = processor.defaultRandomStr // Easy to be mocked out

export default processor
