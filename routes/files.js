// Creating a new router object to handle post requests
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuid4 } = require('uuid');

let storage = multer.diskStorage({
	// There are 3 parameters
	// cb => callback
	// extname tells the extension of the file ex-> input - qwerty.js result - .js
	destination: (req, file, cb) => cb(null, 'uploads/'), // Setting the default folder to uploads
	filename: (req, file, cb) => {
		const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
		cb(null, uniqueName);
	}
});

let upload = multer({
	storage, // Basically storage: storage can be written just storage as key: value are the same
	limit: {
		fileSize: 100 * 1024 * 1024
	}
}).single('myfile'); // Only one file is uploaded at a time

// To handle post request at url/api/files
router.post('/', (req, res) => {
	// Store file in uploads
	upload(req, res, async (err) => {
		// Validate request
		if (!req.file) {
			return res.json({ error: 'Empty fields submitted.' });
		}

		if (err) {
			return res.status(500).send({ error: 'err.message' });
		}
		// Store into database
		const file = new File({
			filename: req.file.filename,
			uuid: uuid4(),
			path: req.file.path,
			size: req.file.size
		});

		const response = await file.save();
		return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
	});

	// Response -> Link
});

router.post('/send', async (req, res) => {
	const { uuid, emailTo, emailFrom } = req.body;
	// Validating the request
	if (!uuid || !emailTo || !emailFrom) {
		return res.status(422).send({ error: 'All fields are required' });
	}

	// Get data from database
	const file = await File.findOne({ uuid: uuid });
	if (file.sender) {
		return res.status(422).send({ error: 'Email already sent' });
	}
	file.sender = emailFrom;
	file.receiver = emailTo;

	const response = await file.save();

	// Send email
	const sendMail = require('../services/emailService');
	sendMail({
		from: emailFrom,
		to: emailTo,
		subject: 'A file is shared with you',
		text: `${emailFrom} shared a file with you`,
		html: require('../services/emailTemplate')({
			emailFrom: emailFrom,
			downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
			size: file.size,
			expires: '24 Hours'
		})
	});
	return res.send({ success: true });
});

module.exports = router;
