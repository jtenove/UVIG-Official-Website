/* ============================================================
   UVIG FEEDBACK SURVEY: content file
   Edit this file to change the survey shown on /survey.html.
   No other file needs to change. Responses go to the "Survey"
   tab of the UVIG Google Sheet (the same Sheet the Join form
   uses).

   This is a separate, untimed feedback form — not the
   Newsletter/Website leaderboard quizzes on /surveys.html
   (those live in survey-data.js and keep working as-is).

   QUESTION TYPES
   - "rating": a 1-5 scale. Set "low" and "high" labels.
   - "choice": pick exactly one option.
   - "multi":  pick any number of options.
   - "text":   a written answer. "placeholder" is optional.

   OTHER FIELDS
   - "label": the column name in the Google Sheet. Keep it the
     same between survey rounds if you want answers to line up
     in the same column. New labels get a new column.
   - "required: true" means the person can't skip it.
     Everything else shows a Skip option.
   - "id": change it for each new survey round (e.g. at the
     start of each term). It's recorded in the Sheet so you can
     tell rounds apart.

   Name and email are asked for at the end and are optional.
   ============================================================ */

const SURVEY = {
  id: "2026-27-year-ahead",
  title: "Help shape UVIG",
  intro: "Four quick questions about the year ahead for UVIG and the Market Brief. Every response is read by the exec team.",
  estimate: "About 1 minute",

  questions: [
    {
      type: "multi",
      label: "Goals this year",
      q: "What do you most want to get out of UVIG this year?",
      options: ["Gaining industry connections", "Landing an internship", "Meeting like-minded students", "Understanding financial careers"],
      required: true
    },
    {
      type: "multi",
      label: "Preferred events",
      q: "What events would you enjoy the most?",
      options: ["Speaker panels", "Industry social events", "Stock and portfolio competitions", "Workshops"]
    },
    {
      type: "multi",
      label: "Newsletter favourites",
      q: "What did you enjoy the most about the newsletter?",
      options: ["Market recap", "Recruitment updates", "Upcoming events", "Games and trivia"]
    },
    {
      type: "text",
      label: "Improvement idea",
      q: "Please share one way we can make events or the newsletter a better experience.",
      placeholder: "Your idea here"
    }
  ]
};
