  // ============ PART K PHASE 13 — LIBRARY: PAGE ============
  // Presentation only. Reads and writes through LIB13; holds its own view state.
  // Interface: LIBPAGE13.mount(panel), .render(), .openAdd(), .openReader(id, printed, from), .closeReader(), .state().
  const LIBRARY_PAGE_ENABLED = true;

  const LIBPAGE13 = (function(){
    const api = {};
    let root = null, reader = null, add = null;
    const urls = [];

    api.enabled = function(){
      return LIBRARY_PAGE_ENABLED && typeof LIB13 === 'object' && !!LIB13 && LIB13.enabled();
    };
    api.state = function(){
      return {
        mounted: !!root, adding: !!add,
        reader: reader ? { id: reader.record.id, from: reader.from, page: reader.current, printed: LIB13.printedFor(reader.record, reader.current) } : null
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
    function objectUrl(blob){ const u = URL.createObjectURL(blob); urls.push(u); return u; }
    function releaseUrls(){ while(urls.length) URL.revokeObjectURL(urls.pop()); }
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
    // A two-button question in the Library's own style; resolves true for the main button.
    function ask(title, text, okLabel){
      return new Promise(function(resolve){
        const scrim = el('div', 'l13-scrim');
        const box = el('div', 'l13-alert');
        box.setAttribute('role', 'alertdialog');
        box.setAttribute('aria-modal', 'true');
        const h = el('h2', 'l13-h2', title);
        h.id = 'l13AskTitle';
        box.setAttribute('aria-labelledby', h.id);
        box.appendChild(h);
        if(text) box.appendChild(el('p', 'l13-hint', text));
        const two = el('div', 'l13-two');
        const no = button('l13-btn l13-btn-s', 'Cancel');
        const yes = button('l13-btn l13-btn-p', okLabel);
        two.appendChild(no);
        two.appendChild(yes);
        box.appendChild(two);
        scrim.appendChild(box);
        document.body.appendChild(scrim);
        function close(v){ scrim.remove(); resolve(v); }
        no.addEventListener('click', function(){ close(false); });
        yes.addEventListener('click', function(){ close(true); });
        scrim.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); close(false); } });
        yes.focus();
      });
    }

    // ---- The shelf (the Library tab) ----
    api.mount = function(panel){
      if(!panel || !api.enabled()) return;
      panel.textContent = '';
      root = el('div', 'l13-root');
      const bar = el('div', 'l13-bar');
      const plus = button('l13-btn l13-btn-p l13-add');
      plus.id = 'l13Add';
      plus.innerHTML = '<span class="l13-plus" aria-hidden="true">+</span>Book';
      plus.setAttribute('aria-label', 'Add a book');
      plus.addEventListener('click', function(){ api.openAdd(); });
      bar.appendChild(plus);
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
      panel.appendChild(root);
      api.render();
    };

    let renderGen = 0;
    api.render = async function(){
      if(!root) return;
      const gen = ++renderGen;
      const body = root.querySelector('[data-l13="body"]');
      let books = [];
      try { books = await LIB13.list(); } catch(e){ books = null; }
      if(gen !== renderGen) return;
      releaseUrls();
      body.textContent = '';
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
        const list = el('ul', 'l13-list');
        list.setAttribute('aria-label', 'Books');
        for(const b of books){
          const li = el('li', 'l13-row');
          li.dataset.id = b.id;
          const cover = el('div', 'l13-cover');
          cover.setAttribute('aria-hidden', 'true');
          try {
            const blob = await LIB13.cover(b.id);
            if(blob){ const img = el('img'); img.alt = ''; img.src = objectUrl(blob); cover.appendChild(img); }
          } catch(e){}
          li.appendChild(cover);
          const t = button('l13-title', b.name);
          t.addEventListener('click', function(){ api.openReader(b.id, null, 'library'); });
          li.appendChild(t);
          const more = button('l13-more');
          more.setAttribute('aria-label', 'More for ' + b.name);
          more.innerHTML = '<span class="l13-dots" aria-hidden="true"></span>';
          more.addEventListener('click', function(){ api.openMenu(b); });
          li.appendChild(more);
          list.appendChild(li);
        }
        body.appendChild(list);
      }
      const bytes = (books || []).reduce(function(s, b){ return s + (b.size || 0) + (b.coverSize || 0); }, 0);
      root.querySelector('#l13Foot').textContent = 'Books use ' + LIB13.formatSize(bytes) + ' on this device';
      root.querySelector('#l13Persist').hidden = !books.length || await LIB13.persisted();
    };

    // ---- The ⋯ menu (this release: Delete) ----
    api.openMenu = function(book){
      const scrim = el('div', 'l13-scrim');
      const act = el('div', 'l13-act');
      act.setAttribute('role', 'dialog');
      act.setAttribute('aria-modal', 'true');
      const card = el('div', 'l13-actcard');
      const head = el('div', 'l13-acthead');
      const titles = el('div');
      const h = el('h2', 'l13-h2', book.name);
      h.id = 'l13MenuTitle';
      act.setAttribute('aria-labelledby', h.id);
      titles.appendChild(h);
      titles.appendChild(el('span', 'l13-hint', 'PDF, kept on this device'));
      head.appendChild(titles);
      card.appendChild(head);
      const del = button('l13-mrow l13-del');
      del.id = 'l13Delete';
      del.innerHTML = '<span>Delete<small>Removes the book from this device</small></span>';
      card.appendChild(del);
      act.appendChild(card);
      const cancel = button('l13-btn l13-cancel', 'Cancel');
      act.appendChild(cancel);
      scrim.appendChild(act);
      document.body.appendChild(scrim);
      const close = function(){ scrim.remove(); };
      cancel.addEventListener('click', close);
      scrim.addEventListener('click', function(e){ if(e.target === scrim) close(); });
      scrim.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); close(); } });
      del.addEventListener('click', async function(){
        close();
        const yes = await ask('Delete ' + book.name + '?', 'This removes the book and its cover from this device.', 'Delete');
        if(!yes) return;
        try { await LIB13.remove(book.id); } catch(e){ toast('The book could not be deleted.'); }
        await api.render();
      });
      del.focus();
    };

    // ---- Add a book ----
    api.openAdd = function(options){
      if(add) return add.box;
      const o = overlay('l13-dialog', 'Add a book');
      o.id = 'l13AddDialog';
      o.innerHTML =
        '<div class="l13-dhead"><button type="button" class="l13-lnk" data-l13="cancel">Cancel</button><h1>Add a book</h1><span></span></div>' +
        '<div class="l13-form">' +
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
            '<div class="l13-coverrow"><div class="l13-cover l13-cover-t" data-l13="cover"></div><span class="l13-grow">A page from the PDF</span></div></div>' +
        '</div>' +
        '<div class="l13-dfoot"><p class="l13-error" role="alert" data-l13="error" hidden></p>' +
          '<p class="l13-hint">Kept on this device only. Nothing is uploaded.</p>' +
          '<button type="button" class="l13-btn l13-btn-p l13-btn-w" data-l13="add" disabled>Add book</button></div>';
      const q = function(name){ return o.querySelector('[data-l13="' + name + '"]'); };
      add = { box: o, job: null, nameEdited: false, then: options && options.then };
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
      q('add').addEventListener('click', function(){ api.confirmAdd(); });
      o.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !o.querySelector('.l13-sheet')){ e.stopPropagation(); api.closeAdd(); } });
      q('choose').focus();
      return o;
    };
    function baseName(file){ return String(file || '').replace(/\.pdf$/i, '').replace(/[_]+/g, ' ').trim(); }

    // Reads the chosen PDF: which book, the cover, then the page numbers in the background.
    function current(job){ return !!add && add.job === job; }
    api.choose = async function(file){
      if(!add || add.busy) return;
      const prev = add.job;
      if(prev && !prev.kept) LIB13.unload(prev.handle);
      const job = { file: file, handle: null, bookId: null, cover: null, coverPage: null, match: null, matchResult: null, asked: null, kept: false, ready: false, failed: false };
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
      refreshAdd();
      try {
        job.handle = await LIB13.load(file);
        if(!current(job)) return LIB13.unload(job.handle);
        const info = await LIB13.inspect(job.handle);
        if(!current(job)) return LIB13.unload(job.handle);
        job.pages = info.pages;
        job.bookId = info.book ? info.book.id : null;
        job.recognised = info.book;
        q('pick').value = job.bookId || '';
        if(!add.nameEdited) q('name').value = info.book ? info.book.name : baseName(file.name);
        setBookLine(info.book ? 'recognised' : 'unknown');
        job.match = LIB13.matchPages(job.handle).then(function(r){
          job.matchResult = r;
          if(add && add.job === job && !job.asked) setPageLine(r.state);
          return r;
        }, function(){
          job.matchResult = { state: 'check', offset: 0, method: null };
          if(add && add.job === job && !job.asked) setPageLine('check');
          return job.matchResult;
        });
        const cover = await LIB13.makeCover(job.handle);
        if(!current(job)) return LIB13.unload(job.handle);
        job.cover = cover.blob;
        job.coverPage = cover.page;
        if(cover.blob){ const img = el('img'); img.alt = ''; img.src = objectUrl(cover.blob); q('cover').appendChild(img); }
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
    function refreshAdd(){
      if(!add) return;
      const o = add.box, job = add.job;
      const name = o.querySelector('[data-l13="name"]').value.trim();
      o.querySelector('[data-l13="add"]').disabled = add.busy || !(job && job.ready && !job.failed && name);
    }

    // One page, one question; the answer sets the offset for the whole book.
    api.checkNow = async function(){
      if(!add || !add.job || !add.job.handle) return;
      const job = add.job, pdfPage = LIB13.checkPage(job.handle);
      const sheet = el('div', 'l13-sheet');
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.innerHTML = '<div class="l13-grab" aria-hidden="true"></div>' +
        '<h2 class="l13-h2" id="l13CheckTitle">What page number is printed here?</h2>' +
        '<div class="l13-checkrow"><canvas class="l13-checkpage" aria-label="A page from the PDF"></canvas>' +
          '<div class="l13-checkfld"><label for="l13Printed" class="l13-lbl">Printed page</label>' +
          '<input id="l13Printed" class="l13-inp l13-num" type="text" inputmode="numeric" autocomplete="off">' +
          '<span class="l13-hint">PDF page ' + pdfPage + '</span></div></div>' +
        '<button type="button" class="l13-btn l13-btn-p l13-btn-w" data-l13="done">Done</button>' +
        '<button type="button" class="l13-btn l13-btn-t" data-l13="skip">Skip for now</button>';
      sheet.setAttribute('aria-labelledby', 'l13CheckTitle');
      const scrim = el('div', 'l13-scrim l13-scrim-in');
      scrim.appendChild(sheet);
      add.box.appendChild(scrim);
      LIB13.draw(job.handle, pdfPage, sheet.querySelector('canvas'), 150, 2).promise.catch(function(){});
      const input = sheet.querySelector('#l13Printed');
      const close = function(){ scrim.remove(); };
      sheet.querySelector('[data-l13="skip"]').addEventListener('click', close);
      sheet.querySelector('[data-l13="done"]').addEventListener('click', function(){
        const n = parseInt(input.value, 10);
        if(!(n >= 1)){ input.focus(); return; }
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
      err.hidden = true;
      const persist = LIB13.persist();
      const pages = job.asked || job.matchResult;
      let record;
      try {
        record = await LIB13.add({
          file: job.file, name: o.querySelector('[data-l13="name"]').value, bookId: job.bookId, pages: job.pages,
          offset: pages ? pages.offset : 0, pageState: pages ? pages.state : 'matching', pageMethod: pages ? pages.method : null,
          cover: job.cover, coverPage: job.coverPage
        });
      } catch(e){
        btn.textContent = 'Add book';
        btn.disabled = false;
        add.busy = false;
        o.querySelector('[data-l13="cancel"]').disabled = false;
        err.textContent = e.code === 'full'
          ? 'There isn’t room for this book on this device. It needs about ' + LIB13.formatSize(job.file.size) + '. Free some space, then try again.'
          : 'The book could not be kept on this device. Nothing was saved.';
        err.hidden = false;
        return;
      }
      job.kept = true;
      // Add book never waits for the page numbers: a late result is written to the book.
      if(!pages && job.match){
        job.match.then(function(r){ return LIB13.update(record.id, { offset: r.offset, pageState: r.state, pageMethod: r.method }); })
          .catch(function(){}).then(function(){ LIB13.unload(job.handle); });
      } else LIB13.unload(job.handle);
      const then = add.then;
      add.busy = false;
      api.closeAdd();
      await persist;
      await api.render();
      toast(record.name + ' added');
      if(typeof then === 'function') then(record);
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
      if(!blob || token !== readerToken) return false;
      const o = overlay('l13-reader', record.name);
      o.id = 'l13Reader';
      const state = { record: record, from: from || 'library', box: o, handle: null, slots: [], drawn: new Map(), current: 1, observer: null };
      reader = state;
      const head = el('div', 'l13-rhead');
      const back = button('l13-back', from === 'search' ? '‹ Search' : '‹ Library');
      back.id = 'l13ReaderBack';
      back.addEventListener('click', function(){ api.closeReader(); });
      head.appendChild(back);
      head.appendChild(el('h1', null, record.name));
      head.appendChild(el('span'));
      o.appendChild(head);
      const body = el('div', 'l13-rbody');
      body.setAttribute('aria-label', 'Pages');
      o.appendChild(body);
      const chip = el('span', 'l13-chip');
      chip.setAttribute('aria-live', 'polite');
      o.appendChild(chip);
      const bar = el('div', 'l13-rbar');
      const jump = el('form', 'l13-jump');
      jump.innerHTML = '<label for="l13Jump" class="l13-lbl-s">Page</label>' +
        '<input id="l13Jump" class="l13-inp l13-num" type="text" inputmode="numeric" autocomplete="off">' +
        '<button type="submit" class="l13-btn l13-btn-p">Go</button>';
      jump.addEventListener('submit', function(e){
        e.preventDefault();
        const n = parseInt(jump.querySelector('input').value, 10);
        if(n >= 1) api.goTo(n);
      });
      bar.appendChild(jump);
      o.appendChild(bar);
      o.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.stopPropagation(); api.closeReader(); } });
      try {
        state.handle = await LIB13.load(blob);
      } catch(e){
        if(reader !== state) return false;
        body.appendChild(el('p', 'l13-error', 'This book’s file cannot be opened.'));
        return false;
      }
      if(reader !== state){ LIB13.unload(state.handle); return false; }
      const size = await LIB13.pageSize(state.handle, 1);
      const ratio = size.height / size.width;
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
      let ticking = false;
      body.addEventListener('scroll', function(){
        if(ticking) return;
        ticking = true;
        requestAnimationFrame(function(){ ticking = false; track(state, body); });
      });
      back.focus({ preventScroll: true });
      api.goTo(printed != null ? printed : LIB13.printedFor(record, 1) || 1, printed == null);
      return true;
    };
    function drawSlot(state, slot){
      const n = +slot.dataset.page;
      if(state.drawn.has(n)) return;
      const canvas = el('canvas');
      slot.appendChild(canvas);
      const width = slot.clientWidth || 320;
      const task = LIB13.draw(state.handle, n, canvas, width, Math.min(window.devicePixelRatio || 1, 2));
      state.drawn.set(n, { canvas: canvas, task: task });
      task.promise.then(function(ok){
        if(!ok) return;
        slot.style.aspectRatio = canvas.width + ' / ' + canvas.height;
        slot.classList.add('l13-drawn');
      }, function(){});
    }
    // Keeps at most a few pages drawn: phones have little canvas memory.
    function trim(state, body){
      if(state.drawn.size <= 8) return;
      const top = body.scrollTop, bottom = top + body.clientHeight;
      state.drawn.forEach(function(d, n){
        const s = state.slots[n - 1];
        if(s.offsetTop + s.offsetHeight < top - body.clientHeight || s.offsetTop > bottom + body.clientHeight){
          d.task.cancel();
          d.canvas.width = d.canvas.height = 0;
          d.canvas.remove();
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
      r.drawn.forEach(function(d){ d.task.cancel(); d.canvas.width = d.canvas.height = 0; });
      LIB13.unload(r.handle);
      r.box.remove();
    };

    // ---- Links from Search: citations of books on the shelf ----
    api.linkSearch = async function(container){
      if(!container) return;
      if(!LIB13.cached()) try { await LIB13.list(); } catch(e){ return; }
      container.querySelectorAll('.s14-source').forEach(function(node){
        if(node.closest('button') || node.dataset.l13Linked) return;
        const text = node.textContent;
        const cites = LIB13.citations(text).filter(function(c){ return LIB13.bookFor(c.bookId); });
        if(!cites.length) return;
        node.dataset.l13Linked = '1';
        node.textContent = '';
        let at = 0;
        cites.forEach(function(c){
          if(c.start > at) node.appendChild(document.createTextNode(text.slice(at, c.start)));
          const a = button('l13-cite', c.text);
          a.addEventListener('click', function(){ api.offerOpen(c); });
          node.appendChild(a);
          at = c.end;
        });
        if(at < text.length) node.appendChild(document.createTextNode(text.slice(at)));
      });
    };
    api.offerOpen = async function(cite){
      const book = LIB13.bookFor(cite.bookId);
      if(!book) return false;
      const yes = await ask('Open ' + book.name + ' at p.' + cite.page + '?', 'It opens in the Library, at the printed page.', 'Open');
      if(!yes) return false;
      return api.openReader(book.id, cite.page, 'search');
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
      // UI hook: Search's detail, after each render, links the citations of books on the shelf.
      if(typeof SEARCHPAGE14 === 'object' && SEARCHPAGE14 && typeof SEARCHPAGE14.render === 'function'){
        const baseRender = SEARCHPAGE14.render;
        SEARCHPAGE14.render = function(){
          const out = baseRender.apply(this, arguments);
          const panel = document.querySelector('.cl11-panel[data-panel="search"]');
          if(panel) api.linkSearch(panel);
          return out;
        };
      }
    };

    return api;
  })();

  if(LIBRARY_PAGE_ENABLED) LIBPAGE13.install();
  // ============ END PART K PHASE 13 LIBPAGE13 ============
