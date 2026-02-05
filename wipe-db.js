const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pointmate')
    .then(async () => {
        console.log('Connected. Dropping database...');
        await mongoose.connection.dropDatabase();
        console.log('Database dropped.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
