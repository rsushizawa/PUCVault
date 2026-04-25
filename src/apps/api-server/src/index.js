require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
let app = express();
//const { add } = require("@pucvault/utils"); // import here

const authRoutes = require('./routes/authRoutes.js');
const forumRoutes = require('./routes/forumRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const tagRoutes = require('./routes/tagRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const feedRoutes = require('./routes/feedRoutes.js');

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/forums", forumRoutes);

app.use("/user", userRoutes);

app.use("/tags", tagRoutes);

app.use("/posts", postRoutes);

app.use("/feed", feedRoutes);

app.get("/", (req, res) => {
  res.send("Online");
});

const port = 8000;

app.listen(port, () => {
  console.log(`running on https://localhost:${port}`);
});
