// gh-pages 배포용 index.html 생성: EARTH_URL(localhost)을 base64 data URI로 인라인
import { readFileSync, writeFileSync } from 'fs';

const outPath = process.argv[2] || 'index.deploy.html';
const html = readFileSync('globe-export.html', 'utf8');
const b64 = readFileSync('public/earth-mask.jpg').toString('base64');
const out = html.replace(
  /const EARTH_URL = '[^']*';/,
  `const EARTH_URL = 'data:image/jpeg;base64,${b64}';`
);
if (out === html) throw new Error('EARTH_URL 치환 실패 — globe-export.html에서 패턴을 찾지 못함');
writeFileSync(outPath, out);
console.log('OK:', outPath, `(${(out.length / 1024).toFixed(0)}KB)`);
