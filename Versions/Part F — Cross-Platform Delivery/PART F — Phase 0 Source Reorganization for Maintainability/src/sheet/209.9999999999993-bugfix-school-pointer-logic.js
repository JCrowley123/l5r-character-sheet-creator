  // BUGFIX AP7: Identity's Schools field points to the Advanced Schools on the Techniques page (owner ruling R16,
  // 23 October 2026). Nothing moves; the pointer says where they are and whether one can be joined.
  const SCHOOL_POINTER_ENABLED = true;
  const AP7Logic = {
    // state: {held, name, advantage, available}. Returns {text, go}; go when the Advanced School panel is shown.
    pointer(state){
      const s = state || {};
      if(s.held) return {text:'Your Advanced School, ' + s.name + ', is on the Techniques page.', go:true};
      if(!s.available) return {text:'Advanced Schools appear on the Techniques page once you meet one’s requirements' +
        (s.advantage ? '.' : ', with the Multiple Schools Advantage.'), go:false};
      if(!s.advantage) return {text:'Advanced Schools are on the Techniques page. Joining one needs the Multiple Schools Advantage.', go:true};
      return {text:'Advanced Schools are on the Techniques page, under Advanced School.', go:true};
    }
  };
