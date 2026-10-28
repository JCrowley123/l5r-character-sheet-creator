  // BUGFIX HT7: Hotei's Curse doubles the Void Point the sheet itself spends for an Advantage or an Ancestor's gift
  // (owner ruling R10, 23 October 2026). Dark Paragon's Void payment and every Ancestor gift paid with a Void Point
  // take two points while the Curse is on the sheet. The Void card's declared button stays for Techniques.
  const HOTEI_AUTOMATIC_ENABLED = true;
  const HT7Logic = {
    COST: 2,
    // The reason a doubled spend cannot be paid, or '' when the points cover it.
    shortfall(points){
      return points >= HT7Logic.COST ? '' : 'Hotei’s Curse: this needs ' + HT7Logic.COST + ' Void Points; you have ' + points + '.';
    },
    // An outcome line after a doubled spend.
    outcome(text){ return String(text || '').replace('a Void Point spent', 'two Void Points spent (Hotei’s Curse)'); }
  };
  const HT7 = (() => {
    const api = {};
    api.enabled = () => HOTEI_AUTOMATIC_ENABLED && typeof HOTEI4536 === 'object' && !!HOTEI4536 &&
      typeof consumeVoidPoint === 'function' && typeof getVoidPoints === 'function';
    api.cursed = () => api.enabled() && HOTEI4536.applies();
    api.doubled = false;   // the spend just made took two points, for the status or outcome line that follows it
    api.markDoubled = () => { api.doubled = true; setTimeout(() => { api.doubled = false; }, 0); };
    api.second = () => { consumeVoidPoint(); if(typeof renderVoidPanel === 'function') renderVoidPanel(); };
    // Dark Paragon: the Void payment, its price text and the charge.
    api.installParagon = () => {
      if(typeof DP4523 !== 'object' || !DP4523 || typeof DP4523.payment !== 'function') return false;
      const payment = DP4523.payment, priceText = DP4523.priceText, charge = DP4523.charge;
      DP4523.payment = function(){
        const pay = payment.apply(this, arguments);
        if(!pay || pay.method !== 'void' || !api.cursed()) return pay;
        const short = HT7Logic.shortfall(pay.before);
        if(short) return {method:null, reason:'You have fewer than 5 Honor points (' + DP4523.fmt(pay.honor) + '). ' + short};
        return Object.assign({}, pay, {after:pay.before - HT7Logic.COST, hotei:true});
      };
      DP4523.priceText = function(pay){
        if(!pay || !pay.hotei) return priceText.apply(this, arguments);
        return 'You have fewer than 5 Honor points (' + DP4523.fmt(pay.honor) + '), so spend Void Points instead, two for Hotei’s Curse: ' +
          pay.before + ' → ' + pay.after + '.';
      };
      DP4523.charge = function(entry, pay){
        const doubled = !!pay && pay.hotei === true && api.cursed();
        if(doubled && getVoidPoints() < HT7Logic.COST) return false;
        const paid = charge.apply(this, arguments);
        if(paid && doubled){ api.second(); api.markDoubled(); }
        return paid;
      };
      return true;
    };
    // Ancestors: the Void check, the payment, the price note and the outcome line.
    api.installAncestors = () => {
      if(typeof ANC48 !== 'object' || !ANC48 || typeof ANC48.payVoid !== 'function') return false;
      const voidProblem = ANC48.voidProblem, payVoid = ANC48.payVoid, priceNote = ANC48.priceNote, outcome = ANC48.outcome;
      ANC48.voidProblem = function(){
        const problem = voidProblem.apply(this, arguments);
        return problem || (api.cursed() ? HT7Logic.shortfall(getVoidPoints()) : '');
      };
      ANC48.payVoid = function(){
        api.doubled = false;
        const cursed = api.cursed();
        const paid = payVoid.apply(this, arguments);
        if(paid && cursed){ api.second(); api.markDoubled(); }
        return paid;
      };
      ANC48.priceNote = function(p){
        const note = priceNote.apply(this, arguments);
        return note === 'The sheet takes it when you roll.' && p && p.void && api.cursed()
          ? 'The sheet takes two Void Points when you roll (Hotei’s Curse).' : note;
      };
      ANC48.outcome = function(text){
        const doubled = api.doubled;
        api.doubled = false;
        return outcome.call(this, doubled ? HT7Logic.outcome(text) : text);
      };
      return true;
    };
    if(api.enabled()){ api.installParagon(); api.installAncestors(); }
    return api;
  })();
