  // BUGFIX CP7: replaceable compact controls; existing Rank/point rules remain authoritative.
  const COMPACT_POINTS_ENABLED = true;
  const CP7Logic = {
    amount(value) {const text=String(value??'').trim();return /^[1-9]\d*$/.test(text)&&Number.isSafeInteger(Number(text))?Number(text):null;},
    same(a,b) {return !!a&&!!b&&a.rank===b.rank&&a.points===b.points;}
  };
