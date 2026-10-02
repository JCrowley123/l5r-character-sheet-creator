  // ============ BUGFIX TECHNAMES — TECHNIQUE NAME CLASHES ============
  // The sheet looks a Technique's text up by its name alone (techniqueDescription()), and two
  // Techniques in the books share a name with another (measured 2 October 2026):
  //
  //  - "The Gift of the Lady" is the Doji Courtier's Rank 5 (Core Rulebook p.111) and the Hitomi
  //    Kikage Zumi Order's Rank 1 (Imperial Histories 1 p.215). TECH_DESCRIPTIONS names it twice and
  //    the later entry wins, so a Rank 5 Doji Courtier was shown the monk's tattoo Technique.
  //  - "Forge Your Own Fate" is the Toku Bushi's Rank 4 (Core Rulebook p.222) and the Technique of
  //    the Book of Air's Master of Games, a ronin Path recorded but never offered (p.180). The Toku's
  //    had no text, so the load check of the Alternate Paths fragment, which compares only Techniques
  //    that have text, let the Path's text stand in for it.
  //
  // So: a School's own Technique can carry text for that School alone (BY_SCHOOL), answered where
  // the sheet unlocks a School's Techniques; the Master of Games' Technique is renamed, as "Strike
  // the Center (Eyes of Nanashi)" was; a load check refuses a Path Technique named like ANY School
  // Technique, described or not, and a name two Schools share without text for each; and a
  // character's School Technique rows still holding text the sheet itself wrote, now known to be
  // wrong or missing, are rewritten when the character loads (owner's ruling, 2 October 2026).
  // A row the player edited, and a row without the sheet's School Technique tag, are never touched.
  //
  // Rebinds unlockTechniques() and applyData(); no CSS, markup or save field. Kill switch:
  // TECHNAMES_ENABLED.
  const TECHNAMES_ENABLED = true;
  const TECHNAMES = (function(){
    const api = {};
    // A School's own text for a Technique name it shares. Keyed by name, then by School.
    api.BY_SCHOOL = {
      'The Gift of the Lady': {
        'Doji Courtier': 'After a few minutes’ conversation, roll Courtier (Manipulation) / Awareness against the target’s Etiquette (Courtesy) / Willpower, at +5k0 if the target is your Ally. On a success their feelings turn your way: they heed your advice and go along with whatever you suggest that does not cut against their basic loyalties (the GM decides). (Core Rulebook p.111)',
        'The Hitomi Kikage Zumi Order [Monk]': 'Gain 1 Tattoo; add Reflexes to Armor TN, and may use Reflexes instead of Strength to control a Grapple.',
      },
    };
    // Path Techniques renamed so that no Path shares a School Technique's name.
    api.RENAMES = [
      { path:'Master of Games [Courtier]', from:'Forge Your Own Fate', to:'Forge Your Own Fate (Master of Games)' },
    ];
    // Text the sheet wrote into School Technique rows that is now known to be wrong for that School
    // (name -> School -> [texts]). The "not yet available" notice is stale for every row.
    api.STALE = {
      'Forge Your Own Fate': { 'Toku Bushi': [
        '+2k1 on Social Skill rolls against anyone of higher Status, while you keep a modest, subservient manner. (Master of Games, Book of Air p.180)'] },
      'The Gift of the Lady': { 'Doji Courtier': [
        'Gain 1 Tattoo; add Reflexes to Armor TN, and may use Reflexes instead of Strength to control a Grapple.'] },
    };
    api.renamed = [];
    api.fallback = function(){ return techniqueDescription('\u0000no Technique has this name'); };
    // The text a School's own Technique should show.
    api.describe = function(name, schoolName){
      const own = api.BY_SCHOOL[name];
      if(own && Object.prototype.hasOwnProperty.call(own, schoolName)) return own[schoolName];
      return techniqueDescription(name);
    };
    // Is `name` the School's own Technique at `rank` (not a Path's that replaced it)?
    api.isSchoolsOwn = function(schoolName, rank, name){
      return (findSchoolTechniques(schoolName) || [])[rank - 1] === name;
    };
    // Every School Technique name, with the Schools that use it.
    api.schoolNames = function(){
      const out = {};
      Object.keys(ALL_SCHOOL_TECHNIQUES).forEach(function(s){
        (ALL_SCHOOL_TECHNIQUES[s] || []).forEach(function(n){ (out[n] = out[n] || []).push(s); });
      });
      return out;
    };
    api.pathLibrary = function(){
      return typeof ALTERNATE_PATH_LIBRARY !== 'undefined' && Array.isArray(ALTERNATE_PATH_LIBRARY) ? ALTERNATE_PATH_LIBRARY : [];
    };
    // Every problem the rule forbids; an empty list is a clean load.
    api.assertResolve = function(){
      const bad = [], names = api.schoolNames();
      api.pathLibrary().forEach(function(p){
        if(p && p.tech && Object.prototype.hasOwnProperty.call(names, p.tech)){
          bad.push('Path "' + p.name + '": its Technique "' + p.tech + '" is also ' + names[p.tech].join(', ') + '’s');
        }
      });
      Object.keys(names).forEach(function(n){
        const schools = names[n].filter(function(s, i, a){ return a.indexOf(s) === i; });
        if(schools.length < 2) return;
        const own = api.BY_SCHOOL[n] || {};
        schools.forEach(function(s){
          if(!Object.prototype.hasOwnProperty.call(own, s)) bad.push('"' + n + '" is shared by ' + schools.join(', ') + ' with no text of its own for ' + s);
        });
      });
      Object.keys(api.BY_SCHOOL).forEach(function(n){
        Object.keys(api.BY_SCHOOL[n]).forEach(function(s){
          if((names[n] || []).indexOf(s) < 0) bad.push('text kept for "' + n + '" in ' + s + ', which has no such Technique');
        });
      });
      return bad;
    };
    // The School a granted row's tag names: "[School Technique — Rank N, <School>] <text>". Matched
    // against the library's School names, longest first, because a name may itself hold "]".
    api.readTag = function(desc){
      const m = /^\[School Technique — Rank (\d+), /.exec(desc || '');
      if(!m) return null;
      const rest = desc.slice(m[0].length);
      const school = Object.keys(ALL_SCHOOL_TECHNIQUES).sort(function(a, b){ return b.length - a.length; })
        .find(function(s){ return rest.indexOf(s + '] ') === 0; });
      if(!school) return null;
      return { rank:parseInt(m[1], 10), school:school, head:desc.slice(0, m[0].length + school.length + 2),
        body:rest.slice(school.length + 2) };
    };
    api.isStale = function(name, schoolName, body){
      if(body === api.fallback()) return true;
      const bySchool = api.STALE[name] || {};
      return (bySchool[schoolName] || []).indexOf(body) >= 0;
    };
    // Rewrites the School Technique rows whose text the sheet wrote and now knows to be wrong or
    // missing. Returns the names it rewrote.
    api.refreshRows = function(){
      const done = [];
      document.querySelectorAll('#techList .entry').forEach(function(div){
        const nameEl = div.querySelector('.en-name'), descEl = div.querySelector('.en-desc');
        if(!nameEl || !descEl) return;
        const name = nameEl.value.trim(), tag = api.readTag(descEl.value);
        if(!tag || !api.isSchoolsOwn(tag.school, tag.rank, name) || !api.isStale(name, tag.school, tag.body)) return;
        const now = api.describe(name, tag.school);
        if(now === tag.body) return;
        descEl.value = tag.head + now;
        done.push(name);
      });
      return done;
    };
    return api;
  })();

  if(TECHNAMES_ENABLED){
    // The renamed Path keeps its text under its new name; the old name is left to the School.
    TECHNAMES.RENAMES.forEach(function(r){
      const p = TECHNAMES.pathLibrary().find(function(x){ return x && x.name === r.path && x.tech === r.from; });
      if(!p) return;
      const text = TECH_DESCRIPTIONS[r.from];
      p.tech = r.to;
      if(text !== undefined && !Object.prototype.hasOwnProperty.call(TECH_DESCRIPTIONS, r.to)) TECH_DESCRIPTIONS[r.to] = text;
      const pathText = TECHNAMES.STALE[r.from] && Object.keys(TECHNAMES.STALE[r.from]).some(function(s){
        return TECHNAMES.STALE[r.from][s].indexOf(text) >= 0;
      });
      if(pathText) delete TECH_DESCRIPTIONS[r.from];
      TECHNAMES.renamed.push(r.path);
    });

    // A School's own Technique answers with that School's text.
    const techNamesUnlock = unlockTechniques;
    unlockTechniques = function(schoolName, rank){
      const res = techNamesUnlock.apply(this, arguments);
      (res && res.techniquesUnlocked || []).forEach(function(t){
        if(!TECHNAMES.isSchoolsOwn(schoolName, t.rank, t.name)) return;
        const own = TECHNAMES.describe(t.name, schoolName);
        if(own === t.desc) return;
        if(typeof res.debugExplanation === 'string') res.debugExplanation = res.debugExplanation.split('"' + t.name + '" — ' + t.desc).join('"' + t.name + '" — ' + own);
        t.desc = own;
      });
      return res;
    };

    // A character opened, imported or copied: its stale rows are rewritten before the Characters
    // list marks it saved, so opening a character does not count as a change.
    const techNamesApply = applyData;
    applyData = function(){
      const result = techNamesApply.apply(this, arguments);
      if(result !== false) TECHNAMES.refreshRows();
      return result;
    };

    const techNamesUnresolved = TECHNAMES.assertResolve();
    if(techNamesUnresolved.length) console.error('Technique Name Clashes: unresolved:\n' + techNamesUnresolved.join('\n'));
  }
  // ============ END BUGFIX TECHNAMES ============
