const { query } = require('../db');

async function migrate() {
  console.log('Starting migration: Part 3 (CV + Supervision)...');

  try {
    // 1. Add cv_url to users
    try {
      await query(`ALTER TABLE users ADD COLUMN cv_url VARCHAR(255) NULL AFTER email`);
      console.log('Added cv_url to users.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('cv_url already exists in users.');
      } else {
        throw e;
      }
    }

    // 2. Add supervision fields to internship_requests
    // supervisor_id: ID of the teacher user
    // teacher_opinion: Text opinion
    // teacher_validation: Status given by teacher
    try {
      await query(`ALTER TABLE internship_requests ADD COLUMN supervisor_id INT UNSIGNED NULL AFTER isett_supervisor`);
      await query(`ALTER TABLE internship_requests ADD CONSTRAINT fk_request_supervisor FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL`);
      console.log('Added supervisor_id to internship_requests.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('supervisor_id already exists in internship_requests.');
      } else if (e.code === 'ER_DUP_KEYNAME') {
         console.log('fk_request_supervisor already exists.');
      } else {
        throw e;
      }
    }

    try {
      await query(`ALTER TABLE internship_requests ADD COLUMN teacher_opinion TEXT NULL`);
      console.log('Added teacher_opinion to internship_requests.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('teacher_opinion already exists.');
      else throw e;
    }

    try {
      await query(`ALTER TABLE internship_requests ADD COLUMN teacher_validation ENUM('pending', 'validated', 'invalidated') DEFAULT 'pending'`);
      console.log('Added teacher_validation to internship_requests.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('teacher_validation already exists.');
      else throw e;
    }

    console.log('Migration Part 3 completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
