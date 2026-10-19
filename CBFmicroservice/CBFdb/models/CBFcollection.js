const mongoose = require('mongoose');

const CrossBorderFlow = new mongoose.Schema({
    in_map_code:{type: String, required: true},
    out_map_code:{type: String, required: true},
    date_time:{type: Date, required: true},
    update_time:{type: Date, required: true},
    flow_value:{type: Number, required: true},
}, {collection: 'crossborderflows'});

module.exports = mongoose.model('CrossBorderFlow', CrossBorderFlow);