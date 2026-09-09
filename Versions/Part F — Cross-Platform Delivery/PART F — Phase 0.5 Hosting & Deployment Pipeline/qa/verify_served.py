#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verify a deployed URL is serving the exact file this repo builds.

    python3 "…/qa/verify_served.py" https://your-project.pages.dev

Stdlib only -- no Node, no Playwright, no installs. It runs anywhere Python
runs, which matters because the machine that can reach the deployment is not
always the machine with a browser-automation stack on it. (The cloud session
that wrote this cannot reach *.pages.dev at all: its egress proxy denies the
CONNECT. So this check has to be runnable by whoever *can* reach the site.)

It answers one question, and it is the question that matters:

    are the bytes on the server the bytes we built?

If the sha256 matches, the deployed page IS the file already put through the
full behavioural suite in Phase 0 -- 14 flows, both test seams, every element id
compared. Identical bytes cannot behave differently, so re-testing behaviour
over HTTP would confirm nothing new.

If it does not match, the deploy is stale or was built from different sources.
Cloudflare keeps serving the last good build when a new one fails, so a broken
deploy is silent: the site stays up and quietly goes out of date. Checking for
an HTTP 200 would not catch that. This does.
"""

import hashlib
import os
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PHASE_DIR = os.path.dirname(HERE)
REPO = os.path.dirname(os.path.dirname(os.path.dirname(PHASE_DIR)))
LOCAL_BUILD = os.path.join(REPO, "dist", "index.html")


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def main():
    if len(sys.argv) != 2:
        sys.exit(
            "usage: verify_served.py <https://...>\n\n"
            "The URL Cloudflare Pages shows for the project, e.g.\n"
            "  https://l5r-character-sheet-creator.pages.dev"
        )

    url = sys.argv[1]
    print("\nVerifying: %s\n" % url)

    ok = True

    # --- https --------------------------------------------------------------
    if url.startswith("https://"):
        print("  PASS  URL is https")
    else:
        ok = False
        print("  FAIL  URL is https  — Phase 0.6's service worker will not "
              "install over plain http")

    # --- local build present ------------------------------------------------
    if not os.path.isfile(LOCAL_BUILD):
        sys.exit(
            "  no local build to compare against:\n    %s\n\n"
            "  Run this first, from the repo root:\n    python3 build.py"
            % LOCAL_BUILD
        )
    with open(LOCAL_BUILD, "rb") as fh:
        local = fh.read()
    local_hash = sha256_bytes(local)

    # --- fetch --------------------------------------------------------------
    # Accept-Encoding: identity so the server hands back raw bytes. Without it
    # Cloudflare may gzip the response, and the hash would compare compressed
    # bytes against uncompressed ones and always differ.
    req = urllib.request.Request(url, headers={
        "Accept-Encoding": "identity",
        "User-Agent": "l5r-deploy-verify/1.0",
    })
    try:
        with urllib.request.urlopen(req, timeout=45) as res:
            status = res.status
            served = res.read()
    except urllib.error.HTTPError as e:
        print("  FAIL  responds 200  — HTTP %s %s" % (e.code, e.reason))
        sys.exit(1)
    except Exception as e:                                  # noqa: BLE001
        print("  FAIL  reachable  — %s" % e)
        print("\n  If this machine is behind a proxy or VPN that blocks the")
        print("  host, that is a local network result, not a verdict on the")
        print("  deployment. Try from another network before concluding.")
        sys.exit(1)

    print("  %s  responds 200  — HTTP %s" % ("PASS" if status == 200 else "FAIL", status))
    if status != 200:
        ok = False

    served_hash = sha256_bytes(served)
    print("        served: %d bytes, sha256 %s…" % (len(served), served_hash[:16]))
    print("        local : %d bytes, sha256 %s…" % (len(local), local_hash[:16]))

    if served_hash == local_hash:
        print("  PASS  served bytes match the local build  — deploy is current")
    else:
        ok = False
        print("  FAIL  served bytes match the local build")
        if len(served) < 2000:
            print("\n        The response is small enough to be an error page, not the")
            print("        sheet. First bytes:\n")
            print("        " + served[:300].decode("utf-8", "replace").replace("\n", "\n        "))
        else:
            print("\n        Both look like real pages but differ. Either the deploy")
            print("        predates your last push, or the last build failed and")
            print("        Cloudflare is still serving the previous one. Check the")
            print("        Pages build log.")

    print("\n%s\n" % ("Deployment verified." if ok else "Verification FAILED."))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
