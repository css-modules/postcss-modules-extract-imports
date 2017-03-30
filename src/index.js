import postcss from 'postcss';
import topologicalSort from './topologicalSort';

const declWhitelist = ['composes'];
const declFilter = new RegExp( `^(${declWhitelist.join( '|' )})$` );
const matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)'|(global))$/;
const icssImport = /^:import\((?:"([^"]+)"|'([^']+)')\)/;

function createParentName(rule, root) {
  return `__${root.index(rule.parent)}_${rule.selector}`;
}

function serializeImports(imports) {
  return imports.map(importPath => '`' + importPath + '`').join(', ');
}

const processor = postcss.plugin('modules-extract-imports', function (options = {}) {
  const failOnWrongOrder = options.failOnWrongOrder;

  return css => {
    const graph = {root: []};

    const existingImports = {};
    const importDecls = {};
    const imports = {};

    let importIndex = 0;

    const createImportedName = typeof options.createImportedName !== 'function'
      ? (importName/*, path*/) => `i__imported_${importName.replace(/\W/g, '_')}_${importIndex++}`
      : options.createImportedName;

    // Check the existing imports order and save refs
    css.walkRules(rule => {
      const matches = icssImport.exec(rule.selector);

      if (matches) {
        const [/*match*/, doubleQuotePath, singleQuotePath] = matches;
        const importPath = doubleQuotePath || singleQuotePath;

        if (!graph[importPath]) {
          graph[importPath] = [];
          graph.root.push(importPath);
        };

        existingImports[importPath] = rule;
      }
    });

    // Find any declaration that supports imports
    css.walkDecls(declFilter, decl => {
      let matches = decl.value.match(matchImports);
      let tmpSymbols;

      if (matches) {
        let [/*match*/, symbols, doubleQuotePath, singleQuotePath, global] = matches;

        if (global) {
          // Composing globals simply means changing these classes to wrap them in global(name)
          tmpSymbols = symbols.split(/\s+/).map(s => `global(${s})`);
        } else {
          const importPath = doubleQuotePath || singleQuotePath;
          const parentRule = createParentName(decl.parent, css);

          importDecls[importPath] = decl;
          imports[importPath] = imports[importPath] || {};


          graph[parentRule] = graph[parentRule] || [];
          graph[importPath] = (graph[importPath] || []).concat(graph[parentRule]);

          graph[parentRule].push(importPath);

          tmpSymbols = symbols.split(/\s+/).map(s => {
            if (!imports[importPath][s]) {
              imports[importPath][s] = createImportedName(s, importPath);
            }

            return imports[importPath][s];
          });
        }

        decl.value = tmpSymbols.join(' ');
      }
    });

    const importsOrder = topologicalSort(graph, failOnWrongOrder);

    if (importsOrder instanceof Error) {
      const importPath = importsOrder.nodes.find(importPath => importDecls.hasOwnProperty(importPath));
      const decl = importDecls[importPath];

      const errMsg = 'Failed to resolve order of composed modules ' + serializeImports(importsOrder.nodes) + '.';

      throw decl.error(errMsg, {
        plugin: 'modules-extract-imports',
        word: 'composes',
      });
    }

    let lastImportRule;
    importsOrder.forEach(path => {
      const importedSymbols = imports[path];
      let rule = existingImports[path];

      if (!rule && importedSymbols) {
        rule = postcss.rule({
          selector: `:import("${path}")`,
          raws: {after: '\n'},
        });

        if (lastImportRule)
          css.insertAfter(lastImportRule, rule);
        else
          css.prepend(rule);
      }

      if (!importedSymbols) return;

      Object.keys(importedSymbols).forEach(importedSymbol => {
        rule.append(postcss.decl({
          value: importedSymbol,
          prop: importedSymbols[importedSymbol],
          raws: {before: '\n  '},
        }));
      });

      lastImportRule = rule;
    });
  };
});

export default processor;
