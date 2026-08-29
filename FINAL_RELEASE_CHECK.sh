#!/bin/bash

set -e

echo "================================"
echo " ASTRA PRODUCTION RELEASE CHECK "
echo "================================"

echo ""
echo "Git status:"
git status --short

echo ""
echo "Current commit:"
git rev-parse --short HEAD

echo ""
echo "Latest tag:"
git describe --tags --abbrev=0

echo ""
echo "Workspace typecheck:"
pnpm -r typecheck

echo ""
echo "Production build:"
pnpm build

echo ""
echo "================================"
echo " ASTRA READY FOR PRODUCTION "
echo "================================"
