  // BUGFIX DEPTYPE — preserve Dependant's optional text while editing.
  // The provider saves on change, but the list recalculates on input and replaces its
  // editor first. Its own change handler also recalculates while focus is still moving,
  // which replaces whichever editor the player is moving into. So: save each keystroke
  // here, commit on change without that rebuild, and repaint only this row once focus
  // has left it. A focused editor is kept in place through other recalculations.
  const DEPENDANT_TYPING_ENABLED = true;

  const DEPTYPE = (function(){
    const api = {};
    const KEYS = ['dependant', 'arrangement'];
    const save = function(div, key, value){
      const config = readAdvConfig(div);
      if(!config) return false;
      config[key] = value.trim();
      writeAdvConfig(div, config.type, config);
      return true;
    };
    api.install = function(){
      if(!DEPENDANT_TYPING_ENABLED || typeof R458 !== 'object' || !R458 ||
         !R458.enabled() || typeof D45 !== 'object' || !D45 ||
         typeof R458.decorateDependant !== 'function' || typeof D45.refresh !== 'function' ||
         typeof refreshAdvConfigControl !== 'function') return;

      const previousDecorate = R458.decorateDependant;
      R458.decorateDependant = function(div, row, effect){
        const result = previousDecorate.apply(this, arguments);
        if(!effect || effect.name !== R458.DEPENDANT || !row ||
           !div || !div.parentElement || div.parentElement.id !== 'disadvList') return result;
        const inputs = row.querySelectorAll('.dep458-input');
        const wrap = inputs.length ? inputs[0].parentElement : null;
        if(!wrap) return result;
        const repaintSoon = function(){
          // Wait for any focus transfer to finish, then repaint this row's summary unless
          // focus is inside it (the other field, or its Change button).
          setTimeout(function(){
            if(div.isConnected && !row.contains(document.activeElement)) refreshAdvConfigControl(div);
          }, 0);
        };
        inputs.forEach(function(input, index){
          if(index >= KEYS.length) return;
          input.addEventListener('input', function(){
            // Runs before the list's own input listener recalculates; the refresh wrapper
            // below then leaves this focused editor in place.
            if(input.isConnected) save(div, KEYS[index], input.value);
          });
          // After Enter the row is not repainted (focus stays); leaving it does that.
          input.addEventListener('blur', repaintSoon);
        });
        // Capture on the fields' own wrapper runs before the provider's change listener on
        // the input, in every browser. The value is saved exactly as the provider saves it;
        // the provider's immediate recalcAll() is replaced by the deferred repaint.
        wrap.addEventListener('change', function(e){
          const index = Array.prototype.indexOf.call(inputs, e.target);
          if(index < 0 || index >= KEYS.length || !save(div, KEYS[index], e.target.value)) return;
          e.stopPropagation();
          repaintSoon();
        }, true);
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
