-- Seed Data for ProjectHub Phase 1 & Phase 2

-- Clean existing data in reverse dependency order
TRUNCATE TABLE join_requests, team_members, teams, project_skills, projects, user_skills, skills, profiles, users RESTART IDENTITY CASCADE;

-- 1. Seed Users
INSERT INTO users (id, email, role) VALUES
('11111111-1111-1111-1111-111111111111', 'rahul@projecthub.dev', 'student'),
('22222222-2222-2222-2222-222222222222', 'aman@projecthub.dev', 'student'),
('33333333-3333-3333-3333-333333333333', 'priya@projecthub.dev', 'student'),
('44444444-4444-4444-4444-444444444444', 'neha@projecthub.dev', 'student'),
('55555555-5555-5555-5555-555555555555', 'rohan@projecthub.dev', 'student');

-- 2. Seed Profiles
INSERT INTO profiles (id, user_id, full_name, username, bio, college, course, year, location, github_url, linkedin_url) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Rahul Sharma', 'rahul_sharma', 'Full-stack developer passionate about AI and Web Apps.', 'IIT Delhi', 'Computer Science', '3rd Year', 'New Delhi', 'https://github.com/rahulsharma', 'https://linkedin.com/in/rahulsharma'),
('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Aman Gupta', 'amangupta', 'Frontend wizard crafting clean UIs with React & Next.js.', 'BITS Pilani', 'Information Technology', '4th Year', 'Pilani', 'https://github.com/amangupta', 'https://linkedin.com/in/amangupta'),
('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Priya Verma', 'priya_v', 'ML engineer building smart AI assistants.', 'DTU', 'Computer Engineering', '3rd Year', 'Delhi', 'https://github.com/priyaverma', 'https://linkedin.com/in/priyaverma'),
('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Neha Patel', 'neha_patel', 'UI/UX designer and mobile app developer.', 'NIT Trichy', 'Electronics & Communication', '2nd Year', 'Trichy', 'https://github.com/nehapatel', 'https://linkedin.com/in/nehapatel'),
('a5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Rohan Mehta', 'rohan_m', 'Backend engineer obsessed with PostgreSQL, Rust and Go.', 'IIIT Hyderabad', 'Computer Science', '4th Year', 'Hyderabad', 'https://github.com/rohanmehta', 'https://linkedin.com/in/rohanmehta');

-- 3. Seed Skills (20+ Skills)
INSERT INTO skills (id, name, category) VALUES
('b0100000-0000-0000-0000-000000000000', 'React', 'Frontend'),
('b0200000-0000-0000-0000-000000000000', 'Node.js', 'Backend'),
('b0300000-0000-0000-0000-000000000000', 'TypeScript', 'Programming Languages'),
('b0400000-0000-0000-0000-000000000000', 'Python', 'Programming Languages'),
('b0500000-0000-0000-0000-000000000000', 'PostgreSQL', 'Database'),
('b0600000-0000-0000-0000-000000000000', 'Machine Learning', 'AI/ML'),
('b0700000-0000-0000-0000-000000000000', 'UI/UX Design', 'Design'),
('b0800000-0000-0000-0000-000000000000', 'Docker', 'DevOps'),
('b0900000-0000-0000-0000-000000000000', 'Next.js', 'Frontend'),
('b1000000-0000-0000-0000-000000000000', 'Go', 'Programming Languages'),
('b1100000-0000-0000-0000-000000000000', 'Rust', 'Programming Languages'),
('b1200000-0000-0000-0000-000000000000', 'Flutter', 'Mobile'),
('b1300000-0000-0000-0000-000000000000', 'AWS', 'Cloud'),
('b1400000-0000-0000-0000-000000000000', 'Tailwind CSS', 'Frontend'),
('b1500000-0000-0000-0000-000000000000', 'GraphQL', 'Backend'),
('b1600000-0000-0000-0000-000000000000', 'Express.js', 'Backend'),
('b1700000-0000-0000-0000-000000000000', 'MongoDB', 'Database'),
('b1800000-0000-0000-0000-000000000000', 'Kubernetes', 'DevOps'),
('b1900000-0000-0000-0000-000000000000', 'Java', 'Programming Languages'),
('b2000000-0000-0000-0000-000000000000', 'C++', 'Programming Languages'),
('b2100000-0000-0000-0000-000000000000', 'Cybersecurity', 'Security'),
('b2200000-0000-0000-0000-000000000000', 'FastAPI', 'Backend');

