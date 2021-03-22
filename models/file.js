const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema(
	{
		filename: { type: String, required: true },
		path: { type: String, require: true },
		size: { type: Number, require: true },
		uuid: { type: String, require: true },
		sender: { type: String, require: false },
		receiver: { type: String, require: false }
	},
	{ timestamps: true } // Add timestamps
);

module.exports = mongoose.model('File', fileSchema);
