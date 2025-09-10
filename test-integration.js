// Simple integration test script
// Run this after setting up Supabase to verify the connection

const { createClient } = require('@supabase/supabase-js');

// Test configuration - replace with your actual values
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

async function testIntegration() {
  console.log('🧪 Testing Supabase Integration...\n');

  if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.log('❌ Please update the Supabase credentials in this test file');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Check connection
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful\n');

    // Test 2: Check if tables exist
    console.log('2. Checking database tables...');
    const tables = ['users', 'events', 'registrations', 'colleges', 'attendance', 'feedback'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) throw error;
        console.log(`✅ Table '${table}' exists`);
      } catch (err) {
        console.log(`❌ Table '${table}' missing or inaccessible`);
      }
    }

    console.log('\n🎉 Integration test completed!');
    console.log('\nNext steps:');
    console.log('1. Update WebPortal/src/config/supabase.ts with your credentials');
    console.log('2. Update App_Students/app.json with your credentials');
    console.log('3. Start both applications and test the features');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify your Supabase URL and anon key');
    console.log('2. Check if your Supabase project is active');
    console.log('3. Ensure the database schema is set up (run Backend/main.sql)');
  }
}

testIntegration();
