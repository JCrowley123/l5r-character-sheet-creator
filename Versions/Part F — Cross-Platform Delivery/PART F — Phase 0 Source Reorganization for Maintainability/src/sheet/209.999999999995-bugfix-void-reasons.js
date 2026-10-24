  // ============ BUGFIX VOIDWHY — WHY A VOID CARD BUTTON IS GREYED OUT, ON A PHONE ============
  // FT-38 (the owner's check H4): a greyed-out Void card button gave its reason only as a hover title, which a phone
  // cannot show. The reasons are now written under the buttons, one line per reason with the buttons it covers (just
  // the reason when it covers every button). Reasons the card's own line above the buttons already gives (out of
  // combat, Void already spent this Round: Phase 1.6 of Part H; Momoku) are not repeated. The buttons and titles are
  // unchanged. Redrawn with the card and with the pips, as Hotei's button is (Feature 4.5.36).
  // Interface: VOIDWHY.enabled(), .lines(buttons, blanket), .render(). Switch VOID_REASONS_ENABLED.
  const VOID_REASONS_ENABLED = true;

  var VOIDWHY = (function(){
    const api = {};
    api.COVERED = [/ is a combat effect\. Start a combat round first\.$/, /already spent a Void Point this Round/];
    api.enabled = function(){ return VOID_REASONS_ENABLED === true; };
    api.name = function(text){ return String(text || '').replace(/^\s*Spend Void:\s*/, '').trim(); };
    // Logic: buttons as [{label, disabled, reason}] and the card's blanket line; the lines to show, in button order.
    api.lines = function(buttons, blanket){
      const groups = [];
      buttons.forEach(function(b){
        const reason = String(b.reason || '').trim();
        if(!b.disabled || !reason) return;
        if(blanket && reason === blanket) return;
        if(blanket && api.COVERED.some(function(re){ return re.test(reason); })) return;
        let g = groups.find(function(x){ return x.reason === reason; });
        if(!g){ g = { reason:reason, labels:[] }; groups.push(g); }
        g.labels.push(api.name(b.label));
      });
      return groups.map(function(g){
        return g.labels.length === buttons.length ? g.reason : g.labels.join(', ') + ': ' + g.reason;
      });
    };
    // UI hook: the Void card's buttons (#voidSpendButtons) and its blanket line (#voidDisabledReason).
    api.render = function(){
      const wrap = document.getElementById('voidSpendButtons');
      if(!wrap || !wrap.parentNode) return false;
      let box = document.getElementById('voidWhyReasons');
      if(!box){
        box = document.createElement('div');
        box.id = 'voidWhyReasons';
        box.className = 'voidwhy-reasons';
        box.setAttribute('aria-live', 'polite');
      }
      if(box.previousSibling !== wrap) wrap.parentNode.insertBefore(box, wrap.nextSibling);
      const buttons = Array.from(wrap.querySelectorAll('button.void-spend-btn')).map(function(b){
        return { label:b.textContent, disabled:b.disabled, reason:b.getAttribute('title') };
      });
      const blanket = String((document.getElementById('voidDisabledReason') || {}).textContent || '').trim();
      box.textContent = '';
      api.lines(buttons, blanket).forEach(function(text){
        const line = document.createElement('div');
        line.className = 'voidwhy-reason';
        line.textContent = text;
        box.appendChild(line);
      });
      box.hidden = !box.childNodes.length;
      return true;
    };
    return api;
  })();

  if(VOID_REASONS_ENABLED){
    const voidWhyRender = function(){
      try { VOIDWHY.render(); }
      catch(e){ if(window.console && console.warn) console.warn('L5R sheet: Void button reasons not shown —', e && e.message); }
    };
    if(typeof renderVoidPanel === 'function'){
      const voidWhyPreviousPanel = renderVoidPanel;
      renderVoidPanel = function(){
        const result = voidWhyPreviousPanel.apply(this, arguments);
        voidWhyRender();
        return result;
      };
    }
    if(typeof renderVoidPips === 'function'){
      const voidWhyPreviousPips = renderVoidPips;
      renderVoidPips = function(){
        const result = voidWhyPreviousPips.apply(this, arguments);
        voidWhyRender();
        return result;
      };
    }
  }
  // ============ END BUGFIX VOIDWHY ============
