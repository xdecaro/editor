# SDD ledger — plan: docs/superpowers/plans/2026-09-29-editor-alpha7-builder-consolidation.md

Pre-flight: Task 1 produces Builder contract tests consumed by Tasks 2-3; Task 2 produces runtime/assets consumed by Tasks 3-5; Task 4 versions the completed runtime consumed by Task 5.

Ruling: Open a Draft PR before Task 1 rather than in Task 5 — the local execution container cannot resolve github.com, so GitHub Actions is the only available real test runner for RED→GREEN verification. Cost if wrong: an extra draft PR notification; no merge/publish occurs.

Task 1: complete — RED observed in GitHub Actions run 36529932368: `builder-engine.js must be shipped`; PHP/Core checks passed before the intentional Builder-contract failure.

Task 2: complete — commit 151e49761ff79ff5680d0711fe45f79fe2344125 reused the PR #4 Builder runtime blobs, registered independent Joomla assets and restored the public Builder documentation. GitHub Actions run 36530069231 passed JavaScript contracts, asset validation, PHP/Core checks, deterministic builds and artifact upload.
