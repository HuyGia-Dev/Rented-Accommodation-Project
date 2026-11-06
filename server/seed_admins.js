require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function createAdmins() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 12);

  const admins = [
    { fullName: 'Quản trị viên 1 (Super Admin)', email: 'admin@phongtro.com', phone: '0900000001' },
    { fullName: 'Quản trị viên 2', email: 'admin2@phongtro.com', phone: '0900000002' },
    { fullName: 'Quản trị viên 3', email: 'admin3@phongtro.com', phone: '0900000003' },
    { fullName: 'Quản trị viên 4', email: 'admin4@phongtro.com', phone: '0900000004' },
    { fullName: 'Quản trị viên 5', email: 'admin5@phongtro.com', phone: '0900000005' },
  ];

  for (const a of admins) {
    const existing = await query('SELECT id FROM users WHERE email = ?', [a.email]);
    if (existing.length === 0) {
      await query(
        `INSERT INTO users (id, full_name, email, phone, password_hash, role, is_verified, kyc_status)
         VALUES (?, ?, ?, ?, ?, 'admin', 1, 'approved')`,
        [uuidv4(), a.fullName, a.email, a.phone, hash]
      );
      console.log('Created:', a.email);
    } else {
      console.log('Already exists:', a.email);
    }
  }
  process.exit(0);
}

createAdmins().catch(err => {
  console.error(err);
  process.exit(1);
});

