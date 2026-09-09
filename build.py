#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Repo-root build entry point. Cloudflare Pages runs this.

    python3 build.py            build the site into dist/
    python3 build.py --check-drift   verify the committed build matches its sources

This file is deliberately thin. It exists at the repo root for one reason: a CI
build command is typed into a web form, and pointing that form at

    Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.5 …/deploy/deploy_build.py

means putting spaces and em-dashes into a field that gets retyped and edited by
hand. "python3 build.py" does not have that problem.

Everything real lives with its phase, per the folder convention in
Versions/CLAUDE.md:

    Versions/Part F — Cross-Platform Delivery/
      PART F — Phase 0 Source Reorganization for Maintainability/    the build
      PART F — Phase 0.5 Hosting & Deployment Pipeline/              the deploy

Keep it that way. If this file ever grows logic of its own, the phase folders
stop being self-contained and deleting one stops being a clean rollback.
"""

import os
import runpy
import sys

REPO = os.path.dirname(os.path.abspath(__file__))
PART_F = os.path.join(REPO, "Versions", "Part F — Cross-Platform Delivery")

# Latest deploy phase first. Each phase's build chains onto the one below it --
# 0.6 calls 0.5, which calls Phase 0's recombine -- so this picks the top of the
# chain that is actually present. Roll a phase back by deleting its folder and
# the next one down takes over, with no edit needed here.
CANDIDATES = [
    os.path.join(PART_F, "PART F — Phase 0.6 Installable Web App",
                 "build", "build_pwa.py"),
    os.path.join(PART_F, "PART F — Phase 0.5 Hosting & Deployment Pipeline",
                 "deploy", "deploy_build.py"),
]

TARGET = next((p for p in CANDIDATES if os.path.isfile(p)), None)

if TARGET is None:
    sys.exit(
        "no deploy script found. Looked for:\n  %s\n\n"
        "Every Part F deploy phase may have been rolled back. If so, delete this\n"
        "file too -- it is their entry point and does nothing without them."
        % "\n  ".join(CANDIDATES)
    )

runpy.run_path(TARGET, run_name="__main__")
