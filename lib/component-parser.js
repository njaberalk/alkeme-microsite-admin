import * as acorn from 'acorn';

/**
 * Extract a `const` array or object from a JSX component file.
 *
 * Looks for patterns like:
 *   const faqs = [ ... ];
 *   const steps = [ ... ];
 *   const stats = [ ... ];
 *
 * Returns { name, data, startOffset, endOffset }
 */
export function extractComponentData(source, varName) {
  // Use regex to find `const varName = [` or `const varName = {`
  const pattern = new RegExp(
    `(?:^|\\n)(const\\s+${varName}\\s*=\\s*)`,
    'm'
  );
  const match = source.match(pattern);
  if (!match) return null;

  const declStart = source.indexOf(match[1], match.index);
  const valueStart = declStart + match[1].length;

  // Find the balanced end of the array/object
  const endOffset = findBalancedEnd(source, valueStart);
  if (endOffset === -1) return null;

  // Include the trailing semicolon if present
  const finalEnd = source[endOffset] === ';' ? endOffset + 1 : endOffset;

  const valueSource = source.slice(valueStart, endOffset);

  // Parse just the value using acorn
  let data;
  try {
    const wrappedSource = `const _x_ = ${valueSource};`;
    const ast = acorn.parse(wrappedSource, {
      sourceType: 'module',
      ecmaVersion: 2022,
    });
    const decl = ast.body[0].declarations[0];
    data = evalNode(decl.init, wrappedSource);
  } catch {
    return null;
  }

  return {
    name: varName,
    data,
    startOffset: declStart,
    endOffset: finalEnd,
    rawValue: valueSource,
  };
}

/**
 * Replace a const declaration's value in the source.
 */
export function replaceComponentData(source, varName, newData) {
  const extracted = extractComponentData(source, varName);
  if (!extracted) throw new Error(`Could not find const ${varName} in source`);

  const serialized = JSON.stringify(newData, null, 2);
  const newDecl = `const ${varName} = ${serialized};`;

  return (
    source.slice(0, extracted.startOffset) +
    newDecl +
    source.slice(extracted.endOffset)
  );
}

// Find the end of a balanced [] or {} starting at offset
function findBalancedEnd(source, offset) {
  const open = source[offset];
  const close = open === '[' ? ']' : open === '{' ? '}' : null;
  if (!close) return -1;

  let depth = 0;
  let inString = false;
  let stringChar = '';
  let inTemplate = false;

  for (let i = offset; i < source.length; i++) {
    const ch = source[i];
    const prev = i > 0 ? source[i - 1] : '';

    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false;
      continue;
    }
    if (inTemplate) {
      if (ch === '`' && prev !== '\\') inTemplate = false;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      continue;
    }

    if (ch === open) depth++;
    if (ch === close) {
      depth--;
      if (depth === 0) {
        // Return position after the closing bracket
        let end = i + 1;
        while (end < source.length && source[end] === ' ') end++;
        if (source[end] === ';') end++;
        return end;
      }
    }
  }
  return -1;
}

function evalNode(node, source) {
  if (!node) return undefined;
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'ArrayExpression':
      return node.elements.map((el) => evalNode(el, source));
    case 'ObjectExpression': {
      const obj = {};
      for (const prop of node.properties) {
        const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
        obj[key] = evalNode(prop.value, source);
      }
      return obj;
    }
    case 'TemplateLiteral':
      return node.quasis.map((q) => q.value.cooked).join('');
    case 'UnaryExpression':
      if (node.operator === '-') return -evalNode(node.argument, source);
      return undefined;
    default:
      return undefined;
  }
}
