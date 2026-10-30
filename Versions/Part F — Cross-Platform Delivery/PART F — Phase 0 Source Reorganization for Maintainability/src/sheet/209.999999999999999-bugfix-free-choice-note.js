  // BUGFIX FC8: the character check's free-choice note shows only while a choice is still open (the owner's note, 30
  // October 2026). Phase 5's school-choice-slots rule reports a School's free Skill choices for good, since a free choice
  // leaves no trace of which row it became. The trace used here: a Skill ticked as a School Skill that none of the
  // character's Schools names is a filled free choice. Those are counted against the free choices, first School first,
  // and the note reports only what is still open ("1 free Skill choice still open"), and nothing once all are covered.
  // A Skill ticked by hand that is not a free choice counts too, so the note can go early (declared in the README).
  const FREE_CHOICE_OPEN_ONLY_ENABLED = true;
  const FC8Logic = {
    COUNT: {a:1, one:1, two:2, three:3},
    // How many Skills one free choice grants: "any two Skills" is two, "two ranks in any one Craft Skill" is one.
    size(text){
      const m = /\bany\s+(a|one|two|three|\d+)\b/i.exec(String(text || ''));
      return m ? (FC8Logic.COUNT[m[1].toLowerCase()] || parseInt(m[1], 10) || 1) : 1;
    },
    // How many ticked rows no School names. A row is named by its own name; a bare family a School names ("Lore (pick
    // one)", read as "Lore") and no row carries as it is takes one row the wizard gave a subject ("Lore: History").
    filled(rows, named){
      const exact = new Set(named.map(n => n.toLowerCase()));
      const own = rows.map(name => name.toLowerCase());
      const families = named.map(n => n.toLowerCase()).filter(n => !/:/.test(n) && own.indexOf(n) < 0);
      let extra = 0;
      own.filter(n => !exact.has(n)).forEach(n => {
        const family = /^([^:]+?)\s*:\s*\S/.exec(n);
        const at = family ? families.indexOf(family[1]) : -1;
        if(at >= 0) families.splice(at, 1);
        else extra++;
      });
      return extra;
    },
    // Each School's open choices, the filled ones shared out in order.
    open(sizes, filled){
      let left = filled;
      return sizes.map(size => { const used = Math.min(size, left); left -= used; return size - used; });
    },
    title(name, open){ return name + ': ' + open + ' free Skill choice' + (open === 1 ? '' : 's') + ' still open'; }
  };
  const FC8 = (() => {
    const api = {};
    api.enabled = () => FREE_CHOICE_OPEN_ONLY_ENABLED;
    api.canonical = name => typeof SCHOOL_SKILL_ROWS === 'object' && SCHOOL_SKILL_ROWS ? SCHOOL_SKILL_ROWS.canonical(name) : String(name || '').trim();
    // The Skill rows ticked as School Skills, by the name each stands for.
    api.tickedRows = () => Array.from(document.querySelectorAll('#skillsBody tr')).filter(tr => {
      const box = tr.querySelector('.sk-school'), name = tr.querySelector('.sk-name');
      return box && box.checked && name && name.value.trim();
    }).map(tr => api.canonical(tr.querySelector('.sk-name').value));
    // The previous rule's findings, one per School with free choices and in the same order, retitled or dropped.
    api.rewrite = findings => {
      const schools = validatorSchoolEntries().filter(s => s.lib && validatorChoiceSlots(s.lib).length);
      if(!Array.isArray(findings) || findings.length !== schools.length) return findings;
      const named = [];
      validatorSchoolEntries().forEach(s => { if(s.lib) validatorConcreteSkills(s.lib).forEach(n => named.push(api.canonical(n))); });
      const sizes = schools.map(s => validatorChoiceSlots(s.lib).reduce((sum, text) => sum + FC8Logic.size(text), 0));
      const open = FC8Logic.open(sizes, FC8Logic.filled(api.tickedRows(), named));
      const out = [];
      findings.forEach((f, i) => { if(open[i] > 0) out.push(Object.assign({}, f, {title: FC8Logic.title(schools[i].name, open[i])})); });
      return out;
    };
    if(api.enabled() && typeof CHARACTER_VALIDATOR_RULES !== 'undefined'){
      const rule = CHARACTER_VALIDATOR_RULES.find(r => r.id === 'school-choice-slots');
      if(rule){
        const previousFn = rule.fn;
        rule.fn = function(){
          const all = previousFn.apply(this, arguments);
          return api.enabled() ? api.rewrite(all) : all;
        };
      }
    }
    return api;
  })();
