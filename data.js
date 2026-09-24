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
    time: "6:00 PM",
    venue: "McKinnon Building, Room 150",
    partner: "Longship Investment Club",
    speakers: "UVIG & Longship Exec(s)",
    blurb: "An evening of mentorship, guidance and career exploration in finance, co-hosted with Longship Investment Club. Open to all students, no experience necessary.",
    status: "confirmed",
    cardStyle: "flyer"
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
    blurb: "A joint session with UVic Girls That Invest. Details on speakers and format to follow.",
    status: "planned"
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
    blurb: "Learn from and network with wealth management professionals. Past panels have featured speakers from TD, RBC and Scotiabank.",
    status: "planned"
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
    blurb: "A casual social to meet other students interested in finance. No agenda, just conversation and networking.",
    status: "planned"
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
    blurb: "Hear from professionals working in asset management and investment roles. Open to everyone, no finance background required.",
    status: "planned"
  }
];
// "status: confirmed" events get the full treatment (calendar add, top billing).
// "status: planned" events show as a lighter "not yet confirmed" preview —
// flip to "confirmed" once a date/venue is locked in.

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
    blurb: "Season kickoff co-hosted with Longship Investment Club: mentorship, guidance and career exploration in finance.",
    photos: ["photo-longship-1.jpg", "photo-longship-2.jpg"]
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
    blurb: "Doors, panelist Q&A, networking and close: a full evening connecting students with finance professionals in Victoria."
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
    speakers: ["Shaun Rosson, CFP: IG Wealth Management"],
    photos: ["photo-css-lunch-1.jpg", "photo-css-lunch-2.jpg"]
  },
  {
    title: "People in Finance Social",
    dateDisplay: "November 6",
    venue: "Maude Hunter's Pub",
    tag: "Social",
    blurb: "A relaxed chance to meet fellow finance students and AIMC/APMP alumni.",
    photos: ["photo-finance-social-1.jpg", "photo-finance-social-2.jpg"]
  },
  {
    title: "Asset Management Panel",
    dateDisplay: "November 24",
    venue: "David Strong Building C118",
    tag: "Panel",
    blurb: "Four professionals working in asset management and investment roles shared their stories. Open to everyone.",
    speakers: [
      "James Alder, CFA: Portfolio Manager, Westerkirk Capital",
      "Ian Johnson, CFA: Director of Investments, Victoria Foundation",
      "Mac Costigan: Analyst, Alternative Investments, Westerkirk Capital",
      "Hayden Ford, CFA: Senior Associate, Derivatives, BCI"
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
    speakers: ["Patrick Curtis: CEO, Wall Street Oasis"]
  },
  {
    title: "Wealth Management Panel",
    dateDisplay: "April 2",
    venue: "David Strong Building C118",
    tag: "Panel",
    blurb: "Learn from and network with wealth management professionals from TD, RBC and Scotiabank."
  }
];

// ---------- EQUITY REPORTS (Latest coverage) ----------
// Placeholder until the real report titles from last year's Brightspace
// archive are dropped in here. Each needs: title, sector, and optionally
// a link once reports have a real destination.
const UVIG_REPORTS = [
  {
    title: "Sector Report: Healthcare",
    sector: "Healthcare",
    authors: "Kavin Bawa, Émilie Doyon, Jonathan Khoo & Peter Mikulash",
    date: "October 2025",
    blurb: "A look at the healthcare sector's growth drivers: AI in clinical care, an aging population, and coverage of Johnson & Johnson, Roche, UnitedHealth, and Medtronic.",
    pdf: "report-healthcare-2025.pdf"
  },
  {
    title: "Sector Report: Transportation",
    sector: "Transportation",
    authors: "Kavin Bawa, Émilie Doyon, Jonathan Khoo & Peter Mikulash",
    date: "November 2025",
    blurb: "An analysis of the $8.54T global transportation sector: freight modes, sustainability and digitization trends, and coverage of Delta, Maersk, and Canadian National Railway.",
    pdf: "report-transportation-2025.pdf"
  },
  {
    title: "Sector Report: Consumer Discretionary",
    sector: "Consumer Discretionary",
    authors: "Kavin Bawa, Émilie Doyon, Jonathan Khoo & Peter Mikulash",
    date: "September 2025",
    blurb: "Covering the $13.66T consumer discretionary market: digitization and sustainability trends, and analysis of Amazon, McDonald's, Nike, and Tesla.",
    pdf: "report-consumer-discretionary-2025.pdf"
  },
  {
    title: "Consumer Staples sector coverage",
    sector: "Coming soon",
    pending: true,
    comingSoon: true
  }
];

// ---------- JOIN QUIZ: areas of finance/investing interest ----------
// Draft reframe per Will's request — "what areas of finance/investing
// interest you" with careers listed, rather than activity checkboxes.
// Flagged as a draft for review — swap wording freely.
const UVIG_INTERESTS = [
  { area: "Equity & Public Markets", careers: "Equity research, asset management, portfolio management" },
  { area: "Investment Banking & Corporate Finance", careers: "M&A, capital markets, corporate development" },
  { area: "Wealth & Private Client", careers: "Wealth advisory, financial planning" },
  { area: "Venture Capital & Private Equity", careers: "VC analyst, PE associate" },
  { area: "Trading & Derivatives", careers: "Sales & trading, quantitative trading" },
  { area: "Just here for the newsletter & events", careers: "Keep me in the loop" }
];

