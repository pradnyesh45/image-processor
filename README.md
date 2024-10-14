# Image Processor

A system that processes image data from CSV files.

# How to run?

- Clone the repo onto your local computer.
- Make sure you have node, redis and mongodb installed on your system. Additionally, you can also install Mongo GUI like Mongo Compass.
- Make sure mongodb is working.
- Start `redis-server`.
- Open the project directory on your terminal.
- Type `npm install` to install the dependencies.
- We are done with the setup.
- Type `node server.js` to start the backend server.
- You would see messages like `Connected to MongoDB` and `Server running on port 5000` on the terminal.

# Steps to use

- Import the postman collection given in project onto your local postman for testing. I have given the link, postman json and csv file are also provided in the project itself.
- https://elements.getpostman.com/redirect?entityId=10959407-976ec2dd-69b6-4819-8197-4ba44b1df0b6&entityType=collection
- Hit the POST upload api. You need to upload the csv file in the body. It will queue the images and return a requestId(copy this requestId).
- I have set a timeout of 2 seconds after every image is processed so that we can see the progression.
- Hit the GET status api by replacing the requestId in the url with the one that you copied from the earlier get request.
- Keep hitting the GET status api at regular intervals to see the how images are getting processed one by one.

# Technical Design Document

- Workflow
- ![Workflow](./images/Image%20Processor.drawio.png)

- Image Processor worker
- ![Image Processor worker](./images/Image%20Processor%202.drawio.png)
