const mongoose = require('mongoose');
const Student = require('./models/Student.model');
const Activity = require('./models/Activity.model');
require('dotenv').config();

const repair = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pointmate');
        console.log('Connected...');

        const activities = await Activity.find({});
        console.log(`Found ${activities.length} activities in standalone collection.`);

        for (const act of activities) {
            const student = await Student.findById(act.studentId);
            if (!student) continue;

            const match = student.activities.find(a => {
                const titleMatch = a.title.toLowerCase().trim() === act.title.toLowerCase().trim();
                const dateMatch = new Date(a.date).toDateString() === new Date(act.date).toDateString();
                const eventMatch = a.eventId && act.eventId && a.eventId.toString() === act.eventId.toString();
                return eventMatch || (titleMatch && dateMatch);
            });

            if (match) {
                if (match.status !== act.status) {
                    console.log(`Updating status for "${act.title}" in student "${student.firstName}": ${match.status} -> ${act.status}`);
                    match.status = act.status;
                    if (act.remarks) match.remarks = act.remarks;
                    
                    student.calculateTotalPoints();
                    await student.save();
                }
            } else {
                console.warn(`No match found in student "${student.firstName}" for activity "${act.title}"`);
            }
        }

        console.log('Repair complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

repair();
