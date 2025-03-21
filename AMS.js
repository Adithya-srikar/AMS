// Mock database
const database = {
    admin: {
        username: 'admin',
        password: 'admin123'
    },
    teachers: [
        { 
            username: 'SRKR-0001',
            password: 'teacher123',
            name: 'John Smith'
        },
        { 
            username: 'SRKR-0002',
            password: 'teacher456',
            name: 'Mary Johnson'
        }
    ],
    students: [],
    attendance: {}
};

// Utility functions
function showLogin(type) {
    document.querySelectorAll('.login-form').forEach(form => form.classList.add('hidden'));
    document.getElementById(`${type}Login`).classList.remove('hidden');
}

function showDashboard(type) {
    document.getElementById('loginContainer').classList.add('hidden');
    document.querySelectorAll('.dashboard').forEach(dash => dash.classList.add('hidden'));
    document.getElementById(`${type}Dashboard`).classList.remove('hidden');
    
    if (type === 'teacher') {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendanceDate').value = today;
        updateTotalStudents();
    }
}

function updateTotalStudents() {
    document.getElementById('totalStudents').textContent = database.students.length;
}

function logout() {
    document.querySelectorAll('.dashboard').forEach(dash => dash.classList.add('hidden'));
    document.getElementById('loginContainer').classList.remove('hidden');
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.add('hidden');
        form.reset();
    });
}

// Admin functions
document.getElementById('adminLogin').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === database.admin.username && password === database.admin.password) {
        showDashboard('admin');
        updateStudentsList();
    } else {
        alert('Invalid admin credentials');
    }
});

function addStudent() {
    const regNo = document.getElementById('newStudentRegNo').value;
    const name = document.getElementById('newStudentName').value;

    if (!regNo || !name) {
        alert('Please fill all fields');
        return;
    }

    if (database.students.some(student => student.regNo === regNo)) {
        alert('Student with this registration number already exists');
        return;
    }

    database.students.push({ regNo, name });
    database.attendance[regNo] = {};
    updateStudentsList();
    document.getElementById('newStudentRegNo').value = '';
    document.getElementById('newStudentName').value = '';
}

function updateStudentsList() {
    const list = document.getElementById('studentsList');
    list.innerHTML = database.students.map(student => 
        `<li>${student.name} (${student.regNo})</li>`
    ).join('');
}

// Teacher functions
document.getElementById('teacherLogin').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('teacherUsername').value;
    const password = document.getElementById('teacherPassword').value;

    const teacher = database.teachers.find(t => t.username === username && t.password === password);
    if (teacher) {
        showDashboard('teacher');
    } else {
        alert('Invalid teacher credentials');
    }
});

function submitAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const period = document.getElementById('periodSelect').value;
    const absenteeInput = document.getElementById('absenteeNumbers').value;
    
    if (!date) {
        alert('Please select a date');
        return;
    }

    const absentees = absenteeInput.split(',')
        .map(regNo => regNo.trim())
        .filter(regNo => regNo !== '');

    const invalidNumbers = absentees.filter(regNo => 
        !database.students.some(student => student.regNo === regNo)
    );

    if (invalidNumbers.length > 0) {
        alert(`Invalid registration numbers: ${invalidNumbers.join(', ')}`);
        return;
    }

    database.students.forEach(student => {
        if (!database.attendance[student.regNo][date]) {
            database.attendance[student.regNo][date] = {};
        }
        database.attendance[student.regNo][date][period] = !absentees.includes(student.regNo);
    });

    alert('Attendance submitted successfully');
    document.getElementById('absenteeNumbers').value = '';
}

// Student functions
document.getElementById('studentLogin').addEventListener('submit', (e) => {
    e.preventDefault();
    const regNo = document.getElementById('studentRegNo').value;

    const student = database.students.find(s => s.regNo === regNo);
    if (student) {
        showDashboard('student');
        displayStudentAttendance(regNo);
    } else {
        alert('Invalid student registration number');
    }
});

function displayStudentAttendance(regNo) {
    document.getElementById('studentRegNoDisplay').textContent = regNo;

    const studentAttendance = database.attendance[regNo] || {};
    let totalPresent = 0;
    let totalPeriods = 0;

    const periodWiseAttendance = document.getElementById('periodWiseAttendance');
    periodWiseAttendance.innerHTML = '';

    Object.entries(studentAttendance).forEach(([date, periods]) => {
        Object.entries(periods).forEach(([period, isPresent]) => {
            totalPeriods++;
            if (isPresent) totalPresent++;

            const attendanceRow = document.createElement('div');
            attendanceRow.className = 'period-attendance';
            attendanceRow.innerHTML = `
                <span>Date: ${date}, Period ${period}</span>
                <span>${isPresent ? 'Present' : 'Absent'}</span>
            `;
            periodWiseAttendance.appendChild(attendanceRow);
        });
    });

    const percentage = totalPeriods === 0 ? 0 : Math.round((totalPresent / totalPeriods) * 100);
    document.getElementById('attendancePercentage').textContent = percentage;
}

// Initialize with some sample data
database.students.push(
    { regNo: 'S001', name: 'John Doe' },
    { regNo: 'S002', name: 'Jane Smith' }
);
database.students.forEach(student => {
    database.attendance[student.regNo] = {};
});