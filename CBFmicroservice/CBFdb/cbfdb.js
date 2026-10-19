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

const CrossBorderFlow = require(appRoot + '/CBFdb/models/CBFcollection');
const toExport = { mongoose, CrossBorderFlow};

module.exports = toExport;