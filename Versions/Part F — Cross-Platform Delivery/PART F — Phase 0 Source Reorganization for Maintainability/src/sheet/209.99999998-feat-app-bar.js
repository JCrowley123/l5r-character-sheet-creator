  // ============ PART K PHASE 11.3 — APP BAR: THE BAR ============
  // One bar on every screen with the app's sections, the current one marked. Presentation only: it reads AB113's
  // interface, so a different design can replace this file alone. Its place is the one setting below; its look is
  // its own stylesheet, which also hides the controls the bar repeats while it is present.
  const APP_BAR_ENABLED = true;
  const APP_BAR_POSITION = 'top';   // 'top' or 'bottom'

  const APPBAR113 = (function(){
    const api = {};
    let bar = null;
    api.enabled = function(){ return APP_BAR_ENABLED && typeof AB113 === 'object' && !!AB113 && AB113.enabled(); };
    api.position = function(){ return APP_BAR_POSITION === 'bottom' ? 'bottom' : 'top'; };
    api.element = function(){ return bar; };
    api.render = function(current){
      if(!bar) return;
      bar.querySelectorAll('.ab113-item').forEach(function(b){
        const on = b.dataset.section === current;
        b.classList.toggle('ab113-current', on);
        if(on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      });
    };
    api.mount = function(){
      if(!api.enabled() || bar) return bar;
      bar = document.createElement('nav');
      bar.className = 'ab113-bar';
      bar.id = 'ab113Bar';
      bar.setAttribute('aria-label', 'App');
      AB113.sections().forEach(function(s){
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ab113-item';
        b.dataset.section = s.id;
        b.textContent = s.label;
        bar.appendChild(b);
      });
      bar.addEventListener('click', function(e){
        const b = e.target.closest('.ab113-item');
        if(b) AB113.show(b.dataset.section);
      });
      // UI hook: the bar is the first (or last) row of the sheet's frame, outside every scrolling element; the
      // stylesheet makes the Characters screen leave it room.
      const shell = document.querySelector('.car-shell') || document.body;
      if(api.position() === 'bottom') shell.appendChild(bar);
      else shell.insertBefore(bar, shell.firstChild);
      document.body.classList.add('ab113-on', 'ab113-' + api.position());
      AB113.onChange(api.render);
      api.render(AB113.current());
      return bar;
    };
    return api;
  })();

  if(APP_BAR_ENABLED) APPBAR113.mount();
  // ============ END PART K PHASE 11.3 APPBAR113 ============
