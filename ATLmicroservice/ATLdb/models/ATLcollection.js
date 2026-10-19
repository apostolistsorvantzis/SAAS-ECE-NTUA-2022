const mongoose = require('mongoose');

const ActualTotalLoad = new mongoose.Schema(
  {
    map_code: { type: String, required: true },
    date_time: { type: Date, required: true },
    update_time: { type: Date, required: true },
    total_load_value: { type: Number, required: true },
  },
  { collection: 'actualtotalloads' },
);

module.exports = mongoose.model('ActualTotalLoad', ActualTotalLoad);
