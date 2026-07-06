/* Common behavioral questions mapped to competencies. `linkedTags` should
   match tags used in star-bank.js so the app can suggest which of your
   stories answers each question. Add new entries any time. */

const BEHAVIORAL_BANK = [
  {
    competency: "Ownership",
    question: "Tell me about a time you owned a project end-to-end with no one else driving it.",
    guidance: "Pick a story where you made the calls, not just executed someone else's plan. Name the decision points you owned.",
    linkedTags: ["ownership", "solo-project"]
  },
  {
    competency: "Ambiguity",
    question: "Describe a situation where the requirements were unclear or kept changing.",
    guidance: "Show how you narrowed ambiguity — what you clarified first, what assumption you made explicit, and how you validated it before going further.",
    linkedTags: ["ambiguity"]
  },
  {
    competency: "Conflict",
    question: "Tell me about a disagreement with a teammate or manager and how you resolved it.",
    guidance: "Focus on the reasoning gap, not the personalities. What data or framing actually resolved it, and what would you do differently.",
    linkedTags: ["cross-team", "leadership"]
  },
  {
    competency: "Failure",
    question: "Describe a time something you built failed or caused an incident.",
    guidance: "Don't sanitize it — name the actual mistake, the blast radius, and the concrete process change that came out of it.",
    linkedTags: ["debugging", "reliability"]
  },
  {
    competency: "Leadership",
    question: "Tell me about a time you influenced a team without formal authority.",
    guidance: "Show what you did to get buy-in — a prototype, data, or a clear write-up — rather than asserting the answer.",
    linkedTags: ["leadership", "cross-team"]
  },
  {
    competency: "Impact",
    question: "What's the highest-impact thing you've shipped?",
    guidance: "Lead with the number. Be ready to defend how it was measured and whether it was causal or correlated with the change.",
    linkedTags: ["impact", "scale"]
  },
  {
    competency: "Speed",
    question: "Tell me about a time you had to move fast with an incomplete solution.",
    guidance: "Be explicit about what you deliberately cut and why it was safe to cut, not just that you moved fast.",
    linkedTags: ["speed"]
  },
  {
    competency: "Deep Dive",
    question: "Walk me through the most technically complex thing you've worked on.",
    guidance: "Go one layer deeper than the resume bullet — the interviewer wants to see you can explain the actual mechanism, not just the outcome.",
    linkedTags: ["deep-dive"]
  },
  {
    competency: "Prioritization",
    question: "Tell me about a time you had to choose between two competing priorities.",
    guidance: "Name the actual tradeoff (not a false one) and the criteria you used to decide — cost, risk, or reversibility are usually the real axis.",
    linkedTags: ["tradeoffs"]
  },
  {
    competency: "Learning",
    question: "Tell me about a time you had to learn something unfamiliar quickly to get a project done.",
    guidance: "Show the learning process itself — how you validated you actually understood it, not just that you eventually shipped.",
    linkedTags: ["deep-dive", "personal-project"]
  }
];
