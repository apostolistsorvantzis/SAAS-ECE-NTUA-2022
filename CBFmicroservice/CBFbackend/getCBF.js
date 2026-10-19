const { Record } = require(appRoot + "../CBFbd/cbfdb");

function getcbf(incode, outcode,from, to) {
  return new Promise((resolve, reject) => {
    Record.find({
        "InMapCode": incode,
        "OutMapCode": outcode,
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

module.exports = getcbf;