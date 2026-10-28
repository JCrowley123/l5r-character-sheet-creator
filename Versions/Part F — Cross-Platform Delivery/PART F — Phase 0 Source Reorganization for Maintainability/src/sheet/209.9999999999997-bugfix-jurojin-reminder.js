  // BUGFIX JR7: Jurojin's Blessing reminder gives the steps instead of a Resist poison button (owner ruling R24,
  // 23 October 2026). Each poison or disease names its own roll, so the reminder says how to declare the bonus on it.
  const JUROJIN_REMINDER_ENABLED = true;
  const JR7Logic = {
    HOW: 'No separate button: roll the Ring or Trait the GM names for the poison or disease, then tick ' +
      '“Resisting poison or disease” (+2k0) in that roll’s preview.'
  };
  const JR7 = (() => {
    const api = {};
    api.enabled = () => JUROJIN_REMINDER_ENABLED && typeof FB4521 === 'object' && !!FB4521 && !!FB4521.FORTUNES &&
      !!FB4521.FORTUNES.Jurojin;
    api.previous = null;
    if(api.enabled()){
      api.previous = FB4521.FORTUNES.Jurojin.how;
      FB4521.FORTUNES.Jurojin.how = JR7Logic.HOW;
    }
    return api;
  })();
