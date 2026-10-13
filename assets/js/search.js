/* ANEMOIA — client-side search + filters.
   Loads /search.json (built by Jekyll from every piece of content) and filters it in the browser.
   No server, no database. Filters combine: text + type + month + tag.
   Shareable URLs:  /search/?q=rain&type=photography&month=2026-09&tag=dhaka   */
(function () {
  'use strict';
  var root = document.getElementById('finder');
  if (!root) return;

  var els = {
    q: root.querySelector('[name="q"]'),
    type: root.querySelector('[name="type"]'),
    month: root.querySelector('[name="month"]'),
    tag: root.querySelector('[name="tag"]'),
    clear: root.querySelector('.finder__clear'),
    count: document.getElementById('finder-count'),
    out: document.getElementById('results')
  };
  var data = [];
  var index = root.getAttribute('data-index');

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase(); }
  function nice(t) { return String(t).replace(/-/g, ' '); }

  function monthLabel(ym) {
    var p = ym.split('-');
    return new Date(+p[0], +p[1] - 1, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  }

  function fillSelects() {
    var months = {}, tags = {};
    data.forEach(function (d) {
      months[d.date.slice(0, 7)] = 1;
      (d.tags || []).forEach(function (t) { tags[t] = (tags[t] || 0) + 1; });
    });
    Object.keys(months).sort().reverse().forEach(function (m) {
      els.month.insertAdjacentHTML('beforeend', '<option value="' + m + '">' + esc(monthLabel(m)) + '</option>');
    });
    Object.keys(tags).sort().forEach(function (t) {
      els.tag.insertAdjacentHTML('beforeend', '<option value="' + esc(t) + '">' + esc(nice(t)) + ' (' + tags[t] + ')</option>');
    });
  }

  function readURL() {
    var p = new URLSearchParams(location.search);
    els.q.value = p.get('q') || '';
    els.type.value = p.get('type') || '';
    els.month.value = p.get('month') || '';
    els.tag.value = p.get('tag') || '';
    if (els.tag.value !== (p.get('tag') || '')) { // tag not in dropdown — still honour it
      els.tag.insertAdjacentHTML('beforeend', '<option value="' + esc(p.get('tag')) + '">' + esc(nice(p.get('tag'))) + '</option>');
      els.tag.value = p.get('tag');
    }
  }

  function writeURL() {
    var p = new URLSearchParams();
    if (els.q.value.trim()) p.set('q', els.q.value.trim());
    if (els.type.value) p.set('type', els.type.value);
    if (els.month.value) p.set('month', els.month.value);
    if (els.tag.value) p.set('tag', els.tag.value);
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  function highlight(text, words) {
    var out = esc(text);
    words.forEach(function (w) {
      if (!w) return;
      var re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function score(d, words) {
    var title = norm(d.title), desc = norm(d.description), tags = norm((d.tags || []).join(' ')), body = norm(d.excerpt);
    var s = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i], hit = false;
      if (title.indexOf(w) > -1) { s += 10; hit = true; }
      if (tags.indexOf(w) > -1) { s += 6; hit = true; }
      if (desc.indexOf(w) > -1) { s += 4; hit = true; }
      if (body.indexOf(w) > -1) { s += 1; hit = true; }
      if (norm(d.label + ' ' + d.medium + ' ' + d.location).indexOf(w) > -1) { s += 3; hit = true; }
      if (!hit) return 0;                 // every word must match somewhere
    }
    return s || 1;
  }

  function render() {
    var words = norm(els.q.value).split(/\s+/).filter(Boolean);
    var type = els.type.value, month = els.month.value, tag = els.tag.value;
    var rows = [];
    data.forEach(function (d) {
      if (type && d.group !== type && d.collection !== type && d.subtype !== type) return;
      if (month && d.date.slice(0, 7) !== month) return;
      if (tag && (d.tags || []).indexOf(tag) < 0) return;
      var s = words.length ? score(d, words) : 1;
      if (!s) return;
      rows.push({ d: d, s: s });
    });
    rows.sort(function (a, b) { return words.length && b.s !== a.s ? b.s - a.s : (a.d.date < b.d.date ? 1 : -1); });

    var filtered = words.length || type || month || tag;
    els.clear.hidden = !filtered;
    els.count.textContent = rows.length + (rows.length === 1 ? ' piece' : ' pieces') + (filtered ? ' found' : ' in the archive');

    if (!rows.length) {
      els.out.innerHTML = data.length
        ? '<p class="empty">Nothing found — try fewer filters, or a different word.</p>'
        : '<p class="empty">Nothing has been published yet. Come back soon.</p>';
      return;
    }
    els.out.innerHTML = rows.map(function (r) {
      var d = r.d;
      var tags = (d.tags || []).map(function (t) {
        return '<li><a class="tag" href="?tag=' + encodeURIComponent(t) + '"><span aria-hidden="true">#</span>' + esc(nice(t)) + '</a></li>';
      }).join('');
      return '<article class="result-item sec-' + esc(d.group) + '">' +
        '<div class="result-item__top"><span class="sticker">' + esc(d.label) + '</span>' +
        '<time datetime="' + esc(d.date) + '">' + esc(d.date_display) + '</time>' +
        (d.sub ? '<span>' + esc(d.sub) + '</span>' : '') + '</div>' +
        '<h2 class="result-item__title"><a href="' + esc(d.url) + '">' + highlight(d.title, words) + '</a></h2>' +
        (d.description ? '<p class="result-item__desc">' + highlight(d.description, words) + '</p>' : '') +
        (tags ? '<ul class="tags" aria-label="Tags">' + tags + '</ul>' : '') + '</article>';
    }).join('');
  }

  function update() { writeURL(); render(); }

  var timer;
  els.q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(update, 120); });
  [els.type, els.month, els.tag].forEach(function (s) { s.addEventListener('change', update); });
  els.clear.addEventListener('click', function () {
    els.q.value = ''; els.type.value = ''; els.month.value = ''; els.tag.value = '';
    update(); els.q.focus();
  });
  root.addEventListener('submit', function (e) { e.preventDefault(); update(); });
  document.addEventListener('click', function (e) {   // tag links inside results filter in place
    var a = e.target.closest && e.target.closest('#results a.tag');
    if (!a) return;
    e.preventDefault();
    els.tag.value = new URL(a.href).searchParams.get('tag');
    update(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  fetch(index).then(function (r) { return r.json(); }).then(function (json) {
    data = json;
    fillSelects(); readURL(); render();
  }).catch(function () {
    els.out.innerHTML = '<p class="empty">The search index could not be loaded. Try the <a href="' + root.getAttribute('data-archive') + '">Archive</a> instead.</p>';
  });
})();
