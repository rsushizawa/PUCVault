const express = require("express");
let app = express();
//const { add } = require("@pucvault/utils"); // import here

const authRoutes = require("./routes/authRoutes.js");
const forumRoutes = require("./routes/forumRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const tagRoutes = require("./routes/tagRoutes.js");
const postRoutes = require("./routes/postRoutes.js");

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/forums", forumRoutes);

app.use("/user", userRoutes);

app.use("/tags", tagRoutes);

app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("Online");
});

const port = 8000;

app.listen(port, () => {
  console.log(`running on https://localhost:${port}`);
});

app.use("/forums", forumRoutes);

app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Online");
});

const port = 8000;
