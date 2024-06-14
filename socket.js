const { Server } = require("socket.io");
const { addContact } = require("./controller/contactController");
const {
  videoCall,
  declineCall,
  cancelCall,
  acceptedCall,
} = require("./controller/callController");
const {
  sendMessage,
  typing,
  stopTyping,
} = require("./controller/chatController");

let users = [];

const addUser = (userId, socketId) => {
  const existingUserIndex = users.findIndex((user) => user.userId === userId);
  if (existingUserIndex !== -1) {
    users[existingUserIndex].socketId = socketId;
  } else {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("user connected...", socket.id);

    socket.on("userId", (userId) => {
      addUser(userId, socket.id);
    });

    socket.on("sendMessage", (data) => {
      sendMessage(data, socket, io, users);
    });

    socket.on("videoCall-user", (data) => {
      videoCall(data, io, users, socket);
    });

    socket.on("cancel-Call", (data) => {
      cancelCall(data, io, users);
    });

    socket.on("decline-call", (data) => {
      declineCall(data, io, users);
    });

    socket.on("call-accepted", (data) => {
      acceptedCall(data, io, users);
    });

    socket.on("typing", (data) => {
      typing(data, io, users);
    });

    socket.on("stopTyping", (data) => {
      stopTyping(data, io, users);
    });

    socket.on("addContact", (data) => {
      addContact(data, socket, io, users);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      removeUser(socket.id);
    });
  });
};

module.exports = setupSocket;
