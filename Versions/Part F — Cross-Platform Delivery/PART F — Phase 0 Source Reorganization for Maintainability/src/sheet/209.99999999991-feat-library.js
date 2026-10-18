  // ============ PART K PHASE 13 — LIBRARY: LOGIC ============
  // The user's own PDFs, copied into the app's own IndexedDB database ('l5r-library'), never character storage.
  // No DOM UI. Interface: see the README (LIB13.list/add/remove/load/recognise/matchPages/citations/...).
  const LIBRARY_ENABLED = true;

  const LIB13 = (function(){
    const api = {};
    const DB_NAME = 'l5r-library';
    const DB_VERSION = 2;
    api.DB_NAME = DB_NAME;

    // Known books: Search's citation names, page counts and title phrases from the first pages
    // (desk check of 14 October 2026). Never the PDF's own title metadata.
    const BOOKS = [
      { id: 'core', name: 'Core Rulebook', pages: 404, phrases: ['legend of the five rings rpg 4th', 'core rulebook'], aliases: ['Core'] },
      { id: 'air', name: 'Book of Air', pages: 202, phrases: ['the book of air'] },
      { id: 'earth', name: 'Book of Earth', pages: 218, phrases: ['the book of earth'] },
      { id: 'fire', name: 'Book of Fire', pages: 202, phrases: ['the book of fire'] },
      { id: 'water', name: 'Book of Water', pages: 202, phrases: ['the book of water'] },
      { id: 'void', name: 'Book of Void', pages: 202, phrases: ['the book of void'] },
      { id: 'ee', name: 'Emerald Empire', pages: 303, phrases: ['emerald empire'] },
      { id: 'enemies', name: 'Enemies of the Empire', pages: 290, phrases: ['enemies of the empire'] },
      { id: 'ih1', name: 'Imperial Histories 1', pages: 312, phrases: ['imperial histories'] },
      { id: 'ih2', name: 'Imperial Histories 2', pages: 312, phrases: ['imperial histories 2'] },
      { id: 'naishou', name: 'Naishou Province', pages: 96, phrases: ['naishou province'] },
      { id: 'secrets', name: 'Secrets of the Empire', pages: 258, phrases: ['secrets of the empire'] },
      { id: 'strongholds', name: 'Strongholds of the Empire', pages: 173, phrases: ['strongholds of the empire'] },
      { id: 'swordfan', name: 'Sword and Fan', pages: 218, phrases: ['sword and fan'] },
      { id: 'clans', name: 'The Great Clans', pages: 306, phrases: ['the great clans'], aliases: ['Great Clans'] },
      { id: 'ua2', name: 'Unexpected Allies 2', pages: 84, phrases: ['unexpected allies 2'] }
    ];
    api.knownBooks = function(){ return BOOKS.map(function(b){ return { id: b.id, name: b.name }; }); };
    api.knownBook = function(id){
      const b = BOOKS.find(function(x){ return x.id === id; });
      return b ? { id: b.id, name: b.name } : null;
    };
    api.enabled = function(){ return LIBRARY_ENABLED && typeof indexedDB !== 'undefined'; };

    function norm(text){
      return String(text || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    }

    // probe: { pages, text } where text is the first pages' text. A phrase is required; the page count
    // decides between books whose phrases both appear.
    api.recognise = function(probe){
      const text = ' ' + norm(probe && probe.text) + ' ';
      const scored = BOOKS.map(function(b){
        let phrase = 0;
        b.phrases.forEach(function(p){ if(text.indexOf(' ' + p + ' ') >= 0) phrase = Math.max(phrase, p.length); });
        return { book: b, phrase: phrase, pages: probe && probe.pages === b.pages };
      }).filter(function(s){ return s.phrase > 0; });
      if(!scored.length) return null;
      const score = function(s){ return (s.pages ? 1000 : 0) + s.phrase; };
      scored.sort(function(a, b){ return score(b) - score(a); });
      const best = scored[0], next = scored[1];
      if(next && score(next) === score(best)) return null;
      if(!best.pages && scored.length > 1) return null;
      return { id: best.book.id, name: best.book.name, pagesMatch: !!best.pages };
    };

    // ---- Citations ("Core Rulebook p.139") ----
    const CITE_NAMES = [];
    BOOKS.forEach(function(b){
      CITE_NAMES.push({ text: b.name, id: b.id });
      (b.aliases || []).forEach(function(a){ CITE_NAMES.push({ text: a, id: b.id }); });
    });
    // Citations naming no volume: on the owner's own PDFs (18 October 2026) every entry so cited is printed on that
    // page of Imperial Histories 1; other pages stay unlinked.
    CITE_NAMES.push({ text: 'Imperial Histories', id: 'ih1', pages: [67, 69, 97, 123, 147, 148, 149, 214, 240, 306] });
    CITE_NAMES.sort(function(a, b){ return b.text.length - a.text.length; });
    const CITE_RE = new RegExp('(' + CITE_NAMES.map(function(n){ return n.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') +
      ')\\s+pp?\\.\\s?(\\d{1,3})', 'g');
    api.citations = function(text){
      const out = [];
      const s = String(text || '');
      CITE_RE.lastIndex = 0;
      let m;
      while((m = CITE_RE.exec(s))){
        const name = CITE_NAMES.find(function(n){ return n.text === m[1]; });
        const page = parseInt(m[2], 10);
        if(name.pages && name.pages.indexOf(page) < 0) continue;
        out.push({ start: m.index, end: m.index + m[0].length, text: m[0], bookId: name.id, page: page });
      }
      return out;
    };

    // ---- Printed pages: printed = PDF page + offset ----
    api.pdfPageFor = function(record, printed){
      const p = Math.round(Number(printed)) - (record.offset || 0);
      return Math.min(Math.max(p, 1), record.pages || 1);
    };
    api.printedFor = function(record, pdfPage){
      const p = pdfPage + (record.offset || 0);
      return p >= 1 ? p : null;
    };

    // ---- Storage ----
    let dbPromise = null;
    api.db = function(){
      if(dbPromise) return dbPromise;
      dbPromise = new Promise(function(resolve, reject){
        let req, refused = false;
        try { req = indexedDB.open(DB_NAME, DB_VERSION); } catch(e){ reject(e); return; }
        req.onupgradeneeded = function(){
          const db = req.result;
          if(!db.objectStoreNames.contains('books')) db.createObjectStore('books', { keyPath: 'id' });
          if(!db.objectStoreNames.contains('files')) db.createObjectStore('files');
          if(!db.objectStoreNames.contains('covers')) db.createObjectStore('covers');
          if(!db.objectStoreNames.contains('prefs')) db.createObjectStore('prefs');
        };
        req.onsuccess = function(){
          const db = req.result;
          // Refused while blocked, then opened anyway: nothing uses this connection.
          if(refused){ db.close(); return; }
          // A newer version elsewhere, or the browser dropping the connection: open afresh next time.
          db.onversionchange = function(){ db.close(); dbPromise = null; };
          db.onclose = function(){ dbPromise = null; };
          resolve(db);
        };
        req.onerror = function(){ reject(req.error); };
        req.onblocked = function(){ refused = true; reject(new Error('blocked')); };
      });
      dbPromise.catch(function(){ dbPromise = null; });
      return dbPromise;
    };
    function done(tx){
      return new Promise(function(resolve, reject){
        tx.oncomplete = function(){ resolve(); };
        tx.onerror = function(){ reject(tx.error); };
        tx.onabort = function(){ reject(tx.error || new Error('aborted')); };
      });
    }
    function request(req){
      return new Promise(function(resolve, reject){
        req.onsuccess = function(){ resolve(req.result); };
        req.onerror = function(){ reject(req.error); };
      });
    }
    function storeError(e, needed){
      const full = e && (e.name === 'QuotaExceededError' || /quota/i.test(String(e.message || '')));
      const err = new Error(full ? 'full' : 'storage');
      err.code = full ? 'full' : 'storage';
      err.needed = needed || 0;
      err.cause = e;
      return err;
    }

    let cache = null;
    api.cached = function(){ return cache ? cache.slice() : null; };
    api.list = async function(){
      const db = await api.db();
      const rows = await request(db.transaction('books').objectStore('books').getAll());
      rows.sort(function(a, b){ return a.added - b.added; });
      cache = rows;
      return rows.map(function(r){ return Object.assign({}, r); });
    };
    api.get = async function(id){
      const db = await api.db();
      const r = await request(db.transaction('books').objectStore('books').get(id));
      return r ? Object.assign({}, r) : null;
    };
    api.file = async function(id){
      const db = await api.db();
      return (await request(db.transaction('files').objectStore('files').get(id))) || null;
    };
    api.cover = async function(id){
      const db = await api.db();
      return (await request(db.transaction('covers').objectStore('covers').get(id))) || null;
    };
    // One transaction: the book, its PDF and its cover are saved together or not at all.
    api.add = async function(info){
      const db = await api.db();
      const id = 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const record = {
        id: id, name: String(info.name || '').trim() || 'Untitled book', bookId: info.bookId || null,
        fileName: info.file && info.file.name || '', size: info.file ? info.file.size : 0, pages: info.pages || 0,
        offset: info.offset || 0, pageState: info.pageState || 'matching', pageMethod: info.pageMethod || null,
        coverSize: info.cover ? info.cover.size : 0, coverPage: info.coverPage || null,
        coverKind: info.coverKind === 'picture' ? 'picture' : 'page', added: Date.now()
      };
      try {
        const tx = db.transaction(['books', 'files', 'covers'], 'readwrite');
        tx.objectStore('files').put(info.file, id);
        if(info.cover) tx.objectStore('covers').put(info.cover, id);
        tx.objectStore('books').put(record);
        await done(tx);
      } catch(e){
        throw storeError(e, record.size);
      }
      await api.list();
      return Object.assign({}, record);
    };
    // onlyIfMatching: the page match finishing after Add book, which must not replace numbers fixed meanwhile.
    api.update = async function(id, patch, onlyIfMatching){
      const db = await api.db();
      const tx = db.transaction('books', 'readwrite');
      const store = tx.objectStore('books');
      const r = await request(store.get(id));
      if(!r || (onlyIfMatching && r.pageState !== 'matching')) return null;
      ['name', 'bookId', 'offset', 'pageState', 'pageMethod'].forEach(function(k){ if(k in patch) r[k] = patch[k]; });
      store.put(r);
      await done(tx);
      await api.list();
      return Object.assign({}, r);
    };
    // A page of the PDF ({ page }) or the user's own picture ({ page: null }) as the book's cover.
    api.setCover = async function(id, blob, info){
      const db = await api.db();
      const tx = db.transaction(['books', 'covers'], 'readwrite');
      const store = tx.objectStore('books');
      const r = await request(store.get(id));
      if(!r) return null;
      tx.objectStore('covers').put(blob, id);
      r.coverSize = blob.size;
      r.coverPage = info && info.page || null;
      r.coverKind = r.coverPage ? 'page' : 'picture';
      store.put(r);
      try { await done(tx); } catch(e){ throw storeError(e, blob.size); }
      await api.list();
      return Object.assign({}, r);
    };
    // The file again, for a book whose stored copy is missing: name, cover, book and page fix are kept unless patched.
    api.replaceFile = async function(id, file, patch){
      const db = await api.db();
      const tx = db.transaction(['books', 'files'], 'readwrite');
      const store = tx.objectStore('books');
      const r = await request(store.get(id));
      if(!r) return null;
      tx.objectStore('files').put(file, id);
      r.fileName = file.name || '';
      r.size = file.size;
      r.fileMissing = false;
      ['bookId', 'pages', 'offset', 'pageState', 'pageMethod'].forEach(function(k){ if(patch && k in patch) r[k] = patch[k]; });
      store.put(r);
      try { await done(tx); } catch(e){ throw storeError(e, file.size); }
      await api.list();
      return Object.assign({}, r);
    };
    // Books whose stored PDF is gone, or was found unreadable when opened.
    api.missing = async function(){
      const rows = await api.list();
      const db = await api.db();
      const have = new Set(await request(db.transaction('files').objectStore('files').getAllKeys()));
      // Found unreadable once, but the stored copy is still there: read it again (iOS can fail a read and recover).
      for(const r of rows){
        if(r.fileMissing && have.has(r.id) && (await api.readable(await api.file(r.id)))){ await api.markMissing(r.id, false); r.fileMissing = false; }
      }
      return rows.filter(function(r){ return r.fileMissing || !have.has(r.id); }).map(function(r){ return r.id; });
    };
    api.markMissing = async function(id, missing){
      const db = await api.db();
      const tx = db.transaction('books', 'readwrite');
      const store = tx.objectStore('books');
      const r = await request(store.get(id));
      if(!r) return;
      r.fileMissing = missing !== false;
      store.put(r);
      await done(tx);
      await api.list();
    };
    api.readable = async function(blob){
      try { return !!blob && blob.size > 0 && (await blob.slice(0, 5).arrayBuffer()).byteLength === 5; } catch(e){ return false; }
    };
    // Whether a PDF chosen for a book (its inspect() result and size) is that book: the same size is the same file;
    // otherwise the recognised book, else the page count.
    api.sameBook = function(record, probe){
      if(record.size && probe.size === record.size) return { same: true };
      if(probe.book && record.bookId && probe.book.id !== record.bookId) return { same: false, reason: 'book' };
      if(record.pages && probe.pages !== record.pages) return { same: false, reason: 'pages' };
      return { same: true };
    };
    api.pref = async function(key){
      const db = await api.db();
      const v = await request(db.transaction('prefs').objectStore('prefs').get(key));
      return v === undefined ? null : v;
    };
    api.setPref = async function(key, value){
      const db = await api.db();
      const tx = db.transaction('prefs', 'readwrite');
      tx.objectStore('prefs').put(value, key);
      await done(tx);
    };
    api.remove = async function(id){
      const db = await api.db();
      const tx = db.transaction(['books', 'files', 'covers'], 'readwrite');
      ['books', 'files', 'covers'].forEach(function(s){ tx.objectStore(s).delete(id); });
      await done(tx);
      await api.list();
      return true;
    };
    api.usage = async function(){
      const rows = await api.list();
      return rows.reduce(function(sum, r){ return sum + (r.size || 0) + (r.coverSize || 0); }, 0);
    };
    // The newest book on the shelf for a known book id.
    api.bookFor = function(bookId){
      if(!cache || !bookId) return null;
      const hits = cache.filter(function(r){ return r.bookId === bookId; });
      return hits.length ? Object.assign({}, hits[hits.length - 1]) : null;
    };
    api.persist = async function(){
      try {
        if(navigator.storage && navigator.storage.persist) return !!(await navigator.storage.persist());
      } catch(e){}
      return false;
    };
    api.persisted = async function(){
      try {
        if(navigator.storage && navigator.storage.persisted) return !!(await navigator.storage.persisted());
      } catch(e){}
      return false;
    };

    // ---- The PDF engine: PDF.js 6.4.299 (legacy build), carried in the page as four text blocks ----
    let engine = null, jpx = null, pdfWorker = null;
    function block(id){
      const n = document.getElementById(id);
      if(!n) throw new Error('missing ' + id);
      return n.textContent;
    }
    function blobUrl(src){ return URL.createObjectURL(new Blob([src], { type: 'text/javascript' })); }
    // A module worker cannot start from a file:// page, so the worker runs as a classic script:
    // its two import.meta.url uses become the worker's own address and its one export is dropped.
    // Where openjpeg.wasm cannot run, PDF.js import()s its plain-JavaScript JPEG 2000 decoder; that import
    // becomes a lookup of the copy carried in the page (JPEG 2000 only: JBIG2 still fails as before).
    const NOWASM = 'import(\n/*webpackIgnore: true*/\n/*@vite-ignore*/\n`${WasmImage.#_}${this._noWasmFilename}`)';
    api.classicWorker = function(src, fallback){
      const metas = src.split('import.meta.url').length - 1;
      const exp = 'export{WorkerMessageHandler};', fexp = 'export default OpenJPEG;';
      if(metas !== 2 || src.split(exp).length !== 2 || src.split(NOWASM).length !== 2) throw new Error('unexpected PDF.js worker');
      if(typeof fallback !== 'string' || fallback.split('import.meta.url').length !== 2 || fallback.split(fexp).length !== 2){
        throw new Error('unexpected JPEG 2000 fallback');
      }
      const jpxJs = fallback.split('import.meta.url').join('self.location.href').replace(fexp, 'return OpenJPEG;');
      return 'const lib13NoWasm=(function(){' + jpxJs + '\n})();\n' +
        src.split('import.meta.url').join('self.location.href').replace(exp, '').replace(NOWASM,
          '(this._noWasmFilename==="openjpeg_nowasm_fallback.js"?Promise.resolve({default:lib13NoWasm}):Promise.reject(new Error("not carried")))');
    };
    api.engine = function(){
      if(engine) return engine;
      engine = (async function(){
        const lib = await import(blobUrl(block('lib13PdfLib')));
        const port = new Worker(blobUrl(api.classicWorker(block('lib13PdfWorker'), block('lib13JpxNoWasm'))));
        // One worker for every document, passed to each load, so closing one book never tears it down.
        pdfWorker = new lib.PDFWorker({ port: port, verbosity: 0 });
        port.addEventListener('error', function(){
          const w = pdfWorker;
          engine = null; pdfWorker = null;
          try { w.destroy(); } catch(e){}
        });
        return lib;
      })();
      engine.catch(function(){ engine = null; });
      return engine;
    };
    // Gives PDF.js its JPEG 2000 decoder from the page instead of the network.
    function jpxBytes(){
      if(!jpx){
        const bin = atob(block('lib13Jpx').trim());
        jpx = new Uint8Array(bin.length);
        for(let i = 0; i < bin.length; i++) jpx[i] = bin.charCodeAt(i);
      }
      return jpx;
    }
    function JpxData(){}
    JpxData.prototype.fetch = async function(req){
      if(req && req.kind === 'wasmUrl' && req.filename === 'openjpeg.wasm') return jpxBytes().slice();
      throw new Error('not carried: ' + (req && req.filename));
    };
    // Safari cannot compile openjpeg.wasm (it uses relaxed SIMD), nor can a browser with WebAssembly off; there
    // PDF.js is told not to try, and decodes JPEG 2000 with the plain-JavaScript copy instead.
    // useWasm null asks the browser; the checks set false to take Safari's path in Chrome.
    api.useWasm = null;
    let wasmOk = null;
    api.wasmUsable = function(){
      if(wasmOk === null) try { wasmOk = WebAssembly.validate(jpxBytes()); } catch(e){ wasmOk = false; }
      return wasmOk;
    };

    // Opens a stored or chosen PDF, reading only the byte ranges PDF.js asks for.
    api.load = async function(blob){
      const lib = await api.engine();
      let task = null;
      class BlobRange extends lib.PDFDataRangeTransport {
        requestDataRange(begin, end){
          const self = this;
          blob.slice(begin, end).arrayBuffer().then(function(buf){ self.onDataRange(begin, new Uint8Array(buf)); },
            function(){ if(task) task.destroy(); });
        }
      }
      const head = new Uint8Array(await blob.slice(0, Math.min(blob.size, 65536)).arrayBuffer());
      const useWasm = api.useWasm != null ? !!api.useWasm : api.wasmUsable();
      task = lib.getDocument({
        range: new BlobRange(blob.size, head), worker: pdfWorker, disableAutoFetch: true, disableStream: true,
        useWorkerFetch: false, BinaryDataFactory: JpxData, isEvalSupported: false, verbosity: 0,
        useWasm: useWasm
      });
      const timer = setTimeout(function(){ task.destroy(); }, 60000);
      try {
        const doc = await task.promise;
        return { doc: doc, pages: doc.numPages, useWasm: useWasm };
      } finally { clearTimeout(timer); }
    };
    api.unload = function(handle){
      if(handle && handle.doc) try { handle.doc.destroy(); } catch(e){}
    };
    async function pageText(handle, n){
      const page = await handle.doc.getPage(n);
      const tc = await page.getTextContent();
      return { page: page, items: tc.items, styles: tc.styles || {} };
    }
    api.firstPagesText = async function(handle, count){
      const parts = [];
      for(let n = 1; n <= Math.min(count || 6, handle.pages); n++){
        const t = await pageText(handle, n);
        parts.push(t.items.map(function(i){ return i.str; }).join(' '));
      }
      return parts.join('\n');
    };
    api.inspect = async function(handle){
      const text = await api.firstPagesText(handle, 6);
      return { pages: handle.pages, book: api.recognise({ pages: handle.pages, text: text }) };
    };

    // Page labels count only when the numbers printed on sampled pages confirm them (one book's labels are
    // wrong); with no printed numbers at all (a scan), the labels stand; with neither, the user is asked.
    api.matchPages = async function(handle){
      const n = handle.pages;
      let labelOffset = null;
      try {
        const labels = await handle.doc.getPageLabels();
        if(labels && labels.length === n){
          const tally = {};
          let numeric = 0;
          labels.forEach(function(l, i){
            if(/^\d+$/.test(l)){ numeric++; const d = parseInt(l, 10) - (i + 1); tally[d] = (tally[d] || 0) + 1; }
          });
          const best = Object.keys(tally).sort(function(a, b){ return tally[b] - tally[a]; })[0];
          if(best != null && numeric >= n / 2 && tally[best] >= numeric * 0.9) labelOffset = parseInt(best, 10);
        }
      } catch(e){}
      const sample = [];
      const lo = Math.max(2, Math.floor(n * 0.05)), hi = Math.max(lo, n - 1), want = Math.min(24, hi - lo + 1);
      for(let i = 0; i < want; i++) sample.push(Math.round(lo + (hi - lo) * i / Math.max(1, want - 1)));
      const tally = {};
      let withNumbers = 0, withText = 0;
      for(const p of Array.from(new Set(sample))){
        const t = await pageText(handle, p);
        const v = t.page.view, w = v[2] - v[0], h = v[3] - v[1];
        if(t.items.some(function(i){ return i.str.trim(); })) withText++;
        const seen = {};
        // Printed numbers sit near an edge: the foot, the head, or (in these books) the outer side margin.
        t.items.forEach(function(i){
          const s = i.str.trim();
          if(!/^\d{1,4}$/.test(s)) return;
          const x = i.transform[4], y = i.transform[5];
          if(y - v[1] > h * 0.15 && v[3] - y > h * 0.15 && x - v[0] > w * 0.15 && v[2] - x > w * 0.15) return;
          seen[parseInt(s, 10) - p] = true;
        });
        const ds = Object.keys(seen);
        if(ds.length) withNumbers++;
        ds.forEach(function(d){ tally[d] = (tally[d] || 0) + 1; });
      }
      const top = Object.keys(tally).sort(function(a, b){ return tally[b] - tally[a]; })[0];
      const count = top != null ? tally[top] : 0;
      const printed = top != null && count >= 5 && count >= withNumbers * 0.6 ? parseInt(top, 10) : null;
      const evidence = { labelOffset: labelOffset, printedOffset: printed, agreeing: count, sampled: want, withNumbers: withNumbers };
      if(printed != null) return { state: 'matched', offset: printed, method: labelOffset === printed ? 'labels' : 'printed', evidence: evidence };
      if(labelOffset != null && withText === 0) return { state: 'matched', offset: labelOffset, method: 'labels', evidence: evidence };
      return { state: 'check', offset: labelOffset != null ? labelOffset : 0, method: null, evidence: evidence };
    };
    // The PDF page "Check now" shows: a fifth of the way in, past the front matter.
    api.checkPage = function(handle){ return Math.min(handle.pages, Math.max(1, Math.round(handle.pages / 5))); };

    // ---- Drawing pages ----
    api.pageSize = async function(handle, n){
      const page = await handle.doc.getPage(n);
      const vp = page.getViewport({ scale: 1 });
      return { width: vp.width, height: vp.height };
    };
    // Draws PDF page n into canvas at cssWidth CSS pixels; returns { promise, cancel }. With region
    // ({ x, y, w, h } as fractions of the page, from its top left) only that part is drawn, cssWidth wide.
    api.draw = function(handle, n, canvas, cssWidth, pixelRatio, region){
      let task = null, cancelled = false;
      const r = region || { x: 0, y: 0, w: 1, h: 1 };
      const promise = handle.doc.getPage(n).then(function(page){
        if(cancelled) return false;
        const base = page.getViewport({ scale: 1 });
        const scale = cssWidth / (base.width * r.w) * (pixelRatio || 1);
        const vp = page.getViewport({ scale: scale, offsetX: -r.x * base.width * scale, offsetY: -r.y * base.height * scale });
        canvas.width = Math.floor(base.width * r.w * scale);
        canvas.height = Math.floor(base.height * r.h * scale);
        task = page.render({ canvas: canvas, canvasContext: canvas.getContext('2d'), viewport: vp });
        // Frees the page's decoded images once drawn, so memory stays bounded as pages scroll past.
        return task.promise.then(function(){ page.cleanup(); return true; }, function(e){ page.cleanup(); throw e; });
      });
      return { promise: promise, cancel: function(){ cancelled = true; if(task) try { task.cancel(); } catch(e){} } };
    };
    // The cover: the first of the opening pages that is not near-blank, as a small JPEG.
    api.makeCover = async function(handle){
      const canvas = document.createElement('canvas');
      let chosen = 1, most = -1;
      for(let n = 1; n <= Math.min(4, handle.pages); n++){
        await api.draw(handle, n, canvas, 120, 1).promise;
        const spread = contrast(canvas);
        if(spread >= 12){ chosen = n; break; }
        if(spread > most){ most = spread; chosen = n; }
      }
      canvas.width = canvas.height = 0;
      return { page: chosen, blob: await api.pageCover(handle, chosen) };
    };
    function jpeg(canvas){
      return new Promise(function(resolve){ canvas.toBlob(function(b){ canvas.width = canvas.height = 0; resolve(b); }, 'image/jpeg', 0.82); });
    }
    api.pageCover = async function(handle, n){
      const canvas = document.createElement('canvas');
      await api.draw(handle, n, canvas, 200, 1).promise;
      return jpeg(canvas);
    };
    // The user's picture cropped to frame ({ x, y, w, h } in the picture's own pixels), as a JPEG `width` pixels wide.
    api.pictureCover = function(image, frame, width){
      const canvas = document.createElement('canvas');
      canvas.width = width || 300;
      canvas.height = Math.max(1, Math.round(canvas.width * frame.h / frame.w));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, 0, 0, canvas.width, canvas.height);
      return jpeg(canvas);
    };
    // Brightness spread of a drawn page: about 0 for a blank page, low for sparse text, high for art.
    function contrast(canvas){
      const ctx = canvas.getContext('2d');
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let sum = 0, sq = 0, k = 0;
      for(let i = 0; i < d.length; i += 16){
        const y = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
        sum += y; sq += y * y; k++;
      }
      const mean = sum / k;
      return Math.sqrt(Math.max(0, sq / k - mean * mean));
    }

    // ---- Chapters and Search in book (Release 2b) ----
    // The PDF's own bookmarks as [{ title, page (PDF page), kids }], three levels at most. A lone top bookmark holding
    // all the others (the book's own title: 5 of the owner's 16 PDFs) is skipped. A bookmark whose target cannot be
    // read takes its first child's page, or is left out; when none can be read the list is empty and `unlinked` true.
    api.outline = async function(handle){
      let items = null;
      try { items = await handle.doc.getOutline(); } catch(e){}
      if(!items || !items.length) return [];
      if(items.length === 1 && items[0].items && items[0].items.length) items = items[0].items;
      async function pageOf(dest){
        try {
          if(typeof dest === 'string') dest = await handle.doc.getDestination(dest);
          if(!Array.isArray(dest) || dest[0] == null) return null;
          const i = typeof dest[0] === 'number' ? dest[0] : await handle.doc.getPageIndex(dest[0]);
          return i >= 0 && i < handle.pages ? i + 1 : null;
        } catch(e){ return null; }
      }
      async function level(list, depth){
        const rows = await Promise.all(list.map(async function(it){
          const below = it.items && it.items.length ? await level(it.items, depth + 1) : [];
          let page = await pageOf(it.dest);
          if(page == null && below.length) page = below[0].page;
          return page == null ? null : { title: String(it.title || '').replace(/\s+/g, ' ').trim() || 'Untitled', page: page, kids: depth < 3 ? below : [] };
        }));
        return rows.filter(Boolean);
      }
      const tree = await level(items, 1);
      tree.unlinked = !tree.length;
      return tree;
    };
    // Where PDF page n sits in the bookmarks: the path down each level to the bookmark with the highest page at or
    // before it (the later one on a tie), so one bookmark listed out of order does not hold every later page.
    api.spot = function(tree, n){
      const path = [];
      let level = tree || [];
      while(level.length){
        let hit = null;
        level.forEach(function(b){ if(b.page <= n && (!hit || b.page >= hit.page)) hit = b; });
        if(!hit) break;
        path.push(hit);
        level = hit.kids || [];
      }
      return path;
    };
    // Curly quotes and long dashes as their plain forms, letter for letter (positions in the text stay the same).
    api.fold = function(s){
      return String(s || '').replace(/[’‘ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-');
    };
    // The query whatever its case and quotes, any run of spaces matching any run; null under two letters. Match it
    // against fold(text).
    api.matcher = function(query){
      const q = api.fold(query).trim();
      if(q.replace(/\s+/g, '').length < 2) return null;
      return new RegExp(q.split(/\s+/).map(function(w){ return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('\\s+'), 'gi');
    };
    // A page's text as one string (PDF.js's own joining: items end to end, a space at each line end), and where
    // each item starts in it.
    async function pageWords(handle, n){
      const t = await pageText(handle, n);
      let text = '';
      const spans = [];
      t.items.forEach(function(i){
        if(typeof i.str !== 'string') return;
        spans.push({ start: text.length, item: i });
        text += i.str;
        if(i.hasEOL) text += ' ';
      });
      return { page: t.page, text: text, spans: spans, styles: t.styles };
    }
    // The share of a text item's width before letter `at`, measured in the item's own font family.
    let ruler = null;
    function widthShare(str, at, family){
      if(!ruler) ruler = document.createElement('canvas').getContext('2d');
      ruler.font = '100px ' + (family || 'sans-serif');
      const all = ruler.measureText(str).width;
      return all > 0 ? ruler.measureText(str.slice(0, at)).width / all : at / str.length;
    }
    // About 40 letters before a match and 60 after, cut at spaces, with … where the page's text goes on.
    api.snippet = function(text, at, len){
      let a = Math.max(0, at - 40), b = Math.min(text.length, at + len + 60);
      if(a > 0){ const s = text.indexOf(' ', a); if(s >= 0 && s < at) a = s + 1; }
      if(b < text.length){ const s = text.lastIndexOf(' ', b); if(s > at + len) b = s; }
      const tidy = function(s){ return s.replace(/\s+/g, ' '); };
      return { before: (a > 0 ? '…' : '') + tidy(text.slice(a, at)).replace(/^ /, ''), match: tidy(text.slice(at, at + len)),
        after: tidy(text.slice(at + len, b)).replace(/ $/, '') + (b < text.length ? '…' : '') };
    };
    // Every page holding the query, in page order: [{ page, snippet }]. Each page's text is read once per open book and
    // kept (the text only), four pages at a time. onPage(n, found) after each page; stop() true ends early, returning null.
    api.searchBook = async function(handle, query, onPage, stop){
      const re = api.matcher(query);
      if(!re) return [];
      const texts = handle.texts || (handle.texts = []);
      const found = [];
      for(let n = 1; n <= handle.pages; n += 4){
        if(stop && stop()) return null;
        const group = [];
        for(let k = n; k < n + 4 && k <= handle.pages; k++) group.push(k);
        await Promise.all(group.filter(function(k){ return texts[k] == null; }).map(async function(k){
          try { const w = await pageWords(handle, k); texts[k] = w.text; w.page.cleanup(); } catch(e){ texts[k] = ''; }
        }));
        if(stop && stop()) return null;
        group.forEach(function(k){
          re.lastIndex = 0;
          const m = re.exec(api.fold(texts[k]));
          if(m) found.push({ page: k, snippet: api.snippet(texts[k], m.index, m[0].length) });
          if(onPage) onPage(k, found);
        });
      }
      return found;
    };
    // Where the query is printed on PDF page n: rectangles as fractions of the page from its top left, clipped to the
    // page (some books print text in the bleed, outside it).
    api.findOnPage = async function(handle, n, query){
      const re = api.matcher(query);
      if(!re) return [];
      const w = await pageWords(handle, n);
      const vp = w.page.getViewport({ scale: 1 });
      const rects = [];
      const folded = api.fold(w.text);
      let m;
      while((m = re.exec(folded))){
        const a = m.index, b = a + m[0].length;
        w.spans.forEach(function(s){
          const i = s.item, len = i.str.length;
          const from = Math.max(a, s.start) - s.start, to = Math.min(b, s.start + len) - s.start;
          if(!len || to <= from) return;
          const t = i.transform, size = Math.hypot(t[2], t[3]) || i.height || 10, family = (w.styles[i.fontName] || {}).fontFamily;
          const p = vp.convertToViewportPoint(t[4] + i.width * widthShare(i.str, from, family), t[5] - size * 0.25);
          const q = vp.convertToViewportPoint(t[4] + i.width * widthShare(i.str, to, family), t[5] + size * 0.9);
          const x0 = Math.max(0, Math.min(p[0], q[0]) / vp.width), x1 = Math.min(1, Math.max(p[0], q[0]) / vp.width);
          const y0 = Math.max(0, Math.min(p[1], q[1]) / vp.height), y1 = Math.min(1, Math.max(p[1], q[1]) / vp.height);
          if(x1 > x0 && y1 > y0) rects.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
        });
      }
      w.page.cleanup();
      return rects;
    };

    api.formatSize = function(bytes){
      if(bytes >= 1e9) return (bytes / 1e9).toFixed(bytes >= 1e10 ? 0 : 1) + ' GB';
      if(bytes >= 1e6) return Math.round(bytes / 1e6) + ' MB';
      if(bytes > 0) return Math.max(1, Math.round(bytes / 1e3)) + ' KB';
      return '0 MB';
    };

    return api;
  })();
  // ============ END PART K PHASE 13 LIB13 ============
