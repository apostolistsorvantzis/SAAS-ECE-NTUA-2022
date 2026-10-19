function connect() {
  let Client = require("ssh2-sftp-client");
  let sftp = new Client();
  return new Promise((resolve, reject) => {
    sftp
      .connect({
        host: "localhost",
        port: "22",
        username: "foo",
        password: "pass",
      })
      .then(() => {
        resolve(sftp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function upload(sftp, file) {
  return new Promise((resolve, reject) => {
    sftp
      .put(file, `/upload/${file}`)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function disconnect(sftp) {
  return new Promise((resolve, reject) => {
    sftp
      .end()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function createCsv(data) {
  let csv = require("csv-string");
  return csv.stringify(data);
}

function writeCsv(filePath, data, flag = "a+") {
  const fs = require("fs");
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, { flag }, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function readCsv(filePath) {
  const fs = require("fs");
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function createSampleCsvHeaders(type) {
  const fs = require("fs");
  // If file exists, skip everything
  if (fs.existsSync(`${type}.csv`)) {
    return;
  }

  let data;
  switch (type) {
    case "gpt":
      data = [
        [
          "map_code",
          "production_type",
          "date_time",
          "update_time",
          "gpt_value",
        ],
      ];
      break;
    case "cbf":
      data = [
        [
          "in_map_code",
          "out_map_code",
          "date_time",
          "update_time",
          "flow_value",
        ],
      ];
      break;
    case "atl":
      data = [["map_code", "date_time", "update_time", "total_load_value"]];
      break;
    default:
      data = null;
  }

  if (!data) {
    return null;
  }

  let csv = createCsv(data);

  return writeCsv(`${type}.csv`, csv);
}

function createEmptyCsvData(type, offset) {
  const map_code = ["AL", "GR", "IT"];
  const production_type = ["wind", "solar", "hydro"];

  // Get a random map_code
  const randomMapCode = map_code[Math.floor(Math.random() * map_code.length)];
  // Get a random production_type
  const randomProductionType =
    production_type[Math.floor(Math.random() * production_type.length)];
  // Date time in YYYY-MM-DD HH:MM:SS format
  let date_time = new Date("2022-07-01 00:00:00");

  date_time.setMinutes(date_time.getMinutes() + offset * 15);
  date_time = date_time.toISOString().slice(0, 19).replace("T", " ");

  const update_time = new Date().toISOString().slice(0, 19).replace("T", " ");

  // Get random decimal gpt_value between 0 and 999 with 1 decimals
  const gpt_value = Math.floor(Math.random() * 1000) / 10;

  // Get different random map code than before
  const in_map_code = map_code.filter((code) => code !== randomMapCode)[
    Math.floor(Math.random() * (map_code.length - 1))
  ];

  let data;
  // having the actual value in each case be 0 means that the value is not available
  switch (type) {
    case "gpt":
      data = [[randomMapCode, randomProductionType, date_time, update_time, 0]];
      break;
    case "cbf":
      data = [[in_map_code, randomMapCode, date_time, update_time, 0]];
      break;
    case "atl":
      data = [[randomMapCode, date_time, update_time, 0]];
      break;
    default:
      data = null;
  }

  if (!data) {
    return null;
  }

  let csv = createCsv(data);

  return writeCsv(`${type}.csv`, csv);
}

function createSampleCsvData(type, offset) {
  const map_code = ["AL", "GR", "IT"];
  const production_type = ["wind", "solar", "hydro"];

  // Get a random map_code
  const randomMapCode = map_code[Math.floor(Math.random() * map_code.length)];
  // Get a random production_type
  const randomProductionType =
    production_type[Math.floor(Math.random() * production_type.length)];
  // Date time in YYYY-MM-DD HH:MM:SS format
  let date_time = new Date("2022-07-01 00:00:00");

  date_time.setMinutes(date_time.getMinutes() + offset * 15);
  date_time = date_time.toISOString().slice(0, 19).replace("T", " ");

  const update_time = new Date().toISOString().slice(0, 19).replace("T", " ");

  // Get random decimal gpt_value between 0 and 999 with 1 decimals
  const gpt_value = Math.floor(Math.random() * 1000) / 10;

  // Get different random map code than before
  const in_map_code = map_code.filter((code) => code !== randomMapCode)[
    Math.floor(Math.random() * (map_code.length - 1))
  ];

  let data;
  switch (type) {
    case "gpt":
      data = [
        [
          randomMapCode,
          randomProductionType,
          date_time,
          update_time,
          gpt_value,
        ],
      ];
      break;
    case "cbf":
      data = [[in_map_code, randomMapCode, date_time, update_time, gpt_value]];
      break;
    case "atl":
      data = [[randomMapCode, date_time, update_time, gpt_value]];
      break;
    default:
      data = null;
  }

  if (!data) {
    return null;
  }

  let csv = createCsv(data);

  return writeCsv(`${type}.csv`, csv);
}

async function init() {
  // Delete the csv files
  const fs = require("fs");
  fs.unlinkSync("gpt.csv");
  fs.unlinkSync("cbf.csv");
  fs.unlinkSync("atl.csv");

  const sftp = await connect();

  const CronJob = require("cron").CronJob;

  let time_counter = 0;
  let finished = false;

  const sftpJob = new CronJob("*/5 * * * * *", async () => {
    try {
      await createSampleCsvHeaders("gpt");
      await createSampleCsvHeaders("cbf");
      await createSampleCsvHeaders("atl");

      if (time_counter % 10 === 0) {
        await createEmptyCsvData("gpt", time_counter);
        await createEmptyCsvData("cbf", time_counter);
        await createEmptyCsvData("atl", time_counter);
        time_counter++;
        // } else if (time_counter === 96) { // 96 * 15 = 1440 minutes (24 hours)
      } else if (time_counter === 21) {
        finished = true;
      } else {
        await createSampleCsvData("gpt", time_counter);
        await createSampleCsvData("cbf", time_counter);
        await createSampleCsvData("atl", time_counter);
        time_counter++;
      }

      await upload(sftp, "gpt.csv");
      await upload(sftp, "cbf.csv");
      await upload(sftp, "atl.csv");
    } catch (err) {
      console.log(err);
    }

    if (finished) {
      console.log("Finished creating entries...");
      updateSftpJob.start();
      sftpJob.stop();
    }
  });

  // This cron job will start immediately after the previous one and will run every 10 seconds
  // in order to replace all the missing values from our sftp files.
  // We will use the locally stored files for simplicity but the updates will be pushed to the sftp server
  // and *should* be reflected in real time in the frontend.
  const updateSftpJob = new CronJob("*/10 * * * * *", async () => {
    const fileNames = ["gpt.csv", "cbf.csv", "atl.csv"];

    let data, data_array, fileName;

    for (let i = 0; i < fileNames.length; i++) {
      fileName = fileNames[i];
      data = await readCsv(fileName);
      data_array = data.match(/,0\r?\n/g);
      if (data_array) {
        break;
      }
    }
    // If we didn't find any missing values in the file, we will stop the cron job
    if (!data_array) {
      console.log("Finished updating lines with new data...");
      disconnect(sftp);
      updateSftpJob.stop();
    } else {
      // We will replace the missing values with random values
      for (let i = 0; i < data_array.length; i++) {
        const randomValue = Math.floor(Math.random() * 1000) / 10;
        data = data.replace(data_array[i], `,${randomValue}\r\n`);
      }
      // We will write the new data to the file
      await writeCsv(fileName, data, "w");
      // We will upload the new file to the sftp server
      await upload(sftp, fileName);
    }
  });

  sftpJob.start();
}

init();
