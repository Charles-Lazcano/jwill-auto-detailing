(function(){
  document.getElementById('year').textContent = new Date().getFullYear();

  // before/after sliders (drag-to-compare)
  document.querySelectorAll('.ba').forEach(function(ba){
    var range = ba.querySelector('.ba-range');
    var after = ba.querySelector('.ba-after');
    var handle = ba.querySelector('.ba-handle');

    function setValue(v){
      v = Math.min(100, Math.max(0, v));
      range.value = v;
      after.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
      handle.style.left = v + '%';
    }

    function valueFromClientX(clientX){
      var rect = ba.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    // keyboard (native range) still moves the handle
    range.addEventListener('input', function(){ setValue(Number(range.value)); });

    // mouse + touch: drag the handle (or anywhere on the image) directly
    var dragging = false;
    function onDown(e){
      dragging = true;
      if(ba.setPointerCapture){ ba.setPointerCapture(e.pointerId); }
      setValue(valueFromClientX(e.clientX));
    }
    function onMove(e){
      if(!dragging) return;
      setValue(valueFromClientX(e.clientX));
    }
    function onUp(e){
      dragging = false;
      if(ba.releasePointerCapture && e.pointerId !== undefined){
        try{ ba.releasePointerCapture(e.pointerId); }catch(err){}
      }
    }
    ba.addEventListener('pointerdown', onDown);
    ba.addEventListener('pointermove', onMove);
    ba.addEventListener('pointerup', onUp);
    ba.addEventListener('pointercancel', onUp);

    // stop native image drag-ghost from hijacking the mouse drag (Firefox etc.)
    ba.addEventListener('dragstart', function(e){ e.preventDefault(); });

    setValue(Number(range.value));
  });

  // gallery filter
  var filterBtns = document.querySelectorAll('.filter-btn');
  var tiles = document.querySelectorAll('.gal-tile');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      tiles.forEach(function(t){
        t.hidden = (f !== 'all' && t.getAttribute('data-cat') !== f);
      });
    });
  });

  // lightbox
  var lightbox = document.getElementById('lightbox');
  var lbSvg = document.getElementById('lbSvg');
  var lbTitle = document.getElementById('lbTitle');
  var lbTag = document.getElementById('lbTag');
  tiles.forEach(function(t){
    t.addEventListener('click', function(){
      var svg = t.querySelector('svg');
      lbSvg.innerHTML = svg.innerHTML;
      lbSvg.setAttribute('viewBox', svg.getAttribute('viewBox'));
      lbTitle.textContent = t.getAttribute('data-title');
      lbTag.textContent = t.getAttribute('data-tag');
      lightbox.hidden = false;
    });
  });
  document.getElementById('lbClose').addEventListener('click', function(){ lightbox.hidden = true; });
  lightbox.addEventListener('click', function(e){ if(e.target === lightbox) lightbox.hidden = true; });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') lightbox.hidden = true; });

  // forms -> mailto handoff
  function wireForm(formId, outId, subject){
    var form = document.getElementById(formId);
    var out = document.getElementById(outId);
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var lines = [];
      Array.prototype.forEach.call(form.elements, function(el){
        if(el.name && el.value) lines.push(el.name + ': ' + el.value);
      });
      var body = encodeURIComponent(lines.join('\n'));
      var mail = 'mailto:hello@jwillautodetailing.com?subject=' + encodeURIComponent(subject) + '&body=' + body;
      window.location.href = mail;
      out.textContent = "Opening your email app to send this to J.Will Auto Detailing. If nothing happens, text us at (210) 859-0358.";
    });
  }
  wireForm('personalForm', 'pMsgOut', 'New detail quote request');
  wireForm('commercialForm', 'cMsg', 'New commercial / fleet quote request');
})();
