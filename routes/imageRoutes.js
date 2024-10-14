const express = require("express");
const {
  uploadCSV,
  getStatus,
  upload,
} = require("../controllers/imageController");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadCSV);
router.get("/status/:requestId", getStatus);

module.exports = router;
