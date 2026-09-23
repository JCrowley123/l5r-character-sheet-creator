  // ========= PART I FEATURE 4.5.22: NAISHOU CITIZEN =========
  // A08 (Naishou Province p.7). 3 points, no choice of its own. Two effects, both tied to the
  // character's Seven Fortunes' Blessing (Feature 4.5.21, a declared HARD dependency):
  //   * the Blessing costs 1 XP less, stacking with the Blessing's own Clan price and never below
  //     Core p.149's 1-XP minimum -- applied while both are on the Advantage list;
  //   * one Free Raise on Social Skill rolls with monks aligned to the current blessed Fortune --
  //     a REMINDER on the row, as approved; this sheet has no Raise mechanic to spend it through.
  //
  // NOT built, deliberately: "a later purchase may choose a different Fortune, losing the
  // original Blessing, with no refund". That is the purchase-history question the owner deferred
  // for review on 23 September; until then the Blessing row is priced by its current Fortune.
  //
  // Extends 4.5.21 by property (FB4521.price is looked up at call time) and never edits it.
  const ADV_NAISHOU_CITIZEN_ENABLED = true;

  const NC4522 = (function(){
    const api = {};
    api.NAME = 'Naishou Citizen';
    api.enabled = function(){
      return ADV_NAISHOU_CITIZEN_ENABLED && ADV_CONFIG_ENABLED && typeof FB4521 === 'object' && !!FB4521 && FB4521.enabled();
    };
    api.is = function(name){ return normalizeAdvName(name) === normalizeAdvName(api.NAME); };
    api.present = function(){
      return api.enabled() && Array.prototype.some.call(document.querySelectorAll('#advList .entry .en-name'),
        function(input){ return api.is(input.value); });
    };
    // The Blessing whose Fortune the monk reminder names: the first configured one.
    api.blessing = function(){ const a = FB4521.active(); return a.length ? a[0] : null; };
    api.adjust = function(price){
      if(price === null || price === undefined || !api.present()) return price;
      return Math.max(1, price - 1);
    };
    api.clear = function(div){
      const own = div.querySelector('.nc4522-row');
      if(own){ own.remove(); }
    };
    api.refresh = function(div){
      const name = div && div.querySelector('.en-name');
      if(!name) return false;
      if(!api.enabled() || !api.is(name.value)){ api.clear(div); return false; }
      // A configured-entry row from any earlier name is not ours to keep.
      const foreign = div.querySelector('.adv-config-row:not(.nc4522-row)');
      if(foreign){ delete div.dataset.advConfig; foreign.remove(); }
      const row = advConfigRowFor(div);
      row.className = 'adv-config-row nc4522-row';
      row.textContent = '';
      const wrong = !!div.parentElement && div.parentElement.id === 'disadvList';
      const lead = document.createElement('span');
      const blessing = api.blessing();
      if(wrong){
        lead.className = 'adv-config-warn nc4522-warning';
        lead.textContent = 'This entry belongs in Advantages; move it there.';
        row.appendChild(lead);
        return true;
      }
      lead.className = blessing ? 'adv-config-summary nc4522-badge' : 'adv-config-warn nc4522-warning';
      lead.textContent = blessing ? 'Aligned with ' + blessing.fortune : 'No Seven Fortunes’ Blessing yet';
      row.appendChild(lead);
      row.appendChild(api.info());
      const reminder = document.createElement('p');
      reminder.className = 'nc4522-reminder';
      if(blessing){
        const now = FB4521.price(blessing.fortune);
        reminder.textContent = FB4521.possessive(blessing.fortune) + ' costs 1 XP less (' + now + ' XP). ' +
          'One Free Raise on Social Skill rolls with monks aligned to ' + blessing.fortune + ' — apply it yourself.';
      } else {
        reminder.textContent = 'Add and configure a Seven Fortunes’ Blessing: it will cost 1 XP less, and Social Skill rolls with monks aligned to that Fortune gain one Free Raise.';
      }
      row.appendChild(reminder);
      return true;
    };
    // A line on the Blessing's own row, so its price explains itself.
    api.noteBlessing = function(div){
      if(!api.present()) return;
      const name = div && div.querySelector('.en-name');
      if(!name || !FB4521.is(name.value) || div.parentElement?.id !== 'advList') return;
      const row = div.querySelector('.fb4521-row.configured');
      if(!row || row.querySelector('.nc4522-blessing-note')) return;
      const note = document.createElement('p');
      note.className = 'nc4522-blessing-note';
      note.textContent = 'Naishou Citizen: −1 XP (included in the cost).';
      row.appendChild(note);
    };
    api.noteModal = function(){
      const state = advConfigExtendedModal;
      if(!api.present() || !state || state.kind !== 'fb4521') return;
      const note = document.getElementById('advConfigNote');
      if(note && !/Naishou Citizen/.test(note.textContent)){
        note.textContent += ' Naishou Citizen: the price shown for each Fortune already includes its −1 XP; the Clan prices in brackets do not.';
      }
    };
    api.info = function(){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nc4522-info';
      button.textContent = 'i';
      button.setAttribute('aria-label', api.NAME + ' information');
      button.addEventListener('click', function(){
        const blessing = api.blessing();
        populateInfoOverlay(api.NAME, 'Reference — Naishou Province p.7',
          (blessing ? 'Your Fortune: ' + blessing.fortune + '\n\n' : '') +
          'Cost 3 XP. Your Seven Fortunes’ Blessing costs 1 XP less; this stacks with the Blessing’s own Clan price, and no Advantage costs less than 1 XP.\n\n' +
          'Social Skill rolls dealing with monks aligned to your blessed Fortune gain one Free Raise. This sheet reminds you; apply the Free Raise yourself.\n\n' +
          'With the GM’s agreement a later purchase may choose a different Fortune, losing the original Blessing without a refund. That is not handled by the sheet yet: it is recorded for review.');
      });
      return button;
    };
    return api;
  })();

  if(NC4522.enabled()){
    // Declared hard dependency on Feature 4.5.21: its price is extended, not replaced.
    const nc4522PreviousPrice = FB4521.price;
    FB4521.price = function(fortune){ return NC4522.adjust(nc4522PreviousPrice.call(this, fortune)); };
    const nc4522PreviousRefresh = refreshAdvConfigControl;
    refreshAdvConfigControl = function(div){
      if(NC4522.refresh(div)) return;
      nc4522PreviousRefresh(div);
      NC4522.noteBlessing(div);
    };
    const nc4522PreviousOpen = openExtendedAdvConfigModal;
    openExtendedAdvConfigModal = function(div, schema){
      const opened = nc4522PreviousOpen(div, schema);
      if(opened) NC4522.noteModal();
      return opened;
    };
  }
