  // BUGFIX SC7: eligibility arithmetic, independent of the screen.
  const IMPERIAL_SCION_STATUS_ENABLED = true;
  const SC7Logic = Object.freeze({
    meets(rank, minimum) {
      return Number.isInteger(rank) && rank >= 0 && Number.isInteger(minimum) && rank >= minimum;
    }
  });
