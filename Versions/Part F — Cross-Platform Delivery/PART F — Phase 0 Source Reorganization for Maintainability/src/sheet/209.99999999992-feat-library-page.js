  // ============ PART K PHASE 13 — LIBRARY: PAGE ============
  // Presentation only. Reads and writes through LIB13; holds its own view state.
  // Interface: LIBPAGE13.mount(panel), .render(), .setView(v), .openAdd(), .openMenu(book, anchor), .rename(book),
  // .changeCover(book), .openCover(opts), .fixPages(book), .confirmDelete(book), .explainMissing(book), .refile(book, file),
  // .openReader(id, printed, from), .closeReader(), .openPanel(tab), .closePanel(), .findInBook(query), .offerOpen(cite),
  // .offerAdd(cite), .state().
  const LIBRARY_PAGE_ENABLED = true;

  const LIBPAGE13 = (function(){
    const api = {};
    let root = null, reader = null, add = null, view = 'list', viewRead = null, viewChosen = false, refileFor = null;
    let missingIds = new Set();
    const urls = [];

    api.enabled = function(){
      return LIBRARY_PAGE_ENABLED && typeof LIB13 === 'object' && !!LIB13 && LIB13.enabled();
    };
    api.state = function(){
      return {
        mounted: !!root, adding: !!add, view: view,
        reader: reader ? { id: reader.record.id, from: reader.from, page: reader.current, printed: LIB13.printedFor(reader.record, reader.current),
          panel: reader.panelOpen ? reader.tab : null, desk: !!reader.desk } : null
      };
    };

    function el(tag, cls, text){
      const n = document.createElement(tag);
      if(cls) n.className = cls;
      if(text != null) n.textContent = text;
      return n;
    }
    function button(cls, text){ const b = el('button', cls, text); b.type = 'button'; return b; }
    function pointerWord(){
      return window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches ? 'Click' : 'Tap';
    }
    // Desktop (the CSS's own test): windows instead of sheets, the ⋯ menu beside its button.
    function wide(){ return !!(window.matchMedia && window.matchMedia('(min-width: 900px) and (hover: hover)').matches); }
    function objectUrl(blob){ const u = URL.createObjectURL(blob); urls.push(u); return u; }
    function releaseUrls(){ while(urls.length) URL.revokeObjectURL(urls.pop()); }
    function picture(blob, list){
      const img = el('img');
      img.alt = '';
      const u = URL.createObjectURL(blob);
      list.push(u);
      img.src = u;
      return img;
    }
    function toast(text){
      const t = el('div', 'l13-toast', text);
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
      setTimeout(function(){ t.remove(); }, 2600);
    }
    function overlay(cls, label){
      const o = el('div', cls);
      o.setAttribute('role', 'dialog');
      o.setAttribute('aria-modal', 'true');
      if(label) o.setAttribute('aria-label', label);
      document.body.appendChild(o);
      return o;
    }
    // Full screen on phones, a centred window on desktop: Cancel, the title, and an optional action on the right.
    function panel(title, right){
      const o = overlay('l13-dialog', title);
      const head = el('div', 'l13-dhead');
      const cancel = button('l13-lnk', 'Cancel');
      cancel.dataset.l13 = 'cancel';
      head.appendChild(cancel);
      head.appendChild(el('h1', null, title));
      const ok = right ? button('l13-lnk l13-lnk-r', right) : el('span');
      if(right) ok.dataset.l13 = 'ok';
      head.appendChild(ok);
      o.appendChild(head);
      return { box: o, cancel: cancel, ok: right ? ok : null };
    }
    // A two-button question in the Library's own style; resolves true for the main button. opts: no (its label),
    // top and fields (nodes above and below the title), check (false keeps it open), pick (a file input the main
    // button opens: the device's own picker opens only from the tap itself), focus.
    function ask(title, text, okLabel, opts){
      opts = opts || {};
      return new Promise(function(resolve){
        const scrim = el('div', 'l13-scrim');
        const box = el('div', 'l13-alert');
        box.setAttribute('role', 'alertdialog');
        box.setAttribute('aria-modal', 'true');
        if(opts.top) box.appendChild(opts.top);
        const h = el('h2', 'l13-h2', title);
        h.id = 'l13AskTitle';
        box.setAttribute('aria-labelledby', h.id);
        box.appendChild(h);
        if(opts.fields) box.appendChild(opts.fields);
        if(text) box.appendChild(el('p', 'l13-hint', text));
        const two = el('div', 'l13-two');
        const no = button('l13-btn l13-btn-s', opts.no || 'Cancel');
        const yes = button('l13-btn l13-btn-p', okLabel);
        two.appendChild(no);
        two.appendChild(yes);
        box.appendChild(two);
        scrim.appendChild(box);
        document.body.appendChild(scrim);
        function close(v){ scrim.remove(); resolve(v); }
        no.addEventListener('click', function(){ close(false); });
        yes.addEventListener('click', function(){
          if(opts.check && !opts.check()) return;
          if(opts.pick) opts.pick.click();
          close(true);
        });
        scrim.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); close(false); } });
        (opts.focus || yes).focus();
      });
    }

    // ---- The shelf (the Library tab) ----
    api.mount = function(panelNode){
      if(!panelNode || !api.enabled()) return;
      panelNode.textContent = '';
      root = el('div', 'l13-root');
      const bar = el('div', 'l13-bar');
      const plus = button('l13-btn l13-btn-p l13-add');
      plus.id = 'l13Add';
      plus.innerHTML = '<span class="l13-plus" aria-hidden="true">+</span>Book';
      plus.setAttribute('aria-label', 'Add a book');
      plus.addEventListener('click', function(){ api.openAdd(); });
      bar.appendChild(plus);
      const seg = el('div', 'l13-seg');
      seg.id = 'l13View';
      seg.setAttribute('role', 'group');
      seg.setAttribute('aria-label', 'View');
      seg.hidden = true;
      [['list', 'List'], ['grid', 'Grid']].forEach(function(v){
        const b = button();
        b.dataset.view = v[0];
        b.innerHTML = '<i class="l13-ic-' + v[0] + '" aria-hidden="true"></i>' + v[1];
        b.addEventListener('click', function(){ api.setView(v[0]); });
        seg.appendChild(b);
      });
      bar.appendChild(seg);
      root.appendChild(bar);
      const body = el('div', 'l13-body');
      body.dataset.l13 = 'body';
      root.appendChild(body);
      const foot = el('p', 'l13-foot');
      foot.id = 'l13Foot';
      root.appendChild(foot);
      const note = el('p', 'l13-note', 'This browser may clear books if the device runs low on space. They can be added again.');
      note.id = 'l13Persist';
      note.hidden = true;
      root.appendChild(note);
      // "Add the file again": one picker for every missing book, opened from the tap itself.
      const refile = el('input');
      refile.type = 'file';
      refile.accept = 'application/pdf,.pdf';
      refile.hidden = true;
      refile.id = 'l13RefileFile';
      refile.addEventListener('change', function(){
        const f = refile.files[0], b = refileFor;
        refile.value = '';
        if(f && b) api.refile(b, f);
      });
      root.appendChild(refile);
      panelNode.appendChild(root);
      // A shelf holds as many covers as the width allows; redrawn when that number changes.
      if(typeof ResizeObserver === 'function') new ResizeObserver(function(){
        const s = root.querySelector('.l13-shelves');
        if(s && perShelf() !== +s.dataset.per) api.render();
      }).observe(root);
      api.render();
    };

    api.setView = function(v){
      view = v === 'grid' ? 'grid' : 'list';
      viewChosen = true;
      LIB13.setPref('view', view).catch(function(){});
      return api.render();
    };

    let renderGen = 0;
    api.render = async function(){
      if(!root) return;
      const gen = ++renderGen;
      const body = root.querySelector('[data-l13="body"]');
      // The view chosen last on this device, kept in the Library's own storage.
      if(!viewRead) viewRead = LIB13.pref('view').then(function(v){ if(!viewChosen && (v === 'grid' || v === 'list')) view = v; }, function(){});
      let books = [], missing = [];
      try { await viewRead; books = await LIB13.list(); missing = await LIB13.missing(); } catch(e){ books = null; }
      if(gen !== renderGen) return;
      missingIds = new Set(missing);
      releaseUrls();
      body.textContent = '';
      const seg = root.querySelector('#l13View');
      seg.hidden = !books || !books.length;
      seg.querySelectorAll('button').forEach(function(b){
        const on = b.dataset.view === view;
        b.classList.toggle('l13-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      if(books === null){
        body.appendChild(el('p', 'l13-error', 'The Library cannot use this device’s storage here, so books cannot be kept.'));
        return;
      }
      if(!books.length){
        const empty = el('div', 'l13-empty');
        const art = el('div', 'l13-ghosts');
        art.setAttribute('aria-hidden', 'true');
        const row = el('div', 'l13-ghost-row');
        for(let i = 0; i < 3; i++) row.appendChild(el('div', 'l13-ghost'));
        art.appendChild(row);
        art.appendChild(el('div', 'l13-shelf'));
        empty.appendChild(art);
        empty.appendChild(el('h2', 'l13-h1', 'Your Library is empty'));
        empty.appendChild(el('p', 'l13-body-text', 'Add the books you own as PDF files.'));
        const hint = el('p', 'l13-hint');
        hint.appendChild(document.createTextNode(pointerWord() + ' '));
        hint.appendChild(el('strong', null, '+ Book'));
        hint.appendChild(document.createTextNode(' to add one.'));
        empty.appendChild(hint);
        body.appendChild(empty);
      } else {
        const covers = {};
        for(const b of books){
          try { covers[b.id] = await LIB13.cover(b.id); } catch(e){}
        }
        const list = view === 'grid' ? shelves(books, missing) : rows(books, missing);
        // A later render started while these covers were read: it draws the shelf, not this one.
        if(gen !== renderGen) return;
        body.appendChild(list);
        list.querySelectorAll('[data-cover]').forEach(function(c){
          const blob = covers[c.dataset.cover];
          if(blob){ const img = el('img'); img.alt = ''; img.src = objectUrl(blob); c.appendChild(img); }
        });
      }
      const bytes = (books || []).reduce(function(s, b){ return s + (b.size || 0) + (b.coverSize || 0); }, 0);
      root.querySelector('#l13Foot').textContent = 'Books use ' + LIB13.formatSize(bytes) + ' on this device';
      root.querySelector('#l13Persist').hidden = !books.length || await LIB13.persisted();
    };

    const MISSING_TEXT = 'The copy kept on this device was cleared, as happens when a browser’s stored data is cleared. ' +
      'Its name, cover, recognised book and page fix are kept: choose the same PDF to read it again.';
    function refileButton(b){
      const again = button('l13-btn l13-btn-s', 'Add the file again');
      again.dataset.l13 = 'refile';
      again.addEventListener('click', function(){ refileFor = b; root.querySelector('#l13RefileFile').click(); });
      return again;
    }
    function moreButton(b, cls){
      const more = button(cls);
      more.setAttribute('aria-label', 'More for ' + b.name);
      more.innerHTML = cls === 'l13-more' ? '<span class="l13-dots" aria-hidden="true"></span>' : '<span aria-hidden="true"><i class="l13-dots"></i></span>';
      more.addEventListener('click', function(){ api.openMenu(b, more); });
      return more;
    }
    function rows(books, missing){
      const list = el('ul', 'l13-list');
      list.setAttribute('aria-label', 'Books');
      books.forEach(function(b){
        const gone = missing.indexOf(b.id) >= 0;
        const li = el('li', 'l13-row' + (gone ? ' l13-row-gone' : ''));
        li.dataset.id = b.id;
        const cover = el('div', 'l13-cover' + (gone ? ' l13-gone' : ''));
        cover.setAttribute('aria-hidden', 'true');
        cover.dataset.cover = b.id;
        li.appendChild(cover);
        const t = button('l13-title', b.name);
        if(gone){
          const box = el('div', 'l13-gonebox');
          t.appendChild(el('small', null, 'File missing'));
          t.addEventListener('click', function(){ api.explainMissing(b); });
          box.appendChild(t);
          box.appendChild(el('span', 'l13-hint l13-wide-only', MISSING_TEXT));
          box.appendChild(refileButton(b));
          li.appendChild(box);
        } else {
          t.addEventListener('click', function(){ api.openReader(b.id, null, 'library'); });
          li.appendChild(t);
        }
        li.appendChild(moreButton(b, 'l13-more'));
        list.appendChild(li);
      });
      return list;
    }
    // Grid: covers standing on lacquer shelf lines, three a shelf on phones, up to six on a wide screen (the CSS's gaps).
    function perShelf(){
      const w = root ? root.clientWidth : 390, gap = wide() ? 16 : 22;
      return Math.max(3, Math.min(6, Math.floor((w - 52 + gap) / (98 + gap))));
    }
    function shelves(books, missing){
      const per = perShelf();
      const box = el('div', 'l13-shelves');
      box.setAttribute('aria-label', 'Books');
      box.dataset.per = per;
      for(let i = 0; i < books.length; i += per){
        const row = el('div', 'l13-shelfrow');
        const covers = el('div', 'l13-covers');
        covers.style.setProperty('--l13-per', per);
        books.slice(i, i + per).forEach(function(b){
          const gone = missing.indexOf(b.id) >= 0;
          const w = el('div', 'l13-cvw');
          w.dataset.id = b.id;
          const open = button('l13-cv' + (gone ? ' l13-gone' : ''));
          open.dataset.cover = b.id;
          open.setAttribute('aria-label', gone ? b.name + ', file missing' : 'Open ' + b.name);
          open.appendChild(el('span', 'l13-cvname', b.name));
          open.addEventListener('click', function(){ if(gone) api.explainMissing(b); else api.openReader(b.id, null, 'library'); });
          w.appendChild(open);
          if(gone) w.appendChild(el('span', 'l13-tag', 'File missing'));
          w.appendChild(moreButton(b, 'l13-more-c'));
          covers.appendChild(w);
        });
        row.appendChild(covers);
        const line = el('div', 'l13-shelf');
        line.setAttribute('aria-hidden', 'true');
        row.appendChild(line);
        box.appendChild(row);
      }
      return box;
    }

    // ---- The ⋯ menu ----
    const ICON = function(d){ return '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
    const MENU = [
      { id: 'l13Rename', label: 'Rename', icon: ICON('<path d="M14.5 3.5l4 4L8 18H4v-4z"></path><path d="M12.5 5.5l4 4"></path>'), act: function(b){ api.rename(b); } },
      { id: 'l13Cover', label: 'Change cover', icon: ICON('<rect x="3" y="4" width="16" height="14" rx="1.5"></rect><circle cx="8" cy="9" r="1.6"></circle><path d="M3.5 16l5-5 4 4 2-2 4 4"></path>'), act: function(b){ api.changeCover(b); } },
      { id: 'l13FixPages', label: 'Fix page numbers', small: 'Only if a link opens the wrong page', icon: ICON('<path d="M5 2.5h8.5l3.5 3.5v13.5H5z"></path><path d="M8.5 10h5M8.5 13.5h5M10.5 8l-.8 7.5M13.3 8l-.8 7.5"></path>'), act: function(b){ api.fixPages(b); } },
      { id: 'l13Delete', label: 'Delete', small: 'Removes the book from this device', icon: ICON('<path d="M4 6h14"></path><path d="M9 6V4h4v2"></path><path d="M6 6l1 12h8l1-12"></path>'), act: function(b){ api.confirmDelete(b); } }
    ];
    // A sheet from the bottom on phones; on desktop a menu beside its button.
    api.openMenu = function(book, anchor){
      const pop = wide() && !!anchor;
      const scrim = el('div', 'l13-scrim' + (pop ? ' l13-scrim-clear' : ''));
      const act = el('div', pop ? 'l13-pop' : 'l13-act');
      act.setAttribute('role', pop ? 'menu' : 'dialog');
      if(!pop) act.setAttribute('aria-modal', 'true');
      const card = el('div', 'l13-actcard');
      const head = el('div', 'l13-acthead');
      const thumb = el('div', 'l13-cover l13-cover-s');
      thumb.setAttribute('aria-hidden', 'true');
      head.appendChild(thumb);
      const titles = el('div');
      const h = el('h2', 'l13-h2', book.name);
      h.id = 'l13MenuTitle';
      act.setAttribute('aria-labelledby', h.id);
      titles.appendChild(h);
      titles.appendChild(el('span', 'l13-hint', 'PDF, kept on this device'));
      head.appendChild(titles);
      card.appendChild(head);
      const mine = [];
      const close = function(){
        scrim.remove();
        mine.forEach(function(u){ URL.revokeObjectURL(u); });
        if(anchor && anchor.isConnected) anchor.focus({ preventScroll: true });
      };
      MENU.forEach(function(m){
        const row = button('l13-mrow' + (m.id === 'l13Delete' ? ' l13-del' : ''));
        row.id = m.id;
        if(pop) row.setAttribute('role', 'menuitem');
        row.innerHTML = m.icon + '<span>' + m.label + (m.small ? '<small>' + m.small + '</small>' : '') + '</span>';
        row.addEventListener('click', function(){ close(); m.act(book); });
        card.appendChild(row);
      });
      act.appendChild(card);
      if(!pop){
        const cancel = button('l13-btn l13-cancel', 'Cancel');
        cancel.addEventListener('click', close);
        act.appendChild(cancel);
      }
      scrim.appendChild(act);
      document.body.appendChild(scrim);
      if(pop) place(act, anchor);
      LIB13.cover(book.id).then(function(blob){ if(blob && scrim.isConnected) thumb.appendChild(picture(blob, mine)); }, function(){});
      scrim.addEventListener('click', function(e){ if(e.target === scrim) close(); });
      scrim.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); close(); } });
      card.querySelector('.l13-mrow').focus();
    };
    // Beside its button, kept inside the window.
    function place(box, anchor){
      const r = anchor.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight;
      let left = r.right + 6, top = r.top;
      if(left + w > window.innerWidth - 8) left = Math.max(8, r.left - w - 6);
      if(top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
      box.style.left = left + 'px';
      box.style.top = top + 'px';
    }

    api.rename = function(book){
      const fields = el('div', 'l13-fld l13-left');
      fields.innerHTML = '<label for="l13RenameInput" class="l13-lbl">Name on your shelf</label>' +
        '<input id="l13RenameInput" class="l13-inp" type="text" autocomplete="off">';
      const input = fields.querySelector('input');
      input.value = book.name;
      const done = ask('Rename', 'Only the name on your shelf changes. Search’s links still open this book.', 'Save',
        { fields: fields, focus: input, check: function(){ return !!input.value.trim(); } });
      input.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); input.closest('.l13-alert').querySelector('.l13-btn-p').click(); } });
      return done.then(async function(yes){
        if(!yes) return false;
        try { await LIB13.update(book.id, { name: input.value.trim() }); } catch(e){ toast('The name could not be saved.'); }
        await api.render();
        return true;
      });
    };

    api.confirmDelete = async function(book){
      const others = (LIB13.cached() || []).some(function(r){ return r.id !== book.id && r.bookId && r.bookId === book.bookId; });
      const text = 'This removes the book and its cover from this device.' +
        (book.bookId && !others ? ' Search’s links to it show “not in Library” until you add it again.' : '');
      const yes = await ask('Delete ' + book.name + '?', text, 'Delete');
      if(!yes) return false;
      try { await LIB13.remove(book.id); } catch(e){ toast('The book could not be deleted.'); }
      await api.render();
      relink();
      return true;
    };

    // One page with both side margins enlarged (the books print their numbers halfway down the outer margin), and
    // Previous / Next: the question of Check now and Fix page numbers. The answer counts from the page shown.
    const MARGINS = [{ x: 0, y: 0.42, w: 0.2, h: 0.16 }, { x: 0.8, y: 0.42, w: 0.2, h: 0.16 }];
    function pagePicker(handle, start, ofTotal){
      const box = el('div', 'l13-picker');
      box.innerHTML = '<canvas class="l13-checkpage" data-l13="checkpage" aria-label="A page from the PDF"></canvas>' +
        '<p class="l13-lbl-s" id="l13MarginsLbl">The side margins, enlarged</p>' +
        '<div class="l13-margins" role="group" aria-labelledby="l13MarginsLbl">' +
          '<canvas data-l13="margin" aria-label="Left margin"></canvas><canvas data-l13="margin" aria-label="Right margin"></canvas></div>' +
        '<div class="l13-checknav"><button type="button" class="l13-btn l13-btn-t" data-l13="prev">‹ Previous</button>' +
          '<span class="l13-hint" data-l13="pdfpage"></span>' +
          '<button type="button" class="l13-btn l13-btn-t" data-l13="next">Next ›</button></div>';
      const page = box.querySelector('[data-l13="checkpage"]'), margins = box.querySelectorAll('[data-l13="margin"]');
      let pdfPage = start, tasks = [];
      const show = function(n){
        pdfPage = Math.min(handle.pages, Math.max(1, n));
        tasks.forEach(function(t){ t.cancel(); });
        box.querySelector('[data-l13="pdfpage"]').textContent = 'PDF page ' + pdfPage + (ofTotal ? ' of ' + handle.pages : '');
        box.querySelector('[data-l13="prev"]').disabled = pdfPage <= 1;
        box.querySelector('[data-l13="next"]').disabled = pdfPage >= handle.pages;
        page.dataset.page = pdfPage;
        const ratio = screenRatio();
        tasks = [LIB13.draw(handle, pdfPage, page, page.clientWidth || 300, ratio)];
        margins.forEach(function(c, i){ tasks.push(LIB13.draw(handle, pdfPage, c, c.clientWidth || 140, ratio, MARGINS[i])); });
        tasks.forEach(function(t){ t.promise.catch(function(){}); });
      };
      box.querySelector('[data-l13="prev"]').addEventListener('click', function(){ show(pdfPage - 1); });
      box.querySelector('[data-l13="next"]').addEventListener('click', function(){ show(pdfPage + 1); });
      return {
        box: box, show: show, page: function(){ return pdfPage; },
        close: function(){ tasks.forEach(function(t){ t.cancel(); }); box.querySelectorAll('canvas').forEach(function(c){ c.width = c.height = 0; }); }
      };
    }

    // Corrections only: the numbers were matched when the book was added.
    api.fixPages = async function(book){
      const blob = await LIB13.file(book.id);
      if(!(await LIB13.readable(blob))) return missingFound(book);
      const p = panel('Fix page numbers', 'Save');
      p.box.id = 'l13FixDialog';
      const form = el('div', 'l13-form l13-fix');
      form.appendChild(el('p', 'l13-hint l13-center', 'The page numbers were matched when the book was added. Fix them here only if a link opens the wrong page.'));
      p.box.appendChild(form);
      const foot = el('div', 'l13-dfoot');
      const save = button('l13-btn l13-btn-p l13-btn-w', 'Save');
      save.dataset.l13 = 'save';
      foot.appendChild(save);
      p.box.appendChild(foot);
      let handle = null, picker = null, closed = false;
      const close = function(){ closed = true; if(picker) picker.close(); LIB13.unload(handle); p.box.remove(); };
      p.cancel.addEventListener('click', close);
      p.box.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); close(); } });
      p.cancel.focus();
      try { handle = await LIB13.load(blob); } catch(e){
        if(!closed) form.appendChild(el('p', 'l13-error', 'This book’s file cannot be opened.'));
        return false;
      }
      if(closed){ LIB13.unload(handle); return false; }
      picker = pagePicker(handle, LIB13.checkPage(handle), true);
      form.appendChild(picker.box);
      const fld = el('div', 'l13-checkfld');
      fld.innerHTML = '<label for="l13FixPrinted" class="l13-lbl-s">What page number is printed here?</label>' +
        '<input id="l13FixPrinted" class="l13-inp l13-num" type="text" inputmode="numeric" autocomplete="off">';
      form.appendChild(fld);
      form.appendChild(el('p', 'l13-hint l13-center', 'The other pages follow from this one.'));
      picker.show(picker.page());
      const input = fld.querySelector('input');
      const submit = async function(){
        const n = parseInt(input.value, 10);
        if(!(n >= 1)){ input.focus(); return; }
        const pdfPage = picker.page();
        try { await LIB13.update(book.id, { offset: n - pdfPage, pageState: 'matched', pageMethod: 'asked' }); } catch(e){ toast('The page numbers could not be saved.'); return; }
        close();
        toast('Page numbers saved');
      };
      p.ok.addEventListener('click', submit);
      save.addEventListener('click', submit);
      input.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); submit(); } });
      input.focus();
      return true;
    };

    // ---- Covers: a page of the PDF, or the user's own picture cropped to the book's shape ----
    api.changeCover = async function(book){
      const record = (await LIB13.get(book.id)) || book;
      const blob = await LIB13.file(book.id);
      let handle = null, shape = null;
      if(await LIB13.readable(blob)){
        try { handle = await LIB13.load(blob); shape = await LIB13.pageSize(handle, 1); } catch(e){ LIB13.unload(handle); handle = null; }
      }
      let current = null;
      try { current = await LIB13.cover(book.id); } catch(e){}
      return api.openCover({
        handle: handle, shape: shape, current: { blob: current, page: record.coverKind === 'picture' ? null : record.coverPage },
        onClose: function(){ LIB13.unload(handle); },
        onDone: async function(c){
          try { await LIB13.setCover(book.id, c.blob, { page: c.page }); } catch(e){ toast('The cover could not be kept on this device.'); }
          await api.render();
        }
      });
    };
    // opts: handle (null when the file is missing), shape (the first page's size), current { blob, page },
    // onDone({ blob, page }) when Done follows a change (page null for a picture), onClose.
    api.openCover = function(opts){
      const p = panel('Change cover', 'Done');
      p.box.id = 'l13CoverDialog';
      const form = el('div', 'l13-form');
      form.innerHTML =
        '<div class="l13-covernow"><div class="l13-cover l13-cover-l" data-l13="now" role="img" aria-label="The cover now"></div>' +
          '<span class="l13-hint" data-l13="nowtext"></span></div>' +
        '<div class="l13-fld"><span class="l13-lbl">A page from the PDF</span>' +
          '<div class="l13-thumbs" role="group" aria-label="The first pages" data-l13="thumbs"></div>' +
          '<p class="l13-hint" data-l13="pageshint"></p></div>' +
        '<div class="l13-fld"><span class="l13-lbl">A picture</span>' +
          '<button type="button" class="l13-btn l13-btn-s l13-btn-w" data-l13="picture">Choose a picture…</button>' +
          '<input type="file" accept="image/*" hidden data-l13="picturefile">' +
          '<p class="l13-hint">' + (wide() ? 'From your files.' : 'From your photos, the camera or your files.') +
          ' It is copied and kept on this device with the book.</p></div>';
      p.box.appendChild(form);
      const q = function(n){ return p.box.querySelector('[data-l13="' + n + '"]'); };
      const cur = opts.current || {};
      let chosen = { blob: cur.blob || null, page: cur.page || null }, changed = false, closed = false, gen = 0;
      const mine = [], tasks = [];
      const setNow = function(){
        const now = q('now');
        now.textContent = '';
        if(chosen.blob) now.appendChild(picture(chosen.blob, mine));
        q('nowtext').textContent = chosen.page ? 'Now: PDF page ' + chosen.page : chosen.blob ? 'Now: your picture' : '';
        q('thumbs').querySelectorAll('button').forEach(function(b){
          const on = +b.dataset.page === chosen.page;
          b.classList.toggle('l13-sel', on);
          b.setAttribute('aria-pressed', String(on));
          b.setAttribute('aria-label', 'PDF page ' + b.dataset.page + (on ? ', chosen' : ''));
        });
      };
      if(opts.handle){
        const count = Math.min(opts.handle.pages, wide() ? 12 : 8);
        for(let n = 1; n <= count; n++){
          const b = button('l13-th');
          b.dataset.page = n;
          b.appendChild(el('canvas'));
          b.addEventListener('click', async function(){
            const my = ++gen;
            let blob = null;
            try { blob = await LIB13.pageCover(opts.handle, n); } catch(e){}
            if(!blob || closed || my !== gen) return;
            chosen = { blob: blob, page: n };
            changed = true;
            setNow();
          });
          q('thumbs').appendChild(b);
        }
        q('pageshint').textContent = 'The app picked the first page with real content. ' + pointerWord() + ' another page to use it.';
        // Drawn one after another: phones have little canvas memory.
        (async function(){
          for(const b of Array.from(q('thumbs').children)){
            if(closed) return;
            const t = LIB13.draw(opts.handle, +b.dataset.page, b.firstChild, 56, screenRatio());
            tasks.push(t);
            try { await t.promise; } catch(e){}
          }
        })();
      } else q('pageshint').textContent = 'This book’s file is missing, so its pages cannot be shown.';
      setNow();
      const input = q('picturefile');
      q('picture').addEventListener('click', function(){ input.click(); });
      input.addEventListener('change', async function(){
        const f = input.files[0];
        input.value = '';
        if(!f) return;
        const my = ++gen;
        const blob = await api.cropPicture(f, opts.shape);
        if(!blob || closed || my !== gen) return;
        chosen = { blob: blob, page: null };
        changed = true;
        setNow();
      });
      const close = function(){
        closed = true;
        tasks.forEach(function(t){ t.cancel(); });
        p.box.querySelectorAll('canvas').forEach(function(c){ c.width = c.height = 0; });
        mine.forEach(function(u){ URL.revokeObjectURL(u); });
        p.box.remove();
        if(opts.onClose) opts.onClose();
      };
      p.cancel.addEventListener('click', close);
      p.ok.addEventListener('click', function(){
        const c = chosen, did = changed;
        close();
        if(did && c.blob && opts.onDone) opts.onDone(c);
      });
      p.box.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); close(); } });
      p.cancel.focus();
      return p.box;
    };
    // The picture in a frame of the book's shape: drag to move; pinch, the wheel or the slider to zoom.
    // Resolves with the cropped JPEG, or null.
    api.cropPicture = function(file, shape){
      return new Promise(function(resolve){
        const p = panel('Crop', 'Done');
        p.box.id = 'l13CropDialog';
        p.box.classList.add('l13-cropdlg');
        const area = el('div', 'l13-crop');
        area.setAttribute('role', 'img');
        area.setAttribute('aria-label', 'Your picture, with a frame in the book’s shape');
        const img = el('img', 'l13-photo');
        img.alt = '';
        img.draggable = false;
        const frame = el('div', 'l13-frame');
        area.appendChild(img);
        area.appendChild(frame);
        p.box.appendChild(area);
        const foot = el('div', 'l13-cropfoot');
        if(wide()) foot.innerHTML = '<label for="l13Zoom" class="l13-lbl">Zoom</label><input id="l13Zoom" type="range" min="0" max="100" value="0">';
        foot.appendChild(el('p', 'l13-hint', wide() ? 'Drag to move; zoom with the slider or the mouse wheel. The frame is the book’s shape.'
          : 'Drag to move, pinch to zoom. The frame is the book’s shape.'));
        p.box.appendChild(foot);
        const zoom = foot.querySelector('#l13Zoom');
        const aspect = shape && shape.width > 0 ? shape.height / shape.width : 134 / 98;
        // s: screen pixels per picture pixel; x, y: the picture's centre from the frame's centre, in screen pixels.
        const st = { s: 0, min: 1, max: 4, x: 0, y: 0, fw: 1, fh: 1, iw: 0, ih: 0 };
        const u = URL.createObjectURL(file);
        let finished = false;
        const apply = function(){
          const mx = Math.max(0, (st.iw * st.s - st.fw) / 2), my = Math.max(0, (st.ih * st.s - st.fh) / 2);
          st.x = Math.max(-mx, Math.min(mx, st.x));
          st.y = Math.max(-my, Math.min(my, st.y));
          img.style.width = st.iw * st.s + 'px';
          img.style.height = st.ih * st.s + 'px';
          img.style.transform = 'translate(' + (st.x - st.iw * st.s / 2) + 'px,' + (st.y - st.ih * st.s / 2) + 'px)';
          if(zoom && document.activeElement !== zoom) zoom.value = Math.round((st.s - st.min) / (st.max - st.min) * 100);
        };
        const layout = function(){
          if(!st.iw) return;
          st.fw = Math.max(40, Math.min(area.clientWidth * 0.72, area.clientHeight * 0.8 / aspect));
          st.fh = st.fw * aspect;
          frame.style.width = st.fw + 'px';
          frame.style.height = st.fh + 'px';
          st.min = Math.max(st.fw / st.iw, st.fh / st.ih);
          st.max = st.min * 4;
          st.s = Math.min(Math.max(st.s, st.min), st.max);
          apply();
        };
        const zoomTo = function(s){
          if(!st.iw) return;
          const s1 = Math.min(Math.max(s, st.min), st.max);
          st.x *= s1 / st.s;
          st.y *= s1 / st.s;
          st.s = s1;
          apply();
        };
        const pts = new Map();
        let pinch = null;
        area.addEventListener('pointerdown', function(e){
          e.preventDefault();
          if(!st.iw) return;
          try { area.setPointerCapture(e.pointerId); } catch(err){}
          pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if(pts.size === 2){ const a = Array.from(pts.values()); pinch = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1, s: st.s }; }
        });
        area.addEventListener('pointermove', function(e){
          const prev = pts.get(e.pointerId);
          if(!prev) return;
          const now = { x: e.clientX, y: e.clientY };
          pts.set(e.pointerId, now);
          if(pts.size >= 2 && pinch){ const a = Array.from(pts.values()); zoomTo(pinch.s * Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) / pinch.d); }
          else if(pts.size === 1){ st.x += now.x - prev.x; st.y += now.y - prev.y; apply(); }
        });
        const up = function(e){ pts.delete(e.pointerId); if(pts.size < 2) pinch = null; };
        area.addEventListener('pointerup', up);
        area.addEventListener('pointercancel', up);
        area.addEventListener('wheel', function(e){ e.preventDefault(); zoomTo(st.s * Math.exp(-e.deltaY / 500)); }, { passive: false });
        if(zoom) zoom.addEventListener('input', function(){ zoomTo(st.min + (st.max - st.min) * zoom.value / 100); });
        const finish = function(v){
          if(finished) return;
          finished = true;
          window.removeEventListener('resize', layout);
          URL.revokeObjectURL(u);
          p.box.remove();
          resolve(v);
        };
        window.addEventListener('resize', layout);
        img.onload = function(){ st.iw = img.naturalWidth; st.ih = img.naturalHeight; layout(); };
        img.onerror = function(){ toast('This picture cannot be used.'); finish(null); };
        img.src = u;
        p.cancel.addEventListener('click', function(){ finish(null); });
        p.box.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); finish(null); } });
        p.ok.addEventListener('click', async function(){
          if(!st.iw || finished) return;
          const rect = { x: (st.iw * st.s / 2 - st.x - st.fw / 2) / st.s, y: (st.ih * st.s / 2 - st.y - st.fh / 2) / st.s, w: st.fw / st.s, h: st.fh / st.s };
          let blob = null;
          try { blob = await LIB13.pictureCover(img, rect, 300); } catch(e){}
          finish(blob);
        });
        p.ok.focus();
      });
    };

    // ---- File missing: the stored copy is gone; the book keeps its name, cover, recognised book and page fix ----
    async function missingFound(book){
      try { await LIB13.markMissing(book.id); } catch(e){}
      await api.render();
      return api.explainMissing(book);
    }
    api.explainMissing = async function(book){
      const top = el('div', 'l13-cover l13-cover-l l13-gone');
      top.setAttribute('aria-hidden', 'true');
      const mine = [];
      try { const blob = await LIB13.cover(book.id); if(blob) top.appendChild(picture(blob, mine)); } catch(e){}
      refileFor = book;
      const input = root && root.querySelector('#l13RefileFile');
      const yes = await ask(book.name + '’s file is missing', MISSING_TEXT, 'Add the file again', { no: 'Not now', top: top, pick: input });
      mine.forEach(function(u){ URL.revokeObjectURL(u); });
      return yes;
    };
    // The PDF chosen again: the same book is used at once; a different one is named first.
    api.refile = async function(book, file){
      let handle = null;
      try {
        handle = await LIB13.load(file);
        const info = await LIB13.inspect(handle);
        const record = await LIB13.get(book.id);
        if(!record) return false;
        const same = LIB13.sameBook(record, { book: info.book, pages: info.pages, size: file.size });
        let patch = {};
        if(!same.same){
          const was = LIB13.knownBook(record.bookId);
          const text = (same.reason === 'book' ? 'It looks like ' + info.book.name + ', not ' + (was ? was.name : record.name) + '.'
            : 'It has ' + info.pages + ' pages; the copy that was here had ' + record.pages + '.') +
            ' Use it for ' + record.name + ' anyway?';
          if(!(await ask('This PDF is a different book', text, 'Use it'))) return false;
          // The shelf entry stays the book it was; only another page count needs its numbers matched again.
          if(info.pages !== record.pages){
            const m = await LIB13.matchPages(handle);
            patch = { pages: info.pages, offset: m.offset, pageState: m.state, pageMethod: m.method };
          }
        }
        await LIB13.replaceFile(book.id, file, patch);
      } catch(e){
        toast(e && e.code === 'full' ? 'There isn’t room for this book on this device.' : 'This file cannot be read as a PDF.');
        return false;
      } finally { LIB13.unload(handle); }
      await api.render();
      relink();
      toast(book.name + ' is back on your shelf');
      return true;
    };

    // ---- Add a book ----
    // options: then(record) after it is added; want { bookId, page, name } when it comes from a Search citation.
    api.openAdd = function(options){
      if(add) return add.box;
      const o = overlay('l13-dialog', 'Add a book');
      o.id = 'l13AddDialog';
      o.innerHTML =
        '<div class="l13-dhead"><button type="button" class="l13-lnk" data-l13="cancel">Cancel</button><h1>Add a book</h1><span></span></div>' +
        '<div class="l13-form">' +
          '<div class="l13-stat l13-from" data-l13="from" hidden></div>' +
          '<div class="l13-fld"><span class="l13-lbl">PDF file</span>' +
            '<div class="l13-well"><span class="l13-ficon" aria-hidden="true"></span><span class="l13-fn l13-none" data-l13="fn">No PDF chosen</span>' +
            '<button type="button" class="l13-btn l13-btn-s" data-l13="choose">Choose PDF</button></div>' +
            '<input type="file" accept="application/pdf,.pdf" hidden data-l13="file">' +
            '<p class="l13-hint" data-l13="fhint">The app reads the PDF to find which book it is.</p></div>' +
          '<div class="l13-fld" data-l13="bookfld" hidden><span class="l13-lbl" data-l13="booklbl">Book</span>' +
            '<div class="l13-stat" data-l13="book"></div>' +
            '<select class="l13-inp" data-l13="pick" hidden aria-label="Which book is this?"></select>' +
            '<p class="l13-hint">Search’s page links open the book named here.</p></div>' +
          '<div class="l13-fld" data-l13="pagefld" hidden><span class="l13-lbl">Page numbers</span>' +
            '<div class="l13-stat" role="status" data-l13="pages"></div></div>' +
          '<div class="l13-fld" data-l13="namefld" hidden><label class="l13-lbl" for="l13Name">Name on your shelf</label>' +
            '<input id="l13Name" class="l13-inp" type="text" autocomplete="off" data-l13="name"></div>' +
          '<div class="l13-fld" data-l13="coverfld" hidden><span class="l13-lbl">Cover</span>' +
            '<div class="l13-coverrow"><div class="l13-cover l13-cover-t" data-l13="cover"></div><span class="l13-grow" data-l13="covertext">A page from the PDF</span>' +
            '<button type="button" class="l13-btn l13-btn-t" data-l13="coverchange" disabled>Change</button></div></div>' +
        '</div>' +
        '<div class="l13-dfoot"><p class="l13-error" role="alert" data-l13="error" hidden></p>' +
          '<p class="l13-hint">Kept on this device only. Nothing is uploaded.</p>' +
          '<button type="button" class="l13-btn l13-btn-p l13-btn-w" data-l13="add" disabled>Add book</button></div>';
      const q = function(name){ return o.querySelector('[data-l13="' + name + '"]'); };
      add = { box: o, job: null, nameEdited: false, then: options && options.then, want: options && options.want || null };
      const pick = q('pick');
      LIB13.knownBooks().forEach(function(b){ const op = el('option', null, b.name); op.value = b.id; pick.appendChild(op); });
      const other = el('option', null, 'Another book (no Search links)');
      other.value = '';
      pick.appendChild(other);

      q('cancel').addEventListener('click', function(){ api.closeAdd(); });
      q('choose').addEventListener('click', function(){ q('file').click(); });
      q('file').addEventListener('change', function(){ const f = q('file').files[0]; if(f) api.choose(f); });
      q('name').addEventListener('input', function(){ add.nameEdited = true; refreshAdd(); });
      pick.addEventListener('change', function(){
        if(!add.job) return;
        add.job.bookId = pick.value || null;
        if(!add.nameEdited){
          const kb = LIB13.knownBook(add.job.bookId);
          q('name').value = kb ? kb.name : baseName(add.job.file.name);
        }
        refreshAdd();
      });
      q('coverchange').addEventListener('click', function(){ coverFromAdd(); });
      q('add').addEventListener('click', function(){ api.confirmAdd(); });
      o.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !o.querySelector('.l13-sheet')){ e.stopPropagation(); api.closeAdd(); } });
      refreshAdd();
      q('choose').focus();
      return o;
    };
    function baseName(file){ return String(file || '').replace(/\.pdf$/i, '').replace(/[_]+/g, ' ').trim(); }
    function coverFromAdd(){
      const job = add && add.job;
      if(!job || !job.handle || !job.cover || add.busy) return;
      api.openCover({ handle: job.handle, shape: job.shape, current: { blob: job.cover, page: job.coverPage }, onDone: function(c){
        if(!current(job)) return;
        job.cover = c.blob;
        job.coverPage = c.page;
        job.coverKind = c.page ? 'page' : 'picture';
        const box = add.box.querySelector('[data-l13="cover"]');
        box.textContent = '';
        const img = el('img');
        img.alt = '';
        img.src = objectUrl(c.blob);
        box.appendChild(img);
        add.box.querySelector('[data-l13="covertext"]').textContent = c.page ? 'A page from the PDF' : 'Your picture';
      } });
    }

    // Reads the chosen PDF: which book, the cover, then the page numbers in the background.
    function current(job){ return !!add && add.job === job; }
    api.choose = async function(file){
      if(!add || add.busy) return;
      const prev = add.job;
      if(prev && !prev.kept) LIB13.unload(prev.handle);
      const job = { file: file, handle: null, bookId: null, cover: null, coverPage: null, coverKind: 'page', match: null, matchResult: null, asked: null, kept: false, ready: false, failed: false };
      add.job = job;
      const o = add.box, q = function(name){ return o.querySelector('[data-l13="' + name + '"]'); };
      q('fn').textContent = file.name;
      q('fn').classList.remove('l13-none');
      q('choose').textContent = 'Choose another';
      q('fhint').hidden = true;
      q('error').hidden = true;
      ['bookfld', 'pagefld', 'namefld', 'coverfld'].forEach(function(n){ q(n).hidden = false; });
      setBookLine('reading');
      setPageLine('matching');
      q('cover').textContent = '';
      q('covertext').textContent = 'A page from the PDF';
      q('coverchange').disabled = true;
      refreshAdd();
      try {
        job.handle = await LIB13.load(file);
        if(!current(job)) return LIB13.unload(job.handle);
        const info = await LIB13.inspect(job.handle);
        if(!current(job)) return LIB13.unload(job.handle);
        job.pages = info.pages;
        job.bookId = info.book ? info.book.id : null;
        job.recognised = info.book;
        job.inspected = true;
        q('pick').value = job.bookId || '';
        if(!add.nameEdited) q('name').value = info.book ? info.book.name : baseName(file.name);
        setBookLine(info.book ? 'recognised' : 'unknown');
        refreshAdd();
        job.match = LIB13.matchPages(job.handle).then(function(r){
          job.matchResult = r;
          if(add && add.job === job && !job.asked) setPageLine(r.state);
          return r;
        }, function(){
          job.matchResult = { state: 'check', offset: 0, method: null };
          if(add && add.job === job && !job.asked) setPageLine('check');
          return job.matchResult;
        });
        job.shape = await LIB13.pageSize(job.handle, 1);
        const cover = await LIB13.makeCover(job.handle);
        if(!current(job)) return LIB13.unload(job.handle);
        job.cover = cover.blob;
        job.coverPage = cover.page;
        if(cover.blob){ const img = el('img'); img.alt = ''; img.src = objectUrl(cover.blob); q('cover').appendChild(img); }
        q('coverchange').disabled = !cover.blob;
        job.ready = true;
      } catch(e){
        if(!current(job)){ LIB13.unload(job.handle); return; }
        job.failed = true;
        setBookLine('failed');
        q('pagefld').hidden = true;
      }
      refreshAdd();
    };

    function setBookLine(state){
      const o = add.box, line = o.querySelector('[data-l13="book"]'), pick = o.querySelector('[data-l13="pick"]');
      line.textContent = '';
      line.hidden = false;
      pick.hidden = true;
      o.querySelector('[data-l13="booklbl"]').textContent = 'Book';
      const grow = el('span', 'l13-grow');
      if(state === 'reading') grow.textContent = 'Reading the PDF…';
      else if(state === 'failed') grow.textContent = 'This file cannot be read as a PDF.';
      else if(state === 'unknown') grow.textContent = 'Not recognised';
      else {
        grow.appendChild(document.createTextNode('Recognised as '));
        grow.appendChild(el('b', null, add.job.recognised.name));
      }
      line.appendChild(grow);
      if(state === 'recognised' || state === 'unknown'){
        const change = button('l13-btn l13-btn-t', 'Change');
        change.dataset.l13 = 'change';
        change.addEventListener('click', function(){
          line.hidden = true;
          pick.hidden = false;
          o.querySelector('[data-l13="booklbl"]').textContent = 'Which book is this?';
          pick.focus();
        });
        line.appendChild(change);
      }
    }
    function setPageLine(state){
      const line = add.box.querySelector('[data-l13="pages"]');
      line.textContent = '';
      line.dataset.state = state;
      if(state === 'matching'){
        line.appendChild(el('span', 'l13-i-spin'));
        line.appendChild(el('span', 'l13-grow', 'Matching page numbers…'));
      } else if(state === 'matched'){
        line.appendChild(el('span', 'l13-i-ok'));
        line.appendChild(el('span', 'l13-grow', 'Page numbers matched automatically'));
      } else {
        line.appendChild(el('span', 'l13-i-warn', '!'));
        line.appendChild(el('span', 'l13-grow', 'Page numbers need a quick check'));
        const now = button('l13-btn l13-btn-t', 'Check now');
        now.dataset.l13 = 'checknow';
        now.addEventListener('click', function(){ api.checkNow(); });
        line.appendChild(now);
      }
      line.firstChild.setAttribute('aria-hidden', 'true');
    }
    // From a Search citation: whether the PDF chosen is the book the link wants.
    function setFrom(){
      const line = add.box.querySelector('[data-l13="from"]'), w = add.want, job = add.job;
      if(!w) return;
      line.hidden = false;
      const known = job && job.inspected ? LIB13.knownBook(job.bookId) : null;
      line.classList.toggle('l13-from-warn', !!(job && job.inspected && job.bookId !== w.bookId));
      if(!job || !job.inspected || job.bookId === w.bookId) line.textContent = 'From Search: once added, ' + w.name + ' opens at p.' + w.page + '.';
      else if(known) line.textContent = 'This PDF is ' + known.name + ', not ' + w.name + ', so the link will not open it. Choose another, or add it anyway.';
      else line.textContent = 'This PDF was not recognised as ' + w.name + ', so the link will not open it. Choose another, or use Change if it is ' + w.name + '.';
    }
    function refreshAdd(){
      if(!add) return;
      const o = add.box, job = add.job;
      const name = o.querySelector('[data-l13="name"]').value.trim();
      o.querySelector('[data-l13="add"]').disabled = add.busy || !(job && job.ready && !job.failed && name);
      setFrom();
    }

    // One page, one question; the answer sets the offset for the whole book. The page fills the sheet's width.
    api.checkNow = async function(){
      if(!add || !add.job || !add.job.handle) return;
      const job = add.job;
      const picker = pagePicker(job.handle, LIB13.checkPage(job.handle), false);
      const sheet = el('div', 'l13-sheet l13-check');
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.innerHTML = '<div class="l13-grab" aria-hidden="true"></div>' +
        '<h2 class="l13-h2" id="l13CheckTitle">What page number is printed here?</h2>';
      sheet.appendChild(picker.box);
      sheet.insertAdjacentHTML('beforeend',
        '<div class="l13-checkfld"><label for="l13Printed" class="l13-lbl">Printed page</label>' +
          '<input id="l13Printed" class="l13-inp l13-num" type="text" inputmode="numeric" autocomplete="off"></div>' +
        '<button type="button" class="l13-btn l13-btn-p l13-btn-w" data-l13="done">Done</button>' +
        '<button type="button" class="l13-btn l13-btn-t" data-l13="skip">Skip: use Fix page numbers later</button>');
      sheet.setAttribute('aria-labelledby', 'l13CheckTitle');
      const scrim = el('div', 'l13-scrim l13-scrim-in');
      scrim.appendChild(sheet);
      add.box.appendChild(scrim);
      picker.show(picker.page());
      const input = sheet.querySelector('#l13Printed');
      const close = function(){
        picker.close();
        scrim.remove();
      };
      sheet.querySelector('[data-l13="skip"]').addEventListener('click', close);
      sheet.querySelector('[data-l13="done"]').addEventListener('click', function(){
        const n = parseInt(input.value, 10);
        if(!(n >= 1)){ input.focus(); return; }
        const pdfPage = picker.page();
        job.asked = { state: 'matched', offset: n - pdfPage, method: 'asked' };
        setPageLine('matched');
        close();
      });
      scrim.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); close(); } });
      input.focus();
    };

    api.confirmAdd = async function(){
      if(!add || !add.job || !add.job.ready) return;
      const job = add.job, o = add.box;
      const btn = o.querySelector('[data-l13="add"]'), err = o.querySelector('[data-l13="error"]');
      btn.disabled = true;
      btn.textContent = 'Adding…';
      add.busy = true;
      o.querySelector('[data-l13="cancel"]').disabled = true;
      o.querySelector('[data-l13="coverchange"]').disabled = true;
      err.hidden = true;
      const persist = LIB13.persist();
      const pages = job.asked || job.matchResult;
      let record;
      try {
        record = await LIB13.add({
          file: job.file, name: o.querySelector('[data-l13="name"]').value, bookId: job.bookId, pages: job.pages,
          offset: pages ? pages.offset : 0, pageState: pages ? pages.state : 'matching', pageMethod: pages ? pages.method : null,
          cover: job.cover, coverPage: job.coverKind === 'picture' ? null : job.coverPage, coverKind: job.coverKind
        });
      } catch(e){
        btn.textContent = 'Add book';
        btn.disabled = false;
        add.busy = false;
        o.querySelector('[data-l13="cancel"]').disabled = false;
        o.querySelector('[data-l13="coverchange"]').disabled = !job.cover;
        err.textContent = e.code === 'full'
          ? 'There isn’t room for this book on this device. It needs about ' + LIB13.formatSize(job.file.size) + '. Free some space, then try again.'
          : 'The book could not be kept on this device. Nothing was saved.';
        err.hidden = false;
        return;
      }
      job.kept = true;
      // Add book never waits for the page numbers: a late result is written to the book (unless fixed meanwhile).
      let numbered = null;
      if(!pages && job.match){
        numbered = job.match.then(function(r){ return LIB13.update(record.id, { offset: r.offset, pageState: r.state, pageMethod: r.method }, true); })
          .catch(function(){}).then(function(){ LIB13.unload(job.handle); });
      } else LIB13.unload(job.handle);
      const then = add.then;
      add.busy = false;
      api.closeAdd();
      await persist;
      await api.render();
      relink();
      toast(record.name + ' added to your Library');
      // A link opens the printed page, so it waits for the page numbers.
      if(typeof then === 'function'){ if(numbered) await numbered; then(record); }
    };
    api.closeAdd = function(){
      if(!add || add.busy) return;
      if(add.job && !add.job.kept) LIB13.unload(add.job.handle);
      add.box.remove();
      add = null;
      const plus = document.getElementById('l13Add');
      if(plus) plus.focus({ preventScroll: true });
    };

    // ---- The reader ----
    let readerToken = 0;
    api.openReader = async function(id, printed, from){
      api.closeReader();
      const token = readerToken;
      const record = await LIB13.get(id);
      if(!record || token !== readerToken) return false;
      const blob = await LIB13.file(id);
      if(token !== readerToken) return false;
      if(!(await LIB13.readable(blob))){
        if(token === readerToken) missingFound(record);
        return false;
      }
      if(token !== readerToken) return false;
      const o = overlay('l13-reader', record.name);
      o.id = 'l13Reader';
      const state = { record: record, from: from || 'library', box: o, handle: null, slots: [], drawn: new Map(), current: 1, observer: null,
        outline: null, open: new Set(), spotKey: null, tab: 'chapters', panelOpen: false, searchGen: 0, hits: [] };
      reader = state;
      let loaded = null;
      state.loaded = new Promise(function(r){ loaded = r; });
      const head = el('div', 'l13-rhead');
      const back = button('l13-back', from === 'search' ? '‹ Search' : '‹ Library');
      back.id = 'l13ReaderBack';
      back.addEventListener('click', function(){ api.closeReader(); });
      head.appendChild(back);
      head.appendChild(el('h1', null, record.name));
      const tools = el('div', 'l13-rtools');
      const headChapters = button('l13-btn l13-btn-s', 'Chapters');
      headChapters.id = 'l13HeadChapters';
      headChapters.addEventListener('click', function(){ openPanel(state, 'chapters'); });
      tools.appendChild(headChapters);
      head.appendChild(tools);
      o.appendChild(head);
      const main = el('div', 'l13-rmain');
      const body = el('div', 'l13-rbody');
      body.setAttribute('aria-label', 'Pages');
      main.appendChild(body);
      o.appendChild(main);
      const chip = el('span', 'l13-chip');
      chip.setAttribute('aria-live', 'polite');
      o.appendChild(chip);
      const bar = el('div', 'l13-rbar');
      const barChapters = barButton(ICON_CHAPTERS, 'Chapters'), barSearch = barButton(ICON_SEARCH, 'Search');
      barChapters.id = 'l13BarChapters';
      barSearch.id = 'l13BarSearch';
      barChapters.addEventListener('click', function(){ openPanel(state, 'chapters'); });
      barSearch.addEventListener('click', function(){ openPanel(state, 'search'); });
      const jump = el('form', 'l13-jump');
      jump.innerHTML = '<label for="l13Jump" class="l13-lbl-s">Page</label>' +
        '<input id="l13Jump" class="l13-inp l13-num" type="text" inputmode="numeric" autocomplete="off">' +
        '<button type="submit" class="l13-btn l13-btn-p">Go</button>';
      jump.addEventListener('submit', function(e){
        e.preventDefault();
        const n = parseInt(jump.querySelector('input').value, 10);
        if(n >= 1) api.goTo(n);
      });
      bar.appendChild(barChapters);
      bar.appendChild(jump);
      bar.appendChild(barSearch);
      o.appendChild(bar);
      Object.assign(state, { tools: tools, main: main, body: body, bar: bar, jump: jump, headChapters: headChapters, barChapters: barChapters, barSearch: barSearch });
      buildPanel(state);
      // Opened from the Library, desktop shows Chapters beside the pages; from Search, the page alone.
      state.panelOpen = wide() && state.from !== 'search';
      state.media = window.matchMedia ? window.matchMedia('(min-width: 900px) and (hover: hover)') : null;
      state.onMedia = function(){ layout(state); };
      if(state.media && state.media.addEventListener) state.media.addEventListener('change', state.onMedia);
      layout(state);
      o.addEventListener('keydown', function(e){
        if(e.key !== 'Escape') return;
        e.stopPropagation();
        // The sheet closes first (keeping its search box as typed); on desktop, Escape in a search box with text
        // only clears it (the browser's own), leaving the book open.
        if(state.panelOpen && !state.desk){ e.preventDefault(); closePanel(state); }
        else if(!(e.target === state.findInput && state.findInput.value)) api.closeReader();
      });
      let size = null;
      try {
        state.handle = await LIB13.load(blob);
        if(reader === state) size = await LIB13.pageSize(state.handle, 1);
      } catch(e){}
      if(reader !== state){ if(state.handle) LIB13.unload(state.handle); loaded(false); return false; }
      if(!size){
        loaded(false);
        state.failed = true;
        renderChapters(state);
        body.appendChild(el('p', 'l13-error', CANNOT_OPEN));
        return false;
      }
      const ratio = size.height / size.width;
      o.style.setProperty('--l13-ratio', ratio.toFixed(4));
      for(let n = 1; n <= state.handle.pages; n++){
        const slot = el('div', 'l13-page');
        slot.dataset.page = n;
        slot.style.aspectRatio = '1 / ' + ratio.toFixed(4);
        body.appendChild(slot);
        state.slots.push(slot);
      }
      state.observer = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting) drawSlot(state, en.target); });
        trim(state, body);
      }, { root: body, rootMargin: '100% 0px' });
      state.slots.forEach(function(s){ state.observer.observe(s); });
      loaded(true);
      state.outlineReady = LIB13.outline(state.handle).catch(function(){ return []; }).then(function(tree){
        if(reader !== state) return;
        keyTree(tree, '');
        state.outline = tree;
        follow(state);
        renderChapters(state);
      });
      // Pinch zoom and panning move the visual viewport; scrolling while zoomed brings in pages drawn at the normal ratio.
      state.onZoom = function(){ clearTimeout(state.settle); state.settle = setTimeout(function(){ sharpen(state); }, 250); };
      if(window.visualViewport){
        visualViewport.addEventListener('resize', state.onZoom);
        visualViewport.addEventListener('scroll', state.onZoom);
      }
      let ticking = false;
      body.addEventListener('scroll', function(){
        if(window.visualViewport && visualViewport.scale > 1.05) state.onZoom();
        if(ticking) return;
        ticking = true;
        requestAnimationFrame(function(){ ticking = false; track(state, body); });
      });
      back.focus({ preventScroll: true });
      api.goTo(printed != null ? printed : LIB13.printedFor(record, 1) || 1, printed == null);
      return true;
    };
    // Pages are drawn at the screen's pixel ratio (up to 3) and redrawn sharper after a pinch zoom, within canvas
    // memory: iOS refuses a canvas over 16.7 million pixels, eight normal pages share PAGES_PX, zoomed ones ZOOM_PX.
    const MAX_CANVAS_PX = 16e6, PAGES_PX = 36e6, ZOOM_PX = 32e6;
    function screenRatio(){ return Math.min(window.devicePixelRatio || 1, 3); }
    function fit(ratio, area, maxPx){ return Math.max(1, Math.min(ratio, Math.sqrt(maxPx / Math.max(1, area)))); }
    function slotArea(slot){ return slot.clientWidth * slot.clientHeight; }
    function baseRatio(slot){ return fit(screenRatio(), slotArea(slot), Math.min(MAX_CANVAS_PX, PAGES_PX / 8)); }
    function freeCanvas(c){ c.width = c.height = 0; c.remove(); }
    function drawSlot(state, slot){
      const n = +slot.dataset.page;
      if(state.drawn.has(n)) return;
      const canvas = el('canvas');
      slot.appendChild(canvas);
      const ratio = baseRatio(slot);
      const task = LIB13.draw(state.handle, n, canvas, slot.clientWidth || 320, ratio);
      state.drawn.set(n, { canvas: canvas, task: task, ratio: ratio, next: null });
      task.promise.then(function(ok){
        if(!ok) return;
        slot.style.aspectRatio = canvas.width + ' / ' + canvas.height;
        slot.classList.add('l13-drawn');
      }, function(){});
    }
    // Once a pinch zoom settles, the pages in view are redrawn at the zoomed ratio into fresh canvases, swapped in
    // when drawn; pages left zoomed out of view (or after zooming out) go back to the normal ratio.
    function sharpen(state){
      if(reader !== state) return;
      const vv = window.visualViewport, zoom = vv ? vv.scale : 1;
      const view = vv ? { l: vv.offsetLeft, t: vv.offsetTop, r: vv.offsetLeft + vv.width, b: vv.offsetTop + vv.height }
        : { l: 0, t: 0, r: window.innerWidth, b: window.innerHeight };
      const inView = [];
      if(zoom > 1.05) state.drawn.forEach(function(d, n){
        const b = state.slots[n - 1].getBoundingClientRect();
        if(b.right > view.l && b.left < view.r && b.bottom > view.t && b.top < view.b) inView.push(n);
      });
      const area = inView.reduce(function(s, n){ return s + slotArea(state.slots[n - 1]); }, 0);
      state.drawn.forEach(function(d, n){
        const slot = state.slots[n - 1], base = baseRatio(slot);
        const want = inView.indexOf(n) < 0 ? base
          : Math.max(base, Math.min(fit(screenRatio() * zoom, slotArea(slot), MAX_CANVAS_PX), Math.sqrt(ZOOM_PX / area)));
        const target = d.next ? d.next.ratio : d.ratio;
        if(Math.abs(want - target) > target * 0.1) redraw(state, n, d, want);
      });
    }
    function redraw(state, n, d, ratio){
      const slot = state.slots[n - 1], canvas = el('canvas');
      if(d.next) d.next.task.cancel();
      const task = LIB13.draw(state.handle, n, canvas, slot.clientWidth || 320, ratio);
      const next = d.next = { canvas: canvas, task: task, ratio: ratio };
      task.promise.then(function(ok){
        if(!ok || d.next !== next || state.drawn.get(n) !== d || reader !== state){ freeCanvas(canvas); return; }
        d.task.cancel();
        slot.replaceChild(canvas, d.canvas);
        d.canvas.width = d.canvas.height = 0;
        Object.assign(d, { canvas: canvas, task: task, ratio: ratio, next: null });
        slot.style.aspectRatio = canvas.width + ' / ' + canvas.height;
        slot.classList.add('l13-drawn');
      }, function(){ freeCanvas(canvas); });
    }
    function dropDrawn(d){
      d.task.cancel();
      freeCanvas(d.canvas);
      if(d.next){ d.next.task.cancel(); freeCanvas(d.next.canvas); }
    }
    // Keeps at most a few pages drawn: phones have little canvas memory.
    function trim(state, body){
      if(state.drawn.size <= 8) return;
      const top = body.scrollTop, bottom = top + body.clientHeight;
      state.drawn.forEach(function(d, n){
        const s = state.slots[n - 1];
        if(s.offsetTop + s.offsetHeight < top - body.clientHeight || s.offsetTop > bottom + body.clientHeight){
          dropDrawn(d);
          s.classList.remove('l13-drawn');
          state.drawn.delete(n);
        }
      });
    }
    function track(state, body){
      const probe = body.scrollTop + body.clientHeight * 0.3;
      let n = 1;
      for(const s of state.slots){ if(s.offsetTop <= probe) n = +s.dataset.page; else break; }
      state.current = n;
      const printed = LIB13.printedFor(state.record, n);
      state.box.querySelector('.l13-chip').textContent = printed ? 'Printed page ' + printed : 'PDF page ' + n;
      const input = state.box.querySelector('#l13Jump');
      if(document.activeElement !== input) input.value = printed || '';
      follow(state);
    }
    // Goes to a printed page (or to PDF page 1 when asked for the start).
    api.goTo = function(printed, start){
      if(!reader || !reader.slots.length) return false;
      const n = start ? 1 : LIB13.pdfPageFor(reader.record, printed);
      const body = reader.box.querySelector('.l13-rbody');
      body.scrollTop = reader.slots[n - 1].offsetTop - 12;
      track(reader, body);
      return n;
    };
    api.closeReader = function(){
      readerToken++;
      if(!reader) return;
      const r = reader;
      reader = null;
      if(r.observer) r.observer.disconnect();
      clearTimeout(r.settle);
      clearTimeout(r.findTimer);
      r.searchGen++;
      if(r.media && r.media.removeEventListener) r.media.removeEventListener('change', r.onMedia);
      if(r.onZoom && window.visualViewport){
        visualViewport.removeEventListener('resize', r.onZoom);
        visualViewport.removeEventListener('scroll', r.onZoom);
      }
      r.drawn.forEach(dropDrawn);
      LIB13.unload(r.handle);
      r.box.remove();
    };

    // ---- Chapters and Search in book: a sheet over the pages on phones, a panel beside them on desktop ----
    function barButton(icon, text){
      const b = button('l13-rbtn');
      b.innerHTML = icon;
      b.appendChild(document.createTextNode(text));
      return b;
    }
    const ICON_CHAPTERS = '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M7 5h11M7 11h11M7 17h11"></path><path d="M3 5h.5M3 11h.5M3 17h.5"></path></svg>';
    const CANNOT_OPEN = 'This book’s file cannot be opened.';
    const ICON_SEARCH ='<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="9.5" cy="9.5" r="6"></circle><path d="M14 14l5 5"></path></svg>';
    function buildPanel(state){
      const scrim = el('div', 'l13-rscrim');
      scrim.addEventListener('click', function(){ closePanel(state); });
      const side = el('div', 'l13-side');
      side.id = 'l13Side';
      side.setAttribute('aria-label', 'Chapters and search');
      side.appendChild(el('div', 'l13-grab'));
      const top = el('div', 'l13-sidehead');
      const tabs = el('div', 'l13-tabsw');
      tabs.setAttribute('role', 'tablist');
      const tChap = button(null, 'Chapters'), tFind = button(null, 'Search in book');
      tChap.id = 'l13TabChapters';
      tFind.id = 'l13TabSearch';
      [tChap, tFind].forEach(function(t){ t.setAttribute('role', 'tab'); tabs.appendChild(t); });
      tChap.setAttribute('aria-controls', 'l13Chapters');
      tFind.setAttribute('aria-controls', 'l13FindPanel');
      tChap.addEventListener('click', function(){ showTab(state, 'chapters', 'tab'); });
      tFind.addEventListener('click', function(){ showTab(state, 'search', 'content'); });
      // Arrow keys move between the two tabs (only the chosen one is in the Tab order).
      tabs.addEventListener('keydown', function(e){
        if(['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
        e.preventDefault();
        const to = e.key === 'Home' ? 'chapters' : e.key === 'End' ? 'search' : state.tab === 'chapters' ? 'search' : 'chapters';
        showTab(state, to, 'tab');
      });
      const close = button('l13-x');
      close.dataset.l13 = 'closepanel';
      close.addEventListener('click', function(){ closePanel(state); });
      top.appendChild(tabs);
      top.appendChild(close);
      side.appendChild(top);
      const chapters = el('div', 'l13-sidebody');
      chapters.id = 'l13Chapters';
      const find = el('div', 'l13-sidebody');
      find.id = 'l13FindPanel';
      [[chapters, tChap], [find, tFind]].forEach(function(p){ p[0].setAttribute('role', 'tabpanel'); p[0].setAttribute('aria-labelledby', p[1].id); });
      const form = el('form', 'l13-findform');
      form.innerHTML = '<label for="l13Find" class="l13-lbl"></label><input id="l13Find" class="l13-inp" type="search" autocomplete="off" enterkeyhint="search">' +
        '<p id="l13FindStatus" class="l13-hint" role="status"></p><ul class="l13-res" aria-label="Results"></ul>';
      form.querySelector('label').textContent = 'Find in ' + state.record.name;
      form.appendChild(el('p', 'l13-hint', 'Printed page numbers. ' + pointerWord() + ' a result to open that page with the word marked.'));
      const input = form.querySelector('input');
      input.addEventListener('input', function(){
        clearTimeout(state.findTimer);
        state.findTimer = setTimeout(function(){ runSearch(state); }, 400);
      });
      form.addEventListener('submit', function(e){
        e.preventDefault();
        clearTimeout(state.findTimer);
        if(!state.desk) input.blur();
        runSearch(state);
      });
      find.appendChild(form);
      side.appendChild(chapters);
      side.appendChild(find);
      // On phones the sheet is modal: Tab stays inside it.
      side.addEventListener('keydown', function(e){
        if(e.key !== 'Tab' || state.desk) return;
        const all = Array.from(side.querySelectorAll('button,input')).filter(function(x){ return x.getClientRects().length && x.tabIndex >= 0; });
        const first = all[0], last = all[all.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      });
      state.main.insertBefore(side, state.body);
      state.main.appendChild(scrim);
      Object.assign(state, { side: side, scrim: scrim, close: close, tabChapters: tChap, tabSearch: tFind, chapters: chapters, find: find,
        findInput: input, findStatus: form.querySelector('#l13FindStatus'), results: form.querySelector('.l13-res') });
      showTab(state, 'chapters');
      renderChapters(state);
    }
    // Desktop: the page jump in the header, the panel beside the pages. Phones: the jump in the bottom bar, the panel a sheet.
    function layout(state){
      state.desk = wide();
      if(state.desk) state.tools.appendChild(state.jump); else state.bar.insertBefore(state.jump, state.barSearch);
      state.side.setAttribute('role', state.desk ? 'complementary' : 'dialog');
      if(state.desk) state.side.removeAttribute('aria-modal'); else state.side.setAttribute('aria-modal', 'true');
      state.close.setAttribute('aria-label', state.desk ? 'Hide the panel' : 'Close');
      showPanel(state);
    }
    function showPanel(state){
      state.side.hidden = !state.panelOpen;
      state.scrim.hidden = !state.panelOpen || state.desk;
      state.headChapters.hidden = state.panelOpen || !state.desk;
    }
    // Focus moves into the panel: the search box, or the Chapters tab.
    function openPanel(state, tab){
      state.panelOpen = true;
      showPanel(state);
      tab = tab || state.tab;
      showTab(state, tab, tab === 'search' ? 'content' : 'tab');
    }
    function closePanel(state){
      state.panelOpen = false;
      showPanel(state);
      const back = state.desk ? state.headChapters : state.tab === 'search' ? state.barSearch : state.barChapters;
      back.focus({ preventScroll: true });
    }
    // focus: 'tab' onto the tab itself, 'content' into the search box; otherwise focus stays where it is.
    function showTab(state, tab, focus){
      state.tab = tab;
      [[state.tabChapters, 'chapters'], [state.tabSearch, 'search']].forEach(function(t){
        t[0].setAttribute('aria-selected', String(tab === t[1]));
        t[0].tabIndex = tab === t[1] ? 0 : -1;
      });
      state.chapters.hidden = tab !== 'chapters';
      state.find.hidden = tab !== 'search';
      // Leaving the search box hides it: blur it so a phone's keyboard closes.
      if(tab !== 'search' && document.activeElement === state.findInput) state.findInput.blur();
      if(tab === 'chapters' && state.panelOpen){
        if(state.tocStale) renderChapters(state);
        revealCurrent(state, true);
      }
      if(focus === 'tab') (tab === 'search' ? state.tabSearch : state.tabChapters).focus({ preventScroll: true });
      else if(focus === 'content' && tab === 'search') state.findInput.focus();
    }

    function keyTree(list, prefix){ list.forEach(function(b, i){ b.key = prefix + i; keyTree(b.kids, b.key + '.'); }); }
    function pageLabel(state, n){ const p = LIB13.printedFor(state.record, n); return p ? 'p.' + p : 'PDF page ' + n; }
    // The spot being read: highlighted in Chapters, its levels open.
    function follow(state){
      if(!state.outline) return;
      const path = LIB13.spot(state.outline, state.current);
      const key = path.length ? path[path.length - 1].key : '';
      if(key === state.spotKey) return;
      state.spotKey = key;
      path.slice(0, -1).forEach(function(b){ state.open.add(b.key); });
      // Drawn only while shown: the Core Rulebook's 391 bookmarks would be redrawn at every page otherwise.
      if(!(state.panelOpen && state.tab === 'chapters')){ state.tocStale = true; return; }
      renderChapters(state);
      revealCurrent(state, false);
    }
    function revealCurrent(state, centre){
      const box = state.chapters, row = box.querySelector('.l13-cur');
      if(!row || box.hidden) return;
      const top = row.offsetTop, bottom = top + row.offsetHeight;
      if(centre || top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) box.scrollTop = top - box.clientHeight / 3;
    }
    function renderChapters(state){
      const box = state.chapters;
      state.tocStale = false;
      // A row that had focus gets it back once redrawn (or the Chapters tab, if its row is now hidden).
      const had = box.contains(document.activeElement) && document.activeElement.closest('[data-key]');
      const refocus = had ? { key: had.dataset.key, part: document.activeElement.classList.contains('l13-tw') ? '.l13-tw' : '.l13-tocgo' } : null;
      box.textContent = '';
      if(state.failed){ box.appendChild(el('p', 'l13-error', CANNOT_OPEN)); return; }
      if(state.outline === null){ box.appendChild(el('p', 'l13-hint', 'Reading the bookmarks…')); return; }
      if(!state.outline.length){
        box.appendChild(el('p', 'l13-body-text', state.outline.unlinked ? 'This PDF’s bookmarks do not lead to its pages, so there are no chapters to show.'
          : 'This PDF has no bookmarks, so there are no chapters to show.'));
        box.appendChild(el('p', 'l13-hint', 'Type a printed page by Page and Go, or find a word with Search in book.'));
        const s = button('l13-btn l13-btn-s', 'Search in book');
        s.dataset.l13 = 'tosearch';
        s.addEventListener('click', function(){ showTab(state, 'search', 'content'); });
        box.appendChild(s);
        return;
      }
      const ul = el('ul', 'l13-toc');
      ul.setAttribute('aria-label', 'Bookmarks');
      (function add(list, depth){
        list.forEach(function(b){
          const li = el('li', 'l13-tocrow l13-l' + depth);
          li.dataset.key = b.key;
          const isOpen = state.open.has(b.key);
          if(b.kids.length){
            const tw = button('l13-tw');
            tw.setAttribute('aria-expanded', String(isOpen));
            tw.setAttribute('aria-label', 'Sections of ' + b.title);
            tw.addEventListener('click', function(){
              if(state.open.has(b.key)) state.open.delete(b.key); else state.open.add(b.key);
              renderChapters(state);
            });
            li.appendChild(tw);
          } else li.appendChild(el('span', 'l13-tw0'));
          const go = button('l13-tocgo');
          go.appendChild(el('span', 'l13-t', b.title));
          go.appendChild(el('span', 'l13-p', pageLabel(state, b.page)));
          if(b.key === state.spotKey){ li.classList.add('l13-cur'); go.setAttribute('aria-current', 'true'); }
          go.addEventListener('click', function(){
            showPdfPage(state, b.page);
            if(!state.desk) closePanel(state);
          });
          li.appendChild(go);
          ul.appendChild(li);
          if(b.kids.length && isOpen) add(b.kids, depth + 1);
        });
      })(state.outline, 1);
      box.appendChild(ul);
      box.appendChild(el('p', 'l13-hint', 'From the PDF’s own bookmarks. ' + pointerWord() + ' a title to go there; the arrow opens or closes a level.'));
      if(refocus){
        const row = box.querySelector('[data-key="' + refocus.key + '"]');
        ((row && row.querySelector(refocus.part)) || state.tabChapters).focus({ preventScroll: true });
      }
    }
    // Scrolls PDF page n into view: its top, or (y, a fraction of the page) a third of the way down the view.
    function showPdfPage(state, n, y){
      const slot = state.slots[n - 1];
      if(!slot) return;
      let top = slot.offsetTop - 12;
      if(y != null) top = Math.max(top, slot.offsetTop + y * slot.offsetHeight - state.body.clientHeight * 0.35);
      state.body.scrollTop = top;
      track(state, state.body);
    }

    async function runSearch(state){
      const q = state.findInput.value, gen = ++state.searchGen;
      clearHits(state);
      state.results.textContent = '';
      if(!LIB13.matcher(q)){ state.findStatus.textContent = q.trim() ? 'Type two letters or more.' : ''; return []; }
      // Screen readers hear "Searching…" and the result; the page count beside it is for the eye only.
      state.findStatus.textContent = 'Searching…';
      const progress = el('span');
      progress.setAttribute('aria-hidden', 'true');
      state.findStatus.appendChild(progress);
      const stop = function(){ return gen !== state.searchGen || reader !== state; };
      if(!(await state.loaded)){ if(!stop()) state.findStatus.textContent = CANNOT_OPEN; return null; }
      await state.outlineReady;
      if(stop()) return null;
      let shown = 0, found;
      try {
        found = await LIB13.searchBook(state.handle, q, function(n, hits){
          if(stop()) return;
          while(shown < hits.length) state.results.appendChild(resultRow(state, hits[shown++], q));
          if(n % 12 === 0) progress.textContent = ' page ' + n + ' of ' + state.handle.pages;
        }, stop);
      } catch(e){
        if(stop()) return null;
        state.findStatus.textContent = 'This book’s text cannot be read.';
        return null;
      }
      if(found === null || stop()) return null;
      state.findStatus.textContent = found.length ? 'Found on ' + found.length + (found.length === 1 ? ' page' : ' pages') : 'Not found in this book';
      return found;
    }
    function resultRow(state, r, q){
      const li = el('li');
      const b = button('l13-resgo');
      const section = LIB13.spot(state.outline || [], r.page).pop();
      b.appendChild(el('span', 'l13-pp', pageLabel(state, r.page) + (section ? ' · ' + section.title : '')));
      const sn = el('span', 'l13-sn');
      sn.appendChild(document.createTextNode(r.snippet.before));
      sn.appendChild(el('mark', 'l13-mark', r.snippet.match));
      sn.appendChild(document.createTextNode(r.snippet.after));
      b.appendChild(sn);
      b.addEventListener('click', function(){ choose(state, r.page, q, b); });
      li.appendChild(b);
      return li;
    }
    // A result chosen: its page, with the word marked where it is printed.
    async function choose(state, page, q, b){
      state.results.querySelectorAll('[aria-current]').forEach(function(x){ x.removeAttribute('aria-current'); });
      b.setAttribute('aria-current', 'true');
      clearHits(state);
      if(!state.desk) closePanel(state);
      showPdfPage(state, page);
      const gen = state.searchGen;
      let rects = [];
      try { rects = await LIB13.findOnPage(state.handle, page, q); } catch(e){}
      if(reader !== state || gen !== state.searchGen || b.getAttribute('aria-current') !== 'true') return;
      const slot = state.slots[page - 1];
      rects.forEach(function(r){
        const h = el('div', 'l13-hit');
        h.style.left = (r.x * 100) + '%';
        h.style.top = (r.y * 100) + '%';
        h.style.width = (r.w * 100) + '%';
        h.style.height = (r.h * 100) + '%';
        slot.appendChild(h);
        state.hits.push(h);
      });
      if(rects.length) showPdfPage(state, page, rects[0].y);
    }
    function clearHits(state){
      state.hits.forEach(function(h){ h.remove(); });
      state.hits = [];
    }
    api.openPanel = function(tab){ if(reader) openPanel(reader, tab); };
    api.closePanel = function(){ if(reader && reader.panelOpen) closePanel(reader); };
    api.findInBook = function(query){
      if(!reader) return Promise.resolve(null);
      reader.findInput.value = query;
      return runSearch(reader);
    };

    // ---- Links from Search: books on the shelf open at the printed page; the others are marked "not in Library" ----
    api.linkSearch = async function(container){
      if(!container) return;
      if(!LIB13.cached()) try { await LIB13.list(); } catch(e){ return; }
      container.querySelectorAll('.s14-source').forEach(function(node){
        if(node.closest('button')) return;
        const text = node.dataset.l13Text != null ? node.dataset.l13Text : node.textContent;
        const cites = LIB13.citations(text);
        if(!cites.length) return;
        node.dataset.l13Text = text;
        node.dataset.l13Linked = '1';
        node.textContent = '';
        let at = 0;
        cites.forEach(function(c){
          if(c.start > at) node.appendChild(document.createTextNode(text.slice(at, c.start)));
          const shelved = LIB13.bookFor(c.bookId);
          let a;
          if(shelved){
            a = button('l13-cite', c.text);
            a.addEventListener('click', function(){ api.offerOpen(c); });
          } else {
            // The mark is drawn by the stylesheet, so Search's own text stays the citation alone.
            a = button('l13-nil-cite', c.text);
            a.setAttribute('aria-label', c.text + ', not in your Library');
            const tag = el('span', 'l13-nil');
            tag.setAttribute('aria-hidden', 'true');
            a.appendChild(tag);
            a.addEventListener('click', function(){ api.offerAdd(c); });
          }
          node.appendChild(a);
          at = c.end;
        });
        if(at < text.length) node.appendChild(document.createTextNode(text.slice(at)));
      });
    };
    // After the shelf changes, Search's citations already on screen follow it.
    function relink(){
      const searchPanel = document.querySelector('.cl11-panel[data-panel="search"]');
      if(searchPanel) api.linkSearch(searchPanel);
    }
    api.offerOpen = async function(cite){
      const book = LIB13.bookFor(cite.bookId);
      if(!book) return false;
      // As the shelf last showed it; the reader finds any other missing file itself.
      if(missingIds.has(book.id)) return api.explainMissing(book);
      const yes = await ask('Open ' + book.name + ' at p.' + cite.page + '?', 'It opens in the Library, at the printed page.', 'Open');
      if(!yes) return false;
      return api.openReader(book.id, cite.page, 'search');
    };
    api.offerAdd = async function(cite){
      const kb = LIB13.knownBook(cite.bookId);
      if(!kb) return false;
      const yes = await ask(kb.name + ' is not in your Library', 'Add the PDF of your copy, and this link opens it at p.' + cite.page + '.', 'Add book', { no: 'Not now' });
      if(!yes) return false;
      api.openAdd({ want: { bookId: cite.bookId, page: cite.page, name: kb.name }, then: function(record){
        if(record.bookId === cite.bookId) api.openReader(record.id, cite.page, 'search');
      } });
      return true;
    };

    api.install = function(){
      if(!api.enabled()) return;
      // UI hook: mount into the Library tab panel whenever the Characters screen is built.
      if(typeof CL11 === 'object' && CL11 && typeof CL11.build === 'function'){
        const baseBuild = CL11.build;
        CL11.build = function(){
          const fresh = !CL11.view;
          const v = baseBuild.apply(this, arguments);
          if(v && fresh) api.mount(v.querySelector('.cl11-panel[data-panel="library"]'));
          return v;
        };
      }
      // UI hook: Search's detail, after each render, links or marks the citations of known books.
      if(typeof SEARCHPAGE14 === 'object' && SEARCHPAGE14 && typeof SEARCHPAGE14.render === 'function'){
        const baseRender = SEARCHPAGE14.render;
        SEARCHPAGE14.render = function(){
          const out = baseRender.apply(this, arguments);
          const searchPanel = document.querySelector('.cl11-panel[data-panel="search"]');
          if(searchPanel) api.linkSearch(searchPanel);
          return out;
        };
      }
    };

    return api;
  })();

  if(LIBRARY_PAGE_ENABLED) LIBPAGE13.install();
  // ============ END PART K PHASE 13 LIBPAGE13 ============
