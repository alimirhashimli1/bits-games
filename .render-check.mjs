import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const load = (p) => server.ssrLoadModule(p);

const { drawHumanoid } = await load('/shared/pixel-art/humanoidRig.ts');
const base = '/games/03-arena-fighters/src/content/fighters';
const arts = {
  osal: (await load(`${base}/osal/osalArt.ts`)).OSAL_ART,
  mahmood: (await load(`${base}/mahmood/mahmoodArt.ts`)).MAHMOOD_ART,
  brand: (await load(`${base}/brand/brandArt.ts`)).BRAND_ART,
  rajab: (await load(`${base}/rajab/rajabArt.ts`)).RAJAB_ART,
};

const wanted = process.argv.slice(2);
for (const spec of wanted) {
  const [who, pose] = spec.split(':');
  const art = arts[who];
  const map = drawHumanoid(art.specialPoses[pose] ?? art.poses[pose], art.body);
  console.log(`\n=== ${who} ${pose}`);
  // Trim empty rows top and bottom for readability.
  const rows = map.map((r) => r.replaceAll('.', ' '));
  const first = rows.findIndex((r) => r.trim() !== '');
  const last = rows.length - 1 - [...rows].reverse().findIndex((r) => r.trim() !== '');
  rows.slice(first, last + 1).forEach((r, i) => console.log(String(first + i).padStart(2), '|' + r + '|'));
}
await server.close();
