const fs = require("fs");
const path = require("path");

const csv = require("csv-parser");
const axios = require("axios");

global.appRoot = path.resolve(__dirname);

const baseURL = "http://localhost:3320/api/v1";
const baseAuthURL = "http://localhost:3333";

let access_token = "";

init();

function init() {
  axios
    .post(`${baseAuthURL}/auth/signin`, {
      email: "testme@testme.com",
      password: "test",
    })
    .then((response) => {
      access_token = response.data.access_token;

      getFiles();
    });
}

function getFiles() {
  // Loop through all csv files in atl folder
  const files = fs.readdirSync(
    appRoot + "/saas2022data/atl_minimal/march_splits"
  );
  // Read one file every 5 seconds
  setInterval(async () => {
    console.log('Processing file: "' + files[0] + '"');
    const file = files.shift();
    if (file && file.startsWith("March")) {
      const result = await processFile(file);
      console.log(result);
    }
  }, 1500);
}

function processFile(file) {
  const fPromises = [];
  return new Promise((resolve, reject) => {
    // Read csv file
    fs.createReadStream(
      appRoot + "/saas2022data/atl_minimal/march_splits/" + file
    )
      .pipe(csv({ separator: "\t" }))
      .on("data", (data) => {
        // Process data
        fPromises.push(processData(data));
      })
      .on("end", () => {
        // Finished processing
        // console.log("Finished processing file: " + file);
        // resolve("Finished processing file: " + file);
        Promise.all(fPromises).then(() => {
          resolve("Finished processing file: " + file);
        });
      });
  });
}

function processData(data) {
  console.log(data);
  return new Promise((resolve, reject) => {
    // If AreaTypeCode is not CTY, skip
    if (data.AreaTypeCode !== "CTY") {
      resolve('Skipping AreaTypeCode: "' + data.AreaTypeCode + '"');
    }

    const post_data = {
      map_code: data.MapCode,
      date_time: data.DateTime,
      update_time: data.UpdateTime,
      total_load_value: data.TotalLoadValue,
    };

    axios
      .post(baseURL + "/atl", post_data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        // console.error(error);
        reject(error);
      });
  });
}
