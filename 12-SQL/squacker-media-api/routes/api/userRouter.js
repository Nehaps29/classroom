const router = require("express").Router();
const db = require("../../db/dbConnection");

/**
 * method: GET
 * pathname: '/api/user'
 */
router.get("/", (req, res) => {
  db.query("SELECT * FROM users", (err, users) => {
    if (err) return res.status(500).send();
    return res.json(users);
  });
});

router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  db.query("SELECT * FROM users WHERE users.id = ?", userId, (err, [user]) => {
    if (err) {
      return res.status(500).send();
    } else if (!user) {
      return res.status(404).send();
    }
    return res.json(user);
  });
});

/** 
 * create new user, requires json payload with 'username'
 * returns the id of the new user
 *
 * @see https://github.com/mysqljs/mysql#getting-the-id-of-an-inserted-row
 */
router.post("/", (req, res) => {
  const { username } = req.body.username;
  db.query("INSERT INTO users SET ?", { username }, (err, result) => {
    if (err) return res.status(500).send();
    return res.json(result.insertId);
  });
});

/**
 * update username, requires json payload with 'username'
 */
router.put("/:id", (req, res) => {
  const userId = req.params.id;
  const { username } = req.body.username;
  db.query("UPDATE users SET ? WHERE id = ?", [{ username }, userId], (err, result) => {
    if (err || result.affectedRows < 1) {
      return res.status(400).send();
    }
    return res.json('ok');
  });
});

console.log(router.stack);

module.exports = router;
