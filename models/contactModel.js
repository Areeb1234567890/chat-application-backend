const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  contacts: [
    {
      _id: false,
      contact: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      chat: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
    },
  ],
});

module.exports = mongoose.model("contact", contactSchema);
