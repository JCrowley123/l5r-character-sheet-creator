  // BUGFIX RP7: shared social Rank/points arithmetic; no document or UI dependency.
  const SOCIAL_RANK_POINTS_ENABLED = true;
  const RP7Logic = (() => {
    const names = ['honor', 'glory', 'status'];
    const integer = value => String(value).trim() !== '' && Number.isSafeInteger(Number(value));
    function normalize(name, rank, points) {
      if(!names.includes(name) || !integer(rank) || !integer(points)) return null;
      rank = Number(rank); points = Number(points);
      if(rank < 0 || rank > 10 || !Number.isSafeInteger(rank * 10 + points)) return null;
      if(name === 'honor') {
        const units = Math.max(0, Math.min(100, rank * 10 + points));
        return {rank:Math.floor(units / 10), points:units % 10};
      }
      // Pending gains never award a Rank; losses borrow from the approved Rank now.
      if(points < 0) {
        const units = Math.max(0, rank * 10 + points);
        return {rank:Math.floor(units / 10), points:units % 10};
      }
      return {rank, points};
    }
    function recognize(name, state) {
      const current = state && normalize(name, state.rank, state.points);
      if(!current || name === 'honor') return current;
      const gained = Math.min(10 - current.rank, Math.floor(current.points / 10));
      return {rank:current.rank + gained, points:current.points - gained * 10};
    }
    function fromDecimal(value) {
      const n = Number(value);
      if(String(value ?? '').trim() === '' || !Number.isFinite(n)) return null;
      const units = Math.max(0, Math.min(100, Math.round(n * 10)));
      return {rank:Math.floor(units / 10), points:units % 10};
    }
    function legacy(name, rank, points) {
      const score = fromDecimal(points) || fromDecimal(rank) || {rank:0, points:0};
      return name === 'honor' ? score : {rank:(fromDecimal(rank) || score).rank, points:score.points};
    }
    function migrate(data) {
      const fields = data.fields || (data.fields = {}), disagreements = [];
      names.forEach(name => {
        const r = 'f_' + name + 'Rank', p = 'f_' + name + 'Pts';
        if(fields[r] === undefined && fields[p] === undefined) return;
        const beforeRank = fromDecimal(fields[r]), beforePoints = fromDecimal(fields[p]);
        if(beforeRank && beforePoints && beforeRank.rank !== beforePoints.rank) disagreements.push(name);
        const state = legacy(name, fields[r], fields[p]);
        fields[r] = String(state.rank); fields[p] = String(state.points);
      });
      // A monk's saved undo record contains the same former decimal Points fields.
      try {
        const applied = JSON.parse(fields.f_schoolApplied || 'null');
        if(applied && applied.monk) {
          ['Glory', 'Status'].forEach(name => {
            const r = 'prior' + name + 'Rank', p = 'prior' + name + 'Pts';
            if(applied.monk[r] !== undefined || applied.monk[p] !== undefined) {
              const state = legacy(name.toLowerCase(), applied.monk[r], applied.monk[p]);
              applied.monk[r] = String(state.rank); applied.monk[p] = String(state.points);
            }
          });
          fields.f_schoolApplied = JSON.stringify(applied);
        }
      } catch(_) { /* Leave an unrelated malformed school record unchanged. */ }
      if(disagreements.length) data.socialRankMigration = {notice:disagreements};
      return data;
    }
    return {names, normalize, recognize, fromDecimal, legacy, migrate};
  })();
