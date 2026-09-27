/* ============================================================
   UVIG SURVEYS: content file
   This is the only file you need to edit to change survey questions.

   Each survey is a short, opinion-based multiple-choice flow (no
   right/wrong answers — the Surveys page times how fast someone
   gets through it, for the leaderboard). Add or remove questions
   freely; options can be any length, 2-6 per question works best.

   These are DRAFT questions to get the page working end-to-end —
   swap in the real ones whenever they're ready.
   ============================================================ */

const SURVEYS = {
  newsletter: {
    id: "newsletter",
    title: "Newsletter Survey",
    subtitle: "Help us make the Market Brief better. A few quick questions, no wrong answers.",
    questions: [
      { q: "How often do you read the UVIG Market Brief?", options: ["Every issue", "Most issues", "Occasionally", "This is news to me"] },
      { q: "Which section do you find most useful?", options: ["Market Pulse", "Sector Spotlight", "Club Digest", "The puzzles"] },
      { q: "How would you rate the newsletter's length?", options: ["Too short", "Just right", "Too long"] },
      { q: "Would you recommend the Market Brief to a friend?", options: ["Definitely", "Probably", "Not sure", "No"] },
      { q: "What should we add more of?", options: ["Market analysis", "Event recaps", "Career & recruiting content", "Puzzles & trivia"] }
    ]
  },
  website: {
    id: "website",
    title: "Website Survey",
    subtitle: "A minute of feedback on the new site. Multiple-choice, no wrong answers.",
    questions: [
      { q: "How easy was it to find what you were looking for?", options: ["Very easy", "Easy", "Neutral", "Difficult"] },
      { q: "What do you use the site for most?", options: ["Checking events", "Reading research", "Joining / membership", "Just browsing"] },
      { q: "How would you rate the overall design?", options: ["Love it", "It's good", "It's okay", "Not for me"] },
      { q: "Did you try the Weekly Puzzles?", options: ["Yes, love them", "Tried once", "Didn't know they existed", "Not interested"] },
      { q: "Anything missing from the site?", options: ["More research", "More events", "A members area", "Nothing, it's great"] }
    ]
  }
};
