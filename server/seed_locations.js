require('dotenv').config();
const { query } = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seedLocations() {
  console.log('🔄 Bắt đầu tải dữ liệu địa giới hành chính Việt Nam...');
  const start = Date.now();

  const response = await fetch('https://provinces.open-api.vn/api/?depth=3');
  if (!response.ok) {
    throw new Error(`Lỗi tải API: ${response.statusText}`);
  }
  const provData = await response.json();
  console.log(`✅ Đã tải ${provData.length} tỉnh/thành phố (${Date.now() - start}ms).`);

  let totalDistricts = 0;
  let totalWards = 0;

  for (const prov of provData) {
    const provId = uuidv4();
    await query(
      'INSERT IGNORE INTO provinces (id, name, code) VALUES (?, ?, ?)',
      [provId, prov.name, String(prov.code)]
    );

    const provRows = await query('SELECT id FROM provinces WHERE code = ?', [String(prov.code)]);
    if (provRows.length === 0) continue;
    const dbProvId = provRows[0].id;

    if (prov.districts && prov.districts.length > 0) {
      // Districts
      const distValues = [];
      const distParams = [];
      for (const dist of prov.districts) {
        distValues.push('(?, ?, ?, ?)');
        distParams.push(uuidv4(), dbProvId, dist.name, String(dist.code));
      }
      await query(
        `INSERT IGNORE INTO districts (id, province_id, name, code) VALUES ${distValues.join(',')}`,
        distParams
      );
      totalDistricts += prov.districts.length;

      // Get district ID map
      const dbDistricts = await query('SELECT id, code FROM districts WHERE province_id = ?', [dbProvId]);
      const distIdMap = {};
      for (const d of dbDistricts) {
        distIdMap[d.code] = d.id;
      }

      // Wards
      const wardValues = [];
      const wardParams = [];
      for (const dist of prov.districts) {
        if (dist.wards && dist.wards.length > 0) {
          const dbDistId = distIdMap[String(dist.code)];
          if (!dbDistId) continue;
          for (const ward of dist.wards) {
            wardValues.push('(?, ?, ?, ?)');
            wardParams.push(uuidv4(), dbDistId, ward.name, String(ward.code));
          }
        }
      }

      if (wardValues.length > 0) {
        totalWards += wardValues.length;
        const chunkSize = 500;
        for (let i = 0; i < wardValues.length; i += chunkSize) {
          const chunkValues = wardValues.slice(i, i + chunkSize);
          const chunkParams = wardParams.slice(i * 4, (i + chunkValues.length) * 4);
          await query(
            `INSERT IGNORE INTO wards (id, district_id, name, code) VALUES ${chunkValues.join(',')}`,
            chunkParams
          );
        }
      }
    }
    process.stdout.write(`.`);
  }

  console.log(`\n🎉 Hoàn thành!`);
  console.log(`- Tỉnh/Thành: ${provData.length}`);
  console.log(`- Quận/Huyện: ${totalDistricts}`);
  console.log(`- Phường/Xã: ${totalWards}`);
  console.log(`⏱ Tổng thời gian: ${((Date.now() - start) / 1000).toFixed(1)}s`);
  process.exit(0);
}

seedLocations().catch(err => {
  console.error('\n❌ Thất bại:', err);
  process.exit(1);
});

