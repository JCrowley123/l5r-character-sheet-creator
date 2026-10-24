  // BUGFIX HR7: the resistance bonus uses whole Honour Rank only.
  const HONOUR_RESISTANCE_ENABLED = true;
  const HR7Logic = Object.freeze({
    bonus(rank, barred) {
      return Number.isInteger(rank) && rank >= 0 && !barred ? rank : 0;
    }
  });
