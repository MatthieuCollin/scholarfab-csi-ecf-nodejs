import { compare } from "bcrypt";

import { createUser } from "../services/user.service.mjs";

async function handleRegistration(req, res) {
  const { app, method } = req;
  const db = app.get("g:db");

  if (req.session.user) {
    return res.redirect("/");
  }
  if (method == "GET") {
    return res.render("register");
  }

  const { email, firstname, lastname, password } = req.body;

  try {
    await createUser(db, { email, firstname, lastname, password });
    res.redirect("/login");
  } catch (err) {
    res.redirect("/register");
  }
}

export function loadRegistrationController(app) {
  app.all("/register", handleRegistration);
}
