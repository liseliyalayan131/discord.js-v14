const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectToDatabase = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectToDatabase;