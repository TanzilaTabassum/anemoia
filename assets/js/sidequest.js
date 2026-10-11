/* ANEMOIA — side quest chapter list.
   Builds a "Chapters" outline from the ## headings in the journal and
   highlights the one you're reading. If JS is off, the journal is still fully readable. */
(function () {
  'use strict';
  var journal = document.querySelector('.journal');
  var wrap = document.querySelector('.chapters');
  if (!journal || !wrap) return;
  var list = wrap.querySelector('.chapters__list');
  var heads = Array.prototype.slice.call(journal.querySelectorAll('h2'))
    .filter(function (h) { return !h.closest('.result, .lessons'); });
  if (heads.length < 2) return;

  // Jekyll normally gives every heading an id; make one if it's missing so the links always work.
  var used = {};
  heads.forEach(function (h) {
    if (!h.id) {
      var base = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'chapter';
      var id = base, n = 2;
      while (used[id] || document.getElementById(id)) { id = base + '-' + n++; }
      h.id = id;
    }
    used[h.id] = true;
  });

  heads.forEach(function (h) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });
  wrap.hidden = false;

  if (!('IntersectionObserver' in window)) return;
  var links = list.querySelectorAll('a');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var i = heads.indexOf(en.target);
      links.forEach(function (l, n) { l.classList.toggle('is-current', n === i); });
    });
  }, { rootMargin: '-10% 0px -75% 0px' });
  heads.forEach(function (h) { io.observe(h); });
})();
