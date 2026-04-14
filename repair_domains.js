const mongoose = require('mongoose');
const Activity = require('./models/Activity.model');
const Student = require('./models/Student.model');
require('dotenv').config();

const fixDomains = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pointmate');
        console.log('Connected...');

        // Fix standalone activities
        // Check for missing domain OR domain not in valid list
        const validDomains = ['Technical', 'Soft Skills', 'Community Service', 'Cultural', 'Sports', 'Environmental'];
        
        const standaloneResult = await Activity.updateMany(
            { $or: [{ domain: { $exists: false } }, { domain: null }, { domain: { $nin: validDomains } }] },
            { $set: { domain: 'Technical' } }
        );
        console.log(`Updated ${standaloneResult.modifiedCount} standalone activity domains.`);

        // Fix embedded activities in Students
        const students = await Student.find({});
        let updatedEmbeddedCount = 0;

        for (const student of students) {
            let changed = false;
            if (student.activities && student.activities.length > 0) {
                student.activities.forEach(act => {
                    if (!act.domain || !validDomains.includes(act.domain)) {
                        act.domain = 'Technical';
                        changed = true;
                        updatedEmbeddedCount++;
                    }
                });
            }

            if (changed) {
                student.calculateTotalPoints();
                await student.save();
            }
        }

        console.log(`Updated ${updatedEmbeddedCount} embedded activity domains across students.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixDomains();
