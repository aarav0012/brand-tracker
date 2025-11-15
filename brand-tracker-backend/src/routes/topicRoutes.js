const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");

router.post("/cluster", topicController.analyzeTopics);

module.exports = router;
