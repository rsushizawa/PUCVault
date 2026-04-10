const express = require("express");
let app = express();
//const { add } = require("@pucvault/utils"); // import here

const authRoutes = require("./routes/authRoutes.js");
const forumRoutes = require("./routes/forumRoutes.js");

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/forums", forumRoutes);

app.get("/", (req, res) => {
  res.send("Online");
});

const port = 8000;

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/forums", forumRoutes);

app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Online");
});

const port = 8000;
