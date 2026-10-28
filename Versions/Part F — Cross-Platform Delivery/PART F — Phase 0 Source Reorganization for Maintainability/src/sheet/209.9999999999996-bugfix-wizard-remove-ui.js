  // BUGFIX WR7: a Remove button on each removable Skill in the wizard's "Your Skills" list.
  const WR7 = (() => {
    const api = {};
    api.enabled = () => WIZARD_SKILL_REMOVE_ENABLED && typeof CW1121 === 'object' && !!CW1121 && !!CW1121.skillsStep &&
      typeof CW112 === 'object' && !!CW112;
    api.describe = tr => {
      const rank = tr.querySelector('.sk-rank');
      return {name:tr.querySelector('.sk-name').value.trim(), school:!!(tr.querySelector('.sk-school') || {}).checked,
        freeChoice:Object.keys(CW1121.slotRows || {}).some(k => CW1121.slotRows[k] === tr),
        freeRanks:Math.max(0, parseInt((rank && rank.dataset.free) || '0', 10) || 0)};
    };
    // Removes the row through its own button, so the sheet recounts the experience as it does by hand.
    api.remove = tr => {
      const button = tr && tr.isConnected ? tr.querySelector('.rm-btn:not(.emph-item-del)') : null;
      if(!button) return false;
      const name = api.describe(tr).name;
      button.click();
      if(tr.isConnected) return false;
      if(typeof setStatus === 'function') setStatus('Removed ' + name + '; its experience is back.');
      CW112.render();
      return true;
    };
    // UI hook: the wizard's Skills step, after its own list (one list row per named Skill row, in order).
    api.decorate = body => {
      const rows = Array.from(body.querySelectorAll('.cw1121-skills > .cw1121-skill'));
      const trs = Array.from(document.getElementById('skillsBody').rows).filter(tr => {
        const name = tr.querySelector('.sk-name');
        return !!name && !!name.value.trim();
      });
      if(rows.length !== trs.length) return;
      rows.forEach((row, i) => {
        const tr = trs[i], info = api.describe(tr);
        if(!WR7Logic.removable(info)) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ghost wr7-remove';
        button.textContent = 'Remove';
        button.setAttribute('aria-label', 'Remove ' + info.name);
        button.addEventListener('click', () => api.remove(tr));
        row.appendChild(button);
      });
    };
    if(api.enabled()){
      const render = CW1121.skillsStep.render;
      CW1121.skillsStep.render = function(body){ const result = render.apply(this, arguments); api.decorate(body); return result; };
    }
    return api;
  })();
