# Removal

Run qa/remove-phase.py against an external scratch Phase 0 tree after later releases have been stripped through the shared registry. This removes three fragments, their manifest entries and the compact-seam block. qa/test-removal.py proves exact predecessor restoration and refusal safeguards. Original saved inputs and model functions remain in the older layers; removing this layer restores their original interface on the next load.
