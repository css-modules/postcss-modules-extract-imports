import postcss from 'postcss';

const declWhitelist = ['composes'],
  declFilter = new RegExp(`^(${declWhitelist.join('|')})$`),
  matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)')$/;

const processor = postcss.plugin('modules-extract-imports', function (options) {
  return (css) => {
    let imports = {},
      importIndex = 0,
      createImportedName = options && options.createImportedName || ((importName/*, path*/) => `i__imported_${importName.replace(/\W/g, '_')}_${importIndex++}`);

    // Find any declaration that supports imports
    css.eachDecl(declFilter, (decl) => {
      let matches = decl.value.match(matchImports);
      if (matches) {
        let [/*match*/, symbols, doubleQuotePath, singleQuotePath] = matches;
        let path = doubleQuotePath || singleQuotePath;
        imports[path] = imports[path] || {};
        let tmpSymbols = symbols.split(/\s+/)
          .map(s => {
            if (!imports[path][s]) {
              imports[path][s] = createImportedName(s, path);
            }
            return imports[path][s];
          });
        decl.value = tmpSymbols.join(' ');
      }
    });

    //Find any custom media queries with imports
    css.eachAtRule('custom-media', (atRule) => {
      let matches = atRule.params.match(matchImports);
      if (matches) {
        let [/*match*/, symbol, doubleQuotePath, singleQuotePath] = matches;
        let path = doubleQuotePath || singleQuotePath;
        imports[path] = imports[path] || {};
        imports[path][symbol] = '--' + createImportedName(symbol, path);
        atRule.params = `${symbol} (${imports[path][symbol]})`;
      }
    });

    // If we've found any imports, insert :import rules
    Object.keys(imports).reverse().forEach(path => {
      let pathImports = imports[path];
      css.prepend(postcss.rule({
        selector: `:import("${path}")`,
        after: "\n",
        nodes: Object.keys(pathImports).map(importedSymbol => postcss.decl({
          value: importedSymbol,
          prop: pathImports[importedSymbol],
          before: "\n  ",
          _autoprefixerDisabled: true
        }))
      }));
    });
  };
});

export default processor;
