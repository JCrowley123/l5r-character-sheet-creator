  // ============ PART H PHASE 15.2.3 — ONE ARMOR TN BREAKDOWN ============
  // Phase 15, Release 15b, unit B04 (group 1, totals and their breakdowns), approved by the owner on 20 November 2026
  // as mocked up. The marker number 3 follows the group's order as mocked up (B02, 15.2.2, was dropped); the unit keeps
  // its identifier, B04.
  // Quick Access shows "Armor TN 7" with an i, and Blind's line under it (Feature 4.5.34 (Part I)) is hidden. The i,
  // and the Combat card's own formula i, show one breakdown: the base (Blind: Reflexes + 5, Core Rulebook p.156;
  // otherwise Reflexes x 5 + 5), the Armor TN Bonus, each other bonus in effect by name (stance, a Void Point, two
  // weapons, Way of the Dragon, Shiba's gift), and the Armor TN. The Combat card's window keeps its formula under the
  // table, and the Combat card's Blind line under Base TN stays (the owner's call of 9 October 2026).
  // No arithmetic of its own: the base and the Armor TN are the sheet's own fields, each bonus is the sheet's own
  // function, and anything they do not account for is shown as "Other bonuses", so the rows always add up to the
  // figure the sheet shows. Screen only; nothing is saved.
  const ARMOR_TN_BREAKDOWN_ENABLED = true;

  const AT15 = (function(){
    const api = {installed: false};
    const $ = id => document.getElementById(id);
    api.LABEL = 'Armor TN: how it is worked out';
    api.BLIND_NOTE = 'Blind: Reflexes + 5 instead of Reflexes × 5 + 5, Core Rulebook p.156';
    api.FORMULA_TITLE = 'TN & Initiative';
    api.enabled = function(){
      return ARMOR_TN_BREAKDOWN_ENABLED === true && typeof populateInfoOverlay === 'function' &&
        typeof showCombatFormulaInfo === 'function' && typeof renderQuickAccessPanel === 'function' &&
        !!$('f_baseTN') && !!$('f_currentTN') && !!$('qaArmorTNValue') && !!$('stanceInfoBody');
    };
    const field = function(id){ const e = $(id); const n = e ? parseFloat(e.value) : NaN; return Number.isFinite(n) ? n : 0; };
    const bonus = function(fn){ try { const n = typeof fn === 'function' ? Number(fn()) : 0; return Number.isFinite(n) ? n : 0; } catch(e){ return 0; } };
    api.signed = function(n){ return (n < 0 ? '−' : '+') + Math.abs(n); };
    // The rows: [label, note, value]. The last is the Armor TN.
    api.rows = function(){
      const base = field('f_baseTN'), current = field('f_currentTN'), armor = field('f_armorTN');
      const rows = [];
      const raw = typeof getTraitValueByName === 'function' ? getTraitValueByName('Reflexes') : NaN;
      const used = (typeof weakness4536Reflexes === 'function' && Number.isFinite(raw)) ? weakness4536Reflexes(raw) : raw;
      const blind = typeof BL4534 === 'object' && !!BL4534 && typeof BL4534.text === 'function' && !!BL4534.text(false);
      if(blind) rows.push(['Base: Blind, Reflexes ' + raw + ' + 5', api.BLIND_NOTE, String(base)]);
      else if(Number.isFinite(used) && used * 5 + 5 === base) rows.push(['Base: Reflexes ' + used + ' × 5 + 5', used !== raw ? 'Weakness: Reflexes ' + raw + ' counts as ' + used : '', String(base)]);
      else rows.push(['Base TN to be Hit', '', String(base)]);
      const name = ($('f_armorName') && $('f_armorName').value || '').trim();
      rows.push(['Armor TN Bonus' + (name ? ' (' + name + ')' : ''), '', api.signed(armor)]);
      let accounted = base + armor;
      const stance = typeof getStanceArmorTNBonus === 'function' ? bonus(getStanceArmorTNBonus) : 0;
      if(stance){ rows.push([(typeof getCurrentStance === 'function' ? getCurrentStance() : 'Stance') + ' stance', '', api.signed(stance)]); accounted += stance; }
      const voidPoint = typeof getVoidArmorTNBonus === 'function' ? bonus(getVoidArmorTNBonus) : 0;
      if(voidPoint){ rows.push(['Void Point spent this round', '', api.signed(voidPoint)]); accounted += voidPoint; }
      const twoWeapons = typeof getDualWieldArmorTNBonus === 'function' ? bonus(getDualWieldArmorTNBonus) : 0;
      if(twoWeapons){ rows.push(['Two weapons (Insight Rank)', '', api.signed(twoWeapons)]); accounted += twoWeapons; }
      const dragon = typeof getMirumotoArmorTNBonus === 'function' ? bonus(getMirumotoArmorTNBonus) : 0;
      if(dragon){ rows.push(['Way of the Dragon (School Rank)', '', api.signed(dragon)]); accounted += dragon; }
      const shiba = typeof ancestorArmorTNBonus === 'function' ? bonus(ancestorArmorTNBonus) : 0;
      if(shiba){ rows.push(['Shiba’s gift (Intelligence)', 'Ancestor, Core Rulebook p.243', api.signed(shiba)]); accounted += shiba; }
      if(current !== accounted) rows.push(['Other bonuses', '', api.signed(current - accounted)]);
      rows.push(['Armor TN', '', String(current)]);
      return rows;
    };
    api.table = function(){
      const table = document.createElement('table');
      table.className = 'at15-breakdown';
      table.setAttribute('aria-label', 'Armor TN: how it is worked out');
      const rows = api.rows();
      rows.forEach(function(r, i){
        const tr = table.insertRow();
        if(i === rows.length - 1) tr.className = 'at15-total';
        const label = tr.insertCell(), figure = tr.insertCell();
        label.textContent = r[0];
        if(r[1]){ const small = document.createElement('small'); small.textContent = r[1]; label.appendChild(small); }
        figure.textContent = r[2];
      });
      return table;
    };
    // The table above whatever the window already says (the Combat card's formula), or alone.
    api.fill = function(){
      const body = $('stanceInfoBody');
      const text = body.textContent;
      body.textContent = '';
      body.appendChild(api.table());
      if(text){ const p = document.createElement('p'); p.className = 'at15-formula'; p.textContent = text; body.appendChild(p); }
    };
    api.openQuick = function(){
      populateInfoOverlay('Armor TN', field('f_currentTN') + ' to be hit', '');
      api.fill();
    };
    api.makeInfo = function(){
      const b = document.createElement('button');
      b.type = 'button';
      b.id = 'at15QaInfo';
      b.className = 'sk-info-btn at15-info print-hide';
      b.setAttribute('aria-label', api.LABEL);
      b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); api.openQuick(); });
      return b;
    };
    // Quick Access rewrites the Armor TN's text on every render, which drops the i, so it is put back each time.
    api.place = function(){
      const host = $('qaArmorTNValue');
      if(!host) return;
      if(!api.info) api.info = api.makeInfo();
      if(api.info.parentElement !== host || host.lastChild !== api.info) host.appendChild(api.info);
    };
    api.install = function(){
      if(api.installed || !api.enabled() || !document.body) return false;
      const previousFormula = showCombatFormulaInfo;
      showCombatFormulaInfo = function(which){
        const result = previousFormula.apply(this, arguments);
        try { if(which === 'tn' && $('stanceInfoTitle') && $('stanceInfoTitle').textContent === api.FORMULA_TITLE) api.fill(); } catch(e){}
        return result;
      };
      const previousQuickAccess = renderQuickAccessPanel;
      renderQuickAccessPanel = function(){
        const result = previousQuickAccess.apply(this, arguments);
        try { api.place(); } catch(e){}
        return result;
      };
      document.body.classList.add('at15-on');
      api.installed = true;
      return true;
    };
    return api;
  })();
  if(ARMOR_TN_BREAKDOWN_ENABLED) AT15.install();
  // ============ END PART H PHASE 15.2.3 AT15 ============
