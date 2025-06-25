# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ai-agents-marketplace`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be created (2-3 minutes)

## Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 3: Set Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `supabase-schema.sql`
3. Paste it in the SQL editor
4. Click "Run" to execute the schema

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3000` (for development)
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. Save changes

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Try to register a new user
3. Check the **Authentication** → **Users** section in Supabase to see if the user was created
4. Check the **Table Editor** → **users** table to see the user profile

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Make sure you're using the `anon` key, not the `service_role` key
   - Check that the environment variables are loaded correctly

2. **"RLS policy violation" error**
   - Make sure you've run the SQL schema completely
   - Check that Row Level Security policies are in place

3. **"User not found" after signup**
   - Check that the `users` table was created correctly
   - Verify the trigger function is working

### Verification Commands:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if policies are in place
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check sample data
SELECT * FROM agents LIMIT 3;
```

## Next Steps

Once Supabase is set up and working:
1. ✅ Database & Authentication (COMPLETED)
2. 🔄 Update frontend to use Supabase auth
3. 🔄 Implement agent usage tracking
4. 🔄 Add credit transaction system
5. 🔄 Integrate Stripe payments 