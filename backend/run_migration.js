const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_9NyrJ3UcWHOB@ep-hidden-cell-b3013p63-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function run() {
  try {
    console.log('Connecting to Neon...');
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_name VARCHAR(255)`;
    console.log('1/7 business_name done');
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#6366f1'`;
    console.log('2/7 primary_color done');
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#8b5cf6'`;
    console.log('3/7 accent_color done');
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255)`;
    console.log('4/7 custom_domain done');
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS welcome_message TEXT`;
    console.log('5/7 welcome_message done');
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS footer_text VARCHAR(500)`;
    console.log('6/7 footer_text done');
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS favicon_url TEXT`;
    console.log('7/7 favicon_url done');
    console.log('Migration complete!');
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tenants' ORDER BY ordinal_position`;
    console.log('Tenant columns:');
    columns.forEach(r => console.log('  -', r.column_name, r.data_type));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

run();
