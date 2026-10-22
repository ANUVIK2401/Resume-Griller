# Maintaining the Amazon preparation workspace

The pages are implemented. Read `amazon/README.md` for current routes and checks.

When extending this module:

- Use the reviewed `amazon/data/profile.json` and the candidate-supplied resume for source alignment. Do not import assumptions from archived company prep.
- The loop format was confirmed on October 21, 2026 and lives in `amazon/data/loop.json`. Only which interviewer covers which part remains unknown; do not invent it.
- Label proposed AWS architectures separately from the candidate's actual deployments.
- Never invent a failure, disagreement, mentoring episode, rollout detail, customer quote, or measurement method. Use confirmation prompts and browser-local drafts.
- Verify changing AWS behavior against official documentation and include source links.
- Keep the 7-day plan focused on explaining technical ideas simply, AI/ML depth, the named LPs at 2 to 4 minutes, and the presentation.
- Update tests before changing behavior. Run the checks in `README.md`, regenerate `stories.md` and the print pages (`scripts/print_pages.mjs`), and verify critical flows in the browser.
- Keep private records and contact information out of static assets.

The recruiter confirmed the role (AWS Solutions Architect, L4, AWSI Emerging Talent Program) and the on-campus loop on October 28, 2026. Do not copy recruiter contact details, room numbers, or candidate intake answers into static assets.
