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

module.exports = fastcsvdiff;