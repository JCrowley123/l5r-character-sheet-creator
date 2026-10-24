  // BUGFIX TA7: Taint arithmetic and table lookup, independent of the interface.
  const TAINT_POINTS_ENABLED = true;
  const TA7Logic = (() => {
    const integer = v => String(v ?? '').trim() !== '' && Number.isSafeInteger(Number(v));
    function normalize(rank, points) {
      if(!integer(rank) || !integer(points) || Number(rank) < 0) return null;
      const units = Number(rank) * 10 + Number(points);
      if(!Number.isSafeInteger(units)) return null;
      const bounded = Math.max(0, units);
      return {rank:Math.floor(bounded / 10), points:bounded % 10};
    }
    function fromScore(value) {
      if(String(value ?? '').trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0) return null;
      return normalize(0, Math.round(Number(value) * 10));
    }
    const score = state => state ? (state.rank * 10 + state.points) / 10 : null;
    function growth(state) {
      if(!state || (state.rank === 0 && state.points === 0) || state.rank > 4) return null;
      return {tn:[5,10,15,20,25][state.rank], interval:['monthly','monthly','every two weeks','weekly','daily'][state.rank],
        label:state.rank === 0 ? 'Seeds of Darkness' : 'Level ' + state.rank};
    }
    return {normalize, fromScore, score, growth};
  })();
