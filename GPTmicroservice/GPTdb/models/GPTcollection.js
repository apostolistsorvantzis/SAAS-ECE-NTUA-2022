const mongoose = require('mongoose');

const GenerationPerType = new mongoose.Schema(
  {
    map_code: { type: String, required: true },
    production_type: { type: String, required: true },
    date_time: { type: Date, required: true },
    update_time: { type: Date, required: true },
    gpt_value: { type: Number, required: true },
  },
  { collection: 'generationpertypes' },
);

module.exports = mongoose.model('GenerationPerType', GenerationPerType);
