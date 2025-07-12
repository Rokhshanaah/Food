const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const { Pool } = require("pg");

const app = express();
const port = 3000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "foodiehub",
  password: "",
  port: 5432
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM foods ORDER BY id DESC");
    res.render("index", { foods: result.rows });
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
});


app.get("/foods/new", (req, res) => {
  res.render("new");
});


app.post("/foods", async (req, res) => {
  const { name, description, price } = req.body;
  try {
    await pool.query(
      "INSERT INTO foods (name, description, price) VALUES ($1, $2, $3)",
      [name, description, price]
    );
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
});

app.get("/foods/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM foods WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      res.status(404).send("Food not found");
      return;
    }
    res.render("show", { food: result.rows[0] });
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
});

app.get("/foods/:id/edit", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM foods WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      res.status(404).send("Food not found");
      return;
    }
    res.render("edit", { food: result.rows[0] });
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
});


app.put("/foods/:id", async (req, res) => {
  const id = req.params.id;
  const { name, description, price } = req.body;
  try {
    await pool.query(
      "UPDATE foods SET name = $1, description = $2, price = $3 WHERE id = $4",
      [name, description, price, id]
    );
    res.redirect("/foods/" + id);
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
});


app.delete("/foods/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM foods WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Database error: " + err.message);
  }
});

app.listen(port, () => {
  console.log(`Foodie Hub backend running at http://localhost:${port}`);
});