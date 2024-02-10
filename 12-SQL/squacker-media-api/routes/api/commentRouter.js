const router = require("express").Router();
const db = require("../../db/dbConnection");

/**
 * Get all comments by a post ID
 */
router.get("/post/:postId", (req, res) => {
  const { postId } = req.params;
  const query = 
    "SELECT c.id, c.body, u.id AS userId, u.username AS username " +
    "FROM comments c " +
    "INNER JOIN posts p ON c.post_id = p.id AND p.id = ?" +
    "INNER JOIN users u ON c.user_id = u.id";

  db.query(query, postId, (err, comments) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    }
    return res.json(comments);
  });
});

router.post("/post/:postId", (req, res) => {
  const { postId } = req.params;
  const { body, user_id } = req.body;
  const comment = {
    body,
    user_id,
    post_id: postId,
  };

  db.query("INSERT INTO comments SET ?", comment, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    }
    return res.json(result.insertId);
  });
});

router.delete("/:commentId", (req, res) => {
  const { commentId } = req.params;

  db.query("DELETE FROM comments WHERE comments.id = ?", [commentId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    }
    return res.json("ok");
  });
});

module.exports = router;
