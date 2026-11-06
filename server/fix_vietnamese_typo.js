require('dotenv').config();
const { query } = require('./config/db');

async function fixTypo() {
  console.log('Fixing room_types...');

  const roomTypes = [
    { slug: 'phong-tro-don', name: 'Phòng trọ đơn', icon: '🏠', description: 'Phòng trọ đơn lẻ, phù hợp cho sinh viên và người đi làm' },
    { slug: 'can-ho-mini', name: 'Căn hộ mini', icon: '🏢', description: 'Căn hộ nhỏ gọn, đầy đủ tiện nghi' },
    { slug: 'nha-nguyen-can', name: 'Nhà nguyên căn', icon: '🏡', description: 'Nhà cho thuê nguyên căn' },
    { slug: 'ky-tuc-xa', name: 'Ký túc xá', icon: '🏫', description: 'Ký túc xá dành cho sinh viên' },
    { slug: 'homestay', name: 'Homestay', icon: '🏨', description: 'Phòng cho thuê dạng homestay' },
    { slug: 'can-ho', name: 'Căn hộ', icon: '🏬', description: 'Căn hộ chung cư cho thuê' },
    { slug: 'phong-ghep', name: 'Phòng ghép', icon: '👥', description: 'Phòng ở ghép, chia sẻ chi phí' },
  ];

  for (const rt of roomTypes) {
    await query(
      'UPDATE room_types SET name = ?, icon = ?, description = ? WHERE slug = ?',
      [rt.name, rt.icon, rt.description, rt.slug]
    );
  }

  console.log('Fixing amenities...');
  // Delete corrupted amenities and re-insert properly
  await query('DELETE FROM amenities');

  const amenities = [
    { name: 'WiFi', icon: '📶' },
    { name: 'Điều hòa', icon: '❄️' },
    { name: 'Máy giặt', icon: '🧺' },
    { name: 'Tủ lạnh', icon: '🧊' },
    { name: 'Nóng lạnh', icon: '🚿' },
    { name: 'Bãi xe', icon: '🅿️' },
    { name: 'Ban công', icon: '🌿' },
    { name: 'Bảo vệ', icon: '🔒' },
    { name: 'Camera', icon: '📷' },
    { name: 'Thang máy', icon: '🛗' },
    { name: 'Bếp', icon: '🍳' },
    { name: 'Giường', icon: '🛏️' },
    { name: 'Tủ quần áo', icon: '👔' },
    { name: 'TV', icon: '📺' },
    { name: 'Bàn làm việc', icon: '🪑' },
  ];

  for (const am of amenities) {
    await query(
      'INSERT INTO amenities (id, name, icon) VALUES (UUID(), ?, ?)',
      [am.name, am.icon]
    );
  }

  console.log('Done fixing room types and amenities!');
  process.exit(0);
}

fixTypo().catch(err => {
  console.error(err);
  process.exit(1);
});

