  // ============ PART K PHASE 14 — SEARCH: PAGE ============
  // Presentation only. Reads through SEARCH14's interface; holds its own view state.
  // Interface: SEARCHPAGE14.open(options), .mount(panel), .state(), .render().
  const SEARCH_PAGE_ENABLED = true;

  const SEARCHPAGE14 = (function(){
    const api = {};
    const PAGE = 50;
    const view = { category: null, text: '', detailId: null, limit: PAGE, listScroll: 0 };
    let root = null;

    api.enabled = function(){
      return SEARCH_PAGE_ENABLED && typeof SEARCH14 === 'object' && !!SEARCH14 && SEARCH14.enabled();
    };
    api.state = function(){ return JSON.parse(JSON.stringify(view)); };

    function el(tag, cls, text){
      const n = document.createElement(tag);
      if(cls) n.className = cls;
      if(text != null) n.textContent = text;
      return n;
    }
    function button(cls, text){ const b = el('button', cls, text); b.type = 'button'; return b; }
    function part(name){ return root ? root.querySelector('[data-s14="' + name + '"]') : null; }
    function scroller(){ return root ? root.closest('.cl11-view') : null; }
    function meta(r, withType){ return (withType ? [r.type] : []).concat(r.tags).filter(Boolean).join(' · '); }
    function label(id){
      const c = SEARCH14.categories().find(function(x){ return x.id === id; });
      return c ? c.label : '';
    }

    // UI hook: the Search tab panel of the Characters screen.
    api.mount = function(panel){
      if(!panel || !api.enabled() || panel.querySelector('.s14-page')) return false;
      panel.textContent = '';
      root = el('div', 's14-page');
      root.appendChild(el('h2', 's14-title', 'Search'));
      const input = el('input', 's14-input');
      input.type = 'search';
      input.id = 's14Input';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('enterkeyhint', 'search');
      input.dataset.s14 = 'input';
      root.appendChild(input);
      const crumb = el('div', 's14-crumb');
      crumb.dataset.s14 = 'crumb';
      const up = button('s14-up', '‹ All categories');
      up.dataset.s14 = 'up';
      crumb.appendChild(up);
      crumb.appendChild(el('span', 's14-crumb-title'));
      root.appendChild(crumb);
      const count = el('p', 's14-count');
      count.dataset.s14 = 'count';
      count.setAttribute('aria-live', 'polite');
      root.appendChild(count);
      const home = el('div', 's14-home');
      home.dataset.s14 = 'home';
      root.appendChild(home);
      const results = el('ul', 's14-list');
      results.dataset.s14 = 'list';
      root.appendChild(results);
      const more = button('s14-more', 'Show more');
      more.dataset.s14 = 'more';
      root.appendChild(more);
      const detail = el('article', 's14-detail');
      detail.dataset.s14 = 'detail';
      root.appendChild(detail);
      panel.appendChild(root);

      input.addEventListener('input', function(){ view.text = input.value; view.limit = PAGE; api.render(); });
      up.addEventListener('click', function(){ view.category = null; view.limit = PAGE; api.render(); });
      more.addEventListener('click', function(){ view.limit += PAGE; api.render(); });
      home.addEventListener('click', function(e){
        const b = e.target.closest('[data-category]');
        if(!b) return;
        view.category = b.dataset.category;
        view.limit = PAGE;
        api.render();
        toTop();
      });
      results.addEventListener('click', function(e){
        const b = e.target.closest('[data-id]');
        if(b) showDetail(b.dataset.id);
      });
      detail.addEventListener('click', function(e){ if(e.target.closest('[data-s14="back"]')) closeDetail(); });
      root.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && view.detailId){ e.stopPropagation(); closeDetail(); }
      });
      api.render();
      return true;
    };

    function toTop(){ const s = scroller(); if(s) s.scrollTop = 0; }
    function showDetail(id){
      const s = scroller();
      view.listScroll = s ? s.scrollTop : 0;
      view.detailId = id;
      api.render();
      toTop();
      const h = root.querySelector('.s14-detail h3');
      if(h) h.focus({ preventScroll: true });
    }
    function closeDetail(){
      view.detailId = null;
      api.render();
      const s = scroller();
      if(s) s.scrollTop = view.listScroll;
    }

    function renderHome(home){
      home.textContent = '';
      const groups = [];
      SEARCH14.categories().forEach(function(c){
        if(!c.count) return;
        let g = groups.find(function(x){ return x.name === c.group; });
        if(!g){ g = { name: c.group, items: [] }; groups.push(g); }
        g.items.push(c);
      });
      groups.forEach(function(g){
        home.appendChild(el('h3', 's14-group', g.name));
        const box = el('div', 's14-cats');
        g.items.forEach(function(c){
          const b = button('s14-cat');
          b.dataset.category = c.id;
          b.appendChild(el('span', 's14-cat-label', c.label));
          b.appendChild(el('span', 's14-cat-count', String(c.count)));
          box.appendChild(b);
        });
        home.appendChild(box);
      });
    }
    function renderList(list, more, count){
      const res = SEARCH14.query({ text: view.text, category: view.category, limit: view.limit });
      list.textContent = '';
      res.results.forEach(function(r){
        const li = el('li');
        const b = button('s14-row');
        b.dataset.id = r.id;
        b.appendChild(el('span', 's14-name', r.name));
        b.appendChild(el('span', 's14-meta', meta(r, !view.category)));
        if(r.source) b.appendChild(el('span', 's14-source', r.source));
        li.appendChild(b);
        list.appendChild(li);
      });
      count.textContent = res.total === 0 ? 'No matches.'
        : res.total + (view.text ? (res.total === 1 ? ' match' : ' matches') : (res.total === 1 ? ' entry' : ' entries'));
      more.hidden = res.results.length >= res.total;
    }
    function renderDetail(detail){
      detail.textContent = '';
      const r = SEARCH14.get(view.detailId);
      const back = button('s14-up', '‹ Back');
      back.dataset.s14 = 'back';
      detail.appendChild(back);
      if(!r){ detail.appendChild(el('p', 's14-count', 'This entry is no longer available.')); return; }
      const h = el('h3', 's14-detail-name', r.name);
      h.tabIndex = -1;
      detail.appendChild(h);
      detail.appendChild(el('p', 's14-detail-meta', meta(r, true)));
      if(r.source) detail.appendChild(el('p', 's14-source', r.source));
      if(r.fields.length){
        const dl = el('dl', 's14-fields');
        r.fields.forEach(function(f){ dl.appendChild(el('dt', null, f.label)); dl.appendChild(el('dd', null, f.value)); });
        detail.appendChild(dl);
      }
      r.text.forEach(function(t){ detail.appendChild(el('p', 's14-text', t)); });
      r.sections.forEach(function(s){
        const sec = el('section', 's14-section');
        sec.appendChild(el('h4', null, s.title));
        const ul = el('ul');
        s.items.forEach(function(i){
          const li = el('li');
          if(i.name) li.appendChild(el('strong', null, i.name));
          if(i.text) li.appendChild(el('span', 's14-item-text', i.text));
          if(i.note) li.appendChild(el('span', 's14-source', i.note));
          ul.appendChild(li);
        });
        sec.appendChild(ul);
        detail.appendChild(sec);
      });
    }

    api.render = function(){
      if(!root) return;
      const input = part('input'), crumb = part('crumb'), home = part('home'), list = part('list'),
        more = part('more'), count = part('count'), detail = part('detail');
      const inDetail = !!view.detailId, browsing = !inDetail && !view.text && !view.category;
      if(input.value !== view.text) input.value = view.text;
      input.placeholder = view.category ? 'Search ' + label(view.category) : 'Search everything';
      input.setAttribute('aria-label', input.placeholder);
      input.hidden = inDetail;
      crumb.hidden = inDetail || !view.category;
      crumb.querySelector('.s14-crumb-title').textContent = view.category ? label(view.category) : '';
      home.hidden = !browsing;
      list.hidden = more.hidden = count.hidden = inDetail || browsing;
      detail.hidden = !inDetail;
      if(browsing) renderHome(home);
      else if(!inDetail) renderList(list, more, count);
      else renderDetail(detail);
    };

    // options: { category, text }. Opens the Characters screen on its Search tab.
    api.open = async function(options){
      if(!api.enabled() || typeof CL11 !== 'object' || !CL11 || !CL11.enabled()) return false;
      const o = options || {};
      if(o.category !== undefined) view.category = o.category || null;
      if(o.text !== undefined) view.text = String(o.text || '');
      view.detailId = null;
      view.limit = PAGE;
      await CL11.open('search');
      api.render();
      return true;
    };

    api.install = function(){
      if(!api.enabled()) return;
      // UI hook: mount into the Search tab panel whenever the Characters screen is built.
      if(typeof CL11 === 'object' && CL11 && typeof CL11.build === 'function'){
        const baseBuild = CL11.build;
        CL11.build = function(){
          const v = baseBuild.apply(this, arguments);
          if(v) api.mount(v.querySelector('.cl11-panel[data-panel="search"]'));
          return v;
        };
      }
      // UI hook: first item of the header's More menu.
      if(typeof MODES128 === 'object' && MODES128 && typeof MODES128.build === 'function'){
        const baseMenu = MODES128.build;
        MODES128.build = function(){
          const built = baseMenu.apply(this, arguments);
          const menu = document.getElementById(MODES128.menuId);
          if(menu && !document.getElementById('s14MenuItem')){
            const item = button('s14-menu-item', 'Search');
            item.id = 's14MenuItem';
            item.setAttribute('role', 'menuitem');
            item.addEventListener('click', function(){ api.open(); });
            menu.insertBefore(item, menu.firstChild);
          }
          return built;
        };
      }
    };

    return api;
  })();

  if(SEARCH_PAGE_ENABLED) SEARCHPAGE14.install();
  // ============ END PART K PHASE 14 SEARCHPAGE14 ============
