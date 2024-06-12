import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "TimeManagementApp",
  password: "0710",
  port: 5432,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// let events = [
//   {
//     id: 1,
//     content: "Guitar Practice",
//     priority: 5,
//   },
// ];

let count = 0;
// if count is even -> sort ascending order, else sort descending order

async function fillEvents() {
  let events = [];
  if (count % 2 == 0) {
    const result = await db.query(
      "SELECT * FROM events ORDER BY priority DESC"
    );
    result.rows.forEach((event) => {
      events.push(event);
    });
  } else {
    const result = await db.query("SELECT * FROM events ORDER BY priority ASC");
    result.rows.forEach((event) => {
      events.push(event);
    });
  }
  return events;
}

app.get("/", async (req, res) => {
  let events = await fillEvents();
  res.render("index.ejs", {
    eventItems: events,
  });
});

app.post("/edit", async (req, res) => {
  console.log(req.body);
  let Id = req.body.editEventId;
  let Event;
  let events = await fillEvents();
  events.forEach((event) => {
    if (event.id == Id) {
      Event = event;
    }
  });
  res.render("edit.ejs", {
    oldEventId: Id,
    oldContent: Event.content,
    oldPriority: Event.priority,
  });
});

app.post("/editTask", async (req, res) => {
  //     UPDATE table_name
  // SET column1 = value1,
  //     column2 = value2,
  //     ...
  // WHERE condition;
  console.log(req.body);
  await db.query(
    "UPDATE events SET content = $1, priority = $2 WHERE id = $3",
    [req.body.newEventContent, req.body.newEventPriority, req.body.editEventId]
  );
  res.redirect("/");
});

app.post("/new", async (req, res) => {
  console.log(req.body);
  await db.query("INSERT INTO events (content, priority) VALUES ($1, $2)", [
    req.body.newEventContent,
    req.body.newEventPriority,
  ]);
  res.redirect("/");
});

app.post("/done", async (req, res) => {
  console.log(req.body);
  await db.query("DELETE FROM events WHERE id = $1", [req.body.editEventId]);
  res.redirect("/");
});

app.post("/sort", async (req, res) => {
  // SELECT columns
  // FROM tables
  // [WHERE conditions]
  // [ORDER BY column1, column2, .. columnN] [ASC | DESC];
  count++;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
