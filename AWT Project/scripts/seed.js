require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_events';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Club.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing data');

  // ── Create Superadmin ──────────────────────────────────
  const superadmin = await User.create({
    name: 'Dr. Admin Sharma',
    email: 'admin@college.edu',
    password: 'Admin@123',
    role: 'superadmin',
    enrollmentNo: 'SA001',
  });
  console.log('👑 Superadmin created → admin@college.edu / Admin@123');

  // ── Create Club Admins (users first) ──────────────────
  const techAdminUser = await User.create({
    name: 'Rahul Mehta',
    email: 'techclub@college.edu',
    password: 'Club@123',
    role: 'club_admin',
    enrollmentNo: 'CA001',
  });
  const culturalAdminUser = await User.create({
    name: 'Priya Patel',
    email: 'cultural@college.edu',
    password: 'Club@123',
    role: 'club_admin',
    enrollmentNo: 'CA002',
  });
  const sportsAdminUser = await User.create({
    name: 'Arjun Singh',
    email: 'sports@college.edu',
    password: 'Club@123',
    role: 'club_admin',
    enrollmentNo: 'CA003',
  });

  // ── Create Clubs ───────────────────────────────────────
  const techClub = await Club.create({
    name: 'TechVerse Club',
    description: 'Empowering students through technology, innovation, and coding competitions.',
    tags: ['coding', 'AI', 'robotics', 'hackathon'],
    adminUser: techAdminUser._id,
    foundedYear: 2018,
  });
  const culturalClub = await Club.create({
    name: 'Rang Mahotsav',
    description: 'Celebrating diversity through music, dance, drama, and art.',
    tags: ['music', 'dance', 'drama', 'art'],
    adminUser: culturalAdminUser._id,
    foundedYear: 2015,
  });
  const sportsClub = await Club.create({
    name: 'Champions Sports Club',
    description: 'Fostering sportsmanship and athletic excellence across all disciplines.',
    tags: ['cricket', 'football', 'basketball', 'athletics'],
    adminUser: sportsAdminUser._id,
    foundedYear: 2012,
  });

  // Link club to users
  await User.findByIdAndUpdate(techAdminUser._id, { clubRef: techClub._id });
  await User.findByIdAndUpdate(culturalAdminUser._id, { clubRef: culturalClub._id });
  await User.findByIdAndUpdate(sportsAdminUser._id, { clubRef: sportsClub._id });

  console.log('🏛️  3 Clubs created');
  console.log('   techclub@college.edu / Club@123 → TechVerse Club');
  console.log('   cultural@college.edu / Club@123 → Rang Mahotsav');
  console.log('   sports@college.edu   / Club@123 → Champions Sports Club');

  // ── Create Students ────────────────────────────────────
  const studentData = [
    { name: 'Aanya Kapoor', email: 'aanya@college.edu', enrollmentNo: 'S21CS001' },
    { name: 'Dev Sharma', email: 'dev@college.edu', enrollmentNo: 'S21EC002' },
    { name: 'Simran Kaur', email: 'simran@college.edu', enrollmentNo: 'S22ME003' },
    { name: 'Karan Joshi', email: 'karan@college.edu', enrollmentNo: 'S22CS004' },
    { name: 'Nisha Verma', email: 'nisha@college.edu', enrollmentNo: 'S23IT005' },
  ];
  const students = await User.insertMany(
    studentData.map((s) => ({ ...s, password: 'Student@123', role: 'student' }))
  );
  console.log('👤 5 Students created → password: Student@123');

  // ── Create Events ──────────────────────────────────────
  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const events = await Event.create([
    {
      title: 'HackSprint 2024 — 24-Hour Hackathon',
      description: 'A 24-hour coding marathon where teams build innovative solutions to real-world problems. Cash prizes worth ₹50,000! Open to all branches and years.',
      club: techClub._id,
      createdBy: techAdminUser._id,
      venue: 'Seminar Hall A, Block 3',
      startDateTime: future(10),
      endDateTime: future(11),
      capacity: 200,
      registrationDeadline: future(8),
      status: 'approved',
      approvedBy: superadmin._id,
      approvedAt: new Date(),
      category: 'technical',
      tags: ['hackathon', 'coding', 'prizes'],
      registrationCount: 3,
    },
    {
      title: 'AI & ML Workshop — Hands-on with Python',
      description: 'A full-day practical workshop on Machine Learning fundamentals using Python, Scikit-learn and TensorFlow. Bring your laptop!',
      club: techClub._id,
      createdBy: techAdminUser._id,
      venue: 'Computer Lab 2, Block 1',
      startDateTime: future(5),
      endDateTime: future(5),
      capacity: 60,
      registrationDeadline: future(3),
      status: 'approved',
      approvedBy: superadmin._id,
      approvedAt: new Date(),
      category: 'workshop',
      tags: ['AI', 'ML', 'Python', 'workshop'],
      registrationCount: 2,
    },
    {
      title: 'Tarang — Annual Cultural Festival',
      description: 'The biggest cultural extravaganza of the year! Music, dance battles, stand-up comedy, fashion show and more. Three days of non-stop entertainment.',
      club: culturalClub._id,
      createdBy: culturalAdminUser._id,
      venue: 'Open Air Amphitheatre',
      startDateTime: future(20),
      endDateTime: future(22),
      capacity: 1000,
      registrationDeadline: future(18),
      status: 'approved',
      approvedBy: superadmin._id,
      approvedAt: new Date(),
      category: 'cultural',
      tags: ['festival', 'music', 'dance', 'comedy'],
      registrationCount: 1,
    },
    {
      title: 'Inter-College Cricket Tournament',
      description: 'Annual 20-over cricket tournament. Register your team of 11 players. Top college teams from across the state will compete for the championship trophy.',
      club: sportsClub._id,
      createdBy: sportsAdminUser._id,
      venue: 'College Cricket Ground',
      startDateTime: future(15),
      endDateTime: future(17),
      capacity: 300,
      registrationDeadline: future(12),
      status: 'pending',
      category: 'sports',
      tags: ['cricket', 'tournament', 'inter-college'],
      registrationCount: 0,
    },
    {
      title: 'Entrepreneurship Summit 2024',
      description: 'Featuring startup founders, angel investors, and industry experts. Pitch your startup idea and win mentorship and seed funding opportunities.',
      club: techClub._id,
      createdBy: techAdminUser._id,
      venue: 'Main Auditorium',
      startDateTime: future(25),
      endDateTime: future(25),
      capacity: 500,
      registrationDeadline: future(23),
      status: 'pending',
      category: 'seminar',
      tags: ['entrepreneurship', 'startups', 'funding'],
      registrationCount: 0,
    },
    {
      title: 'Classical Dance Competition',
      description: 'Showcase your classical dance talent — Bharatanatyam, Kathak, Odissi, and more. Solo and group categories. Expert panel of judges.',
      club: culturalClub._id,
      createdBy: culturalAdminUser._id,
      venue: 'Cultural Hall, Block 2',
      startDateTime: future(-5),
      endDateTime: future(-5),
      capacity: 100,
      registrationDeadline: future(-7),
      status: 'rejected',
      rejectionReason: 'Venue already booked for the date. Please reschedule.',
      category: 'cultural',
      tags: ['dance', 'classical', 'competition'],
      registrationCount: 0,
    },
  ]);

  console.log('📅 6 Events created (3 approved, 2 pending, 1 rejected)');

  // ── Create Registrations ───────────────────────────────
  const hackSprint = events[0];
  const aiWorkshop = events[1];
  const tarang = events[2];

  const regs = await Registration.create([
    { event: hackSprint._id, student: students[0]._id, checkedIn: true, checkedInAt: new Date() },
    { event: hackSprint._id, student: students[1]._id, checkedIn: false },
    { event: hackSprint._id, student: students[2]._id, checkedIn: false },
    { event: aiWorkshop._id, student: students[0]._id, checkedIn: false },
    { event: aiWorkshop._id, student: students[3]._id, checkedIn: false },
    { event: tarang._id, student: students[4]._id, checkedIn: false },
  ]);

  console.log('🎫 6 Registrations created');

  // ── Summary ────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55));
  console.log('🎉 SEED COMPLETE — Demo Credentials');
  console.log('═'.repeat(55));
  console.log('👑 Superadmin : admin@college.edu      / Admin@123');
  console.log('🎓 Club Admin : techclub@college.edu   / Club@123');
  console.log('🎓 Club Admin : cultural@college.edu   / Club@123');
  console.log('🎓 Club Admin : sports@college.edu     / Club@123');
  console.log('👤 Student    : aanya@college.edu      / Student@123');
  console.log('👤 Student    : dev@college.edu        / Student@123');
  console.log('═'.repeat(55) + '\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
