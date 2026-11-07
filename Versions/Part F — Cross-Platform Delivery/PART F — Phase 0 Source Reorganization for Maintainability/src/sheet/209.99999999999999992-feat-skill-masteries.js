  // ============ PART H PHASE 15.1.3.1 — MASTERIES IN THE SKILL INFORMATION ============
  // Phase 15, Release 15a, unit A03.1: the owner's idea from A03 (6 November 2026), added to group G1 by the owner on
  // 6 November and approved as mocked up on 7 November. The Skill information window (the trunk's showSkillInfoModal,
  // opened by the Skill's i) showed the Rank, Trait, roll, description and Emphases, and only two Debug buttons for
  // the Mastery Abilities. It now also lists them, after the Emphases: each with the Rank that grants it, those the
  // Skill's Rank has reached marked "reached" and drawn in the Clan's colour (as the Skill card draws them), the rest in
  // the muted ink. A Skill with none says so. The data is the trunk's own (findSkill(name).m, tiers 3, 5 and 7, the same
  // map renderSkillMasteryNote() draws on the card), read when the window opens, so the two always agree.
  // The window's other content and the Debug buttons are unchanged. showSkillInfoModal is rebound, keeping the
  // previous binding (the Skill Traits fix's Craft note sits inside it), the same way that fix wraps it.
  // With the switch off nothing is rebound and the window is exactly as before.
  const SKILL_MASTERIES_ENABLED = true;

  const SM15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return SKILL_MASTERIES_ENABLED; };
    api.TIERS = [3, 5, 7];
    api.NONE = 'No Mastery Abilities on file for this Skill.';
    // The Skill's Mastery Abilities: [{rank, text, reached}], from the trunk's library entry.
    api.list = function(tr){
      const name = tr && tr.querySelector('.sk-name') ? tr.querySelector('.sk-name').value : '';
      const lib = typeof findSkill === 'function' ? findSkill(name) : null;
      const rank = parseInt((tr && tr.querySelector('.sk-rank') ? tr.querySelector('.sk-rank').value : '') || '0', 10) || 0;
      if(!lib || !lib.m) return [];
      return api.TIERS.filter(function(t){ return lib.m[t]; }).map(function(t){ return {rank: t, text: String(lib.m[t]), reached: rank >= t}; });
    };
    api.render = function(tr){
      const overlay = document.getElementById('skillInfoModalOverlay');
      const emph = document.getElementById('skillInfoEmph');
      if(!overlay || !emph) return null;
      const old = overlay.querySelector('.sm15-masteries');
      if(old) old.remove();
      const section = document.createElement('section');
      section.className = 'sm15-masteries';
      section.setAttribute('aria-labelledby', 'sm15Head');
      const head = document.createElement('h4');
      head.className = 'sm15-head';
      head.id = 'sm15Head';
      head.textContent = 'Mastery Abilities';
      section.appendChild(head);
      const items = api.list(tr);
      if(!items.length){
        const none = document.createElement('p');
        none.className = 'sm15-none';
        none.textContent = api.NONE;
        section.appendChild(none);
      } else {
        const list = document.createElement('ol');
        list.className = 'sm15-list';
        // list-style none drops a list's semantics in Safari / VoiceOver; the role keeps them.
        list.setAttribute('role', 'list');
        items.forEach(function(item){
          const li = document.createElement('li');
          li.className = 'sm15-item' + (item.reached ? ' sm15-reached' : '');
          const tier = document.createElement('span');
          tier.className = 'sm15-rank';
          tier.textContent = 'Rank ' + item.rank + (item.reached ? ' · reached' : '');
          const text = document.createElement('span');
          text.className = 'sm15-text';
          text.textContent = item.text;
          li.appendChild(tier);
          li.appendChild(text);
          list.appendChild(li);
        });
        section.appendChild(list);
      }
      emph.after(section);
      return section;
    };
    api.install = function(){
      if(api.installed || !SKILL_MASTERIES_ENABLED || typeof showSkillInfoModal !== 'function') return false;
      api.installed = true;
      document.body.classList.add('sm15-on');
      const sm15Show = showSkillInfoModal;
      showSkillInfoModal = function(tr){ const out = sm15Show.apply(this, arguments); api.render(tr); return out; };
      return true;
    };
    return api;
  })();
  SM15.install();
  // ============ END PART H PHASE 15.1.3.1 ============
