/* ANEMOIA — lightbox.
   Any link with  data-lightbox="group"  opens the viewer. Links sharing a group
   become a gallery you can step through.
     href            → the full-size image
     data-caption    → caption text (optional)
     data-meta       → small line such as "Dhaka · September 2026" (optional)
     data-alt        → alt text for the large image (optional)
   Keys: ← previous · → next · Esc close.  Without JS the link just opens the image. */
(function () {
  'use strict';
  var box = document.getElementById('lightbox');
  if (!box) return;

  var img = box.querySelector('.lb__img');
  var cap = box.querySelector('.lb__caption');
  var meta = box.querySelector('.lb__meta');
  var count = box.querySelector('.lb__count');
  var btnClose = box.querySelector('.lb__close');
  var btnPrev = box.querySelector('.lb__prev');
  var btnNext = box.querySelector('.lb__next');

  var items = [];
  var index = 0;
  var opener = null;

  function groupOf(link) {
    var g = link.getAttribute('data-lightbox');
    return Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox="' + g + '"]'));
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var a = items[index];
    var inner = a.querySelector('img');
    img.classList.remove('is-ready');
    img.src = a.getAttribute('href');
    img.alt = a.getAttribute('data-alt') || (inner ? inner.alt : '') || '';
    var c = a.getAttribute('data-caption') || '';
    var m = a.getAttribute('data-meta') || '';
    cap.textContent = c; cap.hidden = !c;
    meta.textContent = m; meta.hidden = !m;
    count.textContent = items.length > 1 ? (index + 1) + ' / ' + items.length : '';
    var single = items.length < 2;
    btnPrev.hidden = single; btnNext.hidden = single;
    // preload neighbours so stepping feels instant
    if (!single) {
      [index + 1, index - 1].forEach(function (n) {
        var p = new Image(); p.src = items[(n + items.length) % items.length].getAttribute('href');
      });
    }
  }

  function open(link) {
    opener = link;
    items = groupOf(link);
    box.hidden = false;
    document.body.classList.add('lb-open');
    show(items.indexOf(link));
    requestAnimationFrame(function () { box.classList.add('is-open'); });
    btnClose.focus();
  }

  function close() {
    box.classList.remove('is-open');
    box.hidden = true;
    document.body.classList.remove('lb-open');
    img.removeAttribute('src');
    if (opener) opener.focus();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[data-lightbox]');
    if (!link) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let "open in new tab" work
    e.preventDefault();
    open(link);
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', function () { show(index - 1); });
  btnNext.addEventListener('click', function () { show(index + 1); });
  // click on the dark background closes
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.classList.contains('lb__stage') || e.target.classList.contains('lb__imgwrap')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowLeft' && items.length > 1) { e.preventDefault(); show(index - 1); }
    else if (e.key === 'ArrowRight' && items.length > 1) { e.preventDefault(); show(index + 1); }
    else if (e.key === 'Tab') {            // keep focus inside the dialog
      var f = Array.prototype.filter.call(box.querySelectorAll('button'), function (b) { return !b.hidden; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // touch: swipe left / right
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null || items.length < 2) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();
