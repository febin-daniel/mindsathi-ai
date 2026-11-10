/* Stress-relief activities. No scores, no timers that pressure the user.
   Each run(box, ctx) renders into `box` and returns a cleanup function.
   ctx = { reduced: boolean, complete(): counts the activity as completed } */
window.Games = (function () {
  const rand = (n) => Math.floor(Math.random() * n);
  const shuffle = (a) => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);

  /* ---------- shared breathing circle (also used by Wellness Tools) ---------- */
  function breathing(box, opts) {
    box.innerHTML =
      '<div class="breath-wrap"><div class="breath-circle"><span class="breath-label">Ready</span></div>' +
      '<p class="breath-time" aria-live="off"></p></div>';
    const circle = box.querySelector('.breath-circle');
    const label = box.querySelector('.breath-label');
    const clock = box.querySelector('.breath-time');
    const phases = [['Breathe in', 4000, 1.35], ['Hold', 2000, 1.35], ['Breathe out', 6000, 1]];
    const end = Date.now() + opts.seconds * 1000;
    let i = 0, stopped = false, timer, tick;

    function finish() {
      stopped = true; clearInterval(tick);
      label.textContent = 'Well done';
      circle.style.transform = 'scale(1)';
      clock.textContent = '';
      if (opts.onDone) opts.onDone();
    }
    function step() {
      if (stopped) return;
      if (Date.now() >= end) { finish(); return; }
      const p = phases[i % 3];
      label.textContent = p[0];
      circle.style.transition = opts.reduced ? 'none' : 'transform ' + p[1] + 'ms ease-in-out';
      circle.style.transform = 'scale(' + p[2] + ')';
      i++;
      timer = setTimeout(step, p[1]);
    }
    function showTime() {
      const r = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      clock.textContent = Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
    }
    tick = setInterval(showTime, 250); showTime(); step();
    return function stop() { stopped = true; clearTimeout(timer); clearInterval(tick); };
  }

  /* ---------- Calm Breath ---------- */
  function calmBreath(box, ctx) {
    box.innerHTML =
      '<div class="row"><label>Length <select class="pill-select" id="cb-len">' +
      '<option value="60">1 minute</option><option value="180">3 minutes</option><option value="300">5 minutes</option></select></label>' +
      '<button class="btn btn-primary" id="cb-go" type="button">Start</button></div><div id="cb-stage"></div>';
    const stage = box.querySelector('#cb-stage');
    let stop = null;
    box.querySelector('#cb-go').addEventListener('click', () => {
      if (stop) stop();
      stop = breathing(stage, { seconds: +box.querySelector('#cb-len').value, reduced: ctx.reduced, onDone: ctx.complete });
    });
    return () => { if (stop) stop(); };
  }

  /* ---------- Mindful Match ---------- */
  function match(box, ctx) {
    const sym = ['🌙', '🌿', '🌸', '🐚', '☀️', '🪷'];
    const deck = shuffle(sym.concat(sym));
    box.innerHTML =
      '<p class="muted">Find the matching pairs. Take your time — there is no clock.</p>' +
      '<div class="match-grid">' + deck.map((s, i) =>
        '<button type="button" class="mcard" data-i="' + i + '" aria-label="Hidden card"><span aria-hidden="true">' + s + '</span></button>').join('') +
      '</div><p class="muted" id="mm" aria-live="polite">Moves: 0</p>';
    const status = box.querySelector('#mm');
    let first = null, lock = false, moves = 0, found = 0;
    const timers = [];
    const hide = (b) => { b.classList.remove('open'); b.setAttribute('aria-label', 'Hidden card'); };

    box.querySelector('.match-grid').addEventListener('click', (e) => {
      const b = e.target.closest('.mcard');
      if (!b || lock || b.classList.contains('open') || b.classList.contains('done')) return;
      b.classList.add('open'); b.setAttribute('aria-label', deck[b.dataset.i]);
      if (!first) { first = b; return; }
      moves++; status.textContent = 'Moves: ' + moves;
      if (deck[first.dataset.i] === deck[b.dataset.i]) {
        first.classList.add('done'); b.classList.add('done'); first = null; found++;
        if (found === sym.length) { status.textContent = 'All pairs found in ' + moves + ' moves. Nicely done.'; ctx.complete(); }
      } else {
        lock = true; const a = first; first = null;
        timers.push(setTimeout(() => { hide(a); hide(b); lock = false; }, 900));
      }
    });
    return () => timers.forEach(clearTimeout);
  }

  /* ---------- Focus Bubbles ---------- */
  function bubbles(box, ctx) {
    box.innerHTML =
      '<div class="row"><label>Length <select class="pill-select" id="fb-len">' +
      '<option value="30">30 seconds</option><option value="60" selected>1 minute</option><option value="120">2 minutes</option></select></label>' +
      '<button class="btn btn-primary" id="fb-go" type="button">Start</button><span class="muted" id="fb-count" aria-live="polite"></span></div>' +
      '<div class="bubble-field" id="fb-field"></div>';
    const field = box.querySelector('#fb-field');
    const count = box.querySelector('#fb-count');
    let spawn = null, ender = null, popped = 0;

    function stopAll() { clearInterval(spawn); clearTimeout(ender); spawn = ender = null; }
    function makeBubble() {
      const b = document.createElement('button');
      const size = 38 + rand(36);
      b.type = 'button'; b.className = 'bubble'; b.setAttribute('aria-label', 'Pop bubble');
      b.style.width = b.style.height = size + 'px';
      b.style.left = rand(Math.max(1, field.clientWidth - size)) + 'px';
      if (ctx.reduced) { b.style.bottom = rand(Math.max(1, field.clientHeight - size)) + 'px'; b.style.animation = 'none'; setTimeout(() => b.remove(), 5000); }
      else { b.style.animationDuration = (6 + rand(4)) + 's'; b.addEventListener('animationend', () => b.remove()); }
      b.addEventListener('click', () => { popped++; count.textContent = 'Popped: ' + popped; b.remove(); });
      field.appendChild(b);
    }
    box.querySelector('#fb-go').addEventListener('click', () => {
      stopAll(); field.innerHTML = ''; popped = 0; count.textContent = 'Popped: 0';
      spawn = setInterval(makeBubble, 800); makeBubble();
      ender = setTimeout(() => {
        stopAll(); field.innerHTML = '<p class="field-msg">Nicely done. You popped ' + popped + '.</p>'; ctx.complete();
      }, +box.querySelector('#fb-len').value * 1000);
    });
    return stopAll;
  }

  /* ---------- Calm Garden ---------- */
  function garden(box, ctx) {
    const stages = ['', '🌱', '🌿', '🌷'];
    const plots = [0, 0, 0, 0, 0, 0];
    let bloomed = false;
    function paint() {
      box.innerHTML =
        '<p class="muted">Tap a plot to plant, then tap again to help it grow.</p><div class="garden-grid">' +
        plots.map((s, i) => '<button type="button" class="plot" data-i="' + i + '" aria-label="Plot ' + (i + 1) + ', ' +
          ['empty', 'seedling', 'sprout', 'in bloom'][s] + '">' + (stages[s] || '·') + '</button>').join('') +
        '</div><div class="row"><button class="btn btn-ghost" id="g-reset" type="button">Start a new garden</button></div>';
    }
    paint();
    box.addEventListener('click', onClick);
    function onClick(e) {
      const p = e.target.closest('.plot');
      if (p) {
        const i = +p.dataset.i;
        if (plots[i] < 3) plots[i]++;
        paint();
        if (!bloomed && plots.every(v => v === 3)) { bloomed = true; ctx.complete(); box.insertAdjacentHTML('beforeend', '<p class="field-msg">Your garden is in full bloom.</p>'); }
        const again = box.querySelectorAll('.plot')[i]; if (again) again.focus();
      } else if (e.target.closest('#g-reset')) { plots.fill(0); bloomed = false; paint(); }
    }
    return () => box.removeEventListener('click', onClick);
  }

  /* ---------- Color & Focus ---------- */
  function colorFocus(box, ctx) {
    const colors = [['Lavender', '#DDD2FA'], ['Sky', '#CFE5F7'], ['Mint', '#D4F0E3'], ['Sand', '#F3E7D3'], ['Rose', '#F7DCE4'], ['Moss', '#DCE8C8']];
    const prompts = [
      'Rest your eyes on this color. Notice how it feels.',
      'Breathe slowly. Find one thing near you that is this color.',
      'Let your shoulders drop as you look at the color.',
      'Imagine this color as a quiet place. What is it like there?'
    ];
    box.innerHTML =
      '<p class="muted">Pick a calm color.</p><div class="swatches">' +
      colors.map((c, i) => '<button type="button" class="swatch" data-i="' + i + '" style="background:' + c[1] + '" aria-label="' + c[0] + '"></button>').join('') +
      '</div><div class="color-panel" id="cf-panel"><p id="cf-text">Choose a color to begin.</p></div>' +
      '<div class="row"><button class="btn btn-ghost" id="cf-next" type="button">New prompt</button></div>';
    const panel = box.querySelector('#cf-panel'), text = box.querySelector('#cf-text');
    let done = false;
    function pick(i) {
      panel.style.background = colors[i][1];
      text.textContent = prompts[rand(prompts.length)];
      if (!done) { done = true; ctx.complete(); }
    }
    box.addEventListener('click', onClick);
    function onClick(e) {
      const s = e.target.closest('.swatch');
      if (s) pick(+s.dataset.i);
      else if (e.target.closest('#cf-next')) text.textContent = prompts[rand(prompts.length)];
    }
    return () => box.removeEventListener('click', onClick);
  }

  /* ---------- Gratitude Cards ---------- */
  function gratitude(box, ctx) {
    const cards = [
      'Name one person who made your week a little easier.',
      'What is a small comfort you enjoyed today?',
      'Think of a place that makes you feel at ease.',
      'What is something your body did for you today?',
      'Recall a kind word someone said to you.',
      'What is one thing you are looking forward to?',
      'Name a skill or strength you are glad to have.',
      'What is a simple food or drink you enjoy?',
      'Think of a moment today that made you smile, even briefly.',
      'What is something you learned recently?'
    ];
    box.innerHTML =
      '<div class="g-card" id="gc" aria-live="polite">Draw a card when you are ready.</div>' +
      '<div class="row"><button class="btn btn-primary" id="gc-draw" type="button">Draw a card</button></div>';
    const card = box.querySelector('#gc');
    let last = -1, done = false;
    box.querySelector('#gc-draw').addEventListener('click', () => {
      let n; do { n = rand(cards.length); } while (n === last);
      last = n; card.textContent = cards[n];
      if (!done) { done = true; ctx.complete(); }
    });
    return () => {};
  }

  /* ---------- Calm Tap ---------- */
  function calmTap(box, ctx) {
    box.innerHTML =
      '<p class="muted">Tap whenever you like. No speed, no score.</p>' +
      '<div class="tap-stage"><button type="button" class="tap-orb" id="tp" aria-label="Tap"><span class="ring"></span></button>' +
      '<p class="tap-text" id="tp-text" aria-live="polite">Tap to begin</p></div>';
    const orb = box.querySelector('#tp'), text = box.querySelector('#tp-text');
    let n = 0, done = false;
    orb.addEventListener('click', () => {
      n++;
      text.textContent = n % 2 ? 'Breathe in…' : 'Breathe out…';
      orb.classList.remove('pulse'); void orb.offsetWidth; if (!ctx.reduced) orb.classList.add('pulse');
      if (!done && n >= 10) { done = true; ctx.complete(); }
    });
    return () => {};
  }

  const list = [
    { id: 'calm-breath', emoji: '🌬️', title: 'Calm Breath', desc: 'Follow a gently expanding circle and slow your breathing.', time: '1–5 minutes', run: calmBreath },
    { id: 'mindful-match', emoji: '🧩', title: 'Mindful Match', desc: 'Find pairs of calming symbols at your own pace.', time: '2–5 minutes', run: match },
    { id: 'focus-bubbles', emoji: '🫧', title: 'Focus Bubbles', desc: 'Pop softly floating bubbles and let your focus settle.', time: '30 seconds–2 minutes', run: bubbles },
    { id: 'calm-garden', emoji: '🌱', title: 'Calm Garden', desc: 'Plant and grow a little garden, one gentle tap at a time.', time: '2–5 minutes', run: garden },
    { id: 'color-focus', emoji: '🎨', title: 'Color & Focus', desc: 'Pick a calm color and rest your eyes with a mindfulness prompt.', time: '1–3 minutes', run: colorFocus },
    { id: 'gratitude', emoji: '💭', title: 'Gratitude Cards', desc: 'Draw a card and reflect on a small positive moment.', time: '2–5 minutes', run: gratitude },
    { id: 'calm-tap', emoji: '✨', title: 'Calm Tap', desc: 'Tap slowly with a soft visual pulse. No speed, no score pressure.', time: '1–2 minutes', run: calmTap }
  ];

  return { list, breathing };
})();
