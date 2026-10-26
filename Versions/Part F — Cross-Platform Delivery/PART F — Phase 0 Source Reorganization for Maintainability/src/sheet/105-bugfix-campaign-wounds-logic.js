  // BUGFIX WM7: campaign wound settings.
  // Campaign wound arithmetic. Core Rulebook pp.82,84: Healthy always holds Earth x5.
  const CAMPAIGN_WOUNDS_ENABLED = true;
  const WM7Logic = (() => {
    const positiveInteger = value => {
      const text = String(value ?? '').trim();
      if(!/^[1-9]\d*$/.test(text)) return null;
      const number = Number(text);
      return Number.isSafeInteger(number) ? number : null;
    };
    const thresholds = (earth, multiplier = 2) => {
      // A temporarily blank Trait is represented by Earth 0 by the existing sheet.
      if(!Number.isSafeInteger(Number(earth)) || Number(earth) < 0 || positiveInteger(multiplier) === null) throw new Error('Earth must be a non-negative whole number and the wound multiplier must be a positive whole number.');
      const healthy = Number(earth) * 5;
      const step = Number(earth) * Number(multiplier);
      const result = Array.from({length:8}, (_, index) => healthy + index * step);
      if(result.some(value => !Number.isSafeInteger(value))) throw new Error('This multiplier is too large to calculate wound thresholds accurately.');
      return result;
    };
    return {positiveInteger, thresholds};
  })();
