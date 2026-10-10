/* ------------------------------------------------------------------
   MindSathi AI – configuration
   apiUrl: URL of YOUR backend endpoint that talks to an AI model.
   Leave it empty to run in demo mode (simple built-in replies).

   NEVER put an AI provider API key in this file – anything in a
   front-end file is public once pushed to GitHub. Keep keys on a server.

   Your endpoint should accept:
     POST { messages: [{role, text}], language: "ml" }
   and return:
     { reply: "text to show the user" }
------------------------------------------------------------------- */
window.MINDSATHI_CONFIG = {
  apiUrl: ""
};
