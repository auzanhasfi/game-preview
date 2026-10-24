#!/bin/sh
# game.html (format Artifact) -> index.html lengkap
cd "$(dirname "$0")"
{ printf '<!doctype html>\n<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'; cat game.html; printf '\n</html>\n'; } > index.html
