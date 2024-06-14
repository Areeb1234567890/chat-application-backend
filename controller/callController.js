const userSchema = require("../models/userModel");

const videoCall = async (data, io, users, socket) => {
  const { callerId, receiverId, offer } = data;

  const callerDoc = await userSchema.findById(callerId);
  const receiverDoc = await userSchema.findById(receiverId);

  const caller = (({ password, profileImagePublicId, bio, __v, ...rest }) =>
    rest)(callerDoc.toObject());
  const receiver = (({ password, profileImagePublicId, bio, __v, ...rest }) =>
    rest)(receiverDoc.toObject());

  const receiverSocket = users.find((user) => user.userId === receiverId);
  const CallerSocket = users.find((user) => user.userId === callerId);

  if (receiverSocket) {
    io.to(receiverSocket.socketId).emit("incomming-Video_call", {
      caller,
      offer,
    });
  }
  io.to(CallerSocket.socketId).emit("receiver_Data-video_call", {
    receiver,
  });
};

const declineCall = (data, io, users) => {
  const callerId = data;
  const callerSocket = users.find((user) => user.userId === callerId);

  if (callerSocket) {
    io.to(callerSocket.socketId).emit("call-declined");
  }
};

const cancelCall = (data, io, users) => {
  const receiverId = data;
  const receiverSocket = users.find((user) => user.userId === receiverId);

  if (receiverSocket) {
    io.to(receiverSocket.socketId).emit("call-cancelled");
  }
};

const acceptedCall = (data, io, users) => {
  const { answer, id } = data;

  const callerSocket = users.find((user) => user.userId === id);

  if (callerSocket) {
    io.to(callerSocket.socketId).emit("call-accepted-by-receiver", { answer });
  }
};

module.exports = { videoCall, declineCall, cancelCall, acceptedCall };
