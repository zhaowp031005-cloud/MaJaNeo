// 逐帧渲染：node render.cjs <buildDir> [--still t1,t2,...] [--workers 4]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const build = path.resolve(process.argv[2]);
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const FONTS = process.env.FONTS_DIR; // 指向安装了 @fontsource/* 的 node_modules
const tl = JSON.parse(fs.readFileSync(path.join(build, 'timeline.json'), 'utf8'));
const page_url = 'file://' + path.join(__dirname, 'index.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto(page_url);
  if (FONTS) for (const f of ['noto-sans-sc/400', 'noto-sans-sc/500', 'noto-sans-sc/700', 'noto-sans-sc/900', 'nunito/400', 'nunito/600', 'nunito/700', 'nunito/800', 'nunito/900', 'fredoka/500', 'fredoka/600', 'fredoka/700', 'zcool-kuaile/400', 'inter/400', 'inter/500', 'inter/600', 'inter/700', 'inter/800', 'inter/900', 'jetbrains-mono/400', 'jetbrains-mono/500', 'jetbrains-mono/700'])
    await page.addStyleTag({ url: 'file://' + path.join(FONTS, '@fontsource', f + '.css') });
  await page.evaluate(tl => window.initTimeline(tl), tl);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

(async () => {
  const browser = await chromium.launch();
  if (process.argv.includes('--events')) {
    const page = await openPage(browser);
    const ev = await page.evaluate(() => window.collectSfx());
    fs.writeFileSync(path.join(build, 'events.json'), JSON.stringify(ev));
    console.log('events', ev.length); await browser.close(); return;
  }
  const still = arg('--still');
  if (still) {
    const page = await openPage(browser);
    for (const s of still.split(',')) {
      const t = s.includes(':') ? await page.evaluate(([id, sp]) => window.at(id, sp), s.split(':')) : +s;
      await page.evaluate(t => window.seek(t), t);
      const f = path.join(build, `still_${s.replace(/[:+]/g, '_')}.png`);
      await page.screenshot({ path: f }); console.log(f, t.toFixed(2));
    }
    await browser.close(); return;
  }
  const W = +(arg('--workers') || 4), fps = tl.fps, N = Math.ceil(tl.duration * fps);
  const per = Math.ceil(N / W);
  await Promise.all([...Array(W)].map(async (_, w) => {
    const a = w * per, b = Math.min(N, a + per);
    const page = await openPage(browser);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), path.join(build, `part${w}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = a; i < b; i++) {
      await page.evaluate(t => window.seek(t), i / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((i - a) % 600 === 0) console.log(`worker ${w}: ${i - a}/${b - a}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }));
  await browser.close();
  fs.writeFileSync(path.join(build, 'parts.txt'), [...Array(W)].map((_, w) => `file 'part${w}.mp4'`).join('\n'));
  console.log('frames done', N);
})();
