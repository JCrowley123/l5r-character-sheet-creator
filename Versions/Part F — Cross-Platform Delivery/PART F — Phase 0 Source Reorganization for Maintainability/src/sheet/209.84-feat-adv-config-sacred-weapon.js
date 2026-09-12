  // ========= PART I PHASE 4.5: SACRED WEAPON AUTO-GRANT =========
  //
  // Sacred Weapon is deliberately conservative. It creates the correct Clan-linked base weapon
  // profile and preserves the sheet's ordinary attack/damage calculations, but it does NOT
  // pretend this player companion knows whether a target is Tainted, an Iaijutsu duel is under
  // way, a character is mounted, or an opponent is attempting a Disarm. Those exact conditional
  // rules are shown on the generated row for the player to apply at the table.
  //
  // Every generated weapon row carries this module's source ID. That means changing Clan,
  // deleting the Advantage, loading a save, or removing Phase 4.5 can identify only the rows
  // this feature owns; a player's separately added Katana is never touched.

  const ADV_CONFIG_SACRED_WEAPON_ENABLED = true;

  const ADV_CONFIG_SACRED_WEAPON_PROFILES = {
    Crab: {
      id:'kaiu-blade', weaponName:'Kaiu Blade', cost:6,
      rules:'Unbreakable. Treat the target’s Reduction as 2 lower.',
      rows:[{ key:'Katana', name:'Kaiu Blade', damage:{roll:3,keep:3}, hand:'main' }],
    },
    Crane: {
      id:'kakita-blade', weaponName:'Kakita Blade', cost:5,
      rules:'Once per Iaijutsu duel, you may reroll the damage roll.',
      rows:[{ key:'Katana', name:'Kakita Blade', damage:{roll:4,keep:2}, hand:'main' }],
    },
    Dragon: {
      id:'twin-sister-blades', weaponName:'Twin Sister Blades', cost:3,
      rules:'A matched daisho. Gain +5 to the TN of attempts to Disarm you.',
      rows:[
        { key:'Katana', name:'Twin Sister Blade — Katana', hand:'main' },
        { key:'Wakizashi', name:'Twin Sister Blade — Wakizashi', hand:'off' },
      ],
    },
    Lion: {
      id:'akodo-blade', weaponName:'Akodo Blade', cost:6,
      rules:'While you carry it, your Honor Rank is treated as 1 higher.',
      rows:[{ key:'Katana', name:'Akodo Blade', damage:{roll:4,keep:2}, hand:'main' }],
    },
    Mantis: {
      id:'storm-kama', weaponName:'Storm Kama', cost:6,
      rules:'A matched pair. While both are wielded, gain +1k0 on attack rolls.',
      rows:[
        { key:'Kama', name:'Storm Kama — Main', damage:{roll:2,keep:2}, hand:'main' },
        { key:'Kama', name:'Storm Kama — Off', damage:{roll:2,keep:2}, hand:'off' },
      ],
    },
    Phoenix: {
      id:'inquisitors-strike', weaponName:'Inquisitor’s Strike', cost:6,
      rules:'Counts as jade against Tainted targets.',
      rows:[{ key:'Wakizashi', name:'Inquisitor’s Strike', damage:{roll:3,keep:2}, hand:'main' }],
    },
    Scorpion: {
      id:'shosuro-blade', weaponName:'Shosuro Blade', cost:5,
      rules:'Gain +5 to the TN of attempts to apply poison to this blade.',
      rows:[{ key:'Katana', name:'Shosuro Blade', damage:{roll:4,keep:2}, hand:'main' }],
    },
    Spider: {
      id:'black-steel-blade', weaponName:'Black Steel Blade', cost:6,
      rules:'When damage dice explode, the target makes an Earth Ring roll at TN 15 or gains 1 Taint.',
      rows:[{ key:'Katana', name:'Black Steel Blade', damage:{roll:4,keep:2}, hand:'main' }],
    },
    Unicorn: {
      id:'moto-scimitar', weaponName:'Moto Scimitar', cost:6,
      rules:'While mounted, gain +3 to damage.',
      rows:[{ key:'Scimitar', name:'Moto Scimitar', damage:{roll:3,keep:3}, hand:'main' }],
    },
  };

  function advConfigSacredWeaponProfileForClan(clan){
    if(!ADV_CONFIG_SACRED_WEAPON_ENABLED) return null;
    const wanted = normalizeAdvName(clan);
    const key = Object.keys(ADV_CONFIG_SACRED_WEAPON_PROFILES).find(function(candidate){
      return normalizeAdvName(candidate) === wanted;
    });
    return key ? ADV_CONFIG_SACRED_WEAPON_PROFILES[key] : null;
  }

  function advConfigSacredWeaponProfileById(id){
    return Object.keys(ADV_CONFIG_SACRED_WEAPON_PROFILES).map(function(key){
      return ADV_CONFIG_SACRED_WEAPON_PROFILES[key];
    }).find(function(profile){ return profile.id === id; }) || null;
  }

  function advConfigSacredRemoveRows(sourceId){
    if(!sourceId) return;
    Array.from(document.querySelectorAll('#weaponsBody tr[data-adv-config-sacred-source]'))
      .filter(function(row){ return row.dataset.advConfigSacredSource === sourceId; })
      .forEach(function(row){ row.remove(); });
    if(typeof refreshAllWeaponRows === 'function') refreshAllWeaponRows();
  }

  function advConfigSacredWeaponRowsFor(sourceId){
    return Array.from(document.querySelectorAll('#weaponsBody tr[data-adv-config-sacred-source]'))
      .filter(function(row){ return row.dataset.advConfigSacredSource === sourceId; });
  }

  function advConfigSacredEnsureRows(profile, sourceId){
    if(!profile || !sourceId) return;
    profile.rows.forEach(function(spec, index){
      const exists = advConfigSacredWeaponRowsFor(sourceId).some(function(row){
        return row.dataset.advConfigSacredRow === String(index);
      });
      if(exists) return;
      const base = findWeapon(spec.key);
      if(!base) return; // no substitute profile is invented if the core weapon entry is absent
      const notes = 'Sacred Weapon — ' + profile.weaponName + '. ' + profile.rules;
      document.getElementById('weaponsBody').appendChild(makeWeaponRow({
        key:spec.key, name:spec.name, skill:base.skill, size:base.size,
        keywords:(base.keywords || []).join(', '), notes:notes,
        roll:'', dmg:'', manualAttack:false, manualDamage:false, hand:spec.hand || 'main',
        advConfigSacredSource:sourceId,
        advConfigSacredWeapon:profile.id,
        advConfigSacredRow:String(index),
      }));
    });
    if(typeof refreshAllWeaponRows === 'function') refreshAllWeaponRows();
  }

  function ensureAdvConfigSacredWeapon(div, schema, current){
    if(!ADV_CONFIG_SACRED_WEAPON_ENABLED || !schema || schema.type !== 'clanWeaponAutoPick') return null;
    const clan = advConfigCharacterClan();
    const profile = advConfigSacredWeaponProfileForClan(clan);
    const oldSource = current && current.sourceId;
    if(!profile){
      if(oldSource) advConfigSacredRemoveRows(oldSource);
      // Keep an explicitly incomplete configuration so the normal Phase 4.5 warning is shown.
      return { sourceId:oldSource || newAdvConfigSourceId('sacred') };
    }
    if(current && current.value === profile.id && current.clan === clan && current.sourceId){
      advConfigSacredEnsureRows(profile, current.sourceId);
      return current;
    }
    if(oldSource) advConfigSacredRemoveRows(oldSource);
    const next = {
      value:profile.id,
      clan:clan,
      sourceId:(current && current.sourceId) || newAdvConfigSourceId('sacred'),
    };
    advConfigSacredEnsureRows(profile, next.sourceId);
    return next;
  }

  function advConfigSacredWeaponEntryForRow(row, baseEntry){
    if(!ADV_CONFIG_SACRED_WEAPON_ENABLED || !row || !baseEntry) return baseEntry;
    const profile = advConfigSacredWeaponProfileById(row.dataset.advConfigSacredWeapon);
    const index = parseInt(row.dataset.advConfigSacredRow,10);
    const spec = profile && profile.rows[index];
    if(!profile || !spec || spec.key !== baseEntry.name) return baseEntry;
    const derived = Object.assign({}, baseEntry, {
      name:(row.querySelector('.wp-name') || {}).value || spec.name,
      notes:'Sacred Weapon — ' + profile.weaponName + '. ' + profile.rules,
    });
    if(spec.damage){
      derived.damage = { roll:spec.damage.roll, keep:spec.damage.keep };
    }
    return derived;
  }

  function advConfigSacredWeaponSummary(effect){
    const profile = advConfigSacredWeaponProfileById(effect.weaponId);
    if(!profile) return '';
    return escHtml(profile.weaponName) + ' — ' + profile.cost + ' points; equipment auto-added';
  }

  function removeAdvConfigOwnedEquipment(div){
    const config = readAdvConfig(div);
    if(config && config.type === 'clanWeaponAutoPick' && config.sourceId){
      advConfigSacredRemoveRows(config.sourceId);
    }
  }

  function decorateAdvConfigSacredWeaponRow(div, row, schema, config, effect){
    if(!effect || effect.effect !== 'sacredWeapon') return;
    row.insertAdjacentHTML('beforeend',
      '<span class="adv-config-badge" title="The generated equipment row contains the exact conditional rules to apply at the table.">Clan weapon added</span>');
    if(!div.dataset.advConfigSacredRemoveWired){
      div.dataset.advConfigSacredRemoveWired = '1';
      const remove = div.querySelector('.rm-btn');
      if(remove) remove.addEventListener('click', function(){
        // This listener runs after makeEntry's normal remove listener. The entry object and its
        // data remain available for this narrow cleanup, while only tagged generated rows move.
        removeAdvConfigOwnedEquipment(div);
        recalcAll();
      });
    }
  }