-- 4. Seed User Skills
INSERT INTO user_skills (user_id, skill_id, proficiency) VALUES
('11111111-1111-1111-1111-111111111111', 'b0100000-0000-0000-0000-000000000000', 'Advanced'),
('11111111-1111-1111-1111-111111111111', 'b0200000-0000-0000-0000-000000000000', 'Intermediate'),
('11111111-1111-1111-1111-111111111111', 'b0500000-0000-0000-0000-000000000000', 'Intermediate'),
('22222222-2222-2222-2222-222222222222', 'b0100000-0000-0000-0000-000000000000', 'Advanced'),
('22222222-2222-2222-2222-222222222222', 'b0900000-0000-0000-0000-000000000000', 'Advanced'),
('22222222-2222-2222-2222-222222222222', 'b1400000-0000-0000-0000-000000000000', 'Advanced'),
('33333333-3333-3333-3333-333333333333', 'b0400000-0000-0000-0000-000000000000', 'Advanced'),
('33333333-3333-3333-3333-333333333333', 'b0600000-0000-0000-0000-000000000000', 'Advanced'),
('44444444-4444-4444-4444-444444444444', 'b0700000-0000-0000-0000-000000000000', 'Advanced'),
('44444444-4444-4444-4444-444444444444', 'b1200000-0000-0000-0000-000000000000', 'Intermediate'),
('55555555-5555-5555-5555-555555555555', 'b0500000-0000-0000-0000-000000000000', 'Advanced'),
('55555555-5555-5555-5555-555555555555', 'b1000000-0000-0000-0000-000000000000', 'Intermediate');

