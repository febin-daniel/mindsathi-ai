/* MindSathi AI – app shell, router and pages */
(function () {
  'use strict';

  const Store = window.Store, Emotion = window.Emotion, Games = window.Games, I18N = window.I18N;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const st = () => Store.get();
  const t = (k) => I18N.t(k, st().lang);
  const view = $('#view');
  let cleanup = null;

  /* ---------- icons ---------- */
  const PATHS = {
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
    voice: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    mood: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    wellness: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
    games: '<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4M15 12h.01M17.5 14h.01"/>',
    support: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M12 8v4M12 15h.01"/>',
    insight: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    logout: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    send: '<path d="M4 12l16-8-6 16-3-7z"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    msg: '<rect x="4" y="5" width="16" height="12" rx="3"/><path d="M8 21l3-4"/>'
  };
  const ic = (n, s) => '<svg viewBox="0 0 24 24" width="' + (s || 22) + '" height="' + (s || 22) +
    '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (PATHS[n] || '') + '</svg>';

  /* ---------- small helpers ---------- */
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600);
  }
  const chip = (emotion, conf) => {
    const m = Emotion.META[emotion] || Emotion.META.neutral;
    return '<span class="chip" style="background:' + m.bg + ';color:' + m.color + '"><i style="background:' + m.color + '"></i>' + m.label +
      (conf != null ? ' <span class="chip-conf">· ' + Math.round(conf) + '%</span>' : '') + '</span>';
  };
  const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
  const fmtDate = (ts) => new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const activities = () => { const c = st().counters; return c.breathing + c.grounding + c.games; };
  const speechLang = () => I18N.info(st().lang).speech;
  const hasApi = () => !!(window.MINDSATHI_CONFIG && window.MINDSATHI_CONFIG.apiUrl);

  function applySettings() {
    const s = st().settings, root = document.documentElement;
    root.classList.toggle('large-text', !!s.large);
    root.classList.toggle('high-contrast', !!s.contrast);
    root.classList.toggle('reduce-motion', !!s.reduced);
    root.lang = st().lang;
  }
  const reduced = () => st().settings.reduced || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- summary of mood data ---------- */
  function summary() {
    const s = st(), moods = s.moods, counts = {};
    moods.forEach(m => { counts[m.emotion] = (counts[m.emotion] || 0) + 1; });
    const total = moods.length;
    let top = null;
    Object.keys(counts).forEach(k => { if (!top || counts[k] > counts[top]) top = k; });
    const langCounts = {};
    s.conversations.forEach(c => { langCounts[c.lang] = (langCounts[c.lang] || 0) + 1; });
    let topLang = null;
    Object.keys(langCounts).forEach(k => { if (!topLang || langCounts[k] > langCounts[topLang]) topLang = k; });
    const last = moods[moods.length - 1] || null;
    return {
      counts, total, top,
      topShare: top ? Math.round(counts[top] / total * 100) : 0,
      avgConf: total ? Math.round(moods.reduce((a, m) => a + m.conf, 0) / total) : 0,
      last, convos: s.conversations.filter(c => c.messages.length).length,
      topLang: topLang ? I18N.info(topLang).english : I18N.info(s.lang).english
    };
  }

  /* ---------- speech ---------- */
  function speak(text, lang) {
    const s = st().settings;
    if (!s.voice || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang ? I18N.info(lang).speech : speechLang();
    u.rate = s.speed;
    speechSynthesis.speak(u);
  }

  /* ---------- conversation ---------- */
  function activeConv() {
    let c = st().conversations[st().conversations.length - 1];
    if (!c) {
      Store.update(s => s.conversations.push({ id: Date.now(), lang: s.lang, messages: [] }));
      c = st().conversations[st().conversations.length - 1];
    }
    return c;
  }

  async function sendMessage(text) {
    const det = Emotion.detect(text), crisis = Emotion.isCrisis(text), now = Date.now();
    activeConv();
    Store.update(s => {
      const c = s.conversations[s.conversations.length - 1];
      c.messages.push({ role: 'user', text, emotion: det.emotion, conf: det.conf, ts: now });
      if (det.emotion !== 'neutral') s.moods.push({ emotion: det.emotion, conf: det.conf, ts: now, lang: s.lang });
    });
    let reply = null;
    if (hasApi()) {
      try {
        const msgs = activeConv().messages.slice(-12).map(m => ({ role: m.role, text: m.text }));
        const res = await fetch(window.MINDSATHI_CONFIG.apiUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: msgs, language: st().lang })
        });
        const data = await res.json();
        if (data && data.reply) reply = { text: String(data.reply), tool: null, lang: st().lang };
      } catch (e) { /* fall back to demo reply below */ }
    }
    if (crisis) {
      // Always lead with a caring, direct message when someone may be in danger – never a generic reply.
      reply = { text: "I'm really glad you told me. What you're feeling matters, and you don't have to face it alone. Please reach out to a real person right now — the options below can connect you.", tool: null, lang: 'en' };
    }
    if (!reply) reply = Emotion.reply(det.emotion);
    Store.update(s => {
      s.conversations[s.conversations.length - 1].messages.push({ role: 'assistant', text: reply.text, ts: Date.now() });
    });
    return { reply, det, crisis };
  }

  /* ---------- chrome: nav, language, dialogs ---------- */
  const NAV = ['home', 'chat', 'voice', 'mood', 'insights', 'wellness', 'games', 'support', 'how', 'settings', 'privacy'];

  function renderChrome() {
    const route = currentRoute();
    $('#nav').innerHTML = NAV.map(k =>
      '<a href="#/' + k + '"' + (k === route ? ' class="active" aria-current="page"' : '') + '>' + esc(t(k)) + '</a>').join('');
    const sel = $('#lang-select');
    sel.innerHTML = I18N.LANGS.map(l =>
      '<option value="' + l.code + '"' + (l.code === st().lang ? ' selected' : '') + '>' +
      (l.code === 'en' ? 'English' : esc(l.native) + ' · ' + l.english) + '</option>').join('');
    $('#emergency-label').textContent = t('emergency');
  }

  function openEmergency() {
    const c = st().contact;
    const dlg = $('#emergency');
    dlg.innerHTML =
      '<div class="dlg-body"><h2 id="em-title">' + esc(t('emergency')) + '</h2>' +
      '<p><strong>If you or someone near you is in immediate danger, call 112 now.</strong></p>' +
      '<ul class="help-list">' +
      '<li><div><b>Tele-MANAS</b><span>Free mental-health helpline (India)</span></div><a class="btn btn-primary" href="tel:14416">Call 14416</a></li>' +
      '<li><div><b>KIRAN</b><span>Mental-health rehabilitation helpline (India)</span></div><a class="btn btn-primary" href="tel:18005990019">Call 1800-599-0019</a></li>' +
      (c && c.phone ? '<li><div><b>' + esc(c.name || 'Trusted contact') + '</b><span>Your trusted contact</span></div><a class="btn btn-primary" href="tel:' + esc(c.phone.replace(/[^\d+]/g, '')) + '">Call</a></li>'
        : '<li><div><b>Trusted contact</b><span>Add someone you trust in Settings so they appear here.</span></div><a class="btn btn-ghost" href="#/settings" data-close>Add</a></li>') +
      '</ul>' +
      '<p class="muted small">Helpline details can change. Please check they are current before relying on them.</p>' +
      '<div class="row end"><button class="btn btn-ghost" type="button" data-close>Close</button></div></div>';
    if (!dlg.open) dlg.showModal();
  }

  function setupWelcome() {
    const dlg = $('#welcome');
    $('#wl-lang').innerHTML = I18N.LANGS.map(l => '<option value="' + l.code + '"' + (l.code === st().lang ? ' selected' : '') + '>' +
      (l.code === 'en' ? 'English' : esc(l.native) + ' · ' + l.english) + '</option>').join('');
    $('#welcome-form').addEventListener('submit', () => {
      const name = $('#wl-name').value.trim();
      Store.update(s => { s.profile = { name: name }; s.lang = $('#wl-lang').value; });
      applySettings(); renderChrome(); navigate();
    });
    dlg.addEventListener('cancel', (e) => e.preventDefault());
  }
  function maybeWelcome() {
    if (!st().profile && !$('#welcome').open) { $('#wl-name').value = ''; $('#welcome').showModal(); }
  }

  /* ---------- pages ---------- */
  const pages = {};

  /* Home */
  pages.home = function () {
    const s = st(), sm = summary(), name = s.profile && s.profile.name;
    const insight = sm.total
      ? '<p>“' + esc(Emotion.META[sm.top].label) + '” has appeared most often in your recent conversations.</p>' +
        '<p class="row-meta">Most detected emotion: ' + chip(sm.top, sm.topShare) +
        (sm.last ? ' &nbsp; Current state: ' + chip(sm.last.emotion, sm.last.conf) : '') + '</p>' +
        '<p class="stats">Conversations: <b>' + sm.convos + '</b> &nbsp; Most used language: <b>' + esc(sm.topLang) +
        '</b> &nbsp; Wellness activities completed: <b>' + activities() + '</b></p>'
      : '<p>Start a conversation and your emotional patterns will show up here.</p>' +
        '<p class="stats">Conversations: <b>' + sm.convos + '</b> &nbsp; Wellness activities completed: <b>' + activities() + '</b></p>';
    const tiles = [
      ['chat', 'chat', 'Start a text conversation.'], ['voice', 'voice', 'Talk naturally using your voice.'],
      ['mood', 'mood', 'View your recent emotion trends.'], ['wellness', 'wellness', 'Breathing, grounding and journaling tools.'],
      ['games', 'games', 'Short calming activities for a mindful break.'], ['support', 'support', 'Verified professional resources.']
    ];
    view.innerHTML =
      '<h1>' + esc(t('welcome')) + '</h1>' +
      '<p class="lede">Good to see you' + (name ? ', ' + esc(name) : '') + '. Your language is set to ' + esc(I18N.info(s.lang).english) + '.</p>' +
      '<section class="card insight-card"><h2 class="h-icon">' + ic('insight') + ' Your AI Insight</h2>' + insight +
      '<p class="fine">AI-estimated emotional tone — not a medical assessment.</p></section>' +
      '<section class="card"><h2>' + esc(t('insights')) + '</h2><p class="muted">Emotion trends, conversation overview and weekly patterns.</p>' +
      '<a class="link" href="#/insights">View full insights →</a></section>' +
      '<div class="tiles">' + tiles.map(x =>
        '<a class="tile" href="#/' + x[0] + '"><span class="tile-icon">' + ic(x[1], 24) + '</span><b>' + esc(t(x[0])) + '</b><span>' + x[2] + '</span></a>').join('') +
      '<button class="tile tile-emergency" type="button" data-action="emergency"><span class="tile-icon">' + ic('support', 24) + '</span><b>' + esc(t('emergency')) +
      '</b><span>Immediate access to emergency contacts.</span></button></div>';
  };

  /* Chat */
  pages.chat = function () {
    const conv = activeConv();
    view.innerHTML =
      '<div class="page-head"><div><h1>' + esc(t('chat')) + '</h1><p class="lede">A private space to talk through how you feel.</p></div>' +
      '<button class="btn btn-ghost" type="button" id="new-chat">New chat</button></div>' +
      (!hasApi() && st().lang !== 'en' ? '<p class="notice">Demo mode: replies are in English. Connect an AI backend (js/config.js) to reply in your language.</p>' : '') +
      '<section class="card chat"><div class="msgs" id="msgs" aria-live="polite"></div>' +
      '<div class="composer"><label class="sr-only" for="chat-input">Message</label>' +
      '<textarea id="chat-input" rows="1" placeholder="Type how you are feeling…"></textarea>' +
      '<button class="btn btn-primary icon-send" id="chat-send" type="button" aria-label="Send">' + ic('send', 20) + '</button></div></section>';
    const box = $('#msgs'), input = $('#chat-input');

    function bubble(m) {
      const d = document.createElement('div');
      d.className = 'msg ' + (m.role === 'user' ? 'me' : 'ai');
      d.innerHTML = '<p>' + esc(m.text) + '</p>' + (m.role === 'user' && m.emotion && m.emotion !== 'neutral' ? '<small>' + chip(m.emotion, m.conf) + '</small>' : '');
      box.appendChild(d); box.scrollTop = box.scrollHeight; return d;
    }
    function extras(reply, crisis) {
      if (crisis) {
        const d = document.createElement('div'); d.className = 'msg ai crisis';
        d.innerHTML = '<p><b>You matter, and you deserve support right now.</b> If you might act on thoughts of harming yourself, please call 112 or Tele-MANAS (14416), or reach someone you trust.</p>' +
          '<button class="btn btn-danger" type="button" data-action="emergency">Open emergency help</button>';
        box.appendChild(d);
      } else if (reply.tool) {
        const d = document.createElement('div'); d.className = 'msg ai tool';
        d.innerHTML = '<a class="btn btn-ghost" href="#/' + reply.tool + '">Open ' + esc(t(reply.tool)) + '</a>'; box.appendChild(d);
      }
      box.scrollTop = box.scrollHeight;
    }
    if (conv.messages.length) conv.messages.forEach(bubble);
    else bubble({ role: 'assistant', text: "Hi, I'm MindSathi. How are you feeling today? You can type in any language you like." });

    let busy = false;
    async function send() {
      const text = input.value.trim();
      if (!text || busy) return;
      busy = true; input.value = ''; input.style.height = 'auto';
      bubble({ role: 'user', text, emotion: Emotion.detect(text).emotion, conf: Emotion.detect(text).conf });
      const typing = bubble({ role: 'assistant', text: '…' });
      const r = await sendMessage(text);
      typing.remove(); bubble({ role: 'assistant', text: r.reply.text });
      extras(r.reply, r.crisis);
      if (st().settings.autoplay) speak(r.reply.text, r.reply.lang);
      busy = false; input.focus();
    }
    $('#chat-send').addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; });
    $('#new-chat').addEventListener('click', () => {
      Store.update(s => s.conversations.push({ id: Date.now(), lang: s.lang, messages: [] }));
      pages.chat();
    });
    return () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  };

  /* Voice */
  pages.voice = function () {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const s = st();
    view.innerHTML =
      '<div class="center-head"><h1>' + esc(t('voice')) + '</h1><p class="lede">Speaking in ' + esc(I18N.info(s.lang).english) + '. Tap the microphone and start talking.</p></div>' +
      '<section class="card voice-card">' +
      '<button class="orb" id="orb" type="button" aria-pressed="false" aria-label="Tap to speak">' + ic('voice', 56) + '</button>' +
      '<div class="dots" id="dots" aria-hidden="true">' + '<i></i>'.repeat(16) + '</div>' +
      '<p class="status" id="v-status" aria-live="polite">' + (SR ? 'Tap to speak' : 'Voice input is not supported in this browser. Try Chrome or Edge, or use AI Chat.') + '</p>' +
      '<div class="row center"><button class="btn btn-ghost" id="v-toggle" type="button" aria-pressed="' + s.settings.voice + '">' + (s.settings.voice ? 'Voice On' : 'Voice Off') + '</button>' +
      '<label class="speed">Speed ' + '<output id="v-speed-out">' + s.settings.speed + 'x</output>' +
      '<input id="v-speed" type="range" min="0.6" max="1.4" step="0.1" value="' + s.settings.speed + '"></label></div>' +
      '<div class="transcript" id="transcript" aria-live="polite"></div></section>';
    const orb = $('#orb'), status = $('#v-status'), tr = $('#transcript');
    let rec = null, listening = false;

    function setListening(on) {
      listening = on; orb.classList.toggle('listening', on); orb.setAttribute('aria-pressed', String(on));
      $('#dots').classList.toggle('on', on);
      if (on) status.textContent = 'Listening…';
    }
    function line(cls, text) {
      const p = document.createElement('p'); p.className = cls; p.textContent = text; tr.appendChild(p); tr.scrollTop = tr.scrollHeight; return p;
    }
    async function handle(text) {
      line('me', text);
      status.textContent = 'Thinking…';
      const r = await sendMessage(text);
      line('ai', r.reply.text);
      status.textContent = 'Tap to speak';
      if (r.crisis) {
        const d = document.createElement('p'); d.className = 'ai crisis-line';
        d.innerHTML = 'If you might act on thoughts of harming yourself, please call 112 or Tele-MANAS (14416). <button class="link-btn" type="button" data-action="emergency">Open emergency help</button>';
        tr.appendChild(d);
      }
      speak(r.reply.text, r.reply.lang);
    }
    orb.addEventListener('click', () => {
      if (!SR) return;
      if (listening && rec) { rec.stop(); return; }
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      rec = new SR(); rec.lang = speechLang(); rec.interimResults = false; rec.continuous = false;
      rec.onstart = () => setListening(true);
      rec.onend = () => { setListening(false); if (status.textContent === 'Listening…') status.textContent = 'Tap to speak'; };
      rec.onerror = (e) => {
        status.textContent = e.error === 'not-allowed' ? 'Microphone access is blocked. Allow it in your browser settings.'
          : e.error === 'no-speech' ? 'I did not hear anything. Tap to try again.' : 'Voice input stopped. Tap to try again.';
      };
      rec.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join(' ').trim();
        if (text) handle(text);
      };
      try { rec.start(); } catch (err) { /* already started */ }
    });
    $('#v-toggle').addEventListener('click', (e) => {
      Store.update(x => { x.settings.voice = !x.settings.voice; });
      e.currentTarget.textContent = st().settings.voice ? 'Voice On' : 'Voice Off';
      e.currentTarget.setAttribute('aria-pressed', String(st().settings.voice));
      if (!st().settings.voice && 'speechSynthesis' in window) speechSynthesis.cancel();
    });
    $('#v-speed').addEventListener('input', (e) => {
      Store.update(x => { x.settings.speed = +e.target.value; }); $('#v-speed-out').textContent = e.target.value + 'x';
    });
    return () => { try { if (rec) rec.abort(); } catch (e) { /* noop */ } if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  };

  /* Mood */
  pages.mood = function () {
    const sm = summary();
    const order = Object.keys(sm.counts).sort((a, b) => sm.counts[b] - sm.counts[a]);
    const max = order.length ? sm.counts[order[0]] : 1;
    const recent = st().moods.slice(-6).reverse();
    view.innerHTML =
      '<h1>' + esc(t('mood')) + '</h1><p class="lede">A gentle reflection of your recent conversations — not a medical assessment.</p>' +
      '<section class="card"><h2 class="label">Current mood</h2>' +
      (sm.last ? chip(sm.last.emotion, sm.last.conf) +
        '<p>It sounds like you may be feeling ' + esc(Emotion.META[sm.last.emotion].label.toLowerCase()) + '.</p>' +
        '<div class="suggest"><b>Suggestion</b><p>' + esc(Emotion.SUGGESTIONS[sm.last.emotion]) + '</p></div>'
        : '<p>No mood yet. <a class="link" href="#/chat">Talk to AI</a> and your mood will appear here.</p>') + '</section>' +
      '<section class="card"><h2 class="label">Emotion distribution</h2>' +
      (order.length ? '<div class="bars" role="img" aria-label="Emotion distribution chart">' + order.map(k => {
        const m = Emotion.META[k];
        return '<div class="bar-col"><span class="bar-n">' + sm.counts[k] + '</span><div class="bar" style="height:' + Math.max(8, sm.counts[k] / max * 150) + 'px;background:' + m.color + '"></div><span class="bar-l">' + m.label + '</span></div>';
      }).join('') + '</div>' : '<p class="muted">Nothing to chart yet.</p>') + '</section>' +
      (recent.length ? '<section class="card"><h2 class="label">Recent readings</h2><ul class="plain">' + recent.map(m =>
        '<li>' + chip(m.emotion, m.conf) + '<span class="muted small">' + fmtDate(m.ts) + '</span></li>').join('') + '</ul></section>' : '');
  };

  /* Insights */
  pages.insights = function () {
    const sm = summary(), now = new Date(), days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); days.push(d); }
    const week = days.map(d => {
      const k = dayKey(d.getTime()), list = st().moods.filter(m => dayKey(m.ts) === k), c = {};
      list.forEach(m => { c[m.emotion] = (c[m.emotion] || 0) + 1; });
      let dom = null; Object.keys(c).forEach(e => { if (!dom || c[e] > c[dom]) dom = e; });
      return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), n: list.length, dom };
    });
    const wmax = Math.max(1, ...week.map(w => w.n));
    view.innerHTML =
      '<h1>' + esc(t('insights')) + '</h1><p class="lede">Patterns from your own data — AI-estimated, never a medical assessment.</p>' +
      '<section class="card"><h2 class="label">Most common emotion</h2>' + (sm.top ? chip(sm.top, sm.topShare) + '<p>Appeared in ' + sm.topShare + '% of analysed messages.</p>' : '<p class="muted">No data yet.</p>') + '</section>' +
      '<section class="card"><h2 class="label">Average confidence</h2><p class="big">' + sm.avgConf + '%</p><p class="muted">Across ' + sm.total + ' analysed message' + (sm.total === 1 ? '' : 's') + '.</p></section>' +
      '<section class="card"><h2 class="label">Conversation overview</h2><p>Conversations: <b>' + sm.convos + '</b></p><p>Most used language: <b>' + esc(sm.topLang) + '</b></p><p>Wellness activities completed: <b>' + activities() + '</b></p></section>' +
      '<section class="card"><h2 class="label">This week</h2><div class="bars week" role="img" aria-label="Messages analysed per day this week">' + week.map(w =>
        '<div class="bar-col"><span class="bar-n">' + (w.n || '') + '</span><div class="bar" style="height:' + (w.n ? Math.max(8, w.n / wmax * 110) : 4) + 'px;background:' + (w.dom ? Emotion.META[w.dom].color : '#DDD2FA') + '"></div><span class="bar-l">' + w.label + '</span></div>').join('') + '</div></section>';
  };

  /* Wellness */
  pages.wellness = function () {
    const c = st().counters;
    view.innerHTML =
      '<h1>' + esc(t('wellness')) + '</h1><p class="lede">Simple practices you can return to any time.</p>' +
      '<div class="pills" id="w-pills"></div>' +
      '<section class="card center-card"><h2>Breathing Exercise</h2>' +
      '<div class="row center"><label>Session: <select class="pill-select" id="b-len"><option value="60">1 min</option><option value="180">3 min</option><option value="300">5 min</option></select></label></div>' +
      '<div id="b-stage"><div class="breath-wrap"><div class="breath-circle"><span class="breath-label">Ready</span></div></div></div>' +
      '<div class="row center"><button class="btn btn-primary" id="b-go" type="button">Start</button></div></section>' +
      '<section class="card"><h2>Grounding: 5-4-3-2-1</h2><div id="gr"></div></section>' +
      '<section class="card"><h2>Journal</h2><label class="sr-only" for="j-text">Journal entry</label>' +
      '<textarea id="j-text" rows="4" placeholder="Write what is on your mind. Only you can see this on your device."></textarea>' +
      '<div class="row"><button class="btn btn-primary" id="j-save" type="button">Save entry</button></div><ul class="journal" id="j-list"></ul></section>';

    function pills() {
      const k = st().counters;
      $('#w-pills').innerHTML = '<span class="pill p1">Breathing exercises completed: <b>' + k.breathing + '</b></span>' +
        '<span class="pill p2">Grounding exercises completed: <b>' + k.grounding + '</b></span>' +
        '<span class="pill p3">Journal entries: <b>' + st().journal.length + '</b></span>';
    }
    // breathing
    let stop = null;
    $('#b-go').addEventListener('click', () => {
      if (stop) stop();
      stop = Games.breathing($('#b-stage'), {
        seconds: +$('#b-len').value, reduced: reduced(),
        onDone: () => { Store.update(s => { s.counters.breathing++; }); pills(); }
      });
    });
    // grounding
    const steps = [['5', 'things you can see'], ['4', 'things you can feel'], ['3', 'things you can hear'], ['2', 'things you can smell'], ['1', 'thing you can taste']];
    let gi = -1;
    function grounding() {
      const box = $('#gr');
      if (gi < 0) box.innerHTML = '<p class="muted">A quick way to come back to the present.</p><button class="btn btn-ghost" id="gr-go" type="button">Begin</button>';
      else if (gi < steps.length) box.innerHTML = '<p class="ground-step"><b>' + steps[gi][0] + '</b> ' + steps[gi][1] + '</p><p class="muted">Take your time, then continue.</p><button class="btn btn-primary" id="gr-next" type="button">' + (gi === steps.length - 1 ? 'Finish' : 'Next') + '</button>';
      else box.innerHTML = '<p class="ground-step">Well done. Notice how you feel now.</p><button class="btn btn-ghost" id="gr-go" type="button">Do it again</button>';
    }
    $('#gr').addEventListener('click', (e) => {
      if (e.target.closest('#gr-go')) { gi = 0; grounding(); }
      else if (e.target.closest('#gr-next')) {
        gi++;
        if (gi >= steps.length) { Store.update(s => { s.counters.grounding++; }); pills(); }
        grounding();
      }
    });
    // journal
    function journal() {
      const list = st().journal.slice().reverse();
      $('#j-list').innerHTML = list.length ? list.map(j => '<li><div><span class="muted small">' + fmtDate(j.ts) + '</span><p>' + esc(j.text) + '</p></div>' +
        '<button class="icon-btn" type="button" data-del="' + j.id + '" aria-label="Delete entry">' + ic('trash', 18) + '</button></li>').join('') : '';
    }
    $('#j-save').addEventListener('click', () => {
      const v = $('#j-text').value.trim();
      if (!v) { toast('Write something first.'); return; }
      Store.update(s => s.journal.push({ id: Date.now(), text: v, ts: Date.now() }));
      $('#j-text').value = ''; journal(); pills(); toast('Entry saved.');
    });
    $('#j-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-del]'); if (!b) return;
      Store.update(s => { s.journal = s.journal.filter(j => String(j.id) !== b.dataset.del); }); journal(); pills();
    });
    pills(); grounding(); journal();
    return () => { if (stop) stop(); };
  };

  /* Games */
  pages.games = function () {
    function list() {
      view.innerHTML =
        '<h1>' + esc(t('games')) + '</h1><p class="lede-accent">Take a short break</p>' +
        '<p class="lede">Try a simple interactive activity and give your mind a moment to reset.</p>' +
        '<h2 class="sect">Choose your activity</h2><div class="game-grid">' + Games.list.map(g =>
          '<article class="card game-card"><span class="g-emoji" aria-hidden="true">' + g.emoji + '</span><h3>' + esc(g.title) + '</h3><p class="muted">' + esc(g.desc) +
          '</p><p class="time">' + esc(g.time) + '</p><button class="btn btn-primary block" type="button" data-game="' + g.id + '">Start Activity</button></article>').join('') + '</div>';
    }
    let stop = null;
    function open(id) {
      const g = Games.list.find(x => x.id === id); if (!g) return;
      view.innerHTML =
        '<div class="page-head"><div><h1>' + esc(g.title) + '</h1><p class="lede">' + esc(g.desc) + '</p></div>' +
        '<button class="btn btn-ghost" type="button" id="g-back">← All activities</button></div>' +
        '<section class="card game-stage" id="g-stage"></section><p class="notice" id="g-done" hidden>Nice. That counts as a completed activity.</p>';
      let counted = false;
      stop = g.run($('#g-stage'), {
        reduced: reduced(),
        complete: () => {
          if (counted) return; counted = true;
          Store.update(s => { s.counters.games++; }); $('#g-done').hidden = false;
        }
      });
      $('#g-back').addEventListener('click', () => { if (stop) stop(); stop = null; list(); window.scrollTo(0, 0); });
      window.scrollTo(0, 0);
    }
    list();
    view.addEventListener('click', onClick);
    function onClick(e) { const b = e.target.closest('[data-game]'); if (b) open(b.dataset.game); }
    return () => { if (stop) stop(); view.removeEventListener('click', onClick); };
  };

  /* Support */
  pages.support = function () {
    const TYPES = ['Mental Health Professional', 'Counsellor', 'Helpline', 'Support Group', 'Hospital / Clinic'];
    const admin = /[?&]admin(=|&|$)/.test(location.search + location.hash);
    const typeOpts = (all) => (all ? '<option value="">All types</option>' : '') + TYPES.map(x => '<option>' + x + '</option>').join('');
    view.innerHTML =
      '<h1>' + esc(t('support')) + '</h1><p class="lede">Verified professional resources and helplines.</p>' +
      '<section class="card"><h2>National helplines (India)</h2><ul class="help-list">' +
      '<li><div><b>Tele-MANAS</b><span>Free mental-health support, 24/7</span></div><a class="btn btn-ghost" href="tel:14416">14416</a></li>' +
      '<li><div><b>KIRAN</b><span>Mental-health rehabilitation helpline</span></div><a class="btn btn-ghost" href="tel:18005990019">1800-599-0019</a></li>' +
      '<li><div><b>Emergency</b><span>Police, ambulance, fire</span></div><a class="btn btn-ghost" href="tel:112">112</a></li></ul>' +
      '<p class="muted small">Please check helpline details are current before relying on them.</p></section>' +
      '<section class="card filters"><label class="field">Location<input id="f-loc" type="text" placeholder="City or state"></label>' +
      '<label class="field">Language<select id="f-lang"><option value="">All languages</option>' + I18N.LANGS.map(l => '<option>' + l.english + '</option>').join('') + '</select></label>' +
      '<label class="field">Professional type<select id="f-type">' + typeOpts(true) + '</select></label></section>' +
      '<div id="res"></div>' +
      (admin ? '<section class="card"><h2>Add resource (admin)</h2><p class="muted">Enter real, verified information only. Saved on this device.</p>' +
        '<div class="form-grid"><label class="field">Name<input id="a-name" type="text"></label><label class="field">Type<select id="a-type">' + typeOpts(false) + '</select></label>' +
        '<label class="field">Phone<input id="a-phone" type="tel"></label><label class="field">Website<input id="a-web" type="url" placeholder="https://"></label>' +
        '<label class="field">Location<input id="a-loc" type="text"></label><label class="field">Languages (comma separated)<input id="a-langs" type="text"></label></div>' +
        '<div class="row between"><label class="check"><input id="a-ver" type="checkbox" checked> Verified</label><button class="btn btn-primary" id="a-add" type="button">Add</button></div></section>' : '');

    function render() {
      const loc = $('#f-loc').value.trim().toLowerCase(), lang = $('#f-lang').value.toLowerCase(), type = $('#f-type').value;
      const rows = st().resources.filter(r => r.verified &&
        (!loc || (r.location || '').toLowerCase().includes(loc)) &&
        (!lang || r.languages.some(l => l.toLowerCase() === lang)) && (!type || r.type === type));
      $('#res').innerHTML = rows.length ? rows.map(r => {
        const web = /^https?:\/\//i.test(r.website || '') ? '<a class="link" href="' + esc(r.website) + '" target="_blank" rel="noopener noreferrer">Website</a>' : '';
        const ph = r.phone ? '<a class="link" href="tel:' + esc(r.phone.replace(/[^\d+]/g, '')) + '">' + esc(r.phone) + '</a>' : '';
        return '<article class="card"><h3>' + esc(r.name) + '</h3><p class="muted">' + esc(r.type) + (r.location ? ' · ' + esc(r.location) : '') + '</p>' +
          (r.languages.length ? '<p class="small">Languages: ' + esc(r.languages.join(', ')) + '</p>' : '') + '<p class="row-links">' + ph + ' ' + web + '</p></article>';
      }).join('') : '<div class="empty">No verified resources match your filters.</div>';
    }
    ['f-loc', 'f-lang', 'f-type'].forEach(id => $('#' + id).addEventListener('input', render));
    if (admin) {
      $('#a-add').addEventListener('click', () => {
        const name = $('#a-name').value.trim();
        if (!name) { toast('Name is required.'); return; }
        Store.update(s => s.resources.push({
          id: Date.now(), name, type: $('#a-type').value, phone: $('#a-phone').value.trim(), website: $('#a-web').value.trim(),
          location: $('#a-loc').value.trim(), languages: $('#a-langs').value.split(',').map(x => x.trim()).filter(Boolean), verified: $('#a-ver').checked
        }));
        ['a-name', 'a-phone', 'a-web', 'a-loc', 'a-langs'].forEach(id => { $('#' + id).value = ''; });
        toast('Resource added.'); render();
      });
    }
    render();
  };

  /* How it works */
  pages.how = function () {
    const steps = [
      ['Talk or type', 'Share how you feel in text or by voice, in the language you are comfortable with.'],
      ['Estimate the tone', 'MindSathi AI estimates the emotional tone of your messages. It is an estimate, not a diagnosis.'],
      ['Get gentle support', 'You get a supportive reply and suggestions such as breathing, grounding, journaling or a calming activity.'],
      ['Stay in control', 'Your data stays on your device. You can export or delete it at any time in Privacy & Data.']
    ];
    view.innerHTML =
      '<h1>' + esc(t('how')) + '</h1><p class="lede">A calm companion, not a replacement for professional care.</p>' +
      '<ol class="steps">' + steps.map(s => '<li class="card"><h3>' + s[0] + '</h3><p class="muted">' + s[1] + '</p></li>').join('') + '</ol>' +
      '<section class="card notice-card"><h2>When to reach out for more help</h2><p>If you feel unsafe, or think you might harm yourself or someone else, please contact emergency services or a helpline right away.</p>' +
      '<button class="btn btn-danger" type="button" data-action="emergency">Open emergency help</button></section>';
  };

  /* Settings */
  pages.settings = function () {
    const s = st();
    const toggle = (id, label, on, sub) => '<div class="setting"><div><b>' + label + '</b>' + (sub ? '<span class="muted small">' + sub + '</span>' : '') + '</div>' +
      '<input class="switch" type="checkbox" role="switch" id="' + id + '"' + (on ? ' checked' : '') + ' aria-label="' + label + '"></div>';
    view.innerHTML =
      '<h1>' + esc(t('settings')) + '</h1><p class="lede">' + (s.profile && s.profile.name ? esc(s.profile.name) : 'Your profile') + '</p>' +
      '<section class="card"><h2>Language</h2><div class="setting"><div><b>Preferred language</b><span class="muted small">Used for AI replies and voice</span></div>' +
      '<select class="pill-select" id="s-lang">' + I18N.LANGS.map(l => '<option value="' + l.code + '"' + (l.code === s.lang ? ' selected' : '') + '>' + esc(l.native) + '</option>').join('') + '</select></div></section>' +
      '<section class="card"><h2>Voice</h2>' + toggle('s-voice', 'Enable voice', s.settings.voice) + toggle('s-auto', 'Auto-play AI responses', s.settings.autoplay) +
      '<div class="setting"><div><b>Speech speed</b><span class="muted small" id="s-speed-out">' + s.settings.speed + 'x</span></div><input type="range" id="s-speed" min="0.6" max="1.4" step="0.1" value="' + s.settings.speed + '" aria-label="Speech speed"></div></section>' +
      '<section class="card"><h2>Accessibility</h2>' + toggle('s-large', 'Larger text', s.settings.large) + toggle('s-contrast', 'High contrast', s.settings.contrast) + toggle('s-reduced', 'Reduced animation', s.settings.reduced) + '</section>' +
      '<section class="card"><h2>Trusted contact</h2><p class="muted">Shown in Emergency Help so you can reach them quickly.</p><div class="form-grid">' +
      '<label class="field">Name<input id="c-name" type="text" value="' + esc(s.contact ? s.contact.name : '') + '"></label>' +
      '<label class="field">Phone<input id="c-phone" type="tel" value="' + esc(s.contact ? s.contact.phone : '') + '"></label></div>' +
      '<div class="row"><button class="btn btn-primary" id="c-save" type="button">Save contact</button></div></section>' +
      '<section class="card"><h2>Privacy</h2><div class="chips-row"><button class="btn btn-ghost" data-wipe="conversations">Delete conversations</button>' +
      '<button class="btn btn-ghost" data-wipe="moods">Clear mood history</button><button class="btn btn-ghost" data-wipe="journal">Delete journal</button>' +
      '<button class="btn btn-ghost danger-text" data-wipe="all">Delete all my data</button></div>' +
      '<p><a class="link" href="#/privacy">Open Privacy & Data Center</a></p></section>' +
      '<p><button class="link-btn muted-btn" id="s-logout" type="button">' + ic('logout', 18) + ' Log out</button></p>';

    const bind = (id, key) => $('#' + id).addEventListener('change', (e) => { Store.update(x => { x.settings[key] = e.target.checked; }); applySettings(); });
    bind('s-voice', 'voice'); bind('s-auto', 'autoplay'); bind('s-large', 'large'); bind('s-contrast', 'contrast'); bind('s-reduced', 'reduced');
    $('#s-speed').addEventListener('input', (e) => { Store.update(x => { x.settings.speed = +e.target.value; }); $('#s-speed-out').textContent = e.target.value + 'x'; });
    $('#s-lang').addEventListener('change', (e) => setLang(e.target.value));
    $('#c-save').addEventListener('click', () => {
      const name = $('#c-name').value.trim(), phone = $('#c-phone').value.trim();
      Store.update(x => { x.contact = (name || phone) ? { name, phone } : null; }); toast('Contact saved.');
    });
    $('#s-logout').addEventListener('click', logout);
  };

  /* Privacy */
  pages.privacy = function () {
    const rows = [
      ['msg', 'Delete conversations', 'Removes all conversations and their messages permanently.', 'conversations'],
      ['mood', 'Delete mood history', 'Removes all recorded emotion readings.', 'moods'],
      ['book', 'Delete journal entries', 'Removes all private journal entries permanently.', 'journal'],
      ['phone', 'Delete trusted contact', 'Removes your saved trusted contact details.', 'contact']
    ];
    view.innerHTML =
      '<h1>' + esc(t('privacy')) + '</h1><p class="lede">You are in full control of everything stored in the app.</p>' +
      '<div class="notice-card card"><span class="tile-icon">' + ic('support', 22) + '</span><p>Your data is stored in this browser on your device. ' +
      (hasApi() ? 'Messages you send are processed by the AI service this app is connected to.' : 'Nothing is sent to a server in demo mode.') + '</p></div>' +
      rows.map(r => '<section class="card row-card"><span class="tile-icon sm">' + ic(r[0], 20) + '</span><div><b>' + r[1] + '</b><span class="muted small">' + r[2] +
        '</span></div><button class="icon-btn outlined" data-wipe="' + r[3] + '" aria-label="' + r[1] + '">' + ic('trash', 18) + '</button></section>').join('') +
      '<section class="card row-card"><div><b>Export personal data</b><span class="muted small">Download everything as a JSON file.</span></div>' +
      '<button class="btn btn-ghost" id="p-export" type="button">' + ic('download', 18) + ' Export data</button></section>' +
      '<section class="card danger-card"><h2 class="h-icon">' + ic('warn') + ' Delete account data</h2>' +
      '<p>Permanently removes all conversations, moods, journals, contacts and wellness records. This cannot be undone.</p>' +
      '<button class="btn btn-danger-solid" data-wipe="all" type="button">' + ic('trash', 18) + ' Delete all my data</button></section>' +
      '<p class="row-links"><button class="link-btn muted-btn" id="p-logout" type="button">' + ic('logout', 18) + ' Log out</button> <a class="link muted-link" href="#/settings">Back to Settings</a></p>';
    $('#p-export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(st(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mindsathi-data.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('#p-logout').addEventListener('click', logout);
  };

  /* ---------- shared actions ---------- */
  function wipe(what) {
    const msg = what === 'all' ? 'Delete all your data from this device? This cannot be undone.' : 'Delete this data? This cannot be undone.';
    if (!confirm(msg)) return;
    if (what === 'all') {
      const profile = st().profile, settings = st().settings;
      Store.clearAll(); Store.update(s => { s.profile = profile; s.settings = settings; });
    } else Store.clear([what]);
    toast('Deleted.');
    if (currentRoute() === 'privacy' || currentRoute() === 'settings') navigate();
  }
  function logout() {
    if (!confirm('Log out on this device? Your saved data stays unless you delete it.')) return;
    Store.update(s => { s.profile = null; });
    maybeWelcome();
  }
  function setLang(code) {
    Store.update(s => { s.lang = code; });
    applySettings(); renderChrome(); navigate();
  }

  /* ---------- router ---------- */
  function currentRoute() {
    const r = (location.hash || '#/home').replace(/^#\/?/, '').split('?')[0];
    return pages[r] ? r : 'home';
  }
  function navigate() {
    if (cleanup) { try { cleanup(); } catch (e) { /* noop */ } cleanup = null; }
    view.innerHTML = '';
    const c = pages[currentRoute()]();
    if (typeof c === 'function') cleanup = c;
    renderChrome();
    closeMenu();
    window.scrollTo(0, 0);
  }
  function closeMenu() { $('#nav').classList.remove('open'); $('#menu-btn').setAttribute('aria-expanded', 'false'); }

  /* ---------- global events ---------- */
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="emergency"]')) { openEmergency(); return; }
    const w = e.target.closest('[data-wipe]'); if (w) { wipe(w.dataset.wipe); return; }
    if (e.target.closest('[data-close]')) { const d = e.target.closest('dialog'); if (d) d.close(); }
  });
  $('#emergency-btn').addEventListener('click', openEmergency);
  $('#emergency').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
  $('#lang-select').addEventListener('change', (e) => setLang(e.target.value));
  $('#menu-btn').addEventListener('click', () => {
    const open = $('#nav').classList.toggle('open'); $('#menu-btn').setAttribute('aria-expanded', String(open));
  });
  window.addEventListener('hashchange', navigate);

  /* ---------- start ---------- */
  applySettings(); setupWelcome(); renderChrome(); navigate(); maybeWelcome();
})();
