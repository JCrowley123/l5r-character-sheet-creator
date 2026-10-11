  // ============ BUGFIX PRINTRINGS: PRINTED RING LAYERS ============
  const PRINTED_RING_LAYERS_ENABLED = true;
  const PRINTRINGS = { enabled: function(){ return PRINTED_RING_LAYERS_ENABLED; } };
  // UI hook: the print-only stylesheet activates through this class.
  if(PRINTRINGS.enabled()) document.documentElement.classList.add('printrings-enabled');