-- 5. Seed Projects (10 Projects)
INSERT INTO projects (id, owner_id, title, description, problem_statement, category, status, visibility, max_team_size, github_url, demo_url) VALUES
('c0100000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'AI Study Assistant', 'An AI-powered platform that helps students organize study material, extract key takeaways, and generate personalized learning quizzes.', 'Students spend hours organizing lecture notes manually instead of focusing on active recall.', 'AI/ML', 'recruiting', 'public', 5, 'https://github.com/rahulsharma/ai-study-assistant', 'https://aistudy.dev'),
('c0200000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Smart Campus Navigation', 'Interactive mobile app providing indoor navigation for university buildings, real-time classroom updates, and event location tracking.', 'Freshmen and campus visitors struggle to navigate large university campuses and locate classrooms.', 'Mobile', 'recruiting', 'public', 4, 'https://github.com/amangupta/campus-nav', 'https://campusnav.dev'),
('c0300000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'College Event Manager', 'All-in-one portal for university clubs to host events, manage registrations, track attendance, and issue digital passes.', 'Clubs rely on messy Google forms and WhatsApp groups for event registration and ticket validation.', 'Web Development', 'in_progress', 'public', 3, 'https://github.com/priyaverma/event-manager', 'https://collegeevents.dev'),
('c0400000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Healthcare Appointment System', 'Telehealth web application allowing campus health centers to manage student medical appointments and prescription tracking.', 'Long wait times at student health centers cause missed classes and delayed care.', 'Healthcare', 'recruiting', 'public', 4, 'https://github.com/nehapatel/campus-health', 'https://campushealth.dev'),
('c0500000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'Expense Tracker for Students', 'Simple shared expense tracking app designed specifically for roommates and student group projects.', 'Splitting bills and tracking group project expenses with spreadsheet tools leads to miscalculated balances.', 'Finance', 'completed', 'public', 2, 'https://github.com/rohanmehta/student-expenses', 'https://studentexpenses.dev'),
('c0600000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Campus Marketplace', 'Peer-to-peer marketplace for students to buy, sell, or rent textbooks, lab gear, and dorm essentials.', 'High cost of new textbooks forces students to hunt across multiple fragmented chat channels.', 'Social Impact', 'recruiting', 'public', 4, 'https://github.com/rahulsharma/campus-market', 'https://campusmarket.dev'),
('c0700000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Student Skill Exchange', 'Platform connecting students who want to swap skills (e.g. teach UI design in exchange for Python lessons).', 'Students lack accessible peer-to-peer skill building communities outside rigid elective courses.', 'Education', 'idea', 'public', 3, 'https://github.com/amangupta/skill-exchange', 'https://skillexchange.dev'),
('c0800000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'AI Resume Builder', 'Tailored resume builder that matches student project portfolios with specific tech internship job postings.', 'Engineering students struggle to format their projects into impact-driven resume bullet points.', 'AI/ML', 'recruiting', 'public', 3, 'https://github.com/priyaverma/ai-resume-builder', 'https://airesumes.dev'),
('c0900000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Smart Attendance System', 'Facial recognition & QR-code based automated attendance verification system for university lecture halls.', 'Manual roll call in large 200-student lecture halls wastes 15 minutes of class time.', 'IoT', 'recruiting', 'public', 4, 'https://github.com/nehapatel/smart-attendance', 'https://smartattendance.dev'),
('c1000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'College Transport Tracker', 'GPS-enabled live bus tracking application for university shuttles and commuter safety alerts.', 'Students miss campus shuttles due to unpredictable schedules and lack of real-time GPS locations.', 'Cybersecurity', 'recruiting', 'private', 3, 'https://github.com/rohanmehta/bus-tracker', 'https://bustracker.dev');

-- 6. Seed Project Skills
INSERT INTO project_skills (project_id, skill_id, importance) VALUES
-- AI Study Assistant
('c0100000-0000-0000-0000-000000000000', 'b0400000-0000-0000-0000-000000000000', 'required'), -- Python
('c0100000-0000-0000-0000-000000000000', 'b0600000-0000-0000-0000-000000000000', 'required'), -- Machine Learning
('c0100000-0000-0000-0000-000000000000', 'b0100000-0000-0000-0000-000000000000', 'required'), -- React
('c0100000-0000-0000-0000-000000000000', 'b0200000-0000-0000-0000-000000000000', 'preferred'), -- Node.js
('c0100000-0000-0000-0000-000000000000', 'b0700000-0000-0000-0000-000000000000', 'preferred'), -- UI/UX Design

-- Smart Campus Navigation
('c0200000-0000-0000-0000-000000000000', 'b1200000-0000-0000-0000-000000000000', 'required'), -- Flutter
('c0200000-0000-0000-0000-000000000000', 'b0200000-0000-0000-0000-000000000000', 'required'), -- Node.js
('c0200000-0000-0000-0000-000000000000', 'b0700000-0000-0000-0000-000000000000', 'preferred'), -- UI/UX Design

-- College Event Manager
('c0300000-0000-0000-0000-000000000000', 'b0100000-0000-0000-0000-000000000000', 'required'), -- React
('c0300000-0000-0000-0000-000000000000', 'b0500000-0000-0000-0000-000000000000', 'required'), -- PostgreSQL
('c0300000-0000-0000-0000-000000000000', 'b1400000-0000-0000-0000-000000000000', 'preferred'), -- Tailwind CSS

-- Healthcare System
('c0400000-0000-0000-0000-000000000000', 'b0900000-0000-0000-0000-000000000000', 'required'), -- Next.js
('c0400000-0000-0000-0000-000000000000', 'b0500000-0000-0000-0000-000000000000', 'required'), -- PostgreSQL
('c0400000-0000-0000-0000-000000000000', 'b0800000-0000-0000-0000-000000000000', 'preferred'), -- Docker

-- Expense Tracker
('c0500000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', 'required'), -- Go
('c0500000-0000-0000-0000-000000000000', 'b0100000-0000-0000-0000-000000000000', 'required'); -- React

-- 7. Seed Teams (One primary team per project)
INSERT INTO teams (id, project_id, name, description, created_by) VALUES
('d0100000-0000-0000-0000-000000000000', 'c0100000-0000-0000-0000-000000000000', 'AI Study Squad', 'Primary development team for AI Study Assistant.', '11111111-1111-1111-1111-111111111111'),
('d0200000-0000-0000-0000-000000000000', 'c0200000-0000-0000-0000-000000000000', 'Campus Nav Creators', 'Mobile app builders for campus navigation.', '22222222-2222-2222-2222-222222222222'),
('d0300000-0000-0000-0000-000000000000', 'c0300000-0000-0000-0000-000000000000', 'Event Tech Team', 'Developers managing college event portal.', '33333333-3333-3333-3333-333333333333'),
('d0400000-0000-0000-0000-000000000000', 'c0400000-0000-0000-0000-000000000000', 'HealthTech Innovators', 'Full-stack team building student health center software.', '44444444-4444-4444-4444-444444444444'),
('d0500000-0000-0000-0000-000000000000', 'c0500000-0000-0000-0000-000000000000', 'FinTech Duo', 'Engineers building student expense tracker.', '55555555-5555-5555-5555-555555555555'),
('d0600000-0000-0000-0000-000000000000', 'c0600000-0000-0000-0000-000000000000', 'Marketplace Guild', 'Team developing peer-to-peer campus shop.', '11111111-1111-1111-1111-111111111111'),
('d0700000-0000-0000-0000-000000000000', 'c0700000-0000-0000-0000-000000000000', 'Skill Swap Alliance', 'Team building student skill barter platform.', '22222222-2222-2222-2222-222222222222'),
('d0800000-0000-0000-0000-000000000000', 'c0800000-0000-0000-0000-000000000000', 'Resume AI Group', 'Engineers building automated resume generator.', '33333333-3333-3333-3333-333333333333'),
('d0900000-0000-0000-0000-000000000000', 'c0900000-0000-0000-0000-000000000000', 'Smart Attendance Lab', 'Developers building smart attendance kiosk.', '44444444-4444-4444-4444-444444444444'),
('d1000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'Bus Transit Tech', 'Team creating live shuttle GPS updates.', '55555555-5555-5555-5555-555555555555');

-- 8. Seed Team Members (Owners as Leaders + Members)
INSERT INTO team_members (team_id, user_id, role) VALUES
-- AI Study Squad (3 members: Rahul (leader), Aman, Priya) -> Max size 5
('d0100000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'leader'),
('d0100000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'member'),
('d0100000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'member'),

-- Campus Nav Creators (2 members: Aman (leader), Neha) -> Max size 4
('d0200000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'leader'),
('d0200000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'member'),

-- Event Tech Team (2 members: Priya (leader), Rahul) -> Max size 3
('d0300000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'leader'),
('d0300000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'member'),

-- HealthTech Innovators (1 member: Neha (leader)) -> Max size 4
('d0400000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'leader'),

-- FinTech Duo (2 members: Rohan (leader), Aman) -> Max size 2 (FULL)
('d0500000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'leader'),
('d0500000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'member'),

-- Other Teams (Leaders only)
('d0600000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'leader'),
('d0700000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'leader'),
('d0800000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'leader'),
('d0900000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'leader'),
('d1000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'leader');

-- 9. Seed Join Requests
INSERT INTO join_requests (id, project_id, team_id, user_id, message, status) VALUES
-- Pending request: Neha -> AI Study Squad
('e0100000-0000-0000-0000-000000000000', 'c0100000-0000-0000-0000-000000000000', 'd0100000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Hi! I have extensive experience with UI/UX Design and Flutter, would love to assist with the frontend components!', 'pending'),

-- Pending request: Rohan -> Campus Nav Creators
('e0200000-0000-0000-0000-000000000000', 'c0200000-0000-0000-0000-000000000000', 'd0200000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'I can help optimize your PostgreSQL database queries and backend route handling.', 'pending'),

-- Accepted request: Priya -> AI Study Squad (matches team member record)
('e0300000-0000-0000-0000-000000000000', 'c0100000-0000-0000-0000-000000000000', 'd0100000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Machine Learning specialist here!', 'accepted'),

-- Rejected request: Rohan -> Event Tech Team
('e0400000-0000-0000-0000-000000000000', 'c0300000-0000-0000-0000-000000000000', 'd0300000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'Interested in helping out.', 'rejected'),

-- Cancelled request: Rahul -> HealthTech Innovators
('e0500000-0000-0000-0000-000000000000', 'c0400000-0000-0000-0000-000000000000', 'd0400000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Joining another project.', 'cancelled');
