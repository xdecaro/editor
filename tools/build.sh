#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${1:-$(cat "$ROOT/VERSION")}"
DIST="$ROOT/dist"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

rm -rf "$DIST"
mkdir -p "$DIST" "$STAGE/component" "$STAGE/plugin" "$STAGE/package"

cp -a "$ROOT/component/." "$STAGE/component/"
cp -a "$ROOT/plugin/." "$STAGE/plugin/"
cp "$ROOT/package/pkg_decaroeditor.xml" "$STAGE/package/pkg_decaroeditor.xml"

find "$STAGE" -exec touch -t 202601010000 {} +

zip_tree() {
  local source="$1"
  local target="$2"
  (
    cd "$source"
    find . -type f -print | LC_ALL=C sort | zip -X -q "$target" -@
  )
}

zip_tree "$STAGE/component" "$DIST/com_decaroeditor_${VERSION}.zip"
zip_tree "$STAGE/plugin" "$DIST/plg_editors_decaroeditor_${VERSION}.zip"

cp "$DIST/com_decaroeditor_${VERSION}.zip" "$STAGE/package/"
cp "$DIST/plg_editors_decaroeditor_${VERSION}.zip" "$STAGE/package/"
find "$STAGE/package" -exec touch -t 202601010000 {} +
zip_tree "$STAGE/package" "$DIST/pkg_decaroeditor_${VERSION}.zip"

(
  cd "$DIST"
  sha256sum \
    "com_decaroeditor_${VERSION}.zip" \
    "plg_editors_decaroeditor_${VERSION}.zip" \
    "pkg_decaroeditor_${VERSION}.zip" \
    > SHA256SUMS.txt
)

echo "Built Editor ${VERSION} packages in $DIST"
