  // ============ PART K PHASE 14.2 — SEARCH REFERENCES ============
  // Verified printed entry pages; no catalogue or character writes.
  const SEARCH_REFERENCES_ENABLED = true;
  var SEARCHREF142 = (function(){
    const pages = {
      kata: {
        "Striking as Air": "Core Rulebook p.259",
        "Striking as Earth": "Core Rulebook p.259",
        "Striking as Fire": "Core Rulebook p.259",
        "Striking as Void": "Core Rulebook p.259",
        "Striking as Water": "Core Rulebook p.259",
        "Balance the Elements Style": "Core Rulebook p.259",
        "Breath of Wind Style": "Core Rulebook p.259",
        "Disappearing World Style": "Core Rulebook p.259",
        "Hidden Blade Style": "Core Rulebook p.259",
        "Indomitable Warrior Style": "Core Rulebook p.260",
        "Iron Forest Style": "Core Rulebook p.260",
        "Iron in the Mountains Style": "Core Rulebook p.260",
        "Reckless Abandon Style": "Core Rulebook p.260",
        "Strength in Arms Style": "Core Rulebook p.260",
        "Strength of Purity Style": "Core Rulebook p.260",
        "Spinning Blades Style": "Core Rulebook p.260",
        "Veiled Menace Style": "Core Rulebook p.260",
      },
      kiho: {
        "Air Fist": "Core Rulebook p.262",
        "Flee the Darkness": "Core Rulebook p.262",
        "The Great Silence": "Core Rulebook p.262",
        "Harmony of the Mind": "Core Rulebook p.262",
        "Riding the Clouds": "Core Rulebook p.262",
        "Soul of the Four Winds": "Core Rulebook p.262",
        "Stain Upon the Soul": "Core Rulebook p.262",
        "Steal the Air Dragon": "Core Rulebook p.263",
        "Way of the Willow": "Core Rulebook p.263",
        "Cleansing Spirit": "Core Rulebook p.263",
        "Earthen Fist": "Core Rulebook p.263",
        "Earth Needs No Eyes": "Core Rulebook p.263",
        "Embrace the Stone": "Core Rulebook p.263",
        "Grasp the Earth Dragon": "Core Rulebook p.263",
        "Rest, My Brother": "Core Rulebook p.263",
        "Root the Mountain": "Core Rulebook p.263",
        "Speed of the Mountains": "Core Rulebook p.264",
        "Way of the Earth": "Core Rulebook p.264",
        "The Body Is an Anvil": "Core Rulebook p.264",
        "Breaking Blow": "Core Rulebook p.264",
        "Channel the Fire Dragon": "Core Rulebook p.264",
        "Dance of the Flames": "Core Rulebook p.264",
        "Destiny's Strike": "Core Rulebook p.264",
        "Falling Star Strike": "Core Rulebook p.264",
        "Fire's Fleeting Speed": "Core Rulebook p.264",
        "Flame Fist": "Core Rulebook p.264",
        "Unbalance the Mind": "Core Rulebook p.265",
        "As the Breakers": "Core Rulebook p.265",
        "Buoyed by the Kami": "Core Rulebook p.265",
        "Chi Protection": "Core Rulebook p.265",
        "Freezing the Lifeblood": "Core Rulebook p.265",
        "Partaking the Waves": "Core Rulebook p.265",
        "Ride the Water Dragon": "Core Rulebook p.265",
        "Slap the Wave": "Core Rulebook p.265",
        "Waves in All Things": "Core Rulebook p.265",
        "Banish All Shadows": "Core Rulebook p.265",
        "Death Touch": "Core Rulebook p.266",
        "Eight Directions Awareness": "Core Rulebook p.266",
        "Silent Solace": "Core Rulebook p.266",
        "Song of the World": "Core Rulebook p.266",
        "Spin the Kharmic Wheel": "Core Rulebook p.266",
        "Touch the Void Dragon": "Core Rulebook p.267",
        "To the Last Breath": "Core Rulebook p.267",
        "Void Fist": "Core Rulebook p.267",
        "Eye of the Eagle": "Book of Air p.190",
        "The Wind’s Vision": "Book of Air p.190",
        "Calling the East Wind": "Book of Air p.191",
        "Censure of Thunder": "Book of Air p.191",
        "Hurricane Palm": "Book of Air p.192",
        "Touch of the Storm": "Book of Air p.192",
        "Inari’s Wrath": "Book of Air p.192",
        "Strike through the Wind": "Book of Air p.192",
        "Thunder’s Word": "Book of Air p.192",
        "Shadowed Mountain": "Book of Earth p.205",
        "Depths of the World": "Book of Earth p.206",
        "Harmony in Earth": "Book of Earth p.206",
        "The Rolling Avalanche": "Book of Earth p.206",
        "Earth Palm": "Book of Earth p.206",
        "Bishamon’s Grasp": "Book of Earth p.206",
        "Rising Mountain": "Book of Earth p.207",
        "Wholeness In All": "Book of Earth p.207",
        "The Mind’s Fire": "Book of Fire p.191",
        "Sever the Dark Lord’s Touch": "Book of Fire p.192",
        "Seven Storms’ Fist": "Book of Fire p.192",
        "Musubi": "Book of Water p.188",
        "Dharma Technique": "Book of Water p.189",
        "Tasaii-Do": "Book of Water p.189",
        "Knowledge from Within": "Book of Void p.192",
        "Mind/No-Mind": "Book of Void p.192",
        "Rebuke of the Heavens": "Book of Void p.192",
        "Sense the Balance": "Book of Void p.192",
        "Striking Through the Void": "Book of Void p.192",
        "The World Disappears": "Book of Void p.192",
      },
    };
    function normalise(value){ return String(value == null ? "" : value).trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " "); }
    const index = {};
    Object.keys(pages).forEach(function(category){
      index[category] = new Map(Object.keys(pages[category]).map(function(name){ return [normalise(name), pages[category][name]]; }));
    });
    return {
      enabled: function(){ return SEARCH_REFERENCES_ENABLED; },
      source: function(category, name){
        if(!SEARCH_REFERENCES_ENABLED || !Object.prototype.hasOwnProperty.call(index, category)) return "";
        return index[category].get(normalise(name)) || "";
      }
    };
  })();
  // Earlier Search consumers may have cached entries before this layer loaded.
  if(typeof SEARCH14 !== 'undefined') SEARCH14.invalidate();
  // ============ END SEARCHREF142 ============
