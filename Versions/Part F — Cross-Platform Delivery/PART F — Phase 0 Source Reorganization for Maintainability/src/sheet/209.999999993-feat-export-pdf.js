  // ============ PART K PHASE 11.1: EXPORT TO PDF ============
  const EXPORT_PDF_ENABLED = true;
  const PDF111 = (function(){
    const api = { busy:false };
    api.enabled = function(){
      return EXPORT_PDF_ENABLED && typeof CL11 !== 'undefined' && CL11.enabled() &&
        typeof PRINTRINGS !== 'undefined' && PRINTRINGS.enabled();
    };
    // UI hook: each list row receives one menu item, after its existing JSON action.
    api.decorate = function(){
      if(!api.enabled() || !CL11.view) return;
      CL11.view.querySelectorAll('.cl11-row').forEach(function(row){
        const menu = row.querySelector('.cl11-menu');
        const json = menu && menu.querySelector('[data-act="export"]');
        if(!json || menu.querySelector('.pdf111-export')) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cl11-item pdf111-export';
        button.setAttribute('role', 'menuitem');
        button.textContent = 'Export to PDF';
        button.disabled = api.busy;
        json.insertAdjacentElement('afterend', button);
      });
    };
    api.setBusy = function(value){
      api.busy = value;
      document.querySelectorAll('.pdf111-export').forEach(function(button){ button.disabled = value; });
    };
    let printState = null;
    // UI hook: native Print and Export to PDF share the same temporary paper view.
    api.preparePrint = function(){
      if(!api.enabled() || printState) return;
      printState = {details:[], text:[]};
      document.querySelectorAll('.combat-details').forEach(function(details){
        printState.details.push([details, details.open]);
        details.open = true;
      });
      document.querySelectorAll('.car-page textarea').forEach(function(field){
        const text = document.createElement('div');
        text.className = 'pdf111-print-text';
        text.textContent = field.value || '\u00a0';
        field.insertAdjacentElement('afterend', text);
        field.classList.add('pdf111-text-source');
        printState.text.push([field, text]);
      });
    };
    api.restorePrint = function(){
      if(!printState) return;
      printState.details.forEach(function(pair){ pair[0].open = pair[1]; });
      printState.text.forEach(function(pair){ pair[0].classList.remove('pdf111-text-source'); pair[1].remove(); });
      printState = null;
    };
    api.exportCharacter = async function(id){
      if(!api.enabled() || api.busy || !id) return false;
      api.setBusy(true);
      try{
        // UI hook: opening uses the list's discard prompt, autosave and mode handling.
        // A cancelled or refused load returns no success value: identity is the proof.
        await CL11.openCharacter(id);
        if(currentId !== id) return false;
        CL11.closeMenus();
        // The selected character stays open after printing or cancelling the system sheet.
        // Nothing restores older form data over edits made while the dialog is open.
  // BUGFIX PS7 BEGIN save-list
        if(typeof PS7 === 'object' && PS7?.enabled()) return await PS7.open(id);
  // END PS7 save-list
        // BUGFIX PX7 BEGIN pdf-export
        // UI hook: keep the existing selected-character, cancel and busy guards.
        if(typeof PX7 === 'object' && PX7 && PX7.enabled()) return await PX7.exportCurrent(id);
        // END PX7 pdf-export
        window.print();
        return true;
      }catch(error){
        api.restorePrint();
        setStatus('Could not open printing. Use the browser’s Print command to save a PDF.');
        console.error(error);
        return false;
      }finally{
        api.setBusy(false);
      }
    };
    if(api.enabled()){
      document.documentElement.classList.add('pdf111-enabled');
      window.addEventListener('beforeprint', api.preparePrint);
      window.addEventListener('afterprint', api.restorePrint);
      // UI hook: decorate the list after each asynchronous redraw, without changing its entries.
      const previousRender = CL11.render;
      CL11.render = async function(){
        const result = await previousRender.apply(this, arguments);
        api.decorate();
        return result;
      };
      // UI hook: intercept only this release's buttons before the list's existing handler.
      document.addEventListener('click', function(event){
        const button = event.target.closest && event.target.closest('.pdf111-export');
        if(!button || !api.enabled()) return;
        event.preventDefault();
        event.stopPropagation();
        const row = button.closest('.cl11-row');
        if(row) api.exportCharacter(row.dataset.id);
      }, true);
    }
    return api;
  })();

