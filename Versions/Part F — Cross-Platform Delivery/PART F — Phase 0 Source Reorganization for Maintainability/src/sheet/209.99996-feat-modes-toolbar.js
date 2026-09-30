  // ============ PART K PHASE 12.8 — PLAY AND MANAGEMENT MODES: THE OLD TOOLBAR REPLACED ============
  // Phase 11's plan and the owner's choices of 30 September 2026. The old toolbar row goes: the
  // Characters list is where characters are opened, created, imported, copied, exported and
  // deleted. On the sheet the header keeps Characters, Save, a More menu (⋯) and Manage/Done. The
  // menu holds Save As a copy (Management only), Print and Export JSON. New Blank is gone: a new
  // character comes from Create New Character or Import.
  //
  // The existing buttons are MOVED, not rebuilt, so their ids, listeners and every wrapper another
  // part put on them keep working unchanged. The rest of the row (picker, Load, New Blank, Delete,
  // the old Import) stays in the page, hidden, for the code that still reads it. Without Phase 11's
  // Characters list there would be no way to open a character, so this part then installs nothing.
  const MODES128_ENABLED = true;

  const MODES128 = {
    menuId: 'pm128Menu',
    moreId: 'pm128More',
    menu: function(){ return document.getElementById(this.menuId); },
    more: function(){ return document.getElementById(this.moreId); },
    isOpen: function(){ const m = this.menu(); return !!m && !m.hidden; },
    // The menu lives at the end of <body> and is placed under its button when it opens: the header
    // clips anything that overflows it, so a menu inside the header would be cut off.
    open: function(){
      const m = this.menu(), b = this.more();
      if(!m || !b) return;
      const r = b.getBoundingClientRect();
      m.style.top = Math.round(r.bottom + 6) + 'px';
      m.style.right = Math.max(8, Math.round(document.documentElement.clientWidth - r.right)) + 'px';
      m.hidden = false;
      b.setAttribute('aria-expanded', 'true');
    },
    close: function(){
      const m = this.menu(), b = this.more();
      if(!m || !b || m.hidden) return;
      m.hidden = true;
      b.setAttribute('aria-expanded', 'false');
    },
    // Runs once Phase 11 has put its Characters button in the old row.
    build: function(){
      if(document.getElementById('pm128Actions')) return false;
      const ids = ['cl11Toolbar', 'btnSave', 'btnSaveAs', 'btnPrint', 'btnExport'];
      const found = ids.map(function(id){ return document.getElementById(id); });
      const seal = document.getElementById('seal');
      if(!seal || !seal.parentNode || found.some(function(el){ return !el; })) return false;
      const [characters, save, saveAs, print, exportJson] = found;

      const bar = document.createElement('div');
      bar.id = 'pm128Actions';
      bar.className = 'pm128-actions print-hide';
      const wrap = document.createElement('div');
      wrap.className = 'pm128-more-wrap';
      const more = document.createElement('button');
      more.type = 'button';
      more.id = this.moreId;
      more.className = 'ghost pm128-more';
      more.textContent = '⋯';
      more.setAttribute('aria-label', 'More: save a copy, print, export');
      more.setAttribute('aria-haspopup', 'menu');
      more.setAttribute('aria-controls', this.menuId);
      more.setAttribute('aria-expanded', 'false');
      const menu = document.createElement('div');
      menu.id = this.menuId;
      menu.className = 'pm128-menu print-hide';
      menu.setAttribute('role', 'menu');
      menu.hidden = true;
      saveAs.textContent = 'Save As a copy';
      print.textContent = 'Print';
      [saveAs, print, exportJson].forEach(function(item){
        item.setAttribute('role', 'menuitem');
        item.classList.add('pm128-item');
        menu.appendChild(item);
      });
      wrap.appendChild(more);
      bar.append(characters, save, wrap);
      document.body.appendChild(menu);
      const toggle = document.getElementById('pm12Toggle');
      seal.parentNode.insertBefore(bar, toggle && toggle.parentNode === seal.parentNode ? toggle : seal);

      const self = this;
      more.addEventListener('click', function(){ if(self.isOpen()) self.close(); else self.open(); });
      // Choosing an item closes the menu once the item's own listeners have run.
      menu.addEventListener('click', function(){ self.close(); });
      // Save As a copy is a Management action: the Phase 12 gate makes it inert in Play, and its
      // style hides a locked button there.
      if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function') MODES12.register('#btnSaveAs');
      document.body.classList.add('pm128-enabled');
      return true;
    },
    install: function(){
      if(typeof CL11 !== 'object' || !CL11 || typeof CL11.addToolbarButton !== 'function' ||
         typeof CL11.enabled !== 'function' || !CL11.enabled()) return;
      const self = this;
      const previousAdd = CL11.addToolbarButton;
      CL11.addToolbarButton = function(){
        const result = previousAdd.apply(this, arguments);
        self.build();
        return result;
      };
      // A tap anywhere else, Escape, or a change of window size closes it.
      document.addEventListener('click', function(e){
        if(!self.isOpen()) return;
        const more = self.more(), menu = self.menu();
        if(!(more && more.contains(e.target)) && !(menu && menu.contains(e.target))) self.close();
      });
      window.addEventListener('resize', function(){ self.close(); });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && self.isOpen()){ self.close(); if(self.more()) self.more().focus(); }
      });
    }
  };

  if(MODES128_ENABLED) MODES128.install();
  // ============ END PART K PHASE 12.8 MODES128 ============
