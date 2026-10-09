  // ============ BUGFIX CL11TOPBAR — THE CHARACTERS SCREEN'S TOP BAR STAYS PUT ============
  // The owner's iPhone check of 9 October 2026 (S9): on long Search pages the Characters screen's top bar scrolled
  // away or was cut off. The fix is 59.999981-bugfix-characters-top-bar.css; it applies only while the page carries
  // the class below, so turning this switch off turns the fix off.
  const CHARACTERS_TOP_BAR_FIX_ENABLED = true;
  if(CHARACTERS_TOP_BAR_FIX_ENABLED && document.body) document.body.classList.add('cl11-topbar-fixed');
  // ============ END BUGFIX CL11TOPBAR ============
