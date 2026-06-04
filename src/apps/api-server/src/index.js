require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
let app = express();
//const { add } = require("@pucvault/utils"); // import here

const authRoutes = require("./routes/authRoutes.js");
const forumRoutes = require("./routes/forumRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const tagRoutes = require("./routes/tagRoutes.js");
const postRoutes = require("./routes/postRoutes.js");
const denunciaRoutes = require("./routes/denunciaRoutes.js");
const feedRoutes = require("./routes/feedRoutes.js");
const imgRoutes = require("./routes/imageRoutes.js");

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/forums", forumRoutes);
app.use("/forums", forumRoutes);

app.use("/user", userRoutes);
app.use("/user", userRoutes);

app.use("/tags", tagRoutes);
app.use("/tags", tagRoutes);

app.use("/posts", postRoutes);

app.use("/denuncias", denunciaRoutes);

app.use("/feed", feedRoutes);

app.use("/posts", postRoutes);
app.use("/denuncias", denunciaRoutes);
app.use("/image", imgRoutes);

app.get("/", (req, res) => {
  res.send("Online");
});

const port = 8000;

app.listen(port, () => {
  console.log(`running on https://localhost:${port}`);
});
