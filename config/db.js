const mongoose = require("mongoose");

const connectToDb = (Uri) => {
  mongoose
    .connect(Uri)
    .then(() => {
      console.log("connected to mongodb successfully....");
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = connectToDb;
