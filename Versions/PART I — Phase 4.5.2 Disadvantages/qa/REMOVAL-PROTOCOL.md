# Paired insertion protocol

The preferred implementation consists only of the release's seven new fragments
and their manifest entries. This protocol supports a narrowly necessary insertion
in a shared file or component-specific CSS inside the new core stylesheet.

```js
// PART G PHASE 3
existingCode();
// PART I FEATURE 4.521 BEGIN phobia-preview
if (typeof phobiaPreview === 'function') phobiaPreview();
// END DISADV45 phobia-preview
// PART G PHASE 3 (continued after DISADV45 phobia-preview)
moreExistingCode();
```

Both delimiters and the synthetic hand-back are removed. The preceding owner
must exactly match the hand-back. When the next existing line is already a phase
marker, no synthetic hand-back is needed. CSS uses comment-only `/* ... */` lines;
HTML uses comment-only `<!-- ... -->` lines.

An insertion ID is lowercase, unique within its file, and composed of letters,
digits and hyphens. Nested insertions, foreign markers inside a block, missing or
mismatched ends, unpaired markers, and an incorrect hand-back cause refusal.
Added blank lines belong inside the delimiters so a cut restores every original
byte, including the file's original final-newline state.

The remover does not support silent replacement of an existing line. Implement
the change in an owned wrapper or add an explicit, asserted inverse before
introducing such an edit. Never solve a removal mismatch by restoring a whole
shared file or weakening the expected hash.

The legacy ownership scanner treats marker-shaped comment prose as ownership.
Inside implementation comments refer to other work as, for example, "the preview
phase" rather than spelling another phase's full marker. The remover deliberately
rejects marker-shaped foreign prose inside a selected fragment as well.
