const express = require("express");
const Route = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const {
  Register,
  Login,
  updateData,
  deleteProfileImage,
} = require("../controller/authController");
const { getContacts } = require("../controller/contactController");
const { getChat } = require("../controller/chatController");

Route.post("/register", uploads.single("file"), Register);
Route.put("/updateUser/:id", uploads.single("file"), updateData);
Route.post("/login", Login);
Route.put("/deleteProfileImage/:id", deleteProfileImage);
Route.get("/getContacts/:id", getContacts);
Route.get("/getChat/:id", getChat);

module.exports = Route;
