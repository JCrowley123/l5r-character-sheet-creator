#!/usr/bin/env bash
#
# Compile the signed APK. Everything the GitHub Actions workflow does beyond
# installing tools lives here, so .github/workflows/android.yml stays a thin
# delegator -- the same shape as build.py at the repo root, and for the same
# reason: rollback should mean deleting this phase's folder plus one obvious
# file, not unpicking logic scattered through CI config.
#
# Runs on any machine with the Android SDK, JDK 21 and Node. It is not
# GitHub-specific; CI just happens to be where the SDK is.
#
#   KEYSTORE_PASSPHRASE   required to produce a signed APK. Without it the
#                         build still runs and emits an UNSIGNED apk, which is
#                         the honest outcome -- Android will refuse to install
#                         it, rather than it looking fine and failing to update
#                         later.
#   VERSION_CODE          integer, must increase between releases (CI passes
#                         the run number). Android refuses to install an APK
#                         whose versionCode is not greater than the installed
#                         one, and the only cure is an uninstall, which takes
#                         the player's characters with it.
#   OUT_DIR               where to leave the finished APK.
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PHASE_DIR="$(dirname "$HERE")"
REPO="$(cd "$PHASE_DIR/../../.." && pwd)"

VERSION_CODE="${VERSION_CODE:-1}"
VERSION_NAME="${VERSION_NAME:-1.0.${VERSION_CODE}}"
OUT_DIR="${OUT_DIR:-$REPO/apk-out}"

# The Capacitor project is built OUTSIDE the repo, at a path with no spaces and
# no em-dash.
#
# This phase lives at "PART F — Phase 0.7 Native Android App" because that is
# the project's folder convention, and Gradle, the Android SDK and several of
# their tools have a long history of mishandling both spaces and non-ASCII in
# paths -- usually not with a clean error but with something obscure much later.
# Copying to a clean directory first costs a second and removes the whole class
# of problem, so the convention does not have to bend for the build.
WORK="${WORK_DIR:-${RUNNER_TEMP:-/tmp}/l5r-android}"

echo "== 1/6  build the site and stage the web assets =="
python3 "$PHASE_DIR/build/build_android.py"

echo
echo "== 2/6  copy the Capacitor project to a clean path =="
rm -rf "$WORK"
mkdir -p "$WORK"
cp -R "$PHASE_DIR/app/." "$WORK/"
chmod +x "$WORK/android/gradlew"
echo "  $WORK"

echo
echo "== 3/6  install Capacitor and copy web assets into the native project =="
cd "$WORK"
npm ci --no-audit --no-fund
npx --no-install cap copy android

echo
echo "== 4/6  signing =="
if [[ -n "${KEYSTORE_PASSPHRASE:-}" ]]; then
  KS="$WORK/release.keystore"
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 240000 \
    -in "$PHASE_DIR/keystore/release.keystore.enc" \
    -out "$KS" -pass "env:KEYSTORE_PASSPHRASE"

  # Written to a file rather than passed with -P, so the passphrase never
  # appears in a command line that `ps` could show. $WORK is outside the repo
  # and discarded with the runner.
  cat > "$WORK/android/gradle.properties.local" <<EOF
l5rKeystore=$KS
l5rKeystorePassword=$KEYSTORE_PASSPHRASE
l5rKeyAlias=l5r
l5rKeyPassword=$KEYSTORE_PASSPHRASE
EOF
  cat "$WORK/android/gradle.properties.local" >> "$WORK/android/gradle.properties"
  rm -f "$WORK/android/gradle.properties.local"
  echo "  keystore decrypted, release signing configured"
else
  echo "  !! KEYSTORE_PASSPHRASE not set -- the APK will be UNSIGNED."
  echo "     Android will refuse to install it. Add the secret; see"
  echo "     BUILD-FROM-A-PHONE.md."
fi

echo
echo "== 5/6  gradle assembleRelease =="
cd "$WORK/android"
./gradlew --no-daemon assembleRelease \
  -Pl5rVersionCode="$VERSION_CODE" \
  -Pl5rVersionName="$VERSION_NAME"

echo
echo "== 6/6  collect =="
mkdir -p "$OUT_DIR"
APK="$(find "$WORK/android/app/build/outputs/apk/release" -name '*.apk' | head -1)"
if [[ -z "$APK" ]]; then
  echo "no APK produced" >&2
  exit 1
fi
DEST="$OUT_DIR/l5r-sheet-${VERSION_NAME}.apk"
cp "$APK" "$DEST"

echo "  $DEST"
echo "  $(stat -c%s "$DEST") bytes"
echo "  versionCode $VERSION_CODE, versionName $VERSION_NAME"

# Say plainly whether this APK can actually be installed, and FAIL if it cannot.
# An unsigned APK looks like a success everywhere except on the phone, which is
# the worst place to find out.
#
# Checked with apksigner, not by looking for META-INF/*.RSA. That file is v1 (jar)
# signing, which AGP skips entirely when minSdkVersion >= 24 -- and this app's is
# 24. A correctly v2/v3-signed APK has no META-INF signature at all, so that test
# would call every good build broken.
APKSIGNER="$(find "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-/opt/android-sdk}}/build-tools" \
             -name apksigner -type f 2>/dev/null | sort -V | tail -1 || true)"
if [[ -n "$APKSIGNER" ]]; then
  if "$APKSIGNER" verify --print-certs "$DEST" 2>/dev/null | grep -q "SHA-256 digest"; then
    echo "  signed: yes"
    "$APKSIGNER" verify --print-certs "$DEST" 2>/dev/null \
      | grep -i "SHA-256 digest" | head -1 | sed 's/^/    /'
  else
    echo "  signed: NO" >&2
    echo "This APK is unsigned and Android will refuse to install it." >&2
    [[ -z "${KEYSTORE_PASSPHRASE:-}" ]] && \
      echo "KEYSTORE_PASSPHRASE was not set -- see BUILD-FROM-A-PHONE.md." >&2
    exit 1
  fi
else
  echo "  signed: UNVERIFIED (apksigner not found on this machine)"
fi
