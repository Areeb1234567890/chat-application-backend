require("dotenv").config();
const userSchema = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = `${process.env.SECRET_KEY}`;
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEI}`,
  api_secret: `${process.env.CLOUDINARY_SECRET}`,
});

const Register = async (req, res) => {
  const { name, email, password, bio } = req.body;
  const file = req.file;
  if (!name || !email || !password || !bio) {
    return res.status(404).json({ msg: "incomplete information error" });
  }
  const userexist = await userSchema.findOne({ email });
  if (userexist) {
    return res
      .status(501)
      .json({ msg: "User already exists with this email." });
  }
  let imageUrl = "";
  let imageId = "";
  if (file) {
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${file.buffer.toString("base64")}`
    );
    imageUrl = result.secure_url;
    imageId = result.public_id;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new userSchema({
    name,
    email,
    password: hashedPassword,
    profileImage: imageUrl,
    bio,
    profileImagePublicId: imageId,
  });
  try {
    await newUser.save();
    res.status(201).json({ msg: "User registerd successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ msg: "try again" });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(404).json({ msg: "incomplete credentials " });
  }
  const userDoc = await userSchema.findOne({ email });
  if (!userDoc) {
    return res.status(400).json({ msg: "User not found" });
  }
  const passwordCheck = bcrypt.compareSync(password, userDoc.password);
  if (passwordCheck) {
    jwt.sign({ _id: userDoc._id }, secret, {}, (error, token) => {
      if (error) throw Error(error);
      let user = userDoc.toObject();
      delete user.password;
      delete user.profileImagePublicId;
      res.json({ user, success: true, token, msg: "Logged in successfully" });
    });
  } else {
    res.status(400).json({ msg: "wrong credentials" });
  }
};

const updateData = async (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;
  const file = req.file;
  const userExist = await userSchema.findById(id);
  if (!userExist) {
    return res.status(404).json({ msg: "user not found" });
  }
  let imageUrl = userExist.profileImage;
  if (file) {
    try {
      if (userExist.profileImage) {
        await cloudinary.uploader.destroy(userExist.profileImagePublicId);
      }
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${file.buffer.toString("base64")}`
      );
      imageUrl = result.secure_url;
      userExist.profileImagePublicId = result.public_id;
    } catch (error) {
      console.error("Error updating image in Cloudinary:", error);
      return res.status(500).json({ msg: "Error updating image" });
    }
  }
  userExist.name = name || userExist.name;
  userExist.bio = bio || userExist.bio;
  userExist.profileImage = imageUrl;
  try {
    await userExist.save();
    let user = userExist.toObject();
    delete user.password;
    delete user.profileImagePublicId;
    res.status(200).json({ user: user, msg: "User data updated successfully" });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ msg: "Error updating user data" });
  }
};

const deleteProfileImage = async (req, res) => {
  const { id } = req.params;
  const userExist = await userSchema.findById(id);
  if (!userExist) {
    return res.status(404).json({ msg: "user not found" });
  }
  try {
    if (userExist.profileImage) {
      await cloudinary.uploader.destroy(userExist.profileImagePublicId);
      userExist.profileImage = "";
      userExist.profileImagePublicId = "";
      await userExist.save();
      let user = userExist.toObject();
      delete user.password;
      delete user.profileImagePublicId;
      return res
        .status(200)
        .json({ user: user, msg: "Image removed successfully" });
    } else {
      return res.status(404).json({ msg: "No Image Found" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error removing user profile Image" });
  }
};

module.exports = { Register, Login, updateData, deleteProfileImage };
