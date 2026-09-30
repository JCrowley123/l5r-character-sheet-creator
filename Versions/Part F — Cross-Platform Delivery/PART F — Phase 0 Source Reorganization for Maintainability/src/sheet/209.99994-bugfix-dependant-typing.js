  // BUGFIX DEPTYPE — preserve Dependant's optional text while editing.
  // The provider saves on change, but the list recalculates on input and replaces its
  // editor first. Save the text before that can happen, and keep the focused editor
  // in place through other recalculations. Other configured rows refresh normally.
  const DEPENDANT_TYPING_ENABLED = true;

  const DEPTYPE = (function(){
    const api = {};
    api.install = function(){
      if(!DEPENDANT_TYPING_ENABLED || typeof R458 !== 'object' || !R458 ||
         !R458.enabled() || typeof D45 !== 'object' || !D45 ||
         typeof R458.decorateDependant !== 'function' || typeof D45.refresh !== 'function') return;

      const previousDecorate = R458.decorateDependant;
      R458.decorateDependant = function(div, row, effect){
        const result = previousDecorate.apply(this, arguments);
        if(!effect || effect.name !== R458.DEPENDANT || !row ||
           !div || !div.parentElement || div.parentElement.id !== 'disadvList') return result;
        const keys = ['dependant', 'arrangement'];
        row.querySelectorAll('.dep458-input').forEach(function(input, index){
          if(index >= keys.length) return;
          input.addEventListener('input', function(e){
            const config = readAdvConfig(div);
            if(!config || !input.isConnected) return;
            config[keys[index]] = input.value.trim();
            writeAdvConfig(div, config.type, config);
            // The existing document capture listener has already scheduled autosave.
            // Prevent only this text edit from reaching the list's destructive refresh.
            e.stopPropagation();
          });
          input.addEventListener('blur', function(){
            // A synchronous refresh here would remove the next field during Tab's
            // focus transfer. Let that transfer finish before updating the summary.
            setTimeout(function(){ if(div.isConnected) recalcAll(); }, 0);
          });
        });
        return result;
      };

      const previousRefresh = D45.refresh;
      D45.refresh = function(div, schema){
        const focused = document.activeElement;
        if(schema && schema.name === R458.DEPENDANT && div &&
           div.parentElement && div.parentElement.id === 'disadvList' &&
           focused && focused.matches('.dep458-input') && div.contains(focused) &&
           !D45.problem(schema, readAdvConfig(div), D45.state())){
          // The current input event already saved the value. Deferring this one row
          // also preserves selection and IME composition during unrelated recalcs.
          return;
        }
        return previousRefresh.apply(this, arguments);
      };
    };
    return api;
  })();
  DEPTYPE.install();
