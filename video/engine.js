// 确定性时间轴引擎：window.seek(t) 根据时间 t（秒）设置整页状态，逐帧截图使用。
(function () {
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeInOut = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeBack = p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };

  let TL, SC = {}, ORDER = [];

  // 时间描述："c2+0.3" 第 2 句开始后 0.3s；"s4" 本场第 4 条字幕；"e" 场景结束；"b+1" 场景开始后 1s；"x2" 第 2 句结束
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

  function setup(tl) {
    TL = tl;
    tl.scenes.forEach((s, i) => {
      s.subs = tl.subs.filter(u => u.start >= s.start - 1e-6 && u.start < s.end);
      s.el = document.querySelector(`[data-scene="${s.id}"]`);
      s.idx = i; SC[s.id] = s; ORDER.push(s);
      if (!s.el) return;
      s.items = [...s.el.querySelectorAll('[data-in],[data-out]')].map(el => ({
        el, tin: el.dataset.in ? at(s.id, el.dataset.in) : -1, tout: el.dataset.out ? at(s.id, el.dataset.out) : 1e9,
        anim: el.dataset.anim || 'up', dur: +(el.dataset.dur || .55), base: el.style.transform || ''
      }));
      s.types = [...s.el.querySelectorAll('[data-type]')].map(el => ({ el, full: el.textContent, tin: at(s.id, el.dataset.type), cps: +(el.dataset.cps || 28), caret: el.dataset.caret !== 'no' }));
      s.counts = [...s.el.querySelectorAll('[data-count]')].map(el => ({ el, tin: at(s.id, el.dataset.count), to: +el.dataset.to, dur: +(el.dataset.dur || 1.6) }));
      s.hls = [...s.el.querySelectorAll('[data-hl]')].map(el => { const [a, b] = el.dataset.hl.split(':'); return { el, a: at(s.id, a), b: b ? at(s.id, b) : 1e9 }; });
      s.ons = [...s.el.querySelectorAll('[data-on]')].map(el => ({ el, a: at(s.id, el.dataset.on), cls: el.dataset.cls || 'on' }));
      s.bars = [...s.el.querySelectorAll('[data-bar]')].map(el => { const [a, b] = el.dataset.bar.split(':'); return { el, a: at(s.id, a), b: at(s.id, b), to: +(el.dataset.to || 100), from: +(el.dataset.from || 0) }; });
      s.texts = [...s.el.querySelectorAll('[data-swap]')].map(el => ({ el, a: at(s.id, el.dataset.swap), from: el.innerHTML, to: el.dataset.to }));
    });
    // 预加载字体所用字形
    const pre = document.getElementById('preload');
    const all = document.body.innerText + tl.subs.map(s => s.text).join('') + [...document.querySelectorAll('[data-to]')].map(e => e.dataset.to).join('');
    pre.innerHTML = [400, 500, 600, 700, 800, 900].map(w => `<div style="font-weight:${w}">${esc(all)}</div><div style="font-weight:${w};font-family:var(--mono)">${esc(all)}</div>`).join('');
  }
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function applyItem(it, t) {
    const pin = it.tin < 0 ? 1 : clamp((t - it.tin) / it.dur);
    const pout = clamp((t - it.tout) / .35);
    let o = 1, tr = '';
    if (it.anim === 'none') { o = pin > 0 ? 1 : 0; }
    else if (it.anim === 'fade') { o = easeOut(pin); }
    else if (it.anim === 'pop') { const e = easeBack(pin); o = clamp(pin * 2.2); tr = `scale(${lerp(.6, 1, e)})`; }
    else if (it.anim === 'grow') { const e = easeOut(pin); tr = `scaleX(${e})`; o = pin > 0 ? 1 : 0; }
    else if (it.anim === 'left') { const e = easeOut(pin); o = e; tr = `translateX(${lerp(-40, 0, e)}px)`; }
    else if (it.anim === 'right') { const e = easeOut(pin); o = e; tr = `translateX(${lerp(40, 0, e)}px)`; }
    else if (it.anim === 'down') { const e = easeOut(pin); o = e; tr = `translateY(${lerp(-30, 0, e)}px)`; }
    else { const e = easeOut(pin); o = e; tr = `translateY(${lerp(28, 0, e)}px)`; }
    if (pout > 0) { o *= 1 - easeOut(pout); tr += ` scale(${lerp(1, .96, pout)})`; }
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
    s.counts.forEach(c => { const p = easeOut(clamp((t - c.tin) / c.dur)); const v = Math.round(c.to * p); c.el.textContent = v.toLocaleString('en-US'); });
    s.hls.forEach(h => h.el.classList.toggle('hl', t >= h.a && t < h.b));
    s.ons.forEach(h => h.el.classList.toggle(h.cls, t >= h.a));
    s.bars.forEach(b => { b.el.style.width = lerp(b.from, b.to, easeInOut(clamp((t - b.a) / (b.b - b.a)))) + '%'; });
    s.texts.forEach(x => { const v = t >= x.a ? x.to : x.from; if (x.el.innerHTML !== v) x.el.innerHTML = v; });
    const hook = HOOKS[s.id]; if (hook) hook(t, s);
  }

  // ---------- 吉祥物 ----------
  const POSES = window.POSES || {};
  function mascotState(t) {
    // 收集所有关键帧（绝对时间）
    if (!mascotState.kf) {
      const kf = [];
      ORDER.forEach(s => (POSES[s.id] || []).forEach(([spec, p]) => kf.push({ t: at(s.id, spec), p })));
      kf.sort((a, b) => a.t - b.t); mascotState.kf = kf;
    }
    const kf = mascotState.kf;
    let cur = { x: 556, y: 700, s: 1, mood: 'normal', look: [0, 0], o: 1 }, prev = { ...cur }, tk = -1;
    for (const k of kf) { if (k.t <= t) { prev = cur; cur = { ...cur, ...k.p }; tk = k.t; } else break; }
    const p = easeInOut(clamp((t - tk) / .8));
    return { x: lerp(prev.x, cur.x, p), y: lerp(prev.y, cur.y, p), s: lerp(prev.s, cur.s, p), o: lerp(prev.o ?? 1, cur.o ?? 1, p), lx: lerp(prev.look[0], cur.look[0], p), ly: lerp(prev.look[1], cur.look[1], p), mood: cur.mood, since: t - tk };
  }
  function updateMascot(t) {
    const m = document.getElementById('mascot'), st = mascotState(t);
    const env = TL.env[Math.min(TL.env.length - 1, Math.floor(t * TL.fps))] || 0;
    const envS = (TL.env[Math.max(0, Math.floor(t * TL.fps) - 2)] || 0) * .5 + env * .5;
    let bob = Math.sin(t * 2.3) * 6, rot = Math.sin(t * 1.3) * 2, jump = 0, shakeX = 0;
    if (st.mood === 'worried') shakeX = Math.sin(t * 38) * 1.6;
    if (st.mood === 'jump') { jump = -Math.abs(Math.sin(t * 4.2)) * 40; }
    if (st.mood === 'shake') rot += Math.sin(t * 9) * 8;
    const sq = 1 + envS * .07;
    m.style.opacity = st.o.toFixed(3);
    m.style.transform = `translate(${st.x + shakeX}px,${st.y + bob + jump}px) scale(${st.s}) rotate(${rot}deg) scale(${(2 - sq).toFixed(4)},${sq.toFixed(4)})`;
    // 眨眼
    const bp = (t % 3.7); const blink = bp > 3.55 ? 0.12 : 1;
    const happy = st.mood === 'happy' || st.mood === 'jump' || st.mood === 'wave';
    m.querySelectorAll('.eye').forEach((e, i) => {
      e.classList.toggle('arc', happy);
      let sy = happy ? 1 : blink, h = st.mood === 'worried' ? .78 : 1;
      let rr = st.mood === 'worried' ? (i ? 14 : -14) : -8;
      if (happy) rr = 0;
      const lx = st.lx * 10, ly = st.ly * 10 + (st.mood === 'think' ? -10 : 0);
      e.style.transform = `translate(${lx}px,${ly}px) rotate(${rr}deg) scaleY(${(sy * h).toFixed(3)})`;
    });
    m.querySelector('.sweat').style.opacity = st.mood === 'worried' ? clamp(st.since * 2) : 0;
    m.querySelector('.sweat').style.transform = `translateY(${(t * 18) % 14}px)`;
    m.querySelectorAll('.blush').forEach(b => b.style.opacity = happy ? .7 : 0);
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

  // ---------- 字幕 ----------
  const KW = [
    [/Claude Code|Claude|CC|claude/g, 'k-claude'],
    [/Grok Bot|Grok|Bot|Cursor|X(?=、)/g, 'k-bot'],
    [/1,140 万|2026|30 美元|五十|四个|第[一二三四]步?/g, 'k-num'],
    [/Linux|HTML|API|AI|Agent team|Pro|tips|Login successful/g, 'k-tech'],
  ];
  function markup(s) {
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
  function updateSub(t) {
    const el = document.getElementById('sub');
    let cur = null;
    for (let i = 0; i < TL.subs.length; i++) {
      const s = TL.subs[i], nx = TL.subs[i + 1];
      const end = nx && nx.start - s.end < .6 ? nx.start : s.end + .25;
      if (t >= s.start && t < end) { cur = s; break; }
    }
    if (!cur) { el.style.opacity = 0; return; }
    const txt = cur.text.replace(/[，。；：、]$/, '');
    if (el.dataset.k !== txt) { el.dataset.k = txt; el.innerHTML = markup(txt); }
    const p = easeBack(clamp((t - cur.start) / .18));
    el.style.opacity = 1;
    el.style.transform = `translate(-50%,-50%) scale(${lerp(.94, 1, p)})`;
  }

  // ---------- 场景显隐 ----------
  function updateScenes(t) {
    ORDER.forEach((s, i) => {
      if (!s.el) return;
      const nxt = ORDER[i + 1];
      const a = s.start - .25, b = nxt ? nxt.start - .1 : 1e9;
      const pin = i === 0 ? 1 : easeOut(clamp((t - a) / .5)), pout = easeOut(clamp((t - b) / .4));
      const o = Math.min(pin, 1 - pout);
      s.el.style.opacity = o.toFixed(3);
      s.el.style.visibility = o <= .001 ? 'hidden' : 'visible';
      s.el.style.transform = `translateY(${(1 - pin) * 24 - pout * 24}px) scale(${1 - pout * .02})`;
      if (o > .001) updateScene(s, t);
    });
  }

  // ---------- 输入框 / 右侧面板 ----------
  const INPUTS = window.INPUTS || [];
  function updateInput(t) {
    const box = document.querySelector('.inputbox .txt'), send = document.querySelector('.inputbox .send');
    let txt = null, on = false;
    for (const it of INPUTS) {
      const a = at(it.scene, it.at), b = at(it.scene, it.send);
      if (t >= a && t < b) { const n = Math.floor((t - a) / (b - a - .25) * it.text.length); txt = it.text.slice(0, clamp(n, 0, it.text.length)); on = n >= it.text.length; }
    }
    if (txt == null) { box.innerHTML = '<span class="ph">给 Grok Bot 发消息，例如：调用 Claude Code 帮我…</span>'; send.classList.remove('on'); }
    else { box.textContent = txt.length > 46 ? '…' + txt.slice(-46) : txt; send.classList.toggle('on', on || txt.length > 0); }
  }
  const CHAPS = [['ban', 'two', 'cons'], ['new', 'what', 'price', 'benefits'], ['principle'], ['overview', 'step1', 'step2', 'step3', 'step4'], ['daily', 'trouble'], ['outro']];
  function updatePanel(t) {
    let cur = ORDER[0]; ORDER.forEach(s => { if (t >= s.start - .25) cur = s; });
    const ci = CHAPS.findIndex(c => c.includes(cur.id));
    document.querySelectorAll('.chap').forEach((el, i) => { el.classList.toggle('on', i === ci); el.classList.toggle('done', i < ci); });
    const comp = ['step1', 'step2', 'step3', 'step4', 'daily', 'trouble'].includes(cur.id);
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

  const HOOKS = window.HOOKS = window.HOOKS || {};

  window.initTimeline = tl => { setup(tl); };
  window.seek = t => { updateScenes(t); updateMascot(t); updateSub(t); updateInput(t); updatePanel(t); };
})();
