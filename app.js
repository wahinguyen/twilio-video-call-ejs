require("dotenv").config();
const express = require("express");
const path = require("path");
//const cors = require("cors");

const app = express();
const port = process.env.PORT || "5000";
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(cors());

app.use(express.static("./public"));

app.get("/2", (req, res) => {
  res.render("room");
});

app.get("/1", (req, res) => {
  res.render("room");
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
