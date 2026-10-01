  // ============ BUGFIX MANAGETOGGLE — MANAGE/DONE KEEPS ONE WIDTH ============
  // The owner's iPhone report (30 September 2026): the first tap on Manage showed a clipped label.
  // The toggle's label changes between Manage and Done, so its width changed with it and the
  // header's other buttons moved. The fix itself is one rule in 59.9998-bugfix-manage-toggle-width.css;
  // it applies only while the page carries the class below, so turning this switch off really
  // turns the fix off.
  const MANAGE_TOGGLE_FIX_ENABLED = true;
  if(MANAGE_TOGGLE_FIX_ENABLED && document.body) document.body.classList.add('manage-toggle-fixed');
  // ============ END BUGFIX MANAGETOGGLE ============
