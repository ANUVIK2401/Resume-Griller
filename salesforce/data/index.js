/* Salesforce MTS action plan. Edit freely; the page re-renders from this file. */
const SF_PAGE = {
  key: 'index',
  sections: [
    {
      title: 'Interview process (from 2026 MTS reports)',
      intro: 'Typical loop: recruiter screen, hiring manager call, coding screen (HackerRank or take-home), then a virtual onsite of 3 to 5 rounds of about 45 min. Confirm the exact rounds with Mary.',
      items: [
        { title: 'Recruiter screen with Mary Baldwin', meta: '15-20 min', notes: 'Pitch, why Salesforce, timeline (Dec 2026 grad, January start), work authorization, comp deferred until leveling is clear.', tags: ['process'] },
        { title: 'Hiring manager call with Sirisha Palla', meta: '45 min', notes: 'Project deep dive and role fit. Lead with Oracle MTTR, then agentic work. Expect "Why Salesforce?"', tags: ['process'] },
        { title: 'Coding screen', meta: '60 min', notes: 'Two LeetCode mediums on HackerRank, or a take-home. See the DSA page.', tags: ['process', 'dsa'] },
        { title: 'Onsite: DSA round', meta: '45 min', notes: 'Reported: task scheduling under memory and concurrency limits, and grid BFS with jumps of 1 to K cells.', tags: ['process', 'dsa'] },
        { title: 'Onsite: LLD round', meta: '45 min', notes: 'Reported: a component that logs and persists workflow step state transitions. Opens with a resume walkthrough.', tags: ['process', 'design'] },
        { title: 'Onsite: System design round', meta: '45-60 min', notes: 'Reported: real-time notifications for millions of users. For this team, expect observability or incident tooling.', tags: ['process', 'design'] },
        { title: 'Onsite: Behavioral and values', meta: '45 min', notes: 'STAR on leadership and teamwork, plus V2MOM and Salesforce values.', tags: ['process', 'behavioral'] },
        {
          title: 'Source reports', tags: ['process'],
          links: [
            { label: 'Glassdoor MTS (Jul 2026)', url: 'https://www.glassdoor.com.ar/Entrevista/Salesforce-Entrevista-E11159-RVW66434753.htm' },
            { label: 'LeetCode MTS loop (Apr 2026)', url: 'https://leetcode.com/discuss/post/7785889/salesforce-mts-interview-experience-by-a-73wh/' },
            { label: 'Glassdoor SWE SF, 3 weeks', url: 'https://www.glassdoor.com.mx/Entrevista/Salesforce-Entrevista-E11159-RVW100030311.htm' }
          ]
        }
      ]
    },
    {
      title: 'Week-by-week timeline',
      items: [
        { title: 'Thu Oct 8: follow up with Mary at 9:00 AM PT', notes: 'Reply on the same thread with fresh slots for Thu, Fri, and Mon. Nudge once more Mon Oct 12 if silent.', tags: ['week-1'] },
        { title: 'Oct 8 to 12: recruiter call ready', notes: '60-second pitch rehearsed out loud 3 times. Questions for Mary written down.', tags: ['week-1'] },
        { title: 'Oct 12 to 19: hiring manager call ready', notes: 'JD-to-proof table memorized. AI incident triage agent design sketched. 4 questions for Sirisha.', tags: ['week-2'] },
        { title: 'Oct 12 to 26: DSA, 2 problems per day', notes: 'Finish the "Must do" and "Reported loop" sections on the DSA page first.', tags: ['week-2', 'week-3'] },
        { title: 'Oct 19 to Nov 2: design reps', notes: '2 LLD and 2 system design sessions per week, timed at 45 min, drawn on a whiteboard tool.', tags: ['week-3', 'week-4'] },
        { title: 'Oct 19 to Nov 2: AI concept gaps', notes: 'RAG, DSPy and RAGAS, OTEL tracing, service mesh, Vertex AI. See the AI page.', tags: ['week-3', 'week-4'] },
        { title: 'Before onsite: 2 full mock loops', notes: 'One coding plus LLD, one system design plus behavioral. Record and review.', tags: ['week-4'] },
        { title: 'After every round: thank-you note within 24 hours', notes: 'Reference one specific thing discussed.', tags: ['process'] }
      ]
    },
    {
      title: 'Recruiter call prep',
      items: [
        { title: '60-second pitch', notes: 'Oracle observability (37K tenants, P1 MTTR 94 to 26 min), then multi-agent LLM systems (MSRcosmos, PacSun), then why AI SRE on GCP is the next step.', tags: ['recruiter'] },
        { title: 'Why Salesforce', notes: 'Agentforce on GCP with Gemini, AI SRE at Salesforce scale. You already built the manual version of this at Oracle.', tags: ['recruiter'] },
        { title: 'Logistics answers ready', notes: 'Graduation Dec 2026, January 2027 start, work authorization in one sentence, comp deferred until level is known.', tags: ['recruiter'] },
        { title: 'Ask Mary', notes: 'Exact rounds after Sirisha, coding screen format, MTS vs SMTS leveling, team size and location, decision timeline.', tags: ['recruiter'] },
        { title: 'Check comp bands', url: 'https://www.levels.fyi/companies/salesforce/salaries/software-engineer', notes: 'MTS band by location, so you can give a range if pushed.', tags: ['recruiter'] }
      ]
    },
    {
      title: 'Hiring manager call: JD to proof',
      intro: 'Lead story: Oracle P1 MTTR 94 to 26 min with root cause auto-tagging. Frame it as the manual version of AI SRE tooling, then say how you would make it agentic.',
      items: [
        { title: 'AI SRE tooling, MTTD/MTTR', anchor: 'Oracle: real-time API diagnostics over 1M+ endpoints, MTTR cut 72%.', tags: ['hm'] },
        { title: 'Monitoring: Prometheus, Grafana, OTEL', anchor: 'Oracle: 47 SLO dashboards and alerts over 37K tenants, 41% fewer false pages.', tags: ['hm'] },
        { title: 'Kubernetes and public cloud', anchor: 'Oracle: NSX on OCI, HPA on custom Prometheus metrics, p99 held at 2x peak.', tags: ['hm'] },
        { title: 'Agentic orchestration and tool use', anchor: 'MSRcosmos: LangGraph + MCP multi-agent ERP migration, 83% auto-approved, 3 days to 5.5 hours.', tags: ['hm'] },
        { title: 'LLM evals and model tradeoffs', anchor: 'AI Trust Lab 6-model benchmark; ModelScope quantization Pareto sweep.', tags: ['hm'] },
        { title: 'Engineering best practices, CI', anchor: 'Oracle: Jenkins pre-deploy validation adopted by 4 teams, failed deploys 11% to 4%.', tags: ['hm'] },
        { title: 'Presenting to executives', anchor: 'PacSun: agents that rank issues and draft CEO briefs.', tags: ['hm'] },
        { title: 'Questions for Sirisha', notes: 'Biggest MTTR gap today? How far along is the GCP migration? What does success look like in 6 months? Split between platform work and AI tooling?', tags: ['hm'] }
      ]
    },
    {
      title: 'Behavioral and Salesforce values',
      intro: 'Salesforce plans with V2MOM: Vision, Values, Methods, Obstacles, Measures. Core values: Trust, Customer Success, Innovation, Equality, Sustainability.',
      items: [
        { title: 'Frame one Oracle project as a V2MOM', notes: 'The observability platform works well: vision of SLO-based alerting, measures of 41% fewer pages and 72% faster MTTR.', tags: ['behavioral'] },
        { title: 'STAR: P1 incident under pressure', anchor: 'Oracle root cause auto-tagging.', tags: ['behavioral'] },
        { title: 'STAR: influence without authority', anchor: 'CLI validation toolchain adopted by 4 NSX teams.', tags: ['behavioral'] },
        { title: 'STAR: customer trust and data correctness', anchor: 'MSRcosmos human-in-the-loop review over financial records.', tags: ['behavioral'] },
        { title: 'STAR: presenting to executives', anchor: 'PacSun CEO briefs.', tags: ['behavioral'] },
        { title: 'STAR: working in agile, iterating under change', notes: 'JD asks for scrum/agile and a mindset to iterate and take risks. Use a sprint where scope moved and how you re-planned.', anchor: 'MSRcosmos: 12 client entities, each on its own cloud.', tags: ['behavioral'] },
        { title: 'STAR: a risky call or a failure', notes: 'Pick one with a clear lesson and what you changed afterward.', tags: ['behavioral'] },
        { title: 'Use the existing STAR bank', url: '../index.html', notes: 'Your Resume · STAR module already has these stories in full.', tags: ['behavioral'] }
      ]
    }
  ]
};
