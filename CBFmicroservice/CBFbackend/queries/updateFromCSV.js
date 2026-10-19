const { CrossBorderFlow } = require(appRoot + '/CBFdb/cbfdb');


function updateFromCSV(data) {
    const records = data.map(csvLine => {
      // Split the fields by tab into an array
      const fields = csvLine.split('\t');
      // Return the object that we will be bulk upserting
      return {
        in_map_code: fields[9],
        out_map_code: fields[5],
        date_time: new Date(fields[0]),
        update_time: new Date(fields[11]),
        flow_value: parseFloat(fields[10]),
      };
    });
    const promises = records.map(record => processSingleRecord(record));
    return new Promise((resolve, reject) => {
      Promise.all(promises)
      .then(results => {
        resolve(results);
      })
      .catch(err => {
        reject(err);
      }
      );
    });
  }
  
  function processSingleRecord(record) {
    return new Promise(async (resolve, reject) => {
      if (!verifySingleRecord(record)) {
        resolve(false);
      } else {
        // Upsert the record
        const result = await CrossBorderFlow.findOneAndUpdate({
          in_map_code: record.in_map_code,
          out_map_code: record.out_map_code,
          date_time: record.date_time,
        }, record, { upsert: true, new: true });
        resolve(result);
      }
    });
  }
  
  function verifySingleRecord(record) {
    // If in map code is not defined or is not a string or is empty or is null return false
    if (!record.in_map_code || !(typeof record.in_map_code === 'string') || record.in_map_code.length === 0 || record.in_map_code === null) {
      return false;
    }
    // same for out map code
    if (!record.out_map_code || !(typeof record.out_map_code === 'string') || record.out_map_code.length === 0 || record.out_map_code === null) {
        return false;
      }
    // If date_time is not defined or is not a date or is null return false
    if (!record.date_time || !(record.date_time instanceof Date) || record.date_time === null) {
      return false;
    }
    
    // If update_time is not defined or is not a date or is null return false
    if (!record.update_time || !(record.update_time instanceof Date) || record.update_time === null) {
      return false;
    }
    
    // If total_load_value is not defined or is not a number or is null return false
    if (!record.flow_value || !(typeof record.flow_value === 'number') || record.flow_value === null) {
      return false;
    }
    
    return true;
  }
  
  
  module.exports = updateFromCSV;