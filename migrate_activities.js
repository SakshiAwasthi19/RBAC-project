const mongoose = require('mongoose');
const Student = require('./models/Student.model');
const Activity = require('./models/Activity.model');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pointmate');
        console.log('Connected for migration...');

        const students = await Student.find({});
        let migratedCount = 0;

        for (const student of students) {
            for (const act of student.activities) {
                // Check if already exists in Activity collection
                const exists = await Activity.findOne({
                    studentId: student._id,
                    title: act.title,
                    date: act.date
                });

                if (!exists) {
                    await Activity.create({
                        studentId: student._id,
                        title: act.title,
                        description: act.description,
                        domain: act.domain,
                        aictePoints: act.aictePoints,
                        date: act.date,
                        semester: act.semester,
                        eventId: act.eventId,
                        status: act.status,
                        remarks: act.remarks,
                        createdAt: act.createdAt || new Date()
                    });
                    migratedCount++;
                }
            }
        }

        console.log(`Migration complete. Created ${migratedCount} activity documents.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
