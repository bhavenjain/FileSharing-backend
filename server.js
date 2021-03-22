const express = require('express');
const ejs = require('ejs');
const connectDB = require('./config/db');

// initiate express
const app = express();

// Template engine
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download/', require('./routes/download'));

// Start the mongodb database
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
