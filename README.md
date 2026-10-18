# AWSI - ETP Solutions Architect interview prep

A focused preparation workspace for Anuvik Thota: AWS service choices, customer architecture conversations, resume deep dives, and Amazon Leadership Principle stories.

Open the root landing page, then the [October 28 sprint](amazon/index.html), [resume and STAR review](amazon/review.html), or [AWS cheat sheet](amazon/cheatsheet.html). The full module and checks are documented in [amazon/README.md](amazon/README.md).

```sh
python3 -m http.server 8000
# http://localhost:8000/
```

Pure HTML/CSS/JS, JSON content, no production dependencies. Progress, mock history, and drafts save in the browser and can be exported. The current target is a possible on-campus interview on Wednesday, October 28, 2026. The dashboard prioritizes October 16-27 practice, with the exact start time, room, and interview structure still unconfirmed. Practice scenarios do not predict the actual loop.

Portable references:

- [Final preparation card](amazon/FINAL-PREP.md)
- [AWS cheat sheet](amazon/AWS-CHEATSHEET.md)
- [Resume and STAR assessment](amazon/RESUME-STAR-REVIEW.md)
- [STAR story bank](amazon/stories.md)

The older general bank remains at [general-prep.html](general-prep.html). Salesforce is active: the hiring manager round is October 22, 2026; start with [salesforce/HM-BRIEF.md](salesforce/HM-BRIEF.md). Google preparation remains an archived module.

Every page shares one interview bar (`shared/switcher.js`): switch between Salesforce and Amazon, see each countdown from the module's `data/loop.json`, and jump between the current module's pages.

The existing GitHub Pages workflow deploys pushes to main after validation. Local edits do not update the live site until pushed.
