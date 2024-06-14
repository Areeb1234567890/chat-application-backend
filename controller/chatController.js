const chatSchema = require("../models/chatModel");
const secret = `${process.env.SECRET_KEY}`;
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEI}`,
  api_secret: `${process.env.CLOUDINARY_SECRET}`,
});

const getChat = async (req, res) => {
  const { id } = req.params;
  try {
    const chatData = await chatSchema.findById(id);

    if (!chatData) {
      return res.status(404).json({ msg: "no chat found" });
    }

    return res.status(200).json({ chatData });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const sendMessage = async (data, socket, io, users) => {
  const { senderId, chatId, receiverId, message } = data;

  console.log(data);

  const chatExist = await chatSchema.findById(chatId);

  if (!chatExist) {
    socket.emit("sendMessageError", { msg: "Chat not found" });
  } else {
    try {
      const newMessage = {
        senderId,
        message,
      };
      chatExist.chat.push(newMessage);
      await chatExist.save();

      const receiverData = users.find((user) => user.userId === receiverId);
      const senderData = users.find((user) => user.userId === senderId);

      if (receiverData) {
        io.to(receiverData.socketId).emit("updateMessageReceiver", {
          id: chatId,
        });
      }
      io.to(senderData.socketId).emit("updateMessageSender", {
        id: chatId,
      });
    } catch (error) {
      console.error("Error adding contact and sending message:", error);
      socket.emit("sendMessageError", { msg: "Internal server error" });
    }
  }
};

const typing = (data, io, users) => {
  const receiverId = data.receiverId;
  const receiverData = users.find((user) => user.userId === receiverId);
  if (receiverData) {
    io.to(receiverData.socketId).emit("Sendertyping");
  }
};

const stopTyping = (data, io, users) => {
  const receiverId = data.receiverId;
  const receiverData = users.find((user) => user.userId === receiverId);
  if (receiverData) {
    io.to(receiverData.socketId).emit("stopSendertyping");
  }
};

module.exports = { getChat, sendMessage, typing, stopTyping };
