const mongoose = require('mongoose');
const Student = require('./models/Student.model');
const Activity = require('./models/Activity.model');
require('dotenv').config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pointmate');
        console.log('Connected...');

        const activity = await Activity.findOne({ title: /nptel/i });
        if (activity) {
            console.log('Activity collection entry:');
            console.log(`  Title: ${activity.title}`);
            console.log(`  Status: ${activity.status}`);
            console.log(`  StudentId: ${activity.studentId}`);
            
            const student = await Student.findById(activity.studentId);
            if (student) {
                console.log('Student found:', student.firstName);
                console.log(`Total Points: ${student.totalPoints}`);
                const match = student.activities.find(a => a.title.toLowerCase().includes('nptel'));
                if (match) {
                    console.log('Embedded activity found:');
                    console.log(`  Title: ${match.title}`);
                    console.log(`  Status: ${match.status}`);
                } else {
                    console.log('Embedded activity NOT found!');
                }
            }
        } else {
            console.log('No activity with "nptel" in title found in Activity collection.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
