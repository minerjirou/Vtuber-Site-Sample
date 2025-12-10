import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src', 'content');
const PUBLIC_OG = join(ROOT, 'public', 'og');
const AGENCY = process.env.AGENCY_NAME || 'Vtuber Agency';

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function fetchNotoSansJP(weight = 700) {
  const file = join(ROOT, 'node_modules', '@fontsource', 'noto-sans-jp', 'files', `noto-sans-jp-japanese-${weight}-normal.woff2`);
  const buf = await readFile(file);
  return { name: 'Noto Sans JP', data: buf, weight, style: 'normal' };
}

async function createSvg({ title, subtitle }) {
  const font = await fetchNotoSansJP(700);
  const width = 1200;
  const height = 630;
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
          background: 'linear-gradient(135deg, #1f2937, #111827 60%)',
          color: 'white',
          fontFamily: 'Noto Sans JP',
        },
        children: [
          { type: 'div', props: { style: { fontSize: 42, opacity: 0.9, marginBottom: 16 }, children: AGENCY } },
          { type: 'div', props: { style: { fontSize: 64, fontWeight: 700, lineHeight: 1.2 }, children: title } },
          subtitle ? { type: 'div', props: { style: { fontSize: 32, opacity: 0.9, marginTop: 20 }, children: subtitle } } : null,
        ],
      },
    },
    { width, height, fonts: [font] }
  );
  return svg;
}

async function svgToPng(svg) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, background: 'rgba(0,0,0,0)' });
  return resvg.render().asPng();
}

async function generateFor(dirName, kind, titleKey, subtitleCb, defaultSubtitle) {
  const dir = join(CONTENT, dirName);
  const files = await readdir(dir);
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await readFile(join(dir, file), 'utf8');
    const fm = matter(raw);
    const title = fm.data[titleKey] || basename(file, '.md');
    const subtitle = subtitleCb ? subtitleCb(fm.data) : defaultSubtitle;
    const svg = await createSvg({ title, subtitle });
    const png = await svgToPng(svg);
    const outDir = join(PUBLIC_OG, kind);
    await ensureDir(outDir);
    const slug = basename(file, '.md');
    await writeFile(join(outDir, `${slug}.png`), png);
  }
}

async function main() {
  await generateFor('member', 'member', 'name', (d) => d.category || 'メンバー紹介');
  await generateFor('news', 'news', 'title', (d) => (d.date ? new Date(d.date).toLocaleDateString('ja-JP') : 'ニュース'));
  console.log('OG images generated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

