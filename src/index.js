import postcss from 'postcss';

const declWhitelist = ['composes'],
  declFilter = new RegExp( `^(${declWhitelist.join( '|' )})$` ),
  matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)'|(global))$/,
  icssImport = /^:import\((?:"([^"]+)"|'([^']+)')\)/;

const processor = postcss.plugin( 'modules-extract-imports', function ( options ) {
  return ( css ) => {
    let imports = {},
      importIndex = 0,
      createImportedName = options && options.createImportedName || (( importName/*, path*/ ) => `i__imported_${importName.replace( /\W/g, '_' )}_${importIndex++}`);

    // Find any declaration that supports imports
    css.walkDecls( declFilter, ( decl ) => {
      let matches = decl.value.match( matchImports );
      let tmpSymbols;
      if ( matches ) {
        let [/*match*/, symbols, doubleQuotePath, singleQuotePath, global] = matches;
        if (global) {
          // Composing globals simply means changing these classes to wrap them in global(name)
          tmpSymbols = symbols.split(/\s+/).map(s => `global(${s})`)
        } else {
          let path = doubleQuotePath || singleQuotePath;
          imports[path] = imports[path] || {};
          tmpSymbols = symbols.split(/\s+/)
            .map(s => {
              if (!imports[path][s]) {
                imports[path][s] = createImportedName(s, path);
              }
              return imports[path][s];
            });
        }
        decl.value = tmpSymbols.join( ' ' );
      }
    } );

    // If we've found any imports, insert or append :import rules
    let existingImports = {};
    css.walkRules(rule => {
      let matches = icssImport.exec(rule.selector);
      if (matches) {
        let [/*match*/, doubleQuotePath, singleQuotePath] = matches;
        existingImports[doubleQuotePath || singleQuotePath] = rule;
      }
    });

    Object.keys( imports ).reverse().forEach( path => {

      let rule = existingImports[path];
      if (!rule) {
        rule = postcss.rule( {
          selector: `:import("${path}")`,
          raws: { after: "\n" }
        } );
        css.prepend( rule );
      }
      Object.keys( imports[path] ).forEach( importedSymbol => {
        rule.append(postcss.decl( {
          value: importedSymbol,
          prop: imports[path][importedSymbol],
          raws: { before: "\n  " }
        } ) );
      } );
    } );
  };
} );

export default processor;
