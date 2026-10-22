  // ========= PART I PHASE 4.5.41: A CHANGING SWORN ENEMY =========
  // Imperial City Stigma and Trials of the Imperial City (Strongholds of the Empire p.134) work as Sworn Enemy
  // (Feature 4.522), worth 1 point more, with an enemy the GM changes every month to year. Owner's ruling 4
  // (22 October 2026, as recommended): the value is set when bought (the enemy's Insight Rank difference then);
  // afterwards Change only renames the enemy. No Kharmic Nemesis: a kharmic bond cannot move to a new enemy.
  // D45 entries reusing Sworn Enemy's 'insightDifferencePick' type string (D45's type list is pinned).
  // Kill switch SUPPLEMENT_SHIFTING_ENEMY_ENABLED.
  const SUPPLEMENT_SHIFTING_ENEMY_ENABLED = true;

  const SUPP4541 = (function(){
    const api = {};
    api.NAMES = ['Imperial City Stigma', 'Trials of the Imperial City'];
    api.enabled = function(){ return SUPPLEMENT_SHIFTING_ENEMY_ENABLED && typeof D45 === 'object' && !!D45 && D45.enabled(); };
    api.value = function(difference){ return 3 + difference + 1; };
    api.definition = {
      type:'insightDifferencePick',
      steps:function(c){
        const name = {field:'target', label:'Name your current enemy (the GM changes them every month to a year)', text:true};
        return c.fixed === true ? [name] : [name, {field:'difference', label:'Their Insight Rank above yours (0 or more)', number:true, min:0}];
      },
      validate:function(c){
        return !!c && c.type === 'insightDifferencePick' && typeof c.target === 'string' && !!c.target.trim() &&
          D45.integer(c.difference, 0) && c.nemesis === false && c.active === false && c.fixed === true;
      },
      finalize:function(c){
        c.target = String(c.target || '').trim();
        c.difference = Number(c.difference);
        c.nemesis = false;
        c.active = false;
        c.fixed = true;
        c.value = c.target;
      },
      resolve:function(c){
        const difference = Number(c.difference);
        return {cost:api.value(difference), target:c.target, difference:difference,
          summary:'Current enemy: ' + c.target + ', changed by the GM every month to a year. Value set when bought (Insight difference ' + difference + ').'};
      },
    };
    api.install = function(){
      if(!api.enabled() || typeof D45.install !== 'function') return 0;
      api.NAMES.forEach(function(n){ D45.install(n, api.definition); });
      return api.NAMES.length;
    };
    return api;
  })();
  SUPP4541.install();
