  // BUGFIX WP7: visible Management wound settings and current thresholds.
  const WP7 = (() => {
    const api = {};
    api.enabled = () => WOUND_SETTINGS_PREVIEW_ENABLED && typeof WM7 === 'object' && WM7.enabled();
    api.render = () => {
      const body = document.getElementById('wp7-thresholds'); if(!body) return;
      const earth = parseInt(document.getElementById('ring_earth')?.value || '2',10);
      const rows = WP7Logic.rows(WOUND_LEVELS,computeWoundThresholds(earth));
      const key = JSON.stringify(rows); if(body.dataset.values === key) return;
      body.replaceChildren();
      rows.forEach(row => {const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.scope='row';th.textContent=row.name;td.textContent=String(row.total);tr.append(th,td);body.append(tr);});
      body.dataset.values = key;
    };
    api.mount = () => {
      const panel = document.getElementById('wm7-panel'); if(!panel) return;
      const heading = document.createElement('h3');heading.id='wp7-heading';heading.textContent='Campaign wounds';panel.prepend(heading);
      const hint = document.createElement('p');hint.className='hint wp7-hint';hint.textContent='In Management, choose the wound multiplier here. The thresholds below show the applied setting, including character modifiers.';heading.after(hint);
      const table=document.createElement('table');table.id='wp7-preview';table.innerHTML='<caption>Current wound thresholds</caption><thead><tr><th scope="col">Wound level</th><th scope="col">Total</th></tr></thead><tbody id="wp7-thresholds"></tbody>';panel.append(table);
      const live=document.getElementById('wm7-live-summary'),pointer=document.createElement('p');pointer.id='wp7-location';pointer.className='hint';pointer.textContent='Change the multiplier in Management → Rings & Traits → Campaign wounds.';live?.after(pointer);
      api.render();
    };
    return api;
  })();
  if(WP7.enabled()) {
    WP7.mount();
    // UI hook: the preview uses the same final calculation as the combat wound track.
    const wp7Wounds=renderWounds;renderWounds=function(){const result=wp7Wounds.apply(this,arguments);WP7.render();return result;};
    const wp7Sync=WM7.sync;WM7.sync=function(){const result=wp7Sync.apply(this,arguments);WP7.render();return result;};
  }
