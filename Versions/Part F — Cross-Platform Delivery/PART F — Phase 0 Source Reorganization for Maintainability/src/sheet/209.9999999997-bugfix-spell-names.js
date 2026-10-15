  // ============ BUGFIX SPELLNAMES — SPELL NAMES MATCH THE BOOKS: SEARCH ============
  // A renamed Spell's Search record also carries its former name, and the page cited under that name. The renaming
  // itself is in 040 (SPELLNAMES), before the library is read. Interface: SPELLNAMESEARCH.decorate(record).
  var SPELLNAMESEARCH = {
    decorate: function(record){
      const former = record && record.category === 'spells' && typeof SPELLNAMES !== 'undefined' ? SPELLNAMES.formerName(record.name) : '';
      if(!former) return;
      record.tags.push('Formerly ' + former);
      if(!record.source && typeof SEARCHREF143 !== 'undefined') record.source = SEARCHREF143.source('spells', former);
    }
  };
  // Earlier Search consumers may have cached entries before this layer loaded.
  if(typeof SEARCH14 !== 'undefined') SEARCH14.invalidate();
  // ============ END SPELLNAMES ============
