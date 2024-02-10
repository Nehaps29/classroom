const router = require("express").Router();
const db = require("../../db/dbConnection");

/**
 * get all posts by a user
 */
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const query = "SELECT * FROM posts post INNER JOIN users user ON post.user_id = user.id WHERE user.id = ?";
  db.query({ sql: query, nestTables: true }, userId, (err, posts) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    }
    return res.json(posts);
  });
});

/**
 * get a single post by ID and user
 */
router.get("/:postId", (req, res) => {
  const { postId } = req.params;
  const query = "SELECT * FROM posts p INNER JOIN users u ON p.user_id = u.id AND p.id = ?";

  // [post] is deconstructing the first 'post' from the results array
  // this is the same as const post = results[0]
  db.query(query, postId, (err, [post]) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    } else if (!post) {
      return res.status(404).send();
    }

    return res.json(post);
  });
});

/**
 * create a new post
 */
router.post("/", (req, res) => {
  console.log(req);
  const { user_id, title, body } = req.body;
  const post = {
    user_id,
    title,
    body,
  };

  db.query("INSERT INTO posts SET ?", post, (err, result) => {
    if (err || result.affectedRows < 1) {
      return res.status(400).send();
    }
    return res.json(result.insertId);
  });
});

/**
 * update a post by ID
 */
router.put("/:postId", (req, res) => {
  const { postId } = req.params;
  const { title, body } = req.body;
  const update = {};
  if (title || title === null) {
    update.title = title;
  }
  if (body) {
    update.body = body;
  }
  db.query("UPDATE posts SET ? WHERE ?", [update, postId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(400).send();
    }
    return res.json("ok");
  });
});

/**
 * Delete a post by id
 */
router.delete("/:postId", (req, res) => {
  const { postId } = req.params;
  db.query("DELETE FROM posts WHERE posts.id = ?", postId, (err) => {
    if (err) {
      console.error(err);
      return res.status(400).send();
    }
    return res.json("ok");
  });
});

/**
 * Get a post by ID and join user & comments
 * 
 * this route is a bit more complicated as it has many joins, including inner and left joins
 * it then messages the query result to return a structured json response.
 * 
 * we left join comments as we query a post
 * the reason is a post might not have any comments, inner joining would return 0 results
 * 
 * inner join only returns matches between the 2 columns (posts.id = comments.post_id)
 *   - only posts with comments would return
 *   - @see https://www.w3schools.com/sql/sql_join_inner.asp
 * 
 * left join returns all posts with or without comments
 *   - if will try to match any comments with a post_id, but still return the post
 *   - @see https://www.w3schools.com/sql/sql_join_left.asp
 */
router.get("/:postId/comments", (req, res) => {
  const { postId } = req.params;
  const query = 
    "SELECT p.id AS postId, p.title AS postTitle, p.body AS postBody, " +
    "u.id AS userId, u.username, " + 
    "c.id AS commentId, c.body AS commentBody, " + 
    "cu.id AS commentUserId, cu.username AS commentUsername " + 
    "FROM posts p " + 
    "INNER JOIN users u ON p.user_id = u.id " +
    "LEFT JOIN comments c ON p.id = c.post_id AND c.post_id = ?" +
    "LEFT JOIN users cu ON c.user_id = cu.id " +
    "WHERE p.id = ? ";

  db.query(query, [postId, postId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    } else if (!results.length) {
      return res.json([]);
    }

    const first = results[0];

    const response = {
      id: postId,
      title: first.postTitle,
      body: first.postBody,
      userId: first.userId,
      username: first.username,
      comments: first.commentId
        ? results.map((comment) => ({
          id: comment.commentId,
          body: comment.commentBody,
          userId: comment.commentUserId,
          username: comment.commentUsername,
        }))
        : [],
    }
    return res.json(response);
  });
});

/** /api/post/comments/user/1 */
router.get("/comments/user/:user_id", (req, res) => {
  const { user_id } = req.params;
  const query =
    "SELECT * FROM posts post " +
    "INNER JOIN users user ON user.id = post.user_id AND user.id = ?" +
    "LEFT JOIN comments comment ON comment.post_id = post.id " +
    "LEFT JOIN users commentUser ON commentUser.id = comment.user_id";
  db.query({ sql: query, nestTables: true }, [user_id], (err, results) => {
    if (err) {
      return handleError(res, err);
    }
    
    // return res.json(results);
    
    const posts = results.reduce((acc, item) => {
      if (!acc[item.post.id]) {
        acc[item.post.id] = {
          id: item.post.id,
          title: item.post.title,
          body: item.post.body,
          userId: item.user.id,
          username: item.user.username,
          comments: [],
        };
      }

      if (item.comment.id) {
        item.comment.username = item.commentUser?.username;
        acc[item.post.id].comments.push(item.comment);
      }

      return acc;
    }, {});

    res.json(Object.values(posts));
  });
});

module.exports = router;
