const router = require("express").Router();
const apiRouter = require("./api");

router.use("/api", apiRouter);

router.all("*", (req, res) => {
  res.status(404).send("page not found!");
});

module.exports = router;
