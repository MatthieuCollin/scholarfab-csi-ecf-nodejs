// Votre travail doit être effectué principalement dans ce fichier ...

import {
  handleCreateNote,
  handleDeleteNote,
  handleGetNotes,
  modifyNoteView,
} from "../services/notes.service.mjs";

export function loadApplicationController(app) {
  const db = app.get("g:db");

  app.get("/note", (req, res) => handleGetNotes(req, res));

  app.get("/note/add", (req, res) => res.render("note_form"));
  app.get("/note/edit/:id", (req, res) => modifyNoteView(req, res));
  app.all("/note", (req, res) => handleCreateNote(req, res));
  app.get("/note/delete/:id", (req, res) => handleDeleteNote(req, res));
  app.get("/error", (req, res) => console.log(req.err));

  // définir les routes de l'application ici ...
}
