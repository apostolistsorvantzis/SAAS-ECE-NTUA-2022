const { CrossBorderFlow } = require(appRoot + '/CBFdb/cbfdb');

function dataRequest(ws, msg) {
  CrossBorderFlow.find({
    in_map_code: {
      $in: msg.in_country,
    },
    out_map_code: {
      $in: msg.out_country,
    },
    date_time: {
      $gte: new Date(msg.start_date),
      $lte: new Date(msg.end_date),
    },
  }).then((result) => {
    const renderData = [];
    for (let i = 0; i < msg.in_country.length; i++) {
      const country = msg.in_country[i];
      const countryData = result.filter((d) => d.in_map_code === country);
      const countryMapped = countryData.map((d) => {
        return [d.date_time, d.flow_value];
      });
      renderData.push({
        name: country,
        name2: msg.out_country,
        data: countryMapped,
      });
    }
    ws.send(
      JSON.stringify({
        type: 'CBF',
        data: renderData,
      }),
    );
  });
}

module.exports = dataRequest;