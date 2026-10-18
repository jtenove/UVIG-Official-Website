/* ============================================================
   UVIG CONTENT BACKEND (Supabase) — public connection settings
   Both values are safe to publish: the "publishable"/anon key
   only allows what the database's Row Level Security rules allow
   (anyone can READ site content; only the admin emails listed in
   the site_admins table can WRITE it).

   NEVER paste the service_role / secret key here.

   Leave both empty and the site simply uses the built-in content
   from data.js, puzzles-data.js and survey-feedback-data.js.
   ============================================================ */
window.UVIG_SUPABASE = {
  url: "",
  anonKey: ""
};
