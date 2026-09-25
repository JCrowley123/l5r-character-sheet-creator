  // ============ BUGFIX — IMPORT FILE PICKER FILTER ============
  // Both Import controls told the browser to offer only JSON files: the toolbar's #fileImport
  // (accept="application/json") and the Characters screen's #cl11ImportFile
  // ("application/json,.json"). On an iPhone that greys out every other file in the picker,
  // including a save named with the sheet's older ".l5r" extension, so it cannot be chosen at all.
  // The filter is lifted: any file can be picked, and each import still reads what was picked and
  // refuses anything that is not a character save, exactly as before.
  const IMPORT_FILE_FILTER_FIX_ENABLED = true;

  const IMPORT_FILE_FILTER = (function(){
    const api = {};
    api.ids = ['fileImport', 'cl11ImportFile'];
    api.lift = function(){
      api.ids.forEach(function(id){
        const input = document.getElementById(id);
        if(input) input.removeAttribute('accept');
      });
    };
    return api;
  })();

  if(IMPORT_FILE_FILTER_FIX_ENABLED){
    IMPORT_FILE_FILTER.lift();
    // The Characters screen builds its own Import control the first time it opens, so the filter
    // is lifted again after each build, by property.
    if(typeof CL11 === 'object' && CL11 && typeof CL11.build === 'function'){
      const importFilterPreviousBuild = CL11.build;
      CL11.build = function(){
        const view = importFilterPreviousBuild.apply(this, arguments);
        IMPORT_FILE_FILTER.lift();
        return view;
      };
    }
  }
  // ============ END BUGFIX IMPORTFILTER ============
