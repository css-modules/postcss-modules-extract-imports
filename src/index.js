import postcss from 'postcss';

const declWhitelist = ['composes'],
  declFilter = new RegExp( `^(${declWhitelist.join( '|' )})$` ),
  matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)')$/,
  icssImport = /^:import\((?:"([^"]+)"|'([^']+)')\)/;

const processor = postcss.plugin( 'modules-extract-imports', function ( options ) {
  return ( css ) => {
    let imports = {},
      importIndex = 0,
      createImportedName = options && options.createImportedName || (( importName/*, path*/ ) => `i__imported_${importName.replace( /\W/g, '_' )}_${importIndex++}`);

    // Find any declaration that supports imports
    css.eachDecl( declFilter, ( decl ) => {
      let matches = decl.value.match( matchImports );
      if ( matches ) {
        let [/*match*/, symbols, doubleQuotePath, singleQuotePath] = matches;
        let path = doubleQuotePath || singleQuotePath;
        imports[path] = imports[path] || {};
        let tmpSymbols = symbols.split( /\s+/ )
          .map( s => {
            if ( !imports[path][s] ) {
              imports[path][s] = createImportedName( s, path );
            }
            return imports[path][s];
          } );
        decl.value = tmpSymbols.join( ' ' );
      }
    } );

    // If we've found any imports, insert or append :import rules
    let existingImports = {};
    css.eachRule(rule => {
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
          after: "\n"
        } );
        css.prepend( rule );
      }
      Object.keys( imports[path] ).forEach( importedSymbol => {
        rule.push(postcss.decl( {
          value: importedSymbol,
          prop: imports[path][importedSymbol],
          before: "\n  ",
          _autoprefixerDisabled: true
        } ) );
      } );
    } );
  };
} );

export default processor;
