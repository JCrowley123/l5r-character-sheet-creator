  // ============ BUGFIX ANCFIX — ANCESTOR CORRECTIONS FROM THE IPHONE CHECK ============
  // Three corrections from the owner's iPhone check of 1 October 2026, each behind its own switch.
  //
  // 1. Void offers beside a declared Void gift (check 4.23). Seppun's and Komori Iongi's gifts are
  //    a Void Point's +1k1 taken without spending one, and the Ancestors (Phase 4.8, Part I) switch
  //    them off whenever a one-roll Void effect is armed, because a roll takes one such effect. The
  //    roll preview (Phase 3, Part G) offers a Void option when arming it changes the roll, and with
  //    a gift ticked, arming ANY option changes the roll by switching the gift off. So "Make an
  //    Unskilled roll Skilled" was offered on a Rank 1 Battle roll and on a Trait roll, where it
  //    would only have cost the gift. An option is now offered only if arming it also brings its
  //    own Void effect onto the roll. The preview's own test still runs first, unchanged.
  // 2. The Ancestor's info button (check 4.1): this switch marks the page for the one stylesheet
  //    rule, 59.9999-bugfix-ancestor-info.css.
  // 3. The Ancestor list follows the Clan picker (found the same day, headless). Before a Family is
  //    applied the Ancestor card reads the Clan & School picker, but nothing redrew it when the
  //    picker changed, so the previous Clan's Ancestors stayed listed until the next recalculation.
  //    The card is now redrawn when either Clan picker changes.
  const ANCFIX_VOID_OFFER_ENABLED = true;
  const ANCFIX_INFO_ICON_ENABLED = true;
  const ANCFIX_CLAN_PICKER_ENABLED = true;

  if(ANCFIX_VOID_OFFER_ENABLED && typeof voidKeyWouldMatter === 'function' && typeof projectRoll === 'function'
     && typeof getVoidPending === 'function' && typeof setVoidPending === 'function'
     && typeof clearOneRollVoidPending === 'function' && typeof armOneRollVoidPending === 'function'){
    const ancfixPreviewWouldMatter = voidKeyWouldMatter;
    const ancfixVoidModCount = function(projection){
      return ((projection && projection.mods) || []).filter(function(m){ return m && m.source === 'void'; }).length;
    };
    voidKeyWouldMatter = function(key, context, baseRolled, baseKept){
      if(!ancfixPreviewWouldMatter.apply(this, arguments)) return false;
      const saved = getVoidPending();
      try {
        setVoidPending(clearOneRollVoidPending(saved));
        const none = projectRoll(context, baseRolled, baseKept);
        setVoidPending(armOneRollVoidPending(saved, key));
        return ancfixVoidModCount(projectRoll(context, baseRolled, baseKept)) > ancfixVoidModCount(none);
      } finally {
        setVoidPending(saved);
      }
    };
  }

  if(ANCFIX_INFO_ICON_ENABLED && document.body) document.body.classList.add('ancfix-info');

  if(ANCFIX_CLAN_PICKER_ENABLED){
    ['cfs_clan', 'cfs_minorClan'].forEach(function(id){
      const picker = document.getElementById(id);
      if(picker) picker.addEventListener('change', function(){
        if(typeof renderAncestorCard === 'function') renderAncestorCard();
      });
    });
  }
  // ============ END BUGFIX ANCFIX ============
