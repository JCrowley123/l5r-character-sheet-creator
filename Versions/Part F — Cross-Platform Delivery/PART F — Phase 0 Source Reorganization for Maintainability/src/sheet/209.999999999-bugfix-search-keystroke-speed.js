  // ============ BUGFIX SEARCHSPEED — SEARCH KEYSTROKE SPEED ============
  // Search's normaliser is pure but ran about 1,500 times per filtered keystroke (the facets' option sort).
  // Short results are remembered; long texts (record bodies) are not. Results are unchanged.
  // Interface: SEARCHSPEED.enabled(), .stats().
  const SEARCH_SPEED_FIX_ENABLED = true;

  const SEARCHSPEED = (function(){
    const api = {};
    const SHORT = 64, LIMIT = 5000;
    const memo = new Map();
    let hits = 0, misses = 0;

    api.enabled = function(){
      return SEARCH_SPEED_FIX_ENABLED && typeof SEARCH14 === 'object' && !!SEARCH14 && typeof SEARCH14.normalise === 'function';
    };
    api.stats = function(){ return { size: memo.size, hits: hits, misses: misses, limit: LIMIT, short: SHORT }; };

    api.install = function(){
      if(!api.enabled()) return;
      const base = SEARCH14.normalise;
      // UI hook: SEARCH14 and FACETS141 both call the normaliser through this public property.
      SEARCH14.normalise = function(value){
        const key = value == null ? '' : String(value);
        if(key.length > SHORT) return base.call(this, value);
        let out = memo.get(key);
        if(out === undefined){
          misses++;
          if(memo.size >= LIMIT) memo.clear();
          out = base.call(this, value);
          memo.set(key, out);
        } else hits++;
        return out;
      };
    };

    return api;
  })();

  if(SEARCH_SPEED_FIX_ENABLED) SEARCHSPEED.install();
  // ============ END BUGFIX SEARCHSPEED ============
