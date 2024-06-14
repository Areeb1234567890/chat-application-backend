const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    chat: [
      {
        _id: false,
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        message: { type: String },
        attachments: {
          publicId: { type: String },
          url: { type: String },
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("chat", chatSchema);
