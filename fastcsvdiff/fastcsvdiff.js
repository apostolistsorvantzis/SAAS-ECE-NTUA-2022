const fs = require('fs');

function fastcsvdiff(fileNew, fileOld) {
  const newFile = fs.readFileSync(fileNew, { encoding: 'ascii' });
  const newFileArray = newFile.split(/\r?\n/g);
  const oldFile = fs.readFileSync(fileOld, { encoding: 'ascii' });
  const oldFileArray = oldFile.split(/\r?\n/g);
  const diff = [];
  
  // Filter items in each array that do not contain the the string: CTY
  const newFileArrayFiltered = newFileArray.filter(item => item.includes('CTY'));
  const oldFileArrayFiltered = oldFileArray.filter(item => item.includes('CTY'));

  // Sort the 2 arrays
  oldFileArrayFiltered.sort();
  newFileArrayFiltered.sort();

  for (let i = 0; i < newFileArrayFiltered.length; i++) {
    if (newFileArrayFiltered[i] !== oldFileArrayFiltered[i]) {
      diff.push(newFileArrayFiltered[i]);
    }
  }
  return diff;
}

function compare_benchmark() {
  console.time(__filename);
  
  // ATL
  // const fileOld = 'test_data/worst_case/atl/2022_01_31_22_ActualTotalLoad6.1.A.csv';
  // const fileNew = 'test_data/worst_case/atl/2022_01_31_23_ActualTotalLoad6.1.A.csv';
  // AGPT
  const fileOld = 'test_data/worst_case/agpt/2022_01_31_22_AggregatedGenerationPerType16.1.BC.csv';
  const fileNew = 'test_data/worst_case/agpt/2022_01_31_23_AggregatedGenerationPerType16.1.BC.csv';
  // FF
  // const fileOld = 'test_data/worst_case/ff/2022_01_31_22_PhysicalFlows12.1.G.csv';
  // const fileNew = 'test_data/worst_case/ff/2022_01_31_23_PhysicalFlows12.1.G.csv';

  const diff = fastcsvdiff(fileNew, fileOld);
  console.log(diff);

  console.timeEnd(__filename);
  
}

compare_benchmark();


module.exports = fastcsvdiff;