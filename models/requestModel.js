const { getDB } = require("../config/db");
const ObjectId = require("mongodb").ObjectId;

async function createRequest(productData, webhookUrl) {
  const db = getDB();
  const request = {
    productData,
    totalImages: productData.reduce(
      (sum, product) => sum + product.inputImageUrls.length,
      0
    ),
    processedImages: 0,
    status: "processing",
    webhookUrl,
  };
  const result = await db.collection("requests").insertOne(request);
  return result.insertedId;
}

async function getRequestById(requestId) {
  const db = getDB();
  return db.collection("requests").findOne({ _id: new ObjectId(requestId) });
}

async function updateRequestStatus(requestId, status) {
  const db = getDB();
  return db
    .collection("requests")
    .updateOne({ _id: new ObjectId(requestId) }, { $set: { status } });
}

module.exports = { createRequest, getRequestById, updateRequestStatus };
