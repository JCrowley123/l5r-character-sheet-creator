  // BUGFIX WM7: campaign wound settings.
  // Replaceable campaign-setting UI; the saved multiplier belongs to this character.
  const WM7 = (() => {
    const api = {enabled:() => CAMPAIGN_WOUNDS_ENABLED};
    let ui;
    const earth = () => Number(document.getElementById('ring_earth')?.value || 2);
    api.read = () => WM7Logic.positiveInteger(document.getElementById('f_woundMultiplier')?.value) ?? 2;
    api.message = text => { if(ui && ui.error.textContent !== text) ui.error.textContent = text; };
    api.sync = () => {
      if(!ui) return;
      const value = api.read(), preset = [2,3,4,5].includes(value);
      ui.picker.value = preset ? String(value) : 'custom';
      ui.custom.value = preset ? '' : String(value);
      ui.customRow.hidden = preset;
      const text = 'Healthy: Earth ×5 · Each later level: Earth ×' + value;
      if(ui.summary.textContent !== text) ui.summary.textContent = text;
      const live = document.getElementById('wm7-live-summary');
      if(live && live.textContent !== text) live.textContent = text;
      api.message('');
    };
    api.apply = value => {
      if(typeof MODES12 === 'object' && MODES12?.isPlay()) {api.message('Switch to Management to change the wound multiplier.'); return false;}
      const parsed = WM7Logic.positiveInteger(value);
      if(parsed === null) {api.message('Enter a positive whole number: 1 or greater, with no decimals or minus sign.'); return false;}
      try {WM7Logic.thresholds(earth(), parsed);} catch(error) {api.message(error.message); return false;}
      const field = document.getElementById('f_woundMultiplier'), before = field.value;
      try {
        field.value = String(parsed);
        recalcAll();
        field.dispatchEvent(new Event('input', {bubbles:true}));
        api.sync();
        setStatus('Wound multiplier set to ×' + parsed + '. Wounds taken are unchanged.');
        return true;
      } catch(error) {
        field.value = before;
        try {recalcAll();} catch(_) {}
        api.message('The wound multiplier could not be applied. ' + error.message);
        return false;
      }
    };
    api.mount = () => {
      const host = document.querySelector('.car-page[data-tab-label="Rings & Traits"] .section');
      if(!host || document.getElementById('wm7-panel')) return;
      const panel = document.createElement('div'); panel.id = 'wm7-panel';
      panel.innerHTML = '<input id="f_woundMultiplier" class="wm7-value" type="text" value="2" hidden>' +
        '<p id="wm7-summary" class="hint"></p><div class="wm7-settings print-hide">' +
        '<label for="wm7-picker">Wound multiplier</label><select id="wm7-picker">' +
        '<option value="2">×2 — Standard</option><option value="3">×3</option><option value="4">×4</option><option value="5">×5</option><option value="custom">Custom</option></select>' +
        '<span id="wm7-custom-row" hidden><label for="wm7-custom">Custom multiplier</label><input id="wm7-custom" type="text" inputmode="numeric" pattern="[1-9][0-9]*" autocomplete="off" aria-describedby="wm7-error"></span>' +
        '<button id="wm7-apply" type="button">Apply</button><p id="wm7-error" role="alert"></p></div>';
      host.append(panel);
      const live = document.createElement('p'); live.id = 'wm7-live-summary'; live.className = 'hint';
      document.getElementById('woundSummaryLine').before(live);
      ui = {picker:panel.querySelector('#wm7-picker'),custom:panel.querySelector('#wm7-custom'),customRow:panel.querySelector('#wm7-custom-row'),summary:panel.querySelector('#wm7-summary'),error:panel.querySelector('#wm7-error')};
      ui.picker.addEventListener('change', () => {ui.customRow.hidden = ui.picker.value !== 'custom'; api.message('');});
      panel.querySelector('#wm7-apply').addEventListener('click', () => api.apply(ui.picker.value === 'custom' ? ui.custom.value : ui.picker.value));
      ui.custom.addEventListener('keydown', event => {if(event.key === 'Enter'){event.preventDefault();api.apply(ui.custom.value);}});
      if(typeof MODES12 === 'object' && MODES12) MODES12.register('#wm7-picker, #wm7-custom, #wm7-apply');
      api.sync();
    };
    return api;
  })();
  if(WM7.enabled()) {
    WM7.mount();
    if(typeof VersionManager === 'object' && VersionManager?.enabled()) VersionManager.register(VersionManager.current(), 'Campaign wound multiplier', data => {
      data.fields.f_woundMultiplier = '2';
      return data;
    });
    const wm7Apply = applyData;
    applyData = function(data) {
      if(typeof VersionManager === 'object' && VersionManager?.bypass) return wm7Apply.apply(this, arguments);
      const kind = typeof VersionManager === 'object' && VersionManager ? VersionManager.classify(data) : 'current';
      if(kind === 'invalid' || kind === 'newer' || !data?.fields) return wm7Apply.apply(this, arguments);
      const up = typeof VersionManager === 'object' && VersionManager ? VersionManager.upgrade(data) : data;
      const value = up.fields.f_woundMultiplier ?? '2';
      try {WM7Logic.thresholds(Number(up.rings?.earth || 2), value);} catch(error) {
        WM7.message('Character not loaded: ' + error.message);
        setStatus('Character not loaded: invalid wound multiplier.');
        return false;
      }
      const handed = {...up, fields:{...up.fields, f_woundMultiplier:String(value)}};
      const result = wm7Apply.call(this, handed);
      if(result !== false) WM7.sync();
      return result;
    };
    const wm7Reset = resetToBaseline;
    resetToBaseline = function(){const result = wm7Reset.apply(this, arguments); WM7.sync(); return result;};
  }
