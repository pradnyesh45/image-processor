const Queue = require("bull");
const axios = require("axios");
const sharp = require("sharp");
const { getDB } = require("../config/db");
const fs = require("fs");
const path = require("path");
const ObjectId = require("mongodb").ObjectId;

// Create a Bull queue
const imageQueue = new Queue("image-processing");

// Image processing job
imageQueue.process(async (job, done) => {
  const { productId, imageUrl, requestId } = job.data;
  try {
    // Step 1: Download the image
    const response = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data, "binary");

    // Step 2: Compress the image using Sharp
    const compressedImage = await sharp(imageBuffer)
      .jpeg({ quality: 50 })
      .toBuffer();

    // Step 3: Store the processed image locally (this can be replaced with cloud storage)
    const outputFileName = `${productId}-${Date.now()}.jpg`;
    const outputPath = path.join(
      __dirname,
      "../processed_images",
      outputFileName
    );

    // Ensure the processed_images directory exists
    if (!fs.existsSync(path.join(__dirname, "../processed_images"))) {
      fs.mkdirSync(path.join(__dirname, "../processed_images"));
    }

    fs.writeFileSync(outputPath, compressedImage);

    // Step 4: Update the database with the processed image URL
    const db = getDB();
    const request = await db
      .collection("requests")
      .findOne({ _id: new ObjectId(requestId) });

    if (!request) {
      throw new Error("Request not found");
    }
    const productIndex = request.productData.findIndex(
      (p) => p.serialNumber === productId
    );

    if (productIndex !== -1) {
      // Update the outputImageUrls with the local file path
      request.productData[productIndex].outputImageUrls.push(outputPath);

      // Introduce a delay after each push
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for 2 seconds

      // Increment the processed images count
      request.processedImages += 1;

      // Check if all images have been processed
      if (request.processedImages === request.totalImages) {
        request.status = "completed";
      }

      await db.collection("requests").updateOne(
        { _id: new ObjectId(requestId) },
        {
          $set: {
            productData: request.productData,
            processedImages: request.processedImages,
            status: request.status,
          },
        }
      );
    } else {
      throw new Error("Product not found in the request");
    }

    // Mark the job as completed
    done();
  } catch (error) {
    console.error("Error processing image:", error);
    done(error);
  }
});

module.exports = imageQueue;
