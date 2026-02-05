const mongoose = require('mongoose');
// const { fetch } = require('undici'); 
const User = require('./models/User.model');
const Organization = require('./models/Organization.model');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for test setup steps...');

    const suffix = Math.random().toString(36).substring(7);
    const orgEmail = `org_${Date.now()}_${suffix}@test.com`;
    const orgPass = 'password123';

    let orgToken;
    let eventId;

    try {
        console.log('[1] Registering Org...');
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userType: 'organization',
                email: orgEmail,
                password: orgPass,
                institutionName: 'Event Org',
                aicteApprovalNumber: `AICTE_${Date.now()}_${suffix}`,
                fullName: 'Director',
                designation: 'Dir',
                authorizedPersonName: 'Director',
                contactNumber: '9999999999',
                organizationType: 'College/University',
                address: 'Bangalore',
                location: { address: 'Bangalore', coordinates: [77.5946, 12.9716] }
            })
        });
        const data = await res.json();
        if (!data.success) throw new Error('Org Reg Failed: ' + data.message);
        orgToken = data.token;
        const orgId = data.profile._id;

        await Organization.findByIdAndUpdate(orgId, { verificationStatus: 'verified' });
        console.log('✅ Org Registered and Verified (Manually)');

        const Event = require('./models/Event.model');
        const event = await Event.create({
            organizationId: orgId,
            title: 'Test Hackathon',
            description: 'A great hackathon',
            domain: 'Technical',
            aictePoints: 10,
            poster: { url: 'http://mock.com/img.jpg', publicId: 'mock' },
            organizedBy: 'Event Org',
            location: { type: 'Point', coordinates: [77.5946, 12.9716], venue: 'Campus' },
            startDateTime: new Date(Date.now() + 86400000),
            endDateTime: new Date(Date.now() + 172800000),
            registrationDeadline: new Date(Date.now() + 86400000),
            status: 'approved'
        });
        eventId = event._id.toString();
        console.log(`✅ Event Created Mock: ${eventId}`);

    } catch (e) {
        console.error('Setup Error:', e.message);
        process.exit(1);
    }

    // 4. Student Register
    try {
        console.log('[4] Registering Student & Booking...');
        const stuRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userType: 'student',
                email: `student_${Date.now()}_${suffix}@test.com`,
                password: 'password123',
                firstName: 'Student',
                lastName: 'One',
                studentId: `USN_${Date.now()}_${suffix}`,
                collegeName: 'Engg College',
                year: '3rd',
                branch: 'CS',
                semester: 5,
                graduationYear: '2025',
                phoneNumber: Math.random().toString().slice(2, 12),
                address: 'Test Addr'
            })
        });
        const stuData = await stuRes.json();
        console.log('Student Reg Response:', JSON.stringify(stuData));

        if (!stuData.success) {
            console.error('❌ Student Reg Failed');
            process.exit(1);
        }

        const stuToken = stuData.token;

        // Register for event
        console.log('Booking with token:', stuToken.substring(0, 10) + '...');
        const bookRes = await fetch(`${BASE_URL}/events/${eventId}/register`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${stuToken}` }
        });
        const bookData = await bookRes.json();

        if (bookData.success) {
            console.log('✅ Registered for Event');
            console.log('Pass ID:', bookData.data.passId);

            const passRes = await fetch(`${BASE_URL}/events/${eventId}/pass`, {
                headers: { 'Authorization': `Bearer ${stuToken}` }
            });
            const passData = await passRes.json();
            if (passData.success) {
                console.log('✅ QR Code Pass Generated');
            } else {
                console.error('❌ Pass Generation Failed:', passData.message);
            }

        } else {
            console.error('❌ Booking Failed:', JSON.stringify(bookData));
        }

    } catch (e) { console.error('Student Flow Error:', e); }

    mongoose.connection.close();
}

runTest();
