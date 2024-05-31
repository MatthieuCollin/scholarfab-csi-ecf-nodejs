// fetch des données de la bdd  notes
async function createNote(
  db,
  { title, content, owner, created_at, updated_at }
) {
  return new Promise(async (resolve, reject) => {
    const stmt = db.prepare(
      "INSERT INTO notes(title, content, owner_id, created_at, updated_at) VALUES (?,?,?,?,?)"
    );
    stmt.run([title, content, owner, created_at, updated_at], (err, data) => {
      const p = err ? err : data;
      (err ? reject : resolve)(p);
    });
  });
}

async function deleteNote(db, { note_id }) {
  return new Promise(async (resolve, reject) => {
    const stmt = db.prepare("delete from notes where notes.id = ?");
    stmt.run([note_id], (err, data) => {
      const p = err ? err : data;
      (err ? reject : resolve)(p);
    });
  });
}

export async function modifyNote(req, res) {
  const { app, method } = req;

  const db = app.get("g:db");

  try {
    res.render("note_form", {
      response: await getNote(db, req.query.note_id),
    });
  } catch (err) {
    res.redirect("/error", err);
  }
}

export async function handleDeleteNote(req, res) {
  const { app, method } = req;

  const db = app.get("g:db");

  try {
    let response = await deleteNote(db, { note_id: req.params.id });
    res.redirect("/note");
  } catch (err) {
    res.redirect("/error", err);
  }
}

export async function handleCreateNote(req, res) {
  const { app, method } = req;
  const db = app.get("g:db");

  const owner = req.session.user.id;
  const { title, content } = req.body;
  const date = Date.now();

  //   console.log({ title, content, owner, date, date });

  try {
    await createNote(db, { title, content, owner, date, date });
    res.redirect("/note");
  } catch (err) {
    res.redirect("/error", err);
  }
}

// fetch des données de la bdd avec comme param l'id de la note
async function getNote(db, noteId) {
  return new Promise(async (resolve, reject) => {
    const stmt = db.prepare(
      `SELECT notes.*, users.lastname, users.firstname from notes
      INNER join users on users.id = notes.owner_id
      where notes.id = ${noteId};`
    );
    stmt.all((err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function getNotes(db) {
  return new Promise(async (resolve, reject) => {
    const stmt =
      db.prepare(`SELECT notes.*, users.lastname, users.firstname from notes
    INNER join users on users.id = notes.owner_id;`);
    stmt.all((err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function handleGetNotes(req, res) {
  const { app, method } = req;

  const db = app.get("g:db");

  if (method == "GET" && req.query.note_id) {
    try {
      res.render("note_view", {
        response: await getNote(db, req.query.note_id),
      });
    } catch (err) {
      res.redirect("/error", err);
    }
  } else if (method == "GET") {
    try {
      //   let response = await getNote(db);
      res.render("note", { response: await getNotes(db) });
    } catch (err) {
      res.redirect("/error", err);
    }
  }
}
