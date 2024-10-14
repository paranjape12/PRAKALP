const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const profileRoutes = require('./routes/profileRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const corsOptions = {
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use('/api', profileRoutes);
app.use('/api', taskRoutes);
app.use('/api', projectRoutes);

app.get('/', (req, res) => {
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    };

    const timestamp = new Date().toLocaleString('en-GB', options);

    res.json({
        status: 'Active',
        timestamp: timestamp
    });
});


module.exports = app;
