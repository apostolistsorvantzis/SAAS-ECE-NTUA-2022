/**
 * Script that imports data from a CSV file into a MongoDB collection.
 *
 * This uses the mongoimport command line tool which means that you need
 * to have it installed in your machine (either as part of the mongodb
 * installation process or by installing it separately).
 *
 * You can find installation instructions here:
 * https://www.mongodb.com/docs/database-tools/installation/installation/
 *
 * You can find the mongoimport documentation here:
 * https://docs.mongodb.com/manual/reference/program/mongoimport/
 */

const { spawn } = require("child_process");

const months = ["January", "February", "March"];

const dbs = [
  {
    name: "GPTdb",
    collection: "generationpertypes",
    path: "agpt",
  },
  {
    name: "CBFdb",
    collection: "crossborderflows",
    path: "ff",
  },
  {
    name: "ATLdb",
    collection: "actualtotalloads",
    path: "atl",
  },
];

for (const db of dbs) {
  for (let month of months) {
    const mi = spawn("mongoimport", [
      `mongodb://127.0.0.1:27017/${db.name}?retryWrites=true&w=majority`,
      "--collection",
      `${db.collection}`,
      "--type",
      "tsv",
      "--file",
      `saas2022data/${db.path}_minimal/${month}_fixed.csv`,
      "--headerline",
      "--columnsHaveTypes",
      "--ignoreBlanks",
    ]);

    mi.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    mi.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });

    mi.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
}
