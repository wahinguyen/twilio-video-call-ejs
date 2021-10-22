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

// app.get("/", (req, res) => {
//   res.render("room");
// });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/room.html");
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
