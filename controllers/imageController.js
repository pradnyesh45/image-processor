const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { createRequest, getRequestById } = require("../models/requestModel");
const imageQueue = require("../workers/imageProcessor");
const path = require("path");

const upload = multer({ dest: "uploads/" });

// Upload CSV file
async function uploadCSV(req, res) {
  const file = req.file;
  const productData = [];

  fs.createReadStream(file.path)
    .pipe(csv())
    .on("data", (row) => {
      const inputUrls = row["Input Image Urls"].split(",");
      productData.push({
        serialNumber: parseInt(row["S. No."]),
        productName: row["Product Name"],
        inputImageUrls: inputUrls,
        outputImageUrls: [],
      });
    })
    .on("end", async () => {
      const webhookUrl = req.body.webhookUrl;
      const requestId = await createRequest(productData, webhookUrl);

      // Queue all images for processing
      productData.forEach((product) => {
        product.inputImageUrls.forEach((imageUrl) => {
          imageQueue.add({
            productId: product.serialNumber,
            imageUrl,
            requestId,
          });
        });
      });

      res.json({ requestId, message: "CSV uploaded and processing started" });
    });
}

// Get status of the request
async function getStatus(req, res) {
  const requestId = req.params.requestId;
  const request = await getRequestById(requestId);

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  res.json({
    requestId,
    status: request.status,
    totalImages: request.totalImages,
    processedImages: request.processedImages,
    productData: request.productData,
  });
}

module.exports = { uploadCSV, getStatus, upload };
