const mongoose = () => {
  const monGoose = require('mongoose');
  const { MONGO_URI } = process.env;
  return new Promise((resolve, reject) => {
    try {
      monGoose
        .connect(MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then(() => resolve(monGoose))
        .catch((err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

const GenerationpPerType = require(appRoot + '/GPTdb/models/GPTcollection');
const toExport = { mongoose, GenerationpPerType };

module.exports = toExport;