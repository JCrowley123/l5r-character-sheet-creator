  // BUGFIX AP7: the pointer under Identity's Add School, with a button that opens the Techniques page.
  const AP7 = (() => {
    const api = {};
    api.enabled = () => SCHOOL_POINTER_ENABLED && typeof AS47 === 'object' && !!AS47 && AS47.enabled();
    api.state = () => {
      const r = AS47.record();
      return {held:!!r, name:r ? r.name : '', available:AS47.available().length > 0,
        advantage:typeof hasMultipleSchoolsAdvantage === 'function' && hasMultipleSchoolsAdvantage()};
    };
    api.render = () => {
      const text = document.getElementById('ap7Text'), go = document.getElementById('ap7Go');
      if(!text || !go) return;
      const p = AP7Logic.pointer(api.state());
      if(text.textContent !== p.text) text.textContent = p.text;
      go.hidden = !p.go;
    };
    api.go = async () => {
      const carousel = window.__L5R_CAROUSEL__;
      if(!carousel || typeof carousel.goToTab !== 'function') return false;
      carousel.goToTab('Techniques');
      if(typeof carousel.whenSettled === 'function') await carousel.whenSettled();
      const panel = document.getElementById('advancedSchoolPanel');
      if(panel && !panel.hidden) panel.scrollIntoView({block:'start'});
      return true;
    };
    api.mount = () => {
      const anchor = document.getElementById('schoolsPanel');
      if(!anchor || document.getElementById('ap7Pointer')) return;
      const line = document.createElement('p');
      line.id = 'ap7Pointer';
      line.className = 'hint ap7-pointer print-hide';
      const text = document.createElement('span');
      text.id = 'ap7Text';
      const go = document.createElement('button');
      go.type = 'button';
      go.id = 'ap7Go';
      go.className = 'ghost ap7-go';
      go.textContent = 'Go to Advanced Schools';
      go.addEventListener('click', api.go);
      line.append(text, ' ', go);
      anchor.after(line);
      api.render();
    };
    if(api.enabled()){
      api.mount();
      // UI hook: redrawn with the School list, as the Advanced School panel is.
      const ap7Schools = refreshMultipleSchoolsUI;
      refreshMultipleSchoolsUI = function(){ const result = ap7Schools.apply(this, arguments); api.render(); return result; };
      // Honor, Family and Gender change the Advanced Schools on offer without a recalculation, as the panel itself listens.
      ['f_honorRank', 'f_honorPts', 'f_family', 'f_gender'].forEach(id => {
        const field = document.getElementById(id);
        if(field) field.addEventListener('input', api.render);
      });
    }
    return api;
  })();
