import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import User from './models/User.js';
import Club from './models/Club.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    await Event.deleteMany();
    await User.deleteMany();
    await Club.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@college.edu',
      password_hash: hash,
      roll_number: 'ADMIN001',
      department: 'IT',
      year: 4,
      role: 'super_admin',
      is_verified: true
    });

    // Create Club Admin
    const clubAdmin = await User.create({
      name: 'Tech Club Head',
      email: 'techclub@college.edu',
      password_hash: hash,
      roll_number: 'TECH001',
      department: 'CSE',
      year: 3,
      role: 'club_admin',
      is_verified: true
    });

    // Create Student
    const student = await User.create({
      name: 'John Doe',
      email: 'john@student.edu',
      password_hash: hash,
      roll_number: '2023CS01',
      department: 'CSE',
      year: 2,
      role: 'student',
      is_verified: true
    });

    // Create Club
    const club = await Club.create({
      name: 'Robotics Society',
      description: 'The official robotics and automation club.',
      admin_user_id: clubAdmin._id
    });

    // Create Events
    await Event.create({
      title: 'Hackathon 2026',
      description: '36-hour coding marathon to solve real-world problems.',
      banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop',
      category: 'technical',
      venue: 'Main Auditorium',
      start_datetime: new Date(Date.now() + 86400000 * 5), // 5 days from now
      end_datetime: new Date(Date.now() + 86400000 * 6),
      registration_deadline: new Date(Date.now() + 86400000 * 3),
      max_capacity: 100,
      status: 'published',
      is_paid: false,
      created_by: clubAdmin._id,
      club_id: club._id
    });

    await Event.create({
      title: 'Annual Cultural Fest: Nexus',
      description: 'The biggest cultural extravaganza of the year. Music, dance, and more!',
      banner_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
      category: 'cultural',
      venue: 'Open Air Theatre',
      start_datetime: new Date(Date.now() + 86400000 * 15),
      end_datetime: new Date(Date.now() + 86400000 * 17),
      registration_deadline: new Date(Date.now() + 86400000 * 10),
      max_capacity: 1000,
      status: 'published',
      is_paid: true,
      price: 150,
      created_by: superAdmin._id
    });

    await Event.create({
      title: 'Inter-College Esports Tournament',
      description: 'Valorant and BGMI tournaments with massive prize pools. Register your squad now!',
      banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
      category: 'sports',
      venue: 'Computer Center Labs',
      start_datetime: new Date(Date.now() + 86400000 * 3), // 3 days from now
      end_datetime: new Date(Date.now() + 86400000 * 4),
      registration_deadline: new Date(Date.now() + 86400000 * 1),
      max_capacity: 64,
      status: 'published',
      is_paid: true,
      price: 500,
      created_by: clubAdmin._id,
      club_id: club._id
    });

    await Event.create({
      title: 'AI Genesis Workshop',
      description: 'Learn to build your own Gen-AI agents using Llama and LangChain from absolute scratch.',
      banner_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
      category: 'workshop',
      venue: 'Seminar Hall B',
      start_datetime: new Date(Date.now() + 86400000 * 10),
      end_datetime: new Date(Date.now() + 86400000 * 10).setHours(17, 0, 0, 0),
      registration_deadline: new Date(Date.now() + 86400000 * 7),
      max_capacity: 120,
      status: 'published',
      is_paid: false,
      created_by: clubAdmin._id,
      club_id: club._id
    });

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
