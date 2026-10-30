import { readFileSync } from 'node:fs';
import ts from 'typescript';
import type { Plugin } from 'vite';

/** Keep copied examples independent from documentation-only translation helpers. */
export function exampleSource(): Plugin {
  return {
    name: 'atelier-example-source',
    enforce: 'pre',
    load(id) {
      if (!id.endsWith('?example')) return;
      const file = id.slice(0, -'?example'.length);
      const source = readFileSync(file, 'utf8');
      const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const edits: Array<{ start: number; end: number; text: string }> = [];
      function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === '../locale') {
          edits.push({ start: node.getStart(ast), end: node.end, text: '' });
          return;
        }
        if (ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) => declaration.initializer && ts.isCallExpression(declaration.initializer) && declaration.initializer.expression.getText(ast) === 'useDemoLocale')) {
          edits.push({ start: node.getStart(ast), end: node.end, text: '' });
          return;
        }
        if (ts.isCallExpression(node) && node.expression.getText(ast) === 'dt' && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
          let text = node.arguments[0].text;
          const params = node.arguments[1];
          if (params && ts.isObjectLiteralExpression(params)) {
            const expressions = new Map(params.properties.filter(ts.isPropertyAssignment).map((property) => [property.name.getText(ast), property.initializer.getText(ast)]));
            text = '`' + text.replaceAll('`', '\\`').replaceAll('${', '\\${').replace(/\{(\d+)\}/g, (token, key: string) => expressions.has(key) ? '${' + expressions.get(key) + '}' : token) + '`';
          } else text = JSON.stringify(text);
          edits.push({ start: node.getStart(ast), end: node.end, text });
          return;
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
      let result = source;
      for (const edit of edits.sort((a, b) => b.start - a.start)) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
      return `export default ${JSON.stringify(result.replace(/^ +$/gm, '').replace(/\n{3,}/g, '\n\n').trimStart())};`;
    },
  };
}
