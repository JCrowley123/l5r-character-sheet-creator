  // ============ PART H PHASE 15.1.15 — COURT BADGES ============
  // Phase 15, Release 15a, finding A15 (owner's ruling Q3, 1 November 2026; the owner's design, mock-up revisions 2
  // and 3 approved 6-7 November 2026). Darling of the Court's row, drawn by Phase 4.5.14 (Part I), had a radio for
  // the selected court (32 px chips with the browser's blue dot) and a separate 13 px "Court in session" tick box.
  // Now each court is one badge, a toggle button:
  //   - not in session: a gold outline on the page colour;
  //   - tap it: it fills in the Clan's colour (the sheet's --shu-dark, which Phase 9 (Part H) recolours per Clan),
  //     which MEANS that court is in session, and the Status readout counts one Rank higher there;
  //   - tap it again: it empties; no court is in session and the bonus goes.
  // One court at a time, as the sheet stores one: tapping another badge moves the session there. The radio dot and
  // the tick box are gone. "+ Add court" sits on the row in Manage (the stylesheet hides it in Play) and opens the
  // editor with a new, empty court line. Rename and remove stay in the editor.
  // The saved data is unchanged: {selected, inSession} as 4.5.14 defines it, written through 4.5.14's own
  // CS4514.update(), so every saved character loads exactly as before. 4.5.14's builder is wrapped by property
  // (CS4514.controls): its fieldset, legend and status line are kept and its radios and tick box replaced. The
  // explanation behind the row's i and the editor's note are reworded to match (by property; same words otherwise).
  // With the switch off nothing is wrapped and the row is exactly as before.
  const COURT_BADGES_ENABLED = true;

  const CB15 = (function(){
    const api = {installed: false};
    api.enabled = function(){ return COURT_BADGES_ENABLED; };
    api.LEGEND = 'Courts: tap the one in session';
    api.HELP_OLD = 'This sheet shows the higher Status only for the one court you select, and only while “Court in session” is ticked.';
    api.HELP_NEW = 'This sheet shows the higher Status only at the court whose badge is filled. Tap a court to put it in session; ' +
      'tap it again when the session ends. One court can be in session at a time.';
    api.NOTE_SWAPS = [
      ['adding courts there keeps one selected court and one session toggle.', 'adding courts there keeps them all on one row.'],
      ['You choose the selected court and whether it is in session on the sheet.', 'On the sheet, tap a court to put it in session.']
    ];
    // The readout, with no court in session, names no court.
    api.idleText = function(text){ return String(text || '').replace(/ — .* not in session\.$/, ' — no court in session.'); };

    api.badge = function(div, config, court, index){
      const on = config.inSession === true && court === CS4514.selectedOf(config);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'court4514-court cb15-badge' + (on ? ' cb15-pressed' : '');
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      button.dataset.cb15Index = String(index);
      button.textContent = court;
      button.addEventListener('click', function(){
        const focus = '.court4514-courts .cb15-badge[data-cb15-index="' + index + '"]';
        if(on) CS4514.update(div, {inSession: false}, focus, CS4514.DARLING + ': ' + court + ' no longer in session.');
        else CS4514.update(div, {selected: court, inSession: true}, focus, CS4514.DARLING + ': ' + court + ' in session.');
      });
      return button;
    };
    api.addCourt = function(div){
      if(typeof openAdvConfigModal !== 'function') return false;
      openAdvConfigModal(div);
      const add = document.querySelector('#advConfigGrid .court4514-add');
      if(!add) return false;
      add.click();
      const inputs = document.querySelectorAll('#advConfigGrid .court4514-input');
      if(inputs.length) inputs[inputs.length - 1].focus();
      return true;
    };
    // 4.5.14's controls, with its radios and tick box replaced by the badges and + Add court.
    api.controls = function(box, div, config){
      const group = box.querySelector('.court4514-courts');
      if(!group) return box;
      group.querySelectorAll('label.court4514-court').forEach(function(label){ label.remove(); });
      const legend = group.querySelector('.court4514-legend');
      if(legend) legend.textContent = api.LEGEND;
      config.courts.forEach(function(court, index){ group.appendChild(api.badge(div, config, court, index)); });
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'cb15-add';
      add.textContent = '+ Add court';
      add.setAttribute('aria-label', 'Add court to ' + CS4514.DARLING);
      add.addEventListener('click', function(){ api.addCourt(div); });
      group.appendChild(add);
      const session = box.querySelector('.court4514-session');
      if(session) session.remove();
      const status = box.querySelector('.court4514-status');
      if(status && config.inSession !== true) status.textContent = api.idleText(status.textContent);
      box.classList.add('cb15-controls');
      return box;
    };

    api.install = function(){
      if(api.installed || !COURT_BADGES_ENABLED) return false;
      if(typeof CS4514 !== 'object' || !CS4514 || typeof CS4514.controls !== 'function' || typeof CS4514.update !== 'function') return false;
      api.installed = true;
      document.body.classList.add('cb15-on');
      const cb15Controls = CS4514.controls;
      CS4514.controls = function(div, config){ return api.controls(cb15Controls.apply(this, arguments), div, config); };
      if(typeof CS4514.darlingHelp === 'function'){
        const cb15Help = CS4514.darlingHelp;
        CS4514.darlingHelp = function(){ return String(cb15Help.apply(this, arguments)).split(api.HELP_OLD).join(api.HELP_NEW); };
      }
      if(typeof CS4514.open === 'function'){
        const cb15Open = CS4514.open;
        CS4514.open = function(){
          const out = cb15Open.apply(this, arguments);
          const note = out && document.getElementById('advConfigNote');
          if(note){ let text = note.textContent; api.NOTE_SWAPS.forEach(function(pair){ text = text.split(pair[0]).join(pair[1]); }); if(text !== note.textContent) note.textContent = text; }
          return out;
        };
      }
      return true;
    };
    return api;
  })();
  CB15.install();
  // ============ END PART H PHASE 15.1.15 ============
