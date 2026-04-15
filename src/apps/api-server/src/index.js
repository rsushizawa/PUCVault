const express = require('express');
let app = express();
//const { add } = require("@pucvault/utils"); // import here

const authRoutes = require('./routes/authRoutes.js');
const forumRoutes = require('./routes/forumRoutes.js');
const userRoutes = require('./routes/userRoutes.js');


app.use(express.json());

app.use('/auth', authRoutes);

app.use('/forums', forumRoutes);

app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Online');
});


const port = 8000;





app.get("/add", (req, res) => {
  const { a, b } = req.query;
  res.json({ result: add(Number(a), Number(b)) });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
