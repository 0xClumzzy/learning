export interface FileLeaf {
  type: 'file';
  name: string;
  /** Human-readable label derived from `name`; what the tree actually shows. */
  label: string;
  path: string;
}

export interface DirNode {
  type: 'dir';
  name: string;
  path: string;
  children: TreeNode[];
}

export type TreeNode = FileLeaf | DirNode;

const DATE_SUFFIX = /-\d{4}-\d{2}-\d{2}(-\d{2}-\d{2}-\d{2})?$/;
const COMPACT_DATE = /\d{8}[-_]\d{6}$/;
const DASHED_DATE_TIME = /\d{4}-\d{2}-\d{2}-\d{6}$/;
const NUMERIC_ONLY = /^[\d-]+$/;

/**
 * Security acronyms that appear verbatim in slugs. A generic "is it already
 * uppercase" test does not work: slugs are lowercased, so `sql` reaches us as
 * `sql`, not `SQL`. This set is explicit rather than heuristic so the output is
 * predictable and reviewable.
 */
const ACRONYMS = new Set([
  'aws', 'iam', 'api', 'cve', 'cwe', 'dast', 'ddos', 'dns', 'ec2', 'gcp',
  'iam', 'ids', 'idsi', 'jwt', 'kerberos', 'ldap', 'lfi', 'mfa', 'mtls', 'nmap',
  'oauth', 'oidc', 'owasp', 'pci', 'rce', 'rfc', 'rfi', 'rsa', 'saml', 'sast',
  'scada', 'siem', 'sql', 'sqli', 'ss7', 'ssrf', 'ssl', 'ssh', 'ssrf', 'tcp',
  'tls', 'udp', 'url', 'vm', 'vpc', 'xss', 'xsrf', 'ecdsa', 'aes', 'sha',
]);

/**
 * Turn a generated filename into something a person would call it.
 *
 * Sessions and exercises are written as `<concept-slug>-<date>.md`, and decks
 * as `<concept-slug>-quiz-<timestamp>.json`. Showing that raw made the sidebar
 * read as a file browser instead of a syllabus, and the trailing date pushed
 * the meaningful part out of view under truncation.
 *
 * The date is dropped on purpose: the ADHD protocol forbids surfacing recency.
 */
export function humanizeFileName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const stem = dot === -1 ? filename : filename.slice(0, dot);

  const stripped = stem
    .replace(COMPACT_DATE, '')
    .replace(DASHED_DATE_TIME, '')
    .replace(DATE_SUFFIX, '');

  // A stem that is nothing but digits/dates has no human form; show the file.
  if (!stripped || NUMERIC_ONLY.test(stripped)) return filename;

  const words = stripped
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => {
      const lower = w.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      // Already-capitalised input (CVE, OWASP) is left alone.
      if (w !== w.toLowerCase()) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    });

  return words.join(' ');
}

function sortTree(nodes: TreeNode[]): void {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const node of nodes) {
    if (node.type === 'dir') sortTree(node.children);
  }
}

export function buildFileTree(paths: string[]): TreeNode[] {
  const root: DirNode = { type: 'dir', name: '', path: '', children: [] };
  const dirs = new Map<string, DirNode>();
  dirs.set('', root);

  for (const fullPath of paths) {
    const segments = fullPath.split('/');
    segments.shift();
    const filename = segments.pop()!;
    let prefix = '';
    for (const segment of segments) {
      const childPath = prefix ? `${prefix}/${segment}` : segment;
      if (!dirs.has(childPath)) {
        const dir: DirNode = { type: 'dir', name: segment, path: childPath, children: [] };
        dirs.set(childPath, dir);
        dirs.get(prefix)!.children.push(dir);
      }
      prefix = childPath;
    }
    dirs.get(prefix)!.children.push({
      type: 'file',
      name: filename,
      label: humanizeFileName(filename),
      path: fullPath,
    });
  }

  sortTree(root.children);
  return root.children;
}

export function ancestorDirPaths(fullRelPath: string): string[] {
  const parts = fullRelPath.split('/');
  if (parts.length < 2) return [];
  parts.shift();
  parts.pop();
  const result: string[] = [];
  let acc = '';
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;
    result.push(acc);
  }
  return result;
}

export function collectFiles(nodes: TreeNode[]): FileLeaf[] {
  const result: FileLeaf[] = [];
  for (const node of nodes) {
    if (node.type === 'file') result.push(node);
    else result.push(...collectFiles(node.children));
  }
  return result;
}
