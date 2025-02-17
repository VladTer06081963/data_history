/** @format */

const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const dataPath = path.join(__dirname, "data", "events.json");

function readEvents() {
  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read events:", error);
    return [];
  }
}
function writeEvents(events) {
  fs.writeFileSync(dataPath, JSON.stringify(events, null, 2));
}
app.get("/", (req, res) => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1; // Месяцы в JavaScript начинаются с 0

  const events = readEvents().filter(
    (event) => event.day === day && event.month === month
  );
  res.render("index", { events });
});

app.get("/ru", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ru.html"));
});

app.get("/admin", (req, res) => {
  const events = readEvents();
  res.render("admins/admin", { events });
});
app.get("/admin/add", (req, res) => {
  res.render("admins/edit", { event: null });
});
app.post("/admin/add", (req, res) => {
  const events = readEvents();
  const newEvent = {
    id: events.length ? events[events.length - 1].id + 1 : 1,
    day: parseInt(req.body.day),
    month: parseInt(req.body.month),
    year: parseInt(req.body.year),
    description: req.body.description,
  };
  events.push(newEvent);
  writeEvents(events);
  res.redirect("/admin");
});
app.get("/admin/edit/:id", (req, res) => {
  const events = readEvents();
  const event = events.find((e) => e.id === parseInt(req.params.id));
  res.render("admins/edit", { event });
});

app.post("/admin/edit/:id", (req, res) => {
  const events = readEvents();
  const index = events.findIndex((e) => e.id === parseInt(req.params.id));
  if (index !== -1) {
    events[index] = {
      id: events[index].id,
      day: parseInt(req.body.day),
      month: parseInt(req.body.month),
      year: parseInt(req.body.year),
      description: req.body.description,
    };
    writeEvents(events);
  }
  res.redirect("/admin");
});
app.get("/admin/delete/:id", (req, res) => {
  const events = readEvents().filter((e) => e.id !== parseInt(req.params.id));
  writeEvents(events);
  res.redirect("/admin");
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
