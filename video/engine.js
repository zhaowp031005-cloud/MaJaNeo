// 确定性时间轴引擎：window.seek(t) 根据时间 t（秒）设置整页状态，逐帧截图使用。
(function () {
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeInOut = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeSine = p => -(Math.cos(Math.PI * p) - 1) / 2;
  const easeBack = p => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const easeElastic = p => p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, -9 * p) * Math.sin((p * 10 - .75) * (2 * Math.PI) / 3.2) + 1;

  let TL, SC = {}, ORDER = [];
  const POSES = window.POSES || {}, CAMS = window.CAMS || {}, INPUTS = window.INPUTS || [], HOOKS = window.HOOKS || {};

  // 时间描述："c2+0.3" 第 2 句开始后 0.3s；"x2" 第 2 句结束；"s4" 本场第 4 条字幕；"e" 场景结束；"b+1" 场景开始后 1s
  function at(sceneId, spec) {
    const sc = SC[sceneId];
    if (spec == null || spec === '') return sc.start;
    spec = String(spec).trim();
    const m = spec.match(/^([csebx])(\d*)\s*([+-]\s*[\d.]+)?$/);
    if (!m) return sc.start + parseFloat(spec);
    const off = m[3] ? parseFloat(m[3].replace(/\s/g, '')) : 0, i = m[2] === '' ? 0 : +m[2];
    let base;
    if (m[1] === 'c') base = sc.cues[Math.min(i, sc.cues.length - 1)].start;
    else if (m[1] === 'x') base = sc.cues[Math.min(i, sc.cues.length - 1)].end;
    else if (m[1] === 's') base = sc.subs[Math.min(i, sc.subs.length - 1)].start;
    else if (m[1] === 'e') base = sc.end;
    else base = sc.start;
    return base + off;
  }
  window.at = at;
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  // 伪随机（确定性）
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const BURST_COLORS = ['#FF8FB1', '#FFD873', '#B9A7FF', '#7FD8BE', '#8EC5FF', '#FFB38A'];

  function setup(tl) {
    TL = tl;
    tl.scenes.forEach((s, i) => {
      s.subs = tl.subs.filter(u => u.start >= s.start - 1e-6 && u.start < s.end);
      s.el = document.querySelector(`[data-scene="${s.id}"]`);
      s.idx = i; SC[s.id] = s; ORDER.push(s);
    });
    ORDER.forEach(s => {
      if (!s.el) return;
      const q = sel => [...s.el.querySelectorAll(sel)];
      s.items = q('[data-in],[data-out],[data-emph]').map(el => ({
        el, tin: el.dataset.in ? at(s.id, el.dataset.in) : -1, tout: el.dataset.out ? at(s.id, el.dataset.out) : 1e9,
        emph: el.dataset.emph ? at(s.id, el.dataset.emph) : null,
        anim: el.dataset.anim || 'up', dur: +(el.dataset.dur || (el.dataset.anim === 'pop' ? .6 : .55)), base: el.style.transform || ''
      }));
      s.types = q('[data-type]').map(el => ({ el, full: el.textContent, tin: at(s.id, el.dataset.type), cps: +(el.dataset.cps || 28), caret: el.dataset.caret !== 'no' }));
      s.counts = q('[data-count]').map(el => ({ el, tin: at(s.id, el.dataset.count), to: +el.dataset.to, dur: +(el.dataset.dur || 1.6) }));
      s.hls = q('[data-hl]').map(el => { const [a, b] = el.dataset.hl.split(':'); return { el, a: at(s.id, a), b: b ? at(s.id, b) : 1e9 }; });
      s.ons = q('[data-on]').map(el => ({ el, a: at(s.id, el.dataset.on), cls: el.dataset.cls || 'on', chk: el.querySelector('.check') }));
      s.bars = q('[data-bar]').map(el => { const [a, b] = el.dataset.bar.split(':'); return { el, a: at(s.id, a), b: at(s.id, b), to: +(el.dataset.to || 100), from: +(el.dataset.from || 0) }; });
      s.texts = q('[data-swap]').map(el => ({ el, a: at(s.id, el.dataset.swap), from: el.innerHTML, to: el.dataset.to }));
      s.mks = q('[data-mk]').map(el => ({ el, a: at(s.id, el.dataset.mk) }));
      s.bursts = q('[data-burst]').map((el, bi) => {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        const box = document.createElement('div'); box.className = 'burst'; el.appendChild(box);
        const parts = [...Array(14)].map((_, k) => {
          const seed = s.idx * 100 + bi * 20 + k, star = k % 3 !== 2;
          const i = document.createElement('i');
          const size = star ? 16 + rnd(seed) * 16 : 8 + rnd(seed + 5) * 8, col = BURST_COLORS[k % BURST_COLORS.length];
          i.innerHTML = star ? `<svg width="${size}" height="${size}" style="display:block;color:${col}"><use href="#i-twinkle" fill="currentColor"/></svg>` : '';
          if (!star) Object.assign(i.style, { width: size + 'px', height: size + 'px', borderRadius: '50%', background: col });
          box.appendChild(i);
          return { i, ang: (k / 14) * Math.PI * 2 + rnd(seed + 1) * .5, dist: 120 + rnd(seed + 2) * 140, rot: (rnd(seed + 3) - .5) * 400, size };
        });
        return { el, a: at(s.id, el.dataset.burst), parts };
      });
    });
    // 镜头关键帧 → 分段
    const kf = [];
    ORDER.forEach(s => {
      const list = CAMS[s.id] || [];
      if (!list.some(k => k[0] === 'b')) kf.push({ t: s.start - .3, z: 1, x: 556, y: 440 });
      list.forEach(([spec, z, x, y, d]) => kf.push({ t: at(s.id, spec) - (spec === 'b' ? .3 : 0), z, x, y, d: d || 1.0 }));
    });
    kf.sort((a, b) => a.t - b.t);
    let prev = { z: 1, x: 556, y: 440 }; CAMSEG = [];
    kf.forEach(k => {
      const last = CAMSEG[CAMSEG.length - 1];
      const from = last ? camEval(last, k.t) : prev;
      CAMSEG.push({ t0: k.t, d: k.d || 1.0, from, to: { z: k.z, x: k.x, y: k.y } });
    });
    // 预加载字体所用字形
    const pre = document.getElementById('preload');
    const all = document.body.innerText + tl.subs.map(s => s.text).join('') + [...document.querySelectorAll('[data-to]')].map(e => e.dataset.to).join('');
    pre.innerHTML = [400, 500, 600, 700, 800, 900].map(w => `<div style="font-weight:${w}">${esc(all)}</div><div style="font-weight:${w};font-family:var(--mono)">${esc(all)}</div><div style="font-weight:${w};font-family:var(--cute)">${esc(all)}</div>`).join('');
  }

  // ---------- 镜头 ----------
  let CAMSEG = [];
  function camEval(seg, t) {
    const p = easeInOut(clamp((t - seg.t0) / seg.d));
    return { z: lerp(seg.from.z, seg.to.z, p), x: lerp(seg.from.x, seg.to.x, p), y: lerp(seg.from.y, seg.to.y, p) };
  }
  function updateCam(t) {
    let seg = null; for (const s of CAMSEG) { if (s.t0 <= t) seg = s; else break; }
    const c = seg ? camEval(seg, t) : { z: 1, x: 556, y: 440 };
    const breathe = 1 + .012 * (1 - Math.cos(t * 2 * Math.PI / 14)) / 2;   // 缓慢“呼吸”推镜
    const z = c.z * breathe, W = 1112, H = 880;
    let tx = W / 2 - c.x * z + Math.sin(t * .37) * 4, ty = H / 2 - c.y * z + Math.cos(t * .29) * 3;
    tx = clamp(tx, W - W * z, 0); ty = clamp(ty, H - H * z, 0);
    document.getElementById('cam').style.transform = `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${z.toFixed(4)})`;
  }

  function applyItem(it, t) {
    const pin = it.tin < 0 ? 1 : clamp((t - it.tin) / it.dur);
    const pout = clamp((t - it.tout) / .35);
    let o = 1, tr = '', sc = 1;
    if (it.anim === 'none') { o = pin > 0 ? 1 : 0; }
    else if (it.anim === 'fade') { o = easeOut(pin); }
    else if (it.anim === 'pop') { const e = easeElastic(pin); o = clamp(pin * 3); sc = lerp(.4, 1, e); tr = `translateY(${lerp(18, 0, easeOut(pin))}px)`; }
    else if (it.anim === 'grow') { const e = easeOut(pin); tr = `scaleX(${e})`; o = pin > 0 ? 1 : 0; }
    else if (it.anim === 'left') { const e = easeBack(pin); o = clamp(pin * 2); tr = `translateX(${lerp(-46, 0, e)}px)`; }
    else if (it.anim === 'right') { const e = easeBack(pin); o = clamp(pin * 2); tr = `translateX(${lerp(46, 0, e)}px)`; }
    else if (it.anim === 'down') { const e = easeBack(pin); o = clamp(pin * 2); tr = `translateY(${lerp(-34, 0, e)}px)`; }
    else { const e = easeBack(pin); o = clamp(pin * 2); tr = `translateY(${lerp(34, 0, e)}px)`; }
    if (pout > 0) { o *= 1 - easeOut(pout); sc *= lerp(1, .9, easeOut(pout)); }
    // 重点强调：弹一下 + 光圈
    if (it.emph != null) {
      const p = (t - it.emph) / .9;
      if (p > 0 && p < 1) {
        sc *= 1 + .14 * Math.sin(Math.PI * Math.min(1, p * 1.6)) * (1 - p * .3);
        const r = easeOut(p);
        it.el.style.outline = `${(6 * (1 - r)).toFixed(1)}px solid rgba(255,196,64,${(.9 * (1 - r)).toFixed(2)})`;
        it.el.style.outlineOffset = `${(4 + 22 * r).toFixed(1)}px`;
      } else if (it.el.style.outline) { it.el.style.outline = ''; }
    }
    if (sc !== 1) tr += ` scale(${sc.toFixed(4)})`;
    it.el.style.opacity = o.toFixed(3);
    it.el.style.transform = (it.base + ' ' + tr).trim();
    it.el.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
  }

  function updateScene(s, t) {
    s.items.forEach(it => applyItem(it, t));
    s.types.forEach(ty => {
      const n = clamp(Math.floor((t - ty.tin) * ty.cps), 0, ty.full.length);
      ty.el.textContent = ty.full.slice(0, n);
      const typing = t >= ty.tin && (n < ty.full.length || (t - ty.tin - ty.full.length / ty.cps) < 0.6);
      ty.el.classList.toggle('caret', ty.caret && typing && (n < ty.full.length || Math.floor(t * 2.5) % 2 === 0));
    });
    s.counts.forEach(c => { const p = easeOut(clamp((t - c.tin) / c.dur)); c.el.textContent = Math.round(c.to * p).toLocaleString('en-US'); });
    s.hls.forEach(h => {
      const pin = easeOut(clamp((t - h.a) / .45)), pout = clamp((t - h.b) / .3);
      h.el.style.setProperty('--hl', (pin * (1 - pout)).toFixed(3));
    });
    s.ons.forEach(h => {
      const on = t >= h.a; h.el.classList.toggle(h.cls, on);
      const p = clamp((t - h.a) / .4);
      if (h.el.classList.contains('x-over')) h.el.style.setProperty('--x', easeOut(p).toFixed(3));
      if (h.chk) h.chk.style.transform = `scale(${(1 + .45 * Math.sin(Math.PI * p)).toFixed(3)})`;
    });
    s.mks.forEach(m => m.el.style.setProperty('--mk', easeInOut(clamp((t - m.a) / .5)).toFixed(3)));
    s.bars.forEach(b => { b.el.style.width = lerp(b.from, b.to, easeInOut(clamp((t - b.a) / (b.b - b.a)))) + '%'; });
    s.texts.forEach(x => { const v = t >= x.a ? x.to : x.from; if (x.el.innerHTML !== v) x.el.innerHTML = v; });
    s.bursts.forEach(b => {
      const p = (t - b.a) / 1.1;
      b.parts.forEach(q => {
        if (p <= 0 || p >= 1) { q.i.style.opacity = 0; return; }
        const e = easeOut(p), d = q.dist * e;
        q.i.style.opacity = (p < .15 ? p / .15 : 1 - (p - .15) / .85).toFixed(3);
        q.i.style.transform = `translate(${(Math.cos(q.ang) * d - q.size / 2).toFixed(1)}px,${(Math.sin(q.ang) * d + 40 * p * p - q.size / 2).toFixed(1)}px) rotate(${(q.rot * p).toFixed(0)}deg) scale(${(1 - .4 * p).toFixed(3)})`;
      });
    });
    const hook = HOOKS[s.id]; if (hook) hook(t, s);
  }

  // ---------- 吉祥物 ----------
  let MKF = null;
  function mascotState(t) {
    if (!MKF) {
      MKF = [];
      ORDER.forEach(s => (POSES[s.id] || []).forEach(([spec, p]) => MKF.push({ t: at(s.id, spec), p })));
      MKF.sort((a, b) => a.t - b.t);
    }
    let cur = { x: 556, y: 700, s: 1, mood: 'normal', look: [0, 0], o: 1 }, prev = { ...cur }, tk = -1;
    for (const k of MKF) { if (k.t <= t) { prev = cur; cur = { ...cur, ...k.p }; tk = k.t; } else break; }
    const p = easeInOut(clamp((t - tk) / .9));
    return { x: lerp(prev.x, cur.x, p), y: lerp(prev.y, cur.y, p), s: lerp(prev.s, cur.s, p), o: lerp(prev.o ?? 1, cur.o ?? 1, p), lx: lerp(prev.look[0], cur.look[0], p), ly: lerp(prev.look[1], cur.look[1], p), mood: cur.mood, since: t - tk, moving: p < 1 };
  }
  function updateMascot(t) {
    const m = document.getElementById('mascot'), st = mascotState(t);
    const fi = Math.floor(t * TL.fps);
    const env = TL.env[Math.min(TL.env.length - 1, fi)] || 0;
    const envS = (TL.env[Math.max(0, fi - 3)] || 0) * .5 + env * .5;
    let bob = Math.sin(t * 2.3) * 7, rot = Math.sin(t * 1.3) * 2.5, jump = 0, shakeX = 0, land = 0;
    if (st.mood === 'worried') shakeX = Math.sin(t * 38) * 1.6;
    if (st.mood === 'angry') { shakeX = Math.sin(t * 46) * 3.2; rot += Math.sin(t * 23) * 2; }
    if (st.mood === 'jump') { const ph = (t * 1.6) % 1; jump = -Math.sin(Math.PI * ph) * 46; land = ph < .12 ? (1 - ph / .12) : 0; }
    if (st.mood === 'shake') rot += Math.sin(t * 9) * 8;
    const sq = 1 + envS * .08 - land * .12;
    m.style.opacity = st.o.toFixed(3);
    m.style.transform = `translate(${(st.x + shakeX).toFixed(2)}px,${(st.y + bob + jump).toFixed(2)}px) scale(${st.s.toFixed(4)}) rotate(${rot.toFixed(2)}deg) scale(${(2 - sq).toFixed(4)},${sq.toFixed(4)})`;
    const bp = (t % 3.7); const blink = bp > 3.55 ? 0.12 : 1;
    const happy = ['happy', 'jump', 'wave'].includes(st.mood);
    m.querySelectorAll('.eye').forEach((e, i) => {
      e.classList.toggle('arc', happy);
      const sy = happy ? 1 : blink, h = st.mood === 'worried' ? .78 : st.mood === 'angry' ? .7 : 1;
      let rr = st.mood === 'worried' ? (i ? 14 : -14) : st.mood === 'angry' ? (i ? -26 : 26) : -8; if (happy) rr = 0;
      const lx = st.lx * 10, ly = st.ly * 10 + (st.mood === 'think' ? -10 : 0);
      e.style.transform = `translate(${lx.toFixed(2)}px,${ly.toFixed(2)}px) rotate(${rr}deg) scaleY(${(sy * h).toFixed(3)})`;
    });
    m.querySelector('.sweat').style.opacity = st.mood === 'worried' ? clamp(st.since * 2) : 0;
    m.querySelector('.sweat').style.transform = `translateY(${(t * 18) % 14}px)`;
    m.querySelectorAll('.blush').forEach(b => b.style.opacity = happy ? .85 : st.mood === 'angry' ? 1 : .4);
    const ang = st.mood === 'angry' ? 1 : 0;
    m.querySelectorAll('.brow').forEach((b, i) => { b.style.opacity = ang; b.style.transform = `translate(${(st.lx * 10).toFixed(2)}px,${(st.ly * 10 + 6).toFixed(2)}px) rotate(${i ? -24 : 24}deg)`; });
    const vein = m.querySelector('.vein'); vein.style.opacity = ang; vein.style.transform = `scale(${(1 + .18 * Math.abs(Math.sin(t * 6))).toFixed(3)})`;
    m.querySelectorAll('.steam').forEach((s, i) => { const ph = (t * 1.4 + i * .5) % 1; s.style.opacity = st.mood === 'angry' ? (Math.sin(Math.PI * ph) * .95).toFixed(3) : 0; s.style.transform = `translate(${(i ? 1 : -1) * ph * 26}px,${-ph * 60}px) scale(${(.6 + ph * .8).toFixed(3)})`; });
    m.querySelector('.sprout').style.transform = `rotate(${(Math.sin(t * 3.1) * 10 + (st.mood === 'jump' ? Math.sin(t * 12) * 12 : 0)).toFixed(2)}deg)`;
    const hl = m.querySelector('.hl'), hr = m.querySelector('.hr');
    const hb = envS * 10;
    if (st.mood === 'cover') {
      const p = easeOut(clamp(st.since / .4));
      hl.style.transform = `translate(${lerp(0, 92, p)}px,${lerp(0, -38, p)}px)`;
      hr.style.transform = `translate(${lerp(0, -92, p)}px,${lerp(0, -38, p)}px)`;
    } else if (st.mood === 'wave') {
      hl.style.transform = `translate(0px,${-hb}px)`;
      hr.style.transform = `translate(6px,${-70 + Math.sin(t * 9) * 14}px)`;
    } else if (st.mood === 'jump' || st.mood === 'happy') {
      hl.style.transform = `translate(-6px,${-30 - Math.abs(Math.sin(t * 4.2)) * 20}px)`;
      hr.style.transform = `translate(6px,${-30 - Math.abs(Math.sin(t * 4.2 + 1)) * 20}px)`;
    } else {
      hl.style.transform = `translate(0px,${-hb + Math.sin(t * 2.3 + 1) * 3}px)`;
      hr.style.transform = `translate(0px,${-hb * .7 + Math.sin(t * 2.3 + 2) * 3}px)`;
    }
  }

  // ---------- 漂浮装饰 ----------
  function updateDeco(t) {
    document.querySelectorAll('#deco .d').forEach(d => {
      const f = +d.dataset.f;
      d.style.transform = `translate(${(Math.sin(t * .6 + f) * 10).toFixed(1)}px,${(Math.cos(t * .8 + f * 1.7) * 14).toFixed(1)}px) rotate(${(Math.sin(t * .5 + f) * 25).toFixed(1)}deg) scale(${(1 + Math.sin(t * 1.4 + f * 2) * .15).toFixed(3)})`;
    });
  }

  // ---------- 字幕 ----------
  const KW = [
    [/Claude Code|Claude|CC|claude|[Aa]nthropic/g, 'k-claude'],
    [/Grok Bot|Grok|Bot|Cursor|X(?=、)/g, 'k-bot'],
    [/1,140 万|2026|30 美元|五十|四个|五个|第[一二三四五]步?/g, 'k-num'],
    [/Linux|HTML|API|AI team|AI|Agent team|agent tool|Pro|tips|Login successful|Codex|OpenAI|Opus|Astra|Twitter|IP/g, 'k-tech'],
  ];
  // 字幕标记：{重点} → 黄色荧光笔；[警示] → 红色；其余文字按关键词自动上色
  function markup(s) {
    const re = /\{([^}]*)\}|\[([^\]]*)\]/g; let last = 0, m, html = '';
    while ((m = re.exec(s))) {
      if (m.index > last) html += autoColor(s.slice(last, m.index));
      html += m[1] != null ? `<span class="k-key">${autoColor(m[1])}</span>` : `<span class="k-warn">${esc(m[2])}</span>`;
      last = re.lastIndex;
    }
    return html + autoColor(s.slice(last));
  }
  function autoColor(s) {
    let tokens = [{ t: s }];
    KW.forEach(([re, cls]) => {
      const out = [];
      tokens.forEach(tok => {
        if (tok.c) { out.push(tok); return; }
        let last = 0; tok.t.replace(re, (m, ...a) => { const i = a[a.length - 2]; if (i > last) out.push({ t: tok.t.slice(last, i) }); out.push({ t: m, c: cls }); last = i + m.length; return m; });
        if (last < tok.t.length) out.push({ t: tok.t.slice(last) });
      });
      tokens = out;
    });
    return tokens.map(x => x.c ? `<span class="${x.c}">${esc(x.t)}</span>` : esc(x.t)).join('');
  }
  function subWindows() {
    if (subWindows.w) return subWindows.w;
    subWindows.w = TL.subs.map((s, i) => { const nx = TL.subs[i + 1]; return { s, end: nx && nx.start - s.end < .6 ? nx.start : s.end + .25, cont: !!(nx && nx.start - s.end < .6) }; });
    return subWindows.w;
  }
  function updateSub(t) {
    const el = document.getElementById('sub'), tx = document.getElementById('subtxt');
    let cur = null, fade = 1, prevCont = false;
    const W = subWindows();
    for (let i = 0; i < W.length; i++) {
      const w = W[i];
      if (t >= w.s.start && t < w.end) { cur = w.s; prevCont = i > 0 && W[i - 1].cont; break; }
      if (!w.cont && t >= w.end && t < w.end + .22) { cur = w.s; fade = 1 - (t - w.end) / .22; break; }
    }
    if (!cur) { el.style.opacity = 0; return; }
    const txt = cur.text.replace(/[，。；：、]$/, '');
    if (el.dataset.k !== txt) { el.dataset.k = txt; tx.innerHTML = markup(txt); }
    const dt = t - cur.start;
    el.style.setProperty('--sk', easeInOut(clamp((dt - .12) / .45)).toFixed(3));
    const p = prevCont ? easeBack(clamp(dt / .22)) : easeElastic(clamp(dt / .5));
    const sc = prevCont ? lerp(.94, 1, p) : lerp(.6, 1, p);
    el.style.opacity = (Math.min(1, prevCont ? .6 + dt / .15 : dt / .12) * fade).toFixed(3);
    el.style.transform = `translate(-50%,-50%) scale(${(sc * (fade < 1 ? lerp(.9, 1, fade) : 1)).toFixed(4)})`;
    el.querySelector('.subbot').style.transform = `translateY(${(Math.sin(t * 4) * 3).toFixed(1)}px) rotate(${(-12 + Math.sin(t * 2.2) * 8).toFixed(1)}deg)`;
  }

  // ---------- 场景显隐 ----------
  function updateScenes(t) {
    ORDER.forEach((s, i) => {
      if (!s.el) return;
      const nxt = ORDER[i + 1], full = s.el.classList.contains('full');
      const a = s.start - .3, b = nxt ? nxt.start - .15 : 1e9;
      const pin = i === 0 ? 1 : easeOut(clamp((t - a) / .6)), pout = easeInOut(clamp((t - b) / .5));
      const o = Math.min(pin, 1 - pout);
      s.el.style.opacity = o.toFixed(3);
      s.el.style.visibility = o <= .001 ? 'hidden' : 'visible';
      if (full) s.el.style.transform = `scale(${(lerp(.88, 1, easeBack(clamp((t - a) / .7))) * lerp(1, 1.06, pout)).toFixed(4)})`;
      else s.el.style.transform = `translateY(${((1 - pin) * 20 - pout * 16).toFixed(2)}px) scale(${(lerp(.965, 1, pin) * lerp(1, 1.025, pout)).toFixed(4)})`;
      if (o > .001) updateScene(s, t);
    });
  }

  // ---------- 输入框 / 右侧面板 ----------
  function updateInput(t) {
    const box = document.querySelector('.inputbox .txt'), send = document.querySelector('.inputbox .send');
    let txt = null, on = false, sendP = -1;
    for (const it of INPUTS) {
      const a = at(it.scene, it.at), b = at(it.scene, it.send);
      if (t >= a && t < b) { const n = Math.floor((t - a) / (b - a - .25) * it.text.length); txt = it.text.slice(0, clamp(n, 0, it.text.length)); on = n >= it.text.length; }
      if (t >= b && t < b + .3) sendP = (t - b) / .3;
    }
    if (txt == null) { box.innerHTML = '<span class="ph">给 Grok Bot 发消息，例如：调用 Claude Code 帮我…</span>'; send.classList.remove('on'); }
    else { box.textContent = txt.length > 46 ? '…' + txt.slice(-46) : txt; send.classList.toggle('on', on || txt.length > 0); }
    send.style.transform = sendP >= 0 ? `scale(${(1 + .35 * Math.sin(Math.PI * sendP)).toFixed(3)})` : (on ? `scale(${(1 + .06 * Math.sin(t * 12)).toFixed(3)})` : '');
  }
  const CHAPS = [['rant', 'ban', 'two', 'cons'], ['new', 'what'], ['stable', 'value'], ['overview', 'step1', 'step2', 'step3', 'step4'], ['daily', 'trouble', 'summary'], ['outro', 'follow']];
  function updatePanel(t) {
    let cur = ORDER[0]; ORDER.forEach(s => { if (t >= s.start - .25) cur = s; });
    const ci = CHAPS.findIndex(c => c.includes(cur.id));
    document.querySelectorAll('.chap').forEach((el, i) => { el.classList.toggle('on', i === ci); el.classList.toggle('done', i < ci); });
    const comp = ['step1', 'step2', 'step3', 'step4', 'daily', 'trouble', 'summary'].includes(cur.id);
    document.getElementById('tab-detail').classList.toggle('on', !comp);
    document.getElementById('tab-pc').classList.toggle('on', comp);
    document.getElementById('pane-detail').style.display = comp ? 'none' : 'block';
    document.getElementById('pane-pc').style.display = comp ? 'block' : 'none';
    const st = (id, spec) => t >= at(id, spec);
    const cc = document.getElementById('pc-cc'), au = document.getElementById('pc-auth'), wd = document.getElementById('pc-dir');
    const set = (el, txt, cls) => { if (el.textContent !== txt) el.textContent = txt; el.className = cls || ''; };
    st('step2', 'c5+2.6') ? set(cc, '已安装', 'ok') : st('step2', 'c5') ? set(cc, '安装中…', 'go') : set(cc, '未安装');
    st('step3', 'c7') ? set(au, '已登录', 'ok') : st('step3', 'c3') ? set(au, '授权中…', 'go') : set(au, '未登录');
    st('step4', 'c6') ? set(wd, '已跑通', 'ok') : st('step4', 'c2') ? set(wd, '/workspace/cc-demo', 'go') : set(wd, '—');
    const steps = [st('step1', 'c2'), st('step2', 'c8'), st('step3', 'c7'), st('step4', 'c6')];
    document.querySelectorAll('.steps4 div').forEach((d, i) => d.classList.toggle('on', steps[i]));
  }

  // ---------- 音效事件（供 sfx.py 混音） ----------
  function collectSfx() {
    const ev = [], push = (t, k, extra) => ev.push(Object.assign({ t: +t.toFixed(3), k }, extra || {}));
    ORDER.forEach((s, i) => {
      if (i > 0) push(s.start - .3, s.el && s.el.classList.contains('full') ? 'zoomin' : 'whoosh');
      if (!s.el) return;
      s.items.forEach(it => {
        const o = it.el.dataset.sfx;
        if (it.tin >= 0 && o !== 'none') {
          let k = o;
          if (!k) {
            if (it.anim === 'pop') k = 'pop';
            else if (it.anim === 'grow') k = 'swish';
            else if (it.anim === 'none') k = null;
            else if (it.el.matches('.card,.chip,.bubble,.term,.sm-box,.stepchip,.row,.abs')) k = 'soft';
          }
          if (k) push(it.tin, k);
        }
        if (it.emph != null) push(it.emph, 'chime');
      });
      s.types.forEach(ty => push(ty.tin, 'keys', { d: +(ty.full.length / ty.cps).toFixed(3), n: ty.full.length }));
      s.counts.forEach(c => push(c.tin, 'count', { d: c.dur }));
      s.bars.forEach(b => push(b.a, 'rise', { d: +(b.b - b.a).toFixed(3) }));
      s.ons.forEach(h => push(h.a, h.el.classList.contains('x-over') ? 'strike' : (h.chk ? 'ding' : 'soft')));
      s.hls.forEach(h => push(h.a, 'marker'));
      s.mks.forEach(m => push(m.a, 'marker'));
      s.bursts.forEach(b => push(b.a, 'sparkle'));
      s.texts.forEach(x => push(x.a, 'pop'));
    });
    INPUTS.forEach(it => { const a = at(it.scene, it.at), b = at(it.scene, it.send); push(a, 'keys', { d: +(b - a - .25).toFixed(3), n: it.text.length }); push(b, 'send'); });
    CAMSEG.forEach(sg => { const dz = sg.to.z - sg.from.z; if (dz > .06) push(sg.t0, 'zoomin'); else if (dz < -.06) push(sg.t0, 'zoomout'); });
    let lastMood = null; (MKF || mascotState(0) && MKF).forEach(k => { if (k.p.mood && k.p.mood !== lastMood) { const m = k.p.mood; if (m === 'jump') push(k.t, 'boing'); if (m === 'worried') push(k.t, 'uhoh'); if (m === 'happy' || m === 'wave') push(k.t, 'twinkle'); if (m === 'cover') push(k.t, 'pop'); lastMood = m; } });
    if (SC.step4) push(at('step4', 's19') - .05, 'click');
    if (SC.summary) push(at('summary', 'x0+0.15'), 'shutter');
    if (SC.follow) { push(at('follow', 's2-0.3'), 'click'); push(at('follow', 'c0+0.2'), 'boing'); }
    return ev.sort((a, b) => a.t - b.t);
  }

  window.initTimeline = tl => { setup(tl); };
  window.collectSfx = collectSfx;
  window.seek = t => { updateCam(t); updateDeco(t); updateScenes(t); updateMascot(t); updateSub(t); updateInput(t); updatePanel(t); };
})();
