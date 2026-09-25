// Phase 12 audit: every interactive control per carousel page, for two characters.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [sheet, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const result = {};
  for (const [label, clan, school] of [['bushi', 'Dragon', 'Mirumoto Bushi'], ['shugenja', 'Phoenix', 'Isawa Shugenja']]) {
    const page = await (await browser.newContext({viewport: {width: 390, height: 844}})).newPage();
    await page.goto('file://' + sheet);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.resetToBaseline);
    await page.evaluate(([c, s]) => {
      const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('change', {bubbles: true})); };
      set('cfs_clan', c); set('cfs_school', s);
      document.getElementById('cfs_applySchool').click();
    }, [clan, school]);
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(80);
      await page.evaluate(() => {
        const o = document.getElementById('affinityPickModalOverlay');
        if (o && o.style.display === 'flex') { document.querySelector('#affinityPickGrid input').click(); document.getElementById('affinityPickConfirm').click(); }
      });
    }
    // One of each row the sheet offers by hand.
    await page.evaluate(() => {
      ['addSkill', 'addAdv', 'addDisadv', 'addTech', 'addEquip', 'addWeapon'].forEach((id) => { const b = document.getElementById(id); if (b) b.click(); });
      const tq = document.getElementById('techQuickAdd');
      if (tq) { const o = [...tq.options].find((x) => /spell/i.test(x.parentElement && x.parentElement.label || '') || /Sense|Commune|Summon/.test(x.textContent)); if (o) { tq.value = o.value; tq.dispatchEvent(new Event('change', {bubbles: true})); } }
      window.__L5R_TEST__.recalcAll();
    });
    await page.waitForTimeout(300);
    result[label] = await page.evaluate(() => {
      const pages = [...document.querySelectorAll('section.car-page:not([data-clone])')];
      const out = {};
      for (const p of pages) {
        const sig = {};
        p.querySelectorAll('input, select, textarea, button, [contenteditable="true"]').forEach((el) => {
          if (el.closest('.roll-modal-overlay, [id$="Overlay"], .modal')) return;
          const cls = [...el.classList].filter((c) => !/^(ghost|field|active|dice-btn)$/.test(c)).sort().join('.');
          const staticId = el.id && !/\d{2,}|_\d|Pick_/.test(el.id) ? '#' + el.id : '';
          const key = el.tagName.toLowerCase() + (el.type ? '[' + el.type + ']' : '') + (staticId || (cls ? '.' + cls : ''));
          const name = (el.getAttribute('aria-label') || el.title || el.placeholder || (el.tagName === 'BUTTON' ? el.textContent : '') || '').trim().slice(0, 60);
          if (!sig[key]) sig[key] = {n: 0, name, hidden: el.type === 'hidden' || getComputedStyle(el).display === 'none' || !!el.closest('[hidden]:not(section)')};
          sig[key].n++;
        });
        out[p.dataset.tabLabel] = sig;
      }
      return out;
    });
    await page.context().close();
  }
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  for (const [who, pages] of Object.entries(result)) {
    console.log('#### ' + who);
    for (const [tab, sig] of Object.entries(pages)) {
      const visible = Object.entries(sig).filter(([, v]) => !v.hidden);
      console.log(`== ${tab}: ${visible.length} kinds, ${visible.reduce((a, [, v]) => a + v.n, 0)} controls`);
      console.log('   ' + visible.map(([k, v]) => `${k}${v.n > 1 ? ' x' + v.n : ''}${v.name ? ' "' + v.name + '"' : ''}`).join(' | '));
    }
  }
  await browser.close();
})();
