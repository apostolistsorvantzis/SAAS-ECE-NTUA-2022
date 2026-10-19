const { Record } = require(appRoot + "../GPTdb/gptdb");

function getgpt(mapcode, from, to) {
  return new Promise((resolve, reject) => {
    Record.find({
        "MapCode": mapcode,
        "DateTime":{
            $gte: from,
            $lte: to
        }
    }, (err, records) => {
      if (err) {
        reject(err);
      } else {
        resolve(records);
      }
    }).sort('DateTime');
  });
}

module.exports = getgpt;