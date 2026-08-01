#!/usr/bin/env bash
#
# install-hooks.sh
#
# Points git at sh/hooks, so the pre-push figure check runs on every push.
#
# Run once per clone:  sh/install-hooks.sh
#
# It sets core.hooksPath rather than copying files into .git/hooks, so the
# hooks stay version controlled and an update to them takes effect without
# anyone having to reinstall.
#
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

git config core.hooksPath sh/hooks
chmod +x sh/hooks/*

echo "Installed. git will now run sh/hooks/pre-push before every push."
echo "Check it with:  git config --get core.hooksPath"
echo "Remove it with: git config --unset core.hooksPath"
