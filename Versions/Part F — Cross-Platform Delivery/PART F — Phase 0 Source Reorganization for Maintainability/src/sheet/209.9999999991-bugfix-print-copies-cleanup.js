  // ============ BUGFIX PRINTCOPIES — PRINT COPIES CLEANUP ============
  // Export to PDF restores only the print copies it recorded. The carousel can re-copy an edge page while printing,
  // and those copies keep the print text. After printing, any copy left anywhere is removed.
  // Interface: PRINTCOPIES.enabled(), .sweep().
  const PRINT_COPIES_FIX_ENABLED = true;

  const PRINTCOPIES = (function(){
    const api = {};

    api.enabled = function(){
      return PRINT_COPIES_FIX_ENABLED && typeof PDF111 === 'object' && !!PDF111 && PDF111.enabled();
    };

    api.sweep = function(){
      if(!api.enabled()) return 0;
      let n = 0;
      document.querySelectorAll('.pdf111-print-text').forEach(function(e){ e.remove(); n++; });
      document.querySelectorAll('.pdf111-text-source').forEach(function(e){ e.classList.remove('pdf111-text-source'); n++; });
      return n;
    };

    // UI hook: registered after Export to PDF's own afterprint listener, so its recorded restore runs first.
    if(api.enabled()) window.addEventListener('afterprint', api.sweep);

    return api;
  })();
  // ============ END BUGFIX PRINTCOPIES ============
