/* ============================================================
   UVIG SITE CONTENT
   Edit this file to update events or team info across the whole
   site — index.html, events.html and team.html all read from here.
   No HTML editing required for routine updates.
   ============================================================ */

// ---------- UPCOMING EVENTS (2026/27 season) ----------
// Add new events to the top or bottom — order doesn't matter,
// the site sorts by date automatically.
const UVIG_UPCOMING = [
  {
    id: "kickoff-longship",
    title: "Kickoff Event With Longship Investment Club",
    dateDisplay: "September 23",
    isoDate: "2026-09-23",
    time: "TBD",
    venue: "TBD",
    partner: "Longship Investment Club",
    speakers: "UVIG & Longship Exec(s)",
    blurb: "An evening of mentorship, guidance and career exploration in finance — co-hosted with Longship Investment Club. Anyone welcome."
  },
  {
    id: "girls-that-invest",
    title: "UVIG x Girls That Invest",
    dateDisplay: "October 7",
    isoDate: "2026-10-07",
    time: "TBD",
    venue: "TBD",
    partner: "UVic Girls That Invest",
    speakers: "TBD",
    blurb: "A joint session with UVic Girls That Invest — details on speakers and format to follow."
  },
  {
    id: "wealth-management-panel",
    title: "Wealth Management Panel",
    dateDisplay: "October 20",
    isoDate: "2026-10-20",
    time: "TBD",
    venue: "TBD",
    partner: "TBD",
    speakers: "TBD",
    blurb: "Learn from and network with wealth management professionals. Past panels have featured speakers from TD, RBC and Scotiabank."
  },
  {
    id: "finance-social",
    title: "Finance Social",
    dateDisplay: "November 10",
    isoDate: "2026-11-10",
    time: "TBD",
    venue: "Maude Hunter's",
    partner: "TBD",
    speakers: "N/A",
    blurb: "A casual social to meet other students interested in finance — no agenda, just conversation and networking."
  },
  {
    id: "asset-management-panel",
    title: "Asset Management Panel",
    dateDisplay: "November 24",
    isoDate: "2026-11-24",
    time: "TBD",
    venue: "TBD",
    partner: "TBD",
    speakers: "TBD",
    blurb: "Hear from professionals working in asset management and investment roles. Open to everyone, no finance background required."
  }
];

// ---------- PAST EVENTS (selected highlights) ----------
// Pulled from the club's Instagram history. Exact years weren't
// legible on every poster, so isoDate is approximate / omitted
// where unclear — safe to correct these once you know the year.
const UVIG_PAST = [
  {
    title: "Longship Investment Club & Career Paths in Finance",
    dateDisplay: "September 15",
    venue: "McKinnon 150",
    tag: "Kickoff",
    blurb: "Season kickoff co-hosted with Longship Investment Club — mentorship, guidance and career exploration in finance."
  },
  {
    title: "Exploring Careers in Financial Services",
    dateDisplay: "September 24",
    venue: "DSB C125",
    tag: "Panel",
    blurb: "A panel discussion hosted with UVic Women in Finance featuring insights from UVic alumni."
  },
  {
    title: "Breaking into Asset Management",
    dateDisplay: "October 21",
    venue: "DSB C108",
    tag: "Panel",
    blurb: "UVic alumni in asset management and investment roles shared career journeys and practical advice on portfolio management and research."
  },
  {
    title: "Annual Finance Networking Event",
    dateDisplay: "October 23",
    venue: "David Strong Building C118",
    tag: "Networking",
    blurb: "Doors, panelist Q&A, networking and close — a full evening connecting students with finance professionals in Victoria."
  },
  {
    title: "Professional Development Workshop",
    dateDisplay: "October 26",
    venue: "David Strong Building C130",
    tag: "Workshop",
    blurb: "Skills-focused workshop session for members."
  },
  {
    title: "UVIG x CSS Finance Lunch",
    dateDisplay: "October 27 & February 24",
    venue: "Michele Pujol Room, SUB",
    tag: "Partner event",
    blurb: "A recurring sandwich-buffet networking lunch run with the Commerce Students' Society, featuring finance professionals as speakers.",
    speakers: ["Shaun Rosson — Certified Financial Planner, VP Wealth Management"]
  },
  {
    title: "People in Finance Social",
    dateDisplay: "November 6",
    venue: "Maude Hunter's Pub",
    tag: "Social",
    blurb: "A relaxed chance to meet fellow finance students and AIMC/APMP alumni."
  },
  {
    title: "Women in Capital Markets",
    dateDisplay: "November 8",
    venue: "DSB C128",
    tag: "Partner event",
    blurb: "Co-hosted with YWiB (Young Women in Business) — guest speakers on careers in capital markets."
  },
  {
    title: "Asset Management Panel",
    dateDisplay: "November 24",
    venue: "David Strong Building C118",
    tag: "Panel",
    blurb: "Four professionals working in asset management and investment roles shared their stories. Open to everyone.",
    speakers: [
      "James Alder, CFA — Portfolio Manager, Westerkirk Capital",
      "Ian Johnson, CFA — Director of Investments, Victoria Foundation",
      "Mac Costigan — Analyst, Alternative Investments, Westerkirk Capital",
      "Hayden Ford, CFA — Senior Associate, Derivatives, BCI"
    ]
  },
  {
    title: "UVic Alumni in Finance Panel",
    dateDisplay: "December 5",
    venue: "Virtual",
    tag: "Panel",
    blurb: "A virtual panel connecting current students with UVic alumni now working across finance."
  },
  {
    title: "Interview Prep & Interview Essentials Series",
    dateDisplay: "January 15 – February 14",
    venue: "Zoom / DSB",
    tag: "Workshop series",
    blurb: "Multi-part series covering behavioral prep, technical prep and a mock-interview clinic ahead of internship application season."
  },
  {
    title: "Gateway to Venture Capital (adVENTURE Series)",
    dateDisplay: "February 11",
    venue: "DSB C103",
    tag: "Partner event",
    blurb: "An interactive night with CVCA (Canadian Venture Capital Association) featuring a hands-on pitch-style fund management challenge and Q&A with industry leaders."
  },
  {
    title: "UVIG Stock Picking Competition",
    dateDisplay: "February 15 – February 14",
    venue: "Club-wide",
    tag: "Competition",
    blurb: "Annual portfolio challenge. 2024–25 winner Marcus Jensen posted a ~110% return, ending value $209,940.69.",
    highlight: true
  },
  {
    title: "WSO Q&A Session with Patrick Curtis",
    dateDisplay: "Friday",
    venue: "Virtual",
    tag: "Partner event",
    blurb: "Q&A with the CEO of Wall Street Oasis, announcing UVIG's member partnership: bootcamps, Bloomberg access and course discounts.",
    speakers: ["Patrick Curtis — CEO, Wall Street Oasis"]
  },
  {
    title: "Wealth Management Panel",
    dateDisplay: "April 2",
    venue: "David Strong Building C118",
    tag: "Panel",
    blurb: "Learn from and network with wealth management professionals from TD, RBC and Scotiabank."
  }
];

