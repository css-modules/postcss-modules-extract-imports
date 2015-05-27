import postcss from 'postcss';

const declWhitelist = ['extends'],
  declFilter = new RegExp(`^(${declWhitelist.join('|')})$`),
  matchImports = /^([\w ]+) from (?:"([^"]+)"|'([^']+)')$/;

const processor = (css) => {
  let imports = {};

  // Find any declaration that supports imports
  css.eachDecl(declFilter, (decl) => {
    let matches = decl.value.match(matchImports);
    if (matches) {
      let [/*match*/, symbols, doubleQuotePath, singleQuotePath] = matches;
      let path = doubleQuotePath || singleQuotePath;
      imports[path] = imports[path] || {};
      let tmpSymbols = symbols.split(' ')
        .map(s => imports[path][s] = `__tmp_${s}_${processor.getRandomStr()}`);
      decl.value = tmpSymbols.join(' ');
    }
  });

  // If we've found any imports, insert :import rules
  Object.keys(imports).forEach(path => {
    let pathImports = imports[path];
    css.prepend(postcss.rule({
      selector: `:import("${path}")`,
      before: "\n",
      nodes: Object.keys(pathImports).map(importedSymbol => postcss.decl({
        prop: importedSymbol,
        value: pathImports[importedSymbol],
        before: "\n  "
      }))
    }));
  });
};

processor.defaultRandomStr = () => Math.random().toString(36).substr(2, 8);
processor.getRandomStr = processor.defaultRandomStr; // Easy to be mocked out

export default processor;
