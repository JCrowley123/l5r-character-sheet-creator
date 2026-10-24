  // BUGFIX SC7: read approved Status through the shared social rule.
  var SC7 = (() => {
    const api = {};
    api.enabled = () => IMPERIAL_SCION_STATUS_ENABLED;
    api.rank = () => {
      if(typeof RP7 === 'object' && RP7 && RP7.enabled()) return RP7.rank('status');
      const raw = document.getElementById('f_statusRank')?.value;
      return raw == null || raw.trim() === '' ? null : Number(raw);
    };
    api.appendRequirement = (special, unmet) => {
      if(special.statusMinimum && !SC7Logic.meets(api.rank(), special.statusMinimum))
        unmet.push('Status Rank ' + special.statusMinimum);
    };
    return api;
  })();
