const mongoose = require('mongoose');

const SampleEntrySchema = new mongoose.Schema({
  location: { type: String, required: true },
  method: {
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String }
  },
  sampleMeta: {
    batchId: { type: String, required: true },
    operator: { type: String },
    timestamp: { type: Date, required: true },
    stage: { type: String, enum: ['before', 'after'], required: true }
  },
  measurements: {
    waterQuality: {
      pH: Number,
      temperature: Number,
      turbidity: Number,
      DO: Number,
      BOD: Number,
      COD: Number,
      TDS: Number,
      EC: Number
    },
    dye: {
      name: String,
      initialConcentration: Number,
      finalConcentration: Number,
      absorbanceInitial: Number,
      absorbanceFinal: Number,
      wavelength: Number
    },
    heavyMetals: {
      Cr: Number,
      Pb: Number,
      Zn: Number,
      Cu: Number,
      Ni: Number,
      Ammonia: Number
    }
  },
  note: String // Optional: for user notes/tags
});

module.exports = mongoose.model('SampleEntry', SampleEntrySchema);