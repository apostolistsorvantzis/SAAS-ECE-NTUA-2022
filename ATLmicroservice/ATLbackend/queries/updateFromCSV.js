const { ActualTotalLoad } = require(appRoot + '/ATLdb/atldb');

function updateFromCSV(data) {
  const records = data.map(csvLine => {
    // Split the fields by tab into an array
    const fields = csvLine.split('\t');
    // Return the object that we will be bulk upserting
    return {
      map_code: fields[5],
      date_time: new Date(fields[0]),
      update_time: new Date(fields[7]),
      total_load_value: parseFloat(fields[6]),
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
      const result = await ActualTotalLoad.findOneAndUpdate({
        map_code: record.map_code,
        date_time: record.date_time,
      }, record, { upsert: true, new: true });
      resolve(result);
    }
  });
}

function verifySingleRecord(record) {
  // If map code is not defined or is not a string or is empty or is null return false
  if (!record.map_code || !(typeof record.map_code === 'string') || record.map_code.length === 0 || record.map_code === null) {
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
  if (!record.total_load_value || !(typeof record.total_load_value === 'number') || record.total_load_value === null) {
    return false;
  }
  
  return true;
}


module.exports = updateFromCSV;