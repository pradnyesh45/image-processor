const Queue = require("bull");
const axios = require("axios");
const sharp = require("sharp");
const { getDB } = require("../config/db");
const fs = require("fs");
const path = require("path");

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
    fs.writeFileSync(outputPath, compressedImage);

    // Step 4: Update the database with the processed image URL
    const db = getDB();
    const request = await db
      .collection("requests")
      .findOne({ _id: ObjectId(requestId) });
    console.log(request);
    const productIndex = request.productData.findIndex(
      (p) => p.serialNumber === productId
    );
    request.productData[productIndex].outputImageUrls.push(
      `https://your-storage-url/${outputFileName}`
    );

    await db
      .collection("requests")
      .updateOne(
        { _id: requestId },
        { $set: { productData: request.productData } }
      );

    done(); // Complete the job
  } catch (error) {
    console.error("Error processing image:", error);
    done(error);
  }
});

module.exports = imageQueue;
