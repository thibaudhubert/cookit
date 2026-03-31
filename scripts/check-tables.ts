import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Checking Supabase tables...\n')

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (profilesError) {
    console.log('❌ profiles table:', profilesError.message)
  } else {
    console.log('✅ profiles table exists')
  }

  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('*')
    .limit(1)

  if (recipesError) {
    console.log('❌ recipes table:', recipesError.message)
  } else {
    console.log('✅ recipes table exists')
    console.log(`   Current recipe count: ${recipes?.length || 0}`)
  }
}

checkTables().catch(console.error)
