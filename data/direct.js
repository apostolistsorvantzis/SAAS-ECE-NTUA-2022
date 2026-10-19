const fs = require("fs");
const path = require("path");
global.appRoot = path.resolve(__dirname) + "/../ATLmicroservice";
require("dotenv").config();

const { mongoose, ActualTotalLoad } = require("../ATLmicroservice/ATLdb/atldb");

const csv = require("csv-parser");

global.appRoot = path.resolve(__dirname);

mongoose().then(() => {
  console.log("Connected to ATL database");

  const files = fs.readdirSync(
    appRoot + "/saas2022data/atl_minimal/march_splits"
  );

  files.forEach((element) => {
    // If AreaTypeCode is not CTY, skip
    if (element.startsWith("March")) {
      console.log("Processing file: " + element);
      process(element).then(() => {
        console.log("Finished processing file: " + element);
      });
    }
  });
});

function process(element) {
  const fPromises = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      appRoot + "/saas2022data/atl_minimal/march_splits/" + element
    )
      .pipe(csv({ separator: "\t" }))
      .on("data", (data) => {
        if (data.AreaTypeCode === "CTY") {
          fPromises.push(processEntry(data));
        }
      })
      .on("end", () => {
        Promise.all(fPromises).then(() => {
          resolve("Finished processing file: " + element);
        });
      });
  });
}

function processEntry(data) {
  return new Promise((resolve, reject) => {
    ActualTotalLoad.findOneAndUpdate({
      map_code: data.MapCode,
      date_time: data.DateTime,
      update_time: data.UpdateTime,
      total_load_value: data.TotalLoadValue,
    }).then((result) => {
      resolve(result);
    });
  });
}
