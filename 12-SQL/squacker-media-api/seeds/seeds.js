const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { faker } = require('@faker-js/faker');
const db = require("../db/dbConnection");

const createUsers = (callback) => {
  const usernames = [];
  for (let i = 0; i < 10; i++) {
    usernames.push([faker.internet.userName()]);
  }
  db.query("INSERT INTO users (username) VALUES ?", [usernames], function(err, result) {
    if (err) {
      throw err
    }
    callback();
  });
}

const createPosts = (callback) => {
    db.query("SELECT users.id from users", (err, users) => {
      if (err) {
        throw err
      }
      
      const posts = users.reduce((acc, user) => {
        for (let i = 0; i < 3; i++) {
          acc.push([
            user.id,
            faker.lorem.words({ min: 1, max: 5 }),
            faker.lorem.sentence()
          ]);
        }

        return acc;
      }, []);

      db.query("INSERT INTO posts (user_id, title, body) VALUES ?", [posts], function(err) {
        if (err) {
          throw err
        }
        callback();
      })
    })
};

const createComments = () => {
  db.query("SELECT * FROM posts", (err, posts) => {
    if (err) {
      throw err;
    }

    const comments = posts.reduce((acc, post) => {
      for (let i = 0; i < 3; i++) {
        acc.push([
          post.id,
          post.user_id,
          faker.lorem.sentence(),
        ]);
      }
      return acc;
    }, []);

    db.query("INSERT INTO comments (post_id, user_id, body) VALUES ?", [comments], (err) => {
      if (err) {
        throw err;
      }
      process.exit();
    });
  });
};

const truncate = (table, callback) => {
  db.query("TRUNCATE TABLE " + table, (err) => {
    if (err) {
      throw err;
    }
    callback();
  });
}

const initPrepareDatabase = (callback) => {
  db.query("SET FOREIGN_KEY_CHECKS=0", (err) => {
    if (err) {
      throw err;
    }
    truncate("comments", () => {
      truncate("posts", () => {
        truncate("users", () => {
          db.query("SET FOREIGN_KEY_CHECKS=1", (err) => {
            if (err) {
              throw err;
            }
            callback();
          });
        });
      });
    });
  });
};

const initInsert = () => {
  createUsers(() => {
    createPosts(() => {
      createComments();
    });
  });
}

initPrepareDatabase(initInsert);