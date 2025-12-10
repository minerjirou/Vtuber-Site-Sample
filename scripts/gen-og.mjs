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
  // Download woff2 from Google Fonts
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&display=swap`;
  const css = await (await fetch(cssUrl)).text();
  const matches = [...css.matchAll(/url\(([^)]+\.woff2)\)/g)];
  if (!matches.length) throw new Error('Failed to fetch font URL');
  let fontUrl = matches[0][1].replace(/^["']|["']$/g, '');
  if (fontUrl.startsWith('//')) fontUrl = 'https:' + fontUrl;
  const res = await fetch(fontUrl);
  const buf = await res.arrayBuffer();
  return { name: 'Noto Sans JP', data: Buffer.from(buf), weight, style: 'normal' };
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
          {
            type: 'div',
            props: {
              style: { fontSize: 42, opacity: 0.9, marginBottom: 16 },
              children: AGENCY,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 64, fontWeight: 700, lineHeight: 1.2 },
              children: title,
            },
          },
          subtitle
            ? {
                type: 'div',
                props: {
                  style: { fontSize: 32, opacity: 0.9, marginTop: 20 },
                  children: subtitle,
                },
              }
            : null,
        ],
      },
    },
    {
      width,
      height,
      fonts: [font],
    }
  );
  return svg;
}

async function svgToPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    background: 'rgba(0,0,0,0)'
  });
  const png = resvg.render().asPng();
  return png;
}

async function generateForMembers() {
  const dir = join(CONTENT, 'member');
  const files = await readdir(dir);
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await readFile(join(dir, file), 'utf8');
    const fm = matter(raw);
    const title = fm.data.name || basename(file, '.md');
    const subtitle = fm.data.category || 'メンバー紹介';
    const svg = await createSvg({ title, subtitle });
    const png = await svgToPng(svg);
    const outDir = join(PUBLIC_OG, 'member');
    await ensureDir(outDir);
    const slug = basename(file, '.md');
    await writeFile(join(outDir, `${slug}.png`), png);
  }
}

async function generateForNews() {
  const dir = join(CONTENT, 'news');
  const files = await readdir(dir);
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await readFile(join(dir, file), 'utf8');
    const fm = matter(raw);
    const title = fm.data.title || basename(file, '.md');
    const d = fm.data.date ? new Date(fm.data.date) : null;
    const subtitle = d ? d.toLocaleDateString('ja-JP') : 'ニュース';
    const svg = await createSvg({ title, subtitle });
    const png = await svgToPng(svg);
    const outDir = join(PUBLIC_OG, 'news');
    await ensureDir(outDir);
    const slug = basename(file, '.md');
    await writeFile(join(outDir, `${slug}.png`), png);
  }
}

async function main() {
  await generateForMembers();
  await generateForNews();
  console.log('OG images generated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
