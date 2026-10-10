/* Tiny localStorage-backed store. Everything stays in the user's browser. */
window.Store = (function () {
  const KEY = 'mindsathi.v1';

  const defaults = () => ({
    profile: null,                 // { name }
    lang: 'en',
    settings: { voice: true, autoplay: true, speed: 1, large: false, contrast: false, reduced: false },
    conversations: [],             // [{ id, lang, messages: [{ role, text, emotion, conf, ts }] }]
    moods: [],                     // [{ emotion, conf, ts, lang }]
    journal: [],                   // [{ id, text, ts }]
    counters: { breathing: 0, grounding: 0, games: 0 },
    contact: null,                 // { name, phone }
    resources: []                  // [{ id, name, type, phone, website, location, languages[], verified }]
  });

  function load() {
    const base = defaults();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      return Object.assign(base, saved, {
        settings: Object.assign(base.settings, saved.settings || {}),
        counters: Object.assign(base.counters, saved.counters || {})
      });
    } catch (e) { return base; }
  }

  let state = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }

  return {
    get: () => state,
    update(fn) { fn(state); save(); return state; },
    clear(keys) {                  // reset selected parts of the state
      const d = defaults();
      keys.forEach(k => { state[k] = d[k]; });
      save();
    },
    clearAll() { const lang = state.lang; state = defaults(); state.lang = lang; save(); }
  };
})();
