/**
 * Parse the @theme block from globals.css and extract CSS custom properties.
 * Returns { colors: { brand: '#25475e', ... }, fonts: { sans: '...' } }
 */
export function parseTheme(cssSource) {
  const themeMatch = cssSource.match(/@theme\s*\{([\s\S]*?)\}/);
  if (!themeMatch) return { colors: {}, fonts: {}, raw: '' };

  const block = themeMatch[1];
  const colors = {};
  const fonts = {};

  for (const line of block.split('\n')) {
    const propMatch = line.match(/--(\w[\w-]*)\s*:\s*(.+?)\s*;/);
    if (!propMatch) continue;

    const [, name, value] = propMatch;
    if (name.startsWith('color-')) {
      colors[name.replace('color-', '')] = value;
    } else if (name.startsWith('font-')) {
      fonts[name.replace('font-', '')] = value;
    }
  }

  return { colors, fonts, raw: themeMatch[0] };
}

/**
 * Serialize theme tokens back into the @theme block and replace it in the CSS.
 */
export function serializeTheme(cssSource, colors, fonts) {
  let block = '@theme {\n';

  // Group colors
  const colorEntries = Object.entries(colors);
  if (colorEntries.length > 0) {
    for (const [name, value] of colorEntries) {
      block += `  --color-${name}: ${value};\n`;
    }
    block += '\n';
  }

  // Group fonts
  const fontEntries = Object.entries(fonts);
  if (fontEntries.length > 0) {
    for (const [name, value] of fontEntries) {
      block += `  --font-${name}: ${value};\n`;
    }
  }

  block += '}';

  // Replace existing @theme block or append
  if (cssSource.includes('@theme')) {
    return cssSource.replace(/@theme\s*\{[\s\S]*?\}/, block);
  }
  return cssSource + '\n\n' + block + '\n';
}
