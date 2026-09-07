#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-0.1.0-alpha1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST/package"

(
  cd "$ROOT/component"
  zip -qr "$DIST/com_decaroeditor_${VERSION}.zip" . -x '*.DS_Store' -x '__MACOSX/*'
)

(
  cd "$ROOT/plugin"
  zip -qr "$DIST/plg_editors_decaroeditor_${VERSION}.zip" . -x '*.DS_Store' -x '__MACOSX/*'
)

cp "$ROOT/package/pkg_decaroeditor.xml" "$DIST/package/pkg_decaroeditor.xml"
cp "$DIST/com_decaroeditor_${VERSION}.zip" "$DIST/package/"
cp "$DIST/plg_editors_decaroeditor_${VERSION}.zip" "$DIST/package/"

(
  cd "$DIST/package"
  zip -qr "$DIST/pkg_decaroeditor_${VERSION}.zip" . -x '*.DS_Store' -x '__MACOSX/*'
)

echo "Built packages in $DIST"
