const express = require("express");
const { connectDB } = require("./config/db");
const imageRoutes = require("./routes/imageRoutes");
const imageQueue = require("./workers/imageProcessor"); // To initiate workers

const app = express();
app.use(express.json());

app.use("/api", imageRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
