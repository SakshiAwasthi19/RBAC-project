// using native fetch
const BASE_URL = 'http://localhost:5000/api';

async function testStudentFlow() {
    console.log('--- Starting Student Flow Tests (Updated Routes) ---');

    console.log('[1] Login Student (using existing credential logic if feasible, or register new)');
    // Register new to be safe
    const uniqueId = Math.random().toString(36).substring(7);
    const studentData = {
        email: `student_${uniqueId}@test.com`,
        password: 'password123',
        userType: 'student',
        firstName: 'Alex',
        lastName: 'Test',
        studentId: `USN_${uniqueId}`,
        collegeName: 'Test College',
        year: '3rd',
        branch: 'ECE',
        semester: 6,
        graduationYear: '2025',
        phoneNumber: Math.floor(Math.random() * 10000000000).toString(),
        address: 'Test Address'
    };

    let token;

    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        const data = await res.json();
        if (res.status === 201 && data.success) {
            token = data.token;
            console.log('✅ Registered');
        } else {
            console.log('FULL ERROR MSG: ', data.message);
            console.error('❌ Registration Failed');
            return;
        }
    } catch (e) { console.error('Error:', e); return; }

    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 2. Get Profile (UPDATED URL: /api/students/profile)
    try {
        console.log('\n[2] Get Profile...');
        const res = await fetch(`${BASE_URL}/students/profile`, { headers: authHeaders });
        const data = await res.json();
        if (data.success) {
            console.log('✅ Profile Fetched (/students/profile)');
        } else {
            console.error('❌ Profile Fail:', res.status, data.message);
        }
    } catch (e) { console.error('Error:', e); }

    // 3. Get Points (UPDATED URL: /api/students/points)
    try {
        console.log('\n[3] Get Points...');
        const res = await fetch(`${BASE_URL}/students/points`, { headers: authHeaders });
        const data = await res.json();
        if (data.success) {
            console.log('✅ Points Fetched (/students/points)');
        } else {
            console.error('❌ Points Fail:', res.status, data.message);
        }
    } catch (e) { console.error('Error:', e); }
}

testStudentFlow();
