import * as acorn from 'acorn';
import { generate } from 'astring';

/**
 * Parse a JS data file (e.g., coverages.js) that exports a named array.
 * Returns { exportName, data: [...] }
 *
 * Handles formats like:
 *   export const coverages = [ ... ];
 *   export const industries = [ ... ];
 */
export function parseDataFile(source) {
  const ast = acorn.parse(source, {
    sourceType: 'module',
    ecmaVersion: 2022,
  });

  const exports = {};

  for (const node of ast.body) {
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      const decl = node.declaration;
      if (decl.type === 'VariableDeclaration') {
        for (const declarator of decl.declarations) {
          const name = declarator.id.name;
          const value = evalNode(declarator.init, source);
          exports[name] = value;
        }
      }
    }
  }

  const names = Object.keys(exports);
  if (names.length === 0) throw new Error('No named exports found');

  return { exports, primaryExport: names[0], data: exports[names[0]] };
}

/**
 * Serialize data back to a JS export file.
 * Takes the export name and data, returns valid JS source code.
 */
export function serializeDataFile(exportName, data) {
  const json = JSON.stringify(data, null, 2);
  return `export const ${exportName} = ${json};\n`;
}

/**
 * Parse a cross-links file with multiple named exports of objects.
 */
export function parseCrossLinksFile(source) {
  return parseDataFile(source).exports;
}

/**
 * Serialize a cross-links file back to JS.
 */
export function serializeCrossLinksFile(exports) {
  let result = '// Cross-linking maps for dense internal linking\n';
  for (const [name, value] of Object.entries(exports)) {
    result += `export const ${name} = ${JSON.stringify(value, null, 2)};\n\n`;
  }
  return result;
}

// Evaluate an AST node to a JS value (supports literals, arrays, objects)
function evalNode(node, source) {
  if (!node) return undefined;

  switch (node.type) {
    case 'Literal':
      return node.value;

    case 'TemplateLiteral': {
      // Simple template literals without expressions
      if (node.expressions.length === 0) {
        return node.quasis[0].value.cooked;
      }
      // Template with expressions: extract raw source
      return source.slice(node.start + 1, node.end - 1);
    }

    case 'ArrayExpression':
      return node.elements.map((el) => evalNode(el, source));

    case 'ObjectExpression': {
      const obj = {};
      for (const prop of node.properties) {
        if (prop.type === 'SpreadElement') continue;
        const key =
          prop.key.type === 'Identifier'
            ? prop.key.name
            : prop.key.type === 'Literal'
              ? prop.key.value
              : String(prop.key.name || prop.key.value);
        obj[key] = evalNode(prop.value, source);
      }
      return obj;
    }

    case 'UnaryExpression':
      if (node.operator === '-') return -evalNode(node.argument, source);
      if (node.operator === '+') return +evalNode(node.argument, source);
      if (node.operator === '!') return !evalNode(node.argument, source);
      return undefined;

    case 'BinaryExpression':
      if (node.operator === '+') {
        return evalNode(node.left, source) + evalNode(node.right, source);
      }
      return undefined;

    case 'Identifier':
      if (node.name === 'undefined') return undefined;
      if (node.name === 'null') return null;
      return `__REF:${node.name}`;

    case 'MemberExpression':
      return undefined;

    default:
      return undefined;
  }
}
