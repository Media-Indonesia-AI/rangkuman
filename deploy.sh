#!/bin/bash
# Quick deploy script for Berita Investor
# Builds the static site and prepares ./out/ for upload to your static host.
#
# Usage:
#   ./deploy.sh           # build only (default)
#   ./deploy.sh check     # run all checks (type, lint, build)
#   ./deploy.sh clean     # clean build artifacts
#   ./deploy.sh help      # show this help

set -e  # exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
  echo ""
  echo -e "${GREEN}=== $1 ===${NC}"
  echo ""
}

print_step() {
  echo -e "${YELLOW}→ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

check_command() {
  if ! command -v "$1" &> /dev/null; then
    print_error "$1 is not installed. Please install it first."
    exit 1
  fi
}

usage() {
  cat << EOF
Berita Investor deploy script

Usage:
  ./deploy.sh           Build production site (default)
  ./deploy.sh check     Run full check: type-check, lint, build
  ./deploy.sh clean     Clean build artifacts (./out and ./.next)
  ./deploy.sh help      Show this help

Examples:
  ./deploy.sh           # build and report size
  ./deploy.sh check     # verify everything before deploy
  ./deploy.sh clean     # clean before fresh build
EOF
}

cmd_build() {
  print_header "Building Berita Investor"

  check_command node
  check_command npm

  print_step "Installing dependencies (if needed)..."
  if [ ! -d "node_modules" ]; then
    npm ci
  else
    print_success "node_modules already present"
  fi

  print_step "Building static site..."
  rm -rf .next out
  npm run build

  if [ -d "out" ]; then
    SIZE=$(du -sh out/ | cut -f1)
    FILE_COUNT=$(find out -type f | wc -l)
    print_success "Build complete: $SIZE, $FILE_COUNT files"
    echo ""
    echo "Output: ./out/"
    echo ""
    echo "Next steps:"
    echo "  • Vercel:        vercel --prod"
    echo "  • Netlify:       netlify deploy --prod --dir=out"
    echo "  • Cloudflare:    wrangler pages deploy out"
    echo "  • AWS S3:        aws s3 sync ./out/ s3://your-bucket/ --delete"
    echo "  • Self-host:     rsync -avz ./out/ user@server:/var/www/"
  else
    print_error "Build failed — ./out/ not generated"
    exit 1
  fi
}

cmd_check() {
  print_header "Running checks"

  check_command node
  check_command npm

  print_step "Type check..."
  npx tsc --noEmit --skipLibCheck && print_success "TypeScript OK"

  print_step "Lint..."
  npx eslint --ext .ts,.tsx --max-warnings 0 app/ components/ lib/ && print_success "ESLint OK"

  print_step "Build..."
  cmd_build
}

cmd_clean() {
  print_header "Cleaning build artifacts"
  rm -rf .next out
  print_success "Removed .next/ and out/"
}

# Main
case "${1:-build}" in
  build)
    cmd_build
    ;;
  check)
    cmd_check
    ;;
  clean)
    cmd_clean
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    echo "Unknown command: $1"
    echo ""
    usage
    exit 1
    ;;
esac
