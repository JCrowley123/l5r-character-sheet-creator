  // ============ PART K PHASE 14.1 — SEARCH FACETS: PAGE ============
  // Presentation only: a category page's filters, and its group headings, on Search's page (Phase 14).
  // Reads through FACETS141 and SEARCHPAGE14's interface; holds the open category's filters.
  // Interface: FACETPAGE141.filters(), .set(facetId, value), .clear().
  const SEARCH_FACET_PAGE_ENABLED = true;

  const FACETPAGE141 = (function(){
    const api = {};
    let filters = {}, category = null, bar = null;

    api.enabled = function(){
      return SEARCH_FACET_PAGE_ENABLED && typeof FACETS141 === 'object' && !!FACETS141 && FACETS141.enabled() &&
        typeof SEARCHPAGE14 === 'object' && !!SEARCHPAGE14 && SEARCHPAGE14.enabled();
    };
    api.filters = function(){ return JSON.parse(JSON.stringify(filters)); };
    api.set = function(id, value){
      if(value) filters[id] = [String(value)]; else delete filters[id];
      SEARCHPAGE14.render();
    };
    api.clear = function(){ filters = {}; SEARCHPAGE14.render(); };

    function el(tag, cls, text){
      const n = document.createElement(tag);
      if(cls) n.className = cls;
      if(text != null) n.textContent = text;
      return n;
    }

    function build(){
      bar = el('div', 's141-bar');
      bar.id = 's141Bar';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Filters');
      bar.hidden = true;
      bar.addEventListener('change', function(e){
        const s = e.target.closest('select[data-facet]');
        if(s) api.set(s.dataset.facet, s.value);
      });
      bar.addEventListener('click', function(e){ if(e.target.closest('.s141-clear')) api.clear(); });
      return bar;
    }

    // Rebuilt only when the category changes, so a focused select keeps its focus.
    function drawBar(facets){
      if(bar.dataset.s141Category !== category){
        bar.textContent = '';
        bar.dataset.s141Category = category;
        facets.forEach(function(f){
          const s = el('select', 's141-select');
          s.dataset.facet = f.id;
          s.setAttribute('aria-label', f.label);
          s.appendChild(el('option', null, f.label + ': any')).value = '';
          f.options.forEach(function(o){ s.appendChild(el('option')).value = o.value; });
          bar.appendChild(s);
        });
        const clear = el('button', 's141-clear', 'Clear filters');
        clear.type = 'button';
        bar.appendChild(clear);
      }
      facets.forEach(function(f){
        const s = bar.querySelector('select[data-facet="' + f.id + '"]');
        if(!s) return;
        let chosen = '';
        f.options.forEach(function(o, i){
          const opt = s.options[i + 1];
          opt.textContent = o.label + ' (' + o.count + ')';
          opt.disabled = !o.count && !o.selected;
          if(o.selected) chosen = o.value;
        });
        s.value = chosen;
        s.classList.toggle('s141-on', !!chosen);
      });
      bar.querySelector('.s141-clear').hidden = !Object.keys(filters).length;
    }

    // The list as Phase 14 draws it, from the filtered query, with a heading wherever a group starts.
    function drawList(page, res){
      const list = page.querySelector('[data-s14="list"]'), count = page.querySelector('[data-s14="count"]'),
        more = page.querySelector('[data-s14="more"]'), text = SEARCHPAGE14.state().text;
      if(!list || !count || !more) return;
      list.textContent = '';
      let last = [];
      res.results.forEach(function(r){
        (r.group || []).forEach(function(g, i){
          if(last[i] === g) return;
          last = last.slice(0, i).concat(g);
          const li = el('li', 's141-group-row');
          li.setAttribute('role', 'presentation');
          li.appendChild(el(i ? 'h5' : 'h4', 's141-group s141-group-' + i, g));
          list.appendChild(li);
        });
        const li = el('li'), b = el('button', 's14-row');
        b.type = 'button';
        b.dataset.id = r.id;
        b.appendChild(el('span', 's14-name', r.name));
        b.appendChild(el('span', 's14-meta', r.tags.filter(Boolean).join(' · ')));
        if(r.source) b.appendChild(el('span', 's14-source', r.source));
        li.appendChild(b);
        list.appendChild(li);
      });
      count.textContent = res.total === 0 ? 'No matches.'
        : res.total + (text ? (res.total === 1 ? ' match' : ' matches') : (res.total === 1 ? ' entry' : ' entries'));
      more.hidden = res.results.length >= res.total;
    }

    function refresh(){
      const v = SEARCHPAGE14.state();
      if(v.category !== category){ category = v.category; filters = {}; }
      if(!bar || !bar.isConnected) return;
      const show = !!v.category && !v.detailId && FACETS141.has(v.category);
      bar.hidden = !show;
      if(!show) return;
      const res = FACETS141.query({ text: v.text, category: v.category, filters: filters, limit: v.limit });
      drawBar(res.facets);
      if(Object.keys(res.filters).length || res.grouped) drawList(bar.closest('.s14-page'), res);
    }

    api.install = function(){
      if(!api.enabled()) return;
      // UI hook: the filters sit under the category title of Search's page.
      const baseMount = SEARCHPAGE14.mount;
      SEARCHPAGE14.mount = function(panel){
        const ok = baseMount.apply(this, arguments);
        const crumb = ok && panel.querySelector('.s14-page [data-s14="crumb"]');
        if(crumb){ crumb.parentNode.insertBefore(build(), crumb.nextSibling); refresh(); }
        return ok;
      };
      // UI hook: every render of Search's page redraws the filters and, while they apply, the list.
      const baseRender = SEARCHPAGE14.render;
      SEARCHPAGE14.render = function(){
        const out = baseRender.apply(this, arguments);
        refresh();
        return out;
      };
      // UI hook: open() with options starts afresh, so the filters clear; open() alone keeps them.
      const baseOpen = SEARCHPAGE14.open;
      SEARCHPAGE14.open = function(options){
        if(options) filters = {};
        return baseOpen.apply(this, arguments);
      };
    };

    return api;
  })();

  if(SEARCH_FACET_PAGE_ENABLED) FACETPAGE141.install();
  // ============ END PART K PHASE 14.1 FACETPAGE141 ============
