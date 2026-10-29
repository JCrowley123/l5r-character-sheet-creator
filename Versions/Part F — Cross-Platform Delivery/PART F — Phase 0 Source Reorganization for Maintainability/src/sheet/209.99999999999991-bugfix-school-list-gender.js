  // BUGFIX GP7: an Advanced School chosen from the list paints Identity's gender boxes (Release 7b.1.1, device check
  // D1). The list's own change listener holds AS47.renderChoice from before GI7 wraps it. Begin training needs no
  // rework: it reads GI7's uiChoices, which already counts what Identity meets.
  const SCHOOL_LIST_GENDER_ENABLED = true;
  const GP7 = (() => {
    const api = {};
    api.enabled = () => SCHOOL_LIST_GENDER_ENABLED && typeof GI7 === 'object' && !!GI7 && GI7.enabled() &&
      typeof GI7Ui === 'object' && !!GI7Ui && typeof AS47 === 'object' && !!AS47 && AS47.enabled();
    api.repaint = () => {
      if(!api.enabled()) return false;
      GI7Ui.paint();
      return true;
    };
    // UI hook: registered after the list's own listener, so the boxes exist when it runs.
    const picker = document.getElementById('advancedSchoolPicker');
    if(api.enabled() && picker) picker.addEventListener('change', api.repaint);
    return api;
  })();
