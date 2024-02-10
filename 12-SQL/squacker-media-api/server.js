require("dotenv").config();
const express = require("express");
const db = require("./db/dbConnection");
const router = require("./routes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(router);

// console.log(app._router.stack);

db.connect((err) => {
  if (err) throw err;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