// ---------- FIRMS & PARTNERS represented at past events ----------
const UVIG_FIRMS = [
  "BCI", "TD", "RBC Dominion Securities", "Scotiabank", "CIBC Capital Markets",
  "Connor, Clark & Lunn Private Capital", "Westerkirk Capital",
  "Wall Street Oasis", "CVCA", "Victoria Foundation",
  "Raymond James", "IG Wealth Management", "Vancity Investment Management",
  "Island Savings", "FWCU", "Emend", "inBC", "Emmertech"
];

// ---------- SPEAKERS who have joined past events ----------
// Grouped by category, sorted alphabetically by first name within each —
// full list supplied by George Murray (Co-President), replacing the
// shorter earlier version.
const UVIG_SPEAKERS = [
  {
    category: "Asset Management & Institutional Investing",
    people: [
      { name: "Alicia Armstrong, CFA", role: "Associate Portfolio Manager, Global, BCI" },
      { name: "Amy McTavish", role: "ESG, BCI" },
      { name: "Hayden Ford, CFA", role: "Senior Associate, Derivatives, BCI" },
      { name: "Ian Johnson, CFA", role: "Director of Investments, Victoria Foundation" },
      { name: "Jade Prezeau", role: "Senior Analyst, Private Debt, BCI" },
      { name: "James Alder, CFA", role: "Portfolio Manager, Westerkirk Capital" },
      { name: "Mac Costigan", role: "Analyst, Alternative Investments, Westerkirk Capital" }
    ]
  },
  {
    category: "Wealth Management & Banking",
    people: [
      { name: "Chelsey Rossner", role: "Branch Manager, RBC Dominion Securities" },
      { name: "Cristina Fazio, BA, CFP, CIM", role: "Associate Advisor, RBC Dominion Securities" },
      { name: "Graydon McQuibban", role: "Senior Wealth Advisor, Raymond James" },
      { name: "Harld Seleman", role: "Public Equities, Vancity Investment Management" },
      { name: "James Anderton", role: "Senior Manager, Business Performance, FWCU" },
      { name: "Jermey Hendrix", role: "Branch Manager, Island Savings" },
      { name: "Larry Wheeler", role: "Retired Associate Director, Scotiabank" },
      { name: "Lauren Minogue, CFA, CFP", role: "Wealth Advisor, Connor, Clark & Lunn Private Capital" },
      { name: "Loerna Milkert", role: "Director, Retail Banking, Island Savings" },
      { name: "Shaun Rosson, CFP", role: "IG Wealth Management" },
      { name: "Valery Heckel", role: "Equity Research Associate, CIBC Capital Markets" }
    ]
  },
  {
    category: "Venture Capital & Fintech",
    people: [
      { name: "Evan Machin", role: "inBC" },
      { name: "Patrick Curtis", role: "CEO, Wall Street Oasis" },
      { name: "Rob Russell", role: "Emmertech" },
      { name: "Todd Tessier", role: "Emend" }
    ]
  }
];

// ---------- TEAM (2026-2027) ----------
const UVIG_TEAM = {
  presidents: [
    { name: "Will Hansen", role: "Co-President", major: "BA Economics", year: "'28" },
    { name: "George Murray", role: "Co-President", major: "BCom", year: "'28" }
  ],
  board: [
    { name: "Alicia Armstrong, CFA", role: "Board Chair", firm: "Associate Portfolio Manager, BCI" },
    { name: "Sheri Love", role: "Director", firm: "UVic BCom Co-op Coordinator" },
    { name: "Alicia Voss, CFA", role: "Director", firm: "Associate, Derivatives, Collateral & Engineering, BCI" },
    { name: "Steven Fan, CFA", role: "Director", firm: "Investment Analyst, UVic Treasury" },
    { name: "Samantha Toms", role: "Director", firm: "Board Member" },
    { name: "Sascha Jansen-Rudan", role: "Director", firm: "Former UVIG President" }
  ],
  external: [
    { name: "Jayce Tenove", role: "Director of External", major: "BCom", year: "'28", featured: true },
    { name: "Manuel Donelly", role: "VP of Marketing", major: "BCom", year: "'27" },
    { name: "Quinn Bragagnolo", role: "VP of Events", major: "BCom", year: "'28" },
    { name: "Aliyah Minter", role: "Director of Club Relations", major: "BCom", year: "'28" }
  ],
  internal: [
    { name: "Cohen Einarson", role: "Director of Internal", major: "BCom", year: "'28", featured: true },
    { name: "Kamren Shah", role: "VP of Internal", major: "BA Economics", year: "'28" },
    { name: "Maia Bell", role: "Analyst", major: "BCom", year: "'27" },
    { name: "Mariah Luzon", role: "Analyst", major: "BA Economics", year: "'27" },
    { name: "Carter Guerin", role: "Analyst", major: "BA Economics", year: "'28" },
    { name: "Owen Harrington", role: "Analyst", major: "BSc Economics", year: "'29" }
  ]
};
