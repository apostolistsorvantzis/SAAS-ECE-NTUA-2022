const express = require('express');
const router = express.Router();

const updateFromCSV = require(appRoot + '/ATLbackend/queries/updateFromCSV');


async function atlKafka(req, res) {
  // We don't need to check for required fields or
  // validate anything since the data that we are 
  // getting from the Kafka topic is direclty passed
  // on from the csv file.
  const data = JSON.parse(req.body.data);
  
  const result = await updateFromCSV(data);
  
  const filtered_result = result.filter(d => d !== false);

  const processed_data = filtered_result.map(d => {
    return `${d.map_code},${d.date_time},${d.total_load_value}`;
  });

  processed_data.sort();

  let final_data = {};

  for (let i = 0; i < processed_data.length; i++) {
    const line = processed_data[i];
    const parts = line.split(',');
    const key = `${parts[0]},${parts[1]}`;
    const value = parts[2];
    final_data[key] = value;
  }
  
  wsSingleton.getWss().clients.forEach((client) => {
    client.send(JSON.stringify({
      type: 'ATLUpdate',
      data: final_data, 
    }));
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Kafka message processed successfully'
  });
  
}

router.post('/kafka', atlKafka);
module.exports = router;