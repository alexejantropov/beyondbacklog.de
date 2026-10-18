// tests/legacy-urls.txt: every old Substack URL, one per line. `# gone …` after a path marks a
// URL that is intentionally removed; other `#` notes are comments.
import { existsSync, readFileSync } from 'node:fs';

export const LEGACY = 'tests/legacy-urls.txt';

/** @returns {{ path: string; gone: boolean }[]} */
export function readLegacy(file = LEGACY) {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    .map(l => { const [path, ...note] = l.split(/\s+#\s*/); return { path: path.trim(), gone: /^gone\b/i.test(note.join(' ')) }; });
}
