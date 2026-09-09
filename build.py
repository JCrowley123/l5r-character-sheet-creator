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
TARGET = os.path.join(
    REPO, "Versions", "Part F — Cross-Platform Delivery",
    "PART F — Phase 0.5 Hosting & Deployment Pipeline", "deploy", "deploy_build.py",
)

if not os.path.isfile(TARGET):
    sys.exit(
        "deploy script not found:\n  %s\n\n"
        "Phase 0.5's folder may have been rolled back. If so, delete this file too --\n"
        "it is the entry point for that phase and does nothing without it." % TARGET
    )

runpy.run_path(TARGET, run_name="__main__")
