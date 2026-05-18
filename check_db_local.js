const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read local .env
const envPath = path.join(__dirname, '.env');
console.log('Loading env from:', envPath);
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function checkDatabase() {
  console.log('--- FETCHING ALL CUSTOM USERS ---');
  const { data: users, error: userError } = await supabase
    .from('custom_users')
    .select('id, email, full_name, email_verified, created_at');
  
  if (userError) {
    console.error('Error fetching custom_users:', userError);
  } else {
    console.table(users);
  }

  console.log('--- FETCHING INVENTORY ITEMS ---');
  const { data: items, error: itemsError } = await supabase
    .from('inventory_items')
    .select('id, user_id, item_name, category');

  if (itemsError) {
    console.error('Error fetching inventory_items:', itemsError);
  } else {
    console.log(`Total items found in DB: ${items.length}`);
    const counts = {};
    items.forEach(item => {
      counts[item.user_id] = (counts[item.user_id] || 0) + 1;
    });
    console.log('Items count grouped by user_id:');
    console.table(counts);
  }
}

checkDatabase().catch(console.error);
