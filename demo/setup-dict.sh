#!/bin/bash
set -euo pipefail

DICT_DIR="public/dict"
TMP_DIR=$(mktemp -d)
IPADIC_VERSION="2.7.0-20070801"
IPADIC_URL="https://sourceforge.net/projects/mecab/files/mecab-ipadic/2.7.0-20070801/mecab-ipadic-${IPADIC_VERSION}.tar.gz/download"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "Downloading mecab-ipadic ${IPADIC_VERSION}..."
curl -fsSL -o "$TMP_DIR/ipadic.tar.gz" "$IPADIC_URL"

echo "Extracting..."
tar xzf "$TMP_DIR/ipadic.tar.gz" -C "$TMP_DIR"

echo "Compiling dictionary with tokana..."
npx tokana build "$TMP_DIR/mecab-ipadic-${IPADIC_VERSION}" "$DICT_DIR"

echo ""
echo "Done! Dictionary files are in ${DICT_DIR}/"
ls -lh "$DICT_DIR"/*.dat.gz