// ---------- FIRMS & PARTNERS represented at past events ----------
const UVIG_FIRMS = [
  "BCI", "TD", "RBC", "Scotiabank", "CIBC Capital Markets",
  "Connor, Clark & Lunn Private Capital", "Westerkirk Capital",
  "Wall Street Oasis", "CVCA", "Victoria Foundation", "Dominion Securities"
];

// ---------- SPEAKERS who have joined past events ----------
const UVIG_SPEAKERS = [
  { name: "James Alder, CFA", role: "Portfolio Manager, Westerkirk Capital" },
  { name: "Ian Johnson, CFA", role: "Director of Investments, Victoria Foundation" },
  { name: "Mac Costigan", role: "Analyst, Alternative Investments, Westerkirk Capital" },
  { name: "Hayden Ford, CFA", role: "Senior Associate, Derivatives, BCI" },
  { name: "Alicia Armstrong, CFA", role: "Associate Portfolio Manager, Canadian Large Cap, BCI" },
  { name: "Amy McTavish", role: "Senior Analyst, ESG, BCI" },
  { name: "Lauren Minogue, CFA, CFP", role: "Wealth Advisor, Connor, Clark & Lunn Private Capital" },
  { name: "Valery Heckel", role: "Equity Research Associate, CIBC Capital Markets" },
  { name: "Patrick Curtis", role: "CEO, Wall Street Oasis" },
  { name: "Shaun Rosson", role: "Certified Financial Planner, VP Wealth Management" }
];

// ---------- TEAM (2026-2027) ----------
const UVIG_TEAM = {
  presidents: [
    { name: "George Murray", role: "Co-President" },
    { name: "Will Hansen", role: "Co-President" }
  ],
  board: [
    { name: "Alicia Armstrong", role: "Board Chair" },
    { name: "Alicia Voss", role: "Board Member" },
    { name: "Samantha Toms", role: "Board Member" },
    { name: "Sascha Jansen-Rudan", role: "Board Member" },
    { name: "Sheri Love", role: "Board Member" },
    { name: "Steven Fan", role: "Board Member" }
  ],
  external: [
    { name: "Jayce Tenove", role: "Director of External" },
    { name: "Manuel Donelly", role: "VP of Marketing" },
    { name: "Quinn Bragagnolo", role: "VP of Events" },
    { name: "Aliyah Minter", role: "Director of Club Relations — Partnership lead with UVic Girls That Invest" }
  ],
  internal: [
    { name: "Cohen Einarson", role: "Director of Internal" },
    { name: "Kamren Shah", role: "VP of Internal" },
    { name: "Mariah Luzon", role: "Analyst" },
    { name: "Carter Guerin", role: "Analyst" },
    { name: "Owen Harrington", role: "Analyst" },
    { name: "Maia Bell", role: "Analyst" }
  ]
};
