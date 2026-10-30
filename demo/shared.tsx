import { useDemoLocale } from './locale';
import { useState, type ReactNode } from 'react';

export function CodeBlock({ code, language = 'tsx' }: { code: string; language?: 'tsx' | 'css' }) {
  const { t: dt } = useDemoLocale();
  return <pre className="code-panel"><code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlightCode(language === 'css' ? code : dt(code), language) }} /></pre>;
}

export function PageHeading({ eyebrow, title, description, badge }: { eyebrow: string; title: string; description: string; badge?: string }) {
  const { t: dt } = useDemoLocale();
  return <div className="page-heading"><div className="eyebrow"><span className="eyebrow__dot" />{dt(eyebrow)}</div><div className="page-heading__row"><div><h1>{dt(title)}</h1><p>{dt(description)}</p></div>{badge && <span className="heading-badge">{badge}</span>}</div></div>;
}

export function ExampleCard({ title, description, code, children, className }: { title: string; description?: string; code?: string; children: ReactNode; className?: string }) {
  const { t: dt } = useDemoLocale();

  const [showCode, setShowCode] = useState(false);
  return <section className={`example-card ${className ?? ''}`}><div className="example-card__heading"><div><h3>{dt(title)}</h3>{description && <p>{dt(description)}</p>}</div>{code && <button type="button" className={`code-toggle ${showCode ? 'code-toggle--active' : ''}`} onClick={() => setShowCode((show) => !show)}><span>{`</>`}</span>{showCode ? dt("收起代码") : dt("查看完整代码")}</button>}</div><div className="example-card__preview">{children}</div>{showCode && <CodeBlock code={code ?? ''} />}</section>;
}

export function ApiTable({ rows, title: titleProp }: { rows: string[][]; title?: string }) {
  const { t: dt } = useDemoLocale();
  const title = titleProp === undefined ? dt("组件属性") : titleProp;

  return <section className="api-table-section"><div className="eyebrow"><span className="eyebrow__dot" /> API REFERENCE</div><h2>{dt(title)}</h2><div className="api-table-wrap"><table className="api-table"><thead><tr><th>{dt("属性")}</th><th>{dt("类型")}</th><th>{dt("默认值")}</th></tr></thead><tbody>{rows.map(([name, type, value]) => <tr key={name}><td><code>{name}</code></td><td>{dt(type)}</td><td>{dt(value)}</td></tr>)}</tbody></table></div></section>;
}

const codeTokens = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|<\/?[A-Za-z][\w.]*(?=[\s/>])|\b(?:import|from|export|default|const|let|var|function|return|async|await|type|interface|new|true|false|null|undefined|if|else)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*(?=\s*\()|[{}()[\].,;:=<>!?|&+*/-])/g;

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

const cssTokens = /(?<comment>\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<selector>[^{};\s][^{};]*?(?=\s*\{))|(?<property>(?:--)?[a-zA-Z_][\w-]*(?=\s*:))|(?<variable>--[\w-]+)|(?<color>#[\da-fA-F]{3,8}\b)|(?<function>[a-zA-Z_][\w-]*(?=\())|(?<number>-?(?:\d*\.)?\d+(?:%|[a-zA-Z]+)?)|(?<punctuation>[{}():;,])/g;

function highlightCss(source: string) {
  let html = '';
  let offset = 0;
  for (const match of source.matchAll(cssTokens)) {
    const groups = match.groups ?? {};
    const kind = Object.keys(groups).find((key) => groups[key] !== undefined);
    const token = match[0];
    const className = kind === 'selector' && token.startsWith('@') ? 'keyword' : kind;
    html += escapeHtml(source.slice(offset, match.index));
    html += `<span class="code-token--${className}">${escapeHtml(token)}</span>`;
    offset = match.index + token.length;
  }
  return html + escapeHtml(source.slice(offset));
}

export function highlightCode(source: string, language: 'tsx' | 'css' = 'tsx') {
  if (language === 'css') return highlightCss(source);
  return source.replace(codeTokens, (token) => {
    const className = token.startsWith('//') || token.startsWith('/*') ? 'code-token--comment'
      : token.startsWith('"') || token.startsWith("'") || token.startsWith('`') ? 'code-token--string'
        : token.startsWith('<') ? 'code-token--tag'
          : /^(?:import|from|export|default|const|let|var|function|return|async|await|type|interface|new|true|false|null|undefined|if|else)$/.test(token) ? 'code-token--keyword'
            : /^\d/.test(token) ? 'code-token--number'
              : /^[A-Za-z_$]/.test(token) ? 'code-token--function'
                : 'code-token--punctuation';
    return `<span class="${className}">${escapeHtml(token)}</span>`;
  }).split(/(<span class="[^"]+">[\s\S]*?<\/span>)/g).map((part) => part.startsWith('<span ') ? part : escapeHtml(part)).join('');
}
