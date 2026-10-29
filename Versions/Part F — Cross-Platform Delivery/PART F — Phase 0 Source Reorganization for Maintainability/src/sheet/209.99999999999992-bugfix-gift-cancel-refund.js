  // BUGFIX GR7: a cast's payment comes back when a gate wrapped outside the spell-slot refund cancels its roll after
  // the preview, as the Ancestors' gift prompts do (Release 7b.1.1, device check B2). Each payment is given back once.
  const GIFT_CANCEL_REFUND_ENABLED = true;
  const GR7 = (() => {
    const api = {}, refunded = new WeakSet();
    api.enabled = () => GIFT_CANCEL_REFUND_ENABLED && typeof SSA992 === 'object' && !!SSA992 && SSA992.refundEnabled() &&
      typeof rollPreviewGate === 'function';
    api.refunded = payment => !!payment && typeof payment === 'object' && refunded.has(payment);
    // The rolls SSA992 itself refunds on a cancel: the Casting Roll and a resistance check made inside the cast.
    api.covers = context => !!context && (context.kind === ROLL_KINDS.SPELL || context.d45WillpowerGate === true);
    // payment: SSA992.pending when the gate opened. Refunds it when the gate as a whole answered cancel.
    api.settle = (payment, proceed, context) => {
      if(proceed || !payment || typeof payment !== 'object' || api.refunded(payment) || !api.covers(context)) return false;
      if(SSA992.pending === payment) SSA992.pending = null;
      return SSA992.refund(payment);
    };
    if(api.enabled()){
      const refund = SSA992.refund;
      SSA992.refund = function(payment){
        if(payment && typeof payment === 'object') refunded.add(payment);
        return refund.apply(this, arguments);
      };
      const previousGate = rollPreviewGate;
      rollPreviewGate = async function(req){
        const payment = SSA992.pending;
        const proceed = await previousGate.apply(this, arguments);
        api.settle(payment, proceed, req && req.context);
        return proceed;
      };
    }
    return api;
  })();
