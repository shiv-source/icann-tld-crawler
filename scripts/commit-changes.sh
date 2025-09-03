#!/bin/bash
set -euo pipefail  # Strict mode: exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Set git config
git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"

log_info "Staging changes..."
git add .

log_info "Checking modified files..."
changed_files=$(git diff --staged --name-only)

# Check for changes in specific directories/files
has_data_changes() { echo "$changed_files" | grep -q "^data/"; }
has_dist_changes() { echo "$changed_files" | grep -q "^dist/"; }
has_readme_changes() { echo "$changed_files" | grep -q "^README.md$"; }

data_changed=$(has_data_changes && echo true || echo false)
dist_changed=$(has_dist_changes && echo true || echo false)
readme_changed=$(has_readme_changes && echo true || echo false)

log_info "Changes detected - Data: $data_changed, Dist: $dist_changed, README: $readme_changed"

# Exit if no relevant changes
if ! $data_changed && ! $dist_changed && ! $readme_changed; then
    log_success "No changes detected in data/, dist/, or README.md"
    exit 0
fi

# Determine commit message based on change combination
if $data_changed && $dist_changed && $readme_changed; then
    commit_msg="chore: 📝 updated tlds and README.md after ⚙️ build executable"
elif $data_changed && $readme_changed; then
    commit_msg="chore: 📝 update tlds and README.md"
elif $data_changed && $dist_changed; then
    commit_msg="chore: ⚙️ build executable with updated tlds"
elif $dist_changed && $readme_changed; then
    commit_msg="chore: ⚙️ build executable and update README.md"
elif $data_changed; then
    commit_msg="chore: 📝 update tlds"
elif $dist_changed; then
    commit_msg="chore: ⚙️ build executable"
elif $readme_changed; then
    commit_msg="chore: 📝 update README.md"
else
    log_warning "Unexpected state: No relevant changes detected"
    exit 0
fi

# Create detailed commit message with changed files
changed_list=$(echo "$changed_files" | head -10 | sed 's/^/  - /')
if [ $(echo "$changed_files" | wc -l) -gt 10 ]; then
    changed_list="$changed_list\n  - ... and more"
fi

full_commit_msg="$commit_msg\n\nChanged files:\n$changed_list"

log_info "Committing with message: ${commit_msg}"
git commit -m "$(echo -e "$full_commit_msg")"

log_info "Pushing changes to remote..."
if git push -u origin master; then
    log_success "Changes pushed successfully"
else
    log_error "Failed to push changes"
    exit 1
fi

# Summary output
log_info "=== UPDATE SUMMARY ==="
$data_changed && log_info "• Updated tlds data"
$dist_changed && log_info "• Rebuilt executable"
$readme_changed && log_info "• Updated documentation"
log_success "Update completed successfully"