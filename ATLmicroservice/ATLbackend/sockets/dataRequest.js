const { ActualTotalLoad } = require(appRoot + '/ATLdb/atldb');

function dataRequest(ws, msg) {
  ActualTotalLoad.find({
    map_code: {
      $in: msg.countries,
    },
    date_time: {
      $gte: new Date(msg.start_date),
      $lte: new Date(msg.end_date),
    },
  }).then((result) => {
    const renderData = [];
    for (let i = 0; i < msg.countries.length; i++) {
      const country = msg.countries[i];
      const countryData = result.filter((d) => d.map_code === country);
      const countryMapped = countryData.map((d) => {
        return [d.date_time, d.total_load_value];
      });
      renderData.push({
        name: country,
        data: countryMapped,
      });
    }
    ws.send(
      JSON.stringify({
        type: 'ATL',
        data: renderData,
      }),
    );
  });
}

module.exports = dataRequest;
