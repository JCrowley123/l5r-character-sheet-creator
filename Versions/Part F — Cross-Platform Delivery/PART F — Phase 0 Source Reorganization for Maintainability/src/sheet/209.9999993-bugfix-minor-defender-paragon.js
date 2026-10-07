  // ========= BUGFIX PG47: MINOR CLAN DEFENDER PARAGON GATE =========
  // Entry needs a complete Paragon purchase. Existing training records remain untouched.
  const PARAGON_GATE_ENABLED = true;
  const PG47 = (function(){
    const api = {};
    api.enabled = function(){
      return PARAGON_GATE_ENABLED && typeof AS47 === 'object' && AS47 && AS47.enabled()
        && typeof SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED !== 'undefined' && SUPPLEMENTAL_ADVANCED_SCHOOLS_ENABLED;
    };
    api.hasConfiguredParagon = function(){
      if(typeof P4518 !== 'object' || !P4518 || typeof P4518.complete !== 'function'
        || typeof readAdvConfig !== 'function') return false;
      return Array.from(document.querySelectorAll('#advList .entry')).some(function(row){
        const name = row.querySelector('.en-name');
        return name && name.value.trim().toLowerCase() === 'paragon' && P4518.complete(readAdvConfig(row));
      });
    };
    return api;
  })();
  if(PG47.enabled()){
    const pg47PriorUnmet = AS47.unmet;
    AS47.unmet = function(entry, choices){
      const unmet = pg47PriorUnmet.apply(this, arguments);
      if(entry && entry.id === 'minor-clan-defender' && !PG47.hasConfiguredParagon()){
        unmet.push('Paragon with a chosen and confirmed Bushido tenet');
      }
      return unmet;
    };
    AS47.refresh();
  }
  // END BUGFIX PG47
