/* Google "Googleyness" competency bank for google-prep.html.
   Add new entries any time — the page picks them up automatically.
   `linkedTags` must match tags used in star-bank.js so matching
   STAR stories get pulled in inline. */

const GOOGLE_PREP_BANK = [
  {
    competency: "Leadership",
    googleDefinition: "Google looks for 'emergent leadership' — stepping up without a title, influencing peers, and knowing when to lead versus when to defer. They probe whether you create clarity for others and multiply the team's output, not just your own.",
    sampleQuestions: [
      "Tell me about a time you led a project or initiative without formal authority.",
      "Describe a time you influenced a team to adopt something they were initially skeptical of.",
      "Tell me about a time you had to step up when something was falling through the cracks."
    ],
    linkedTags: ["leadership", "cross-team"]
  },
  {
    competency: "Collaboration / Teamwork",
    googleDefinition: "Google evaluates how you work across teams and functions — sharing context, resolving disagreements constructively, and putting the team's goal above being right. They listen for genuine credit-sharing and how you handle working with people unlike you.",
    sampleQuestions: [
      "Tell me about a time you worked with a difficult teammate or stakeholder.",
      "Describe a project where you had to coordinate across multiple teams to deliver.",
      "Tell me about a time you disagreed with a colleague's technical approach. How did you resolve it?"
    ],
    linkedTags: ["cross-team", "tooling", "mcp"]
  },
  {
    competency: "Comfort with Ambiguity",
    googleDefinition: "Google explicitly screens for thriving without a spec — making progress when requirements, ownership, or data are unclear, and adapting as things change. They want to see you form a plan under uncertainty, state assumptions, and iterate rather than freeze.",
    sampleQuestions: [
      "Tell me about a time you were given a vague problem with no clear owner or requirements.",
      "Describe a time priorities shifted mid-project. How did you adapt?",
      "Tell me about a decision you made with incomplete information."
    ],
    linkedTags: ["ambiguity", "solo-project", "system-design"]
  },
  {
    competency: "Ownership / Bias for Action",
    googleDefinition: "Google values people who treat problems as theirs to fix — noticing gaps nobody assigned, driving them to done, and preferring a reversible action now over a perfect plan later. They probe follow-through: did you stay with it until the impact landed?",
    sampleQuestions: [
      "Tell me about a time you noticed a problem outside your responsibilities and fixed it.",
      "Describe something you built or improved that nobody asked you to.",
      "Tell me about a time you pushed a project over the finish line when momentum stalled."
    ],
    linkedTags: ["ownership", "automation", "impact"]
  },
  {
    competency: "Handling Failure / Conflict",
    googleDefinition: "Google wants intellectual humility: owning mistakes plainly, updating your view when the data disagrees with you, and turning failure into a concrete process change. Blame-shifting or 'my only weakness is caring too much' answers are red flags.",
    sampleQuestions: [
      "Tell me about a time you failed. What did you learn and change afterward?",
      "Describe a time you received hard feedback. How did you respond?",
      "Tell me about a production incident or serious bug you caused or owned. What happened next?"
    ],
    linkedTags: ["debugging", "on-call", "reliability"]
  }
];
