require("dotenv").config();
const userSchema = require("../models/userModel");
const contactSchema = require("../models/contactModel");
const chatSchema = require("../models/chatModel");

const getContacts = async (req, res) => {
  const { id } = req.params;

  try {
    const userContacts = await contactSchema
      .findOne({ user: id })
      .populate("contacts.contact", "name email bio profileImage")
      .populate("contacts.chat");

    if (!userContacts) {
      return res.status(404).json({ msg: "Contacts not found" });
    }

    const contacts = userContacts.contacts.map((item) => {
      const lastMessage = item.chat.chat[item.chat.chat.length - 1];
      return {
        message: lastMessage.message,
        chat_id: item.chat._id,
        contact_id: item.contact._id,
        name: item.contact.name,
        email: item.contact.email,
        bio: item.contact.bio,
        profileImage: item.contact.profileImage,
      };
    });

    return res.status(200).json({ contacts: contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const addContact = async (data, socket, io, users) => {
  const { email, message, id } = data;
  const senderId = id;

  const receiver = await userSchema.findOne({ email });
  if (!receiver) {
    socket.emit("addContactError", { msg: "User not found" });
  } else {
    try {
      const newChat = new chatSchema({
        chat: [{ senderId: senderId, message }],
      });
      const savedChat = await newChat.save();
      await contactSchema.findOneAndUpdate(
        { user: senderId },
        {
          $addToSet: {
            contacts: { contact: receiver._id, chat: savedChat._id },
          },
        },
        { upsert: true }
      );
      await contactSchema.findOneAndUpdate(
        { user: receiver._id },
        { $addToSet: { contacts: { contact: senderId, chat: savedChat._id } } },
        { upsert: true }
      );

      const receiverData = users.find(
        (user) => user.userId === receiver._id.toString()
      );
      const senderData = users.find((user) => user.userId === senderId);

      if (receiverData) {
        io.to(receiverData.socketId).emit("updateContactsReceiver", {
          msg: "someone added you as a friend",
          id: receiverData.userId,
        });
      }
      io.to(senderData.socketId).emit("updateContactsSender", {
        msg: "Friend added Successfully",
        id: senderId,
      });
    } catch (error) {
      console.error("Error adding contact and sending message:", error);
      socket.emit("addContactError", { msg: "Internal server error" });
    }
  }
};

module.exports = { getContacts, addContact };
