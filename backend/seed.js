/**
 * HU Campus Guard Database Seeder
 * Run: node backend/seed.js
 * Creates demo accounts for testing all 3 roles
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing seed data (identified by email pattern)
    const seedEmails = ['student@hu.edu.pk', 'proctor@hu.edu.pk', 'chief@hu.edu.pk'];
    await User.deleteMany({ email: { $in: seedEmails } });
    console.log('🧹 Cleared old seed users');

    // Create users (passwords will be hashed by pre-save hook)
    const [student, proctor, chief] = await User.create([
      {
        name: 'Ali Raza Khan',
        email: 'student@hu.edu.pk',
        password: 'password123',
        role: 'student',
        rollNumber: 'HU-CS-2021-01',
        department: 'Computer Science',
        semester: '5th',
        phone: '0333-1234567',
        isActive: true,
      },
      {
        name: 'Dr. Imran Hussain',
        email: 'proctor@hu.edu.pk',
        password: 'password123',
        role: 'proctor',
        department: 'Computer Science',
        phone: '0300-9876543',
        isActive: true,
      },
      {
        name: 'Prof. Zahid Ullah',
        email: 'chief@hu.edu.pk',
        password: 'password123',
        role: 'chief_proctor',
        department: 'Administration',
        phone: '0345-1112233',
        isActive: true,
      },
    ]);

    console.log('👤 Created demo users:');
    console.log('   👨‍🎓 302-221045/ password123');
    console.log('   👮 proctor@hu.edu.pk / password123');
    console.log('   🏛️  chief@hu.edu.pk / password123');

    // Create sample complaints
    const complaints = await Complaint.create([
      {
        title: 'Harassment in Library Block',
        description: 'A group of senior students have been harassing juniors near the library building entrance. This has been happening for the past week. They use intimidating language and block the entrance.',
        category: 'harassment',
        priority: 'high',
        status: 'pending',
        submittedBy: student._id,
        location: 'Library Block, Ground Floor',
        incidentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        statusHistory: [{ status: 'pending', changedBy: student._id, note: 'Complaint submitted' }],
      },
      {
        title: 'Smoking Near Canteen Area',
        description: 'Several students have been smoking near the main canteen during lunch hours. The smoke is affecting other students and is clearly a violation of campus rules.',
        category: 'smoking',
        priority: 'medium',
        status: 'under_review',
        submittedBy: student._id,
        assignedTo: proctor._id,
        assignedBy: chief._id,
        assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: 'Main Canteen',
        statusHistory: [
          { status: 'pending', changedBy: student._id, note: 'Complaint submitted' },
          { status: 'under_review', changedBy: chief._id, note: `Assigned to ${proctor.name}` },
        ],
        comments: [{
          author: chief._id,
          authorRole: 'chief_proctor',
          text: 'This has been assigned to Proctor Imran for investigation.',
          isInternal: false,
        }],
      },
      {
        title: 'Ragging in New Student Hostel',
        description: 'New students in Block-C hostel are being ragged by seniors. The incidents occur late at night and involve forced tasks and verbal abuse.',
        category: 'ragging',
        priority: 'urgent',
        status: 'in_progress',
        submittedBy: student._id,
        assignedTo: proctor._id,
        assignedBy: chief._id,
        location: 'Block-C Hostel',
        statusHistory: [
          { status: 'pending', changedBy: student._id, note: 'Complaint submitted' },
          { status: 'under_review', changedBy: chief._id, note: 'Assigned to proctor' },
          { status: 'in_progress', changedBy: proctor._id, note: 'Investigation started' },
        ],
      },
      {
        title: 'Academic Misconduct During Exam',
        description: 'Multiple students were caught using unauthorized materials during the mid-term examination in CS-301. I have the roll numbers.',
        category: 'academic',
        priority: 'high',
        status: 'resolved',
        submittedBy: student._id,
        assignedTo: proctor._id,
        assignedBy: chief._id,
        resolution: 'The implicated students have been issued formal warning letters. Their examination has been cancelled for this paper and they will appear in a supplementary exam with strict invigilation.',
        resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        resolvedBy: proctor._id,
        location: 'Exam Hall, Block-A',
        statusHistory: [
          { status: 'pending', changedBy: student._id, note: 'Complaint submitted' },
          { status: 'resolved', changedBy: proctor._id, note: 'Action taken' },
        ],
      },
      {
        title: 'Anonymous: Theft in Computer Lab',
        description: 'Someone has been stealing accessories from Computer Lab-2. Three mice and two keyboards have gone missing this week.',
        category: 'theft',
        priority: 'medium',
        status: 'pending',
        isAnonymous: true,
        location: 'Computer Lab-2, Block-B',
        statusHistory: [{ status: 'pending', note: 'Anonymous complaint submitted' }],
      },
    ]);

    console.log(`\n📋 Created ${complaints.length} sample complaints`);

    // Create sample notification
    await Notification.create({
      recipient: chief._id,
      title: 'Welcome to HU Campus Guard',
      message: 'Your Chief Proctor dashboard is ready. Start managing campus complaints.',
      type: 'system',
    });

    console.log('\n✅ Seed completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎓 Demo Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍🎓 Student:      302-221045  / password123');
    console.log('👮  Proctor:      proctor@hu.edu.pk  / password123');
    console.log('🏛️  Chief Proctor: chief@hu.edu.pk    / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
