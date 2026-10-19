const express = require('express');
const router = express.Router();

const updateFromCSV = require(appRoot + '/GPTbackend/queries/updateFromCSV');


async function gptKafka(req, res) {
  // We don't need to check for required fields or
  // validate anything since the data that we are 
  // getting from the Kafka topic is direclty passed
  // on from the csv file.
  const data = JSON.parse(req.body.data);
  
  const result = await updateFromCSV(data);
  
  const filtered_result = result.filter(d => d !== false);

  const processed_data = filtered_result.map(d => {
    return `${d.map_code},${d.production_type},${d.date_time},${d.gpt_value}`;
  });

  processed_data.sort();

  let final_data = {};

  for (let i = 0; i < processed_data.length; i++) {
    const line = processed_data[i];
    const parts = line.split(',');
    const key = `${parts[0]},${parts[1]},${parts[2]}`;
    const value = parts[3];
    final_data[key] = value;
  }
  
  wsSingleton.getWss().clients.forEach((client) => {
    client.send(JSON.stringify({
      type: 'GPTUpdate',
      data: final_data, 
    }));
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Kafka message processed successfully'
  });
  
}

router.post('/kafka', gptKafka);
module.exports = router;