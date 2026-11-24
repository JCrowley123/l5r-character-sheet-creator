# Rollback: Character Finder (design draft)

**This folder is a design draft only.** It changes no application file, adds no fragment, marker, seam key,
stylesheet or manifest entry, and registers nothing in `QA — Removal Chain Registry`. The live build is
unaffected by its presence.

To remove it, delete this folder:

```bash
rm -r "Versions/PART K — Phase 11.4 Character Finder"
```

Nothing else refers to it.

## Dependencies

None. The prototype scripts only **read** the built app (`dist/index.html`, produced by `python3 build.py` at the
repository root) and the data they extracted from it (`prototype/schools.json`). They write only inside
`prototype/` and fill the three generated tables in `DESIGN.md`.

If the owner approves the design, the build phase gets its own fragment, marker, harness and a full
`ROLLBACK.md` of the usual kind. Its planned dependencies (a hard one on Phase 11.2, the creation wizard; soft,
guarded ones on Phase 9.1, 14.3b and 4.6/4.7 data) are listed in `DESIGN.md` section 10.
