import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: {} as any
  }

  // Test 1: Environment Variables
  console.log('🔧 Testing environment variables...')
  testResults.tests.environmentVariables = {
    STRIPE_SECRET_KEY: {
      exists: !!process.env.STRIPE_SECRET_KEY,
      length: process.env.STRIPE_SECRET_KEY?.length || 0,
      prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'missing'
    },
    STRIPE_WEBHOOK_SECRET: {
      exists: !!process.env.STRIPE_WEBHOOK_SECRET,
      length: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
      prefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 8) || 'missing'
    },
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing'
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) || 'missing'
    }
  }

  // Test 2: Stripe Connection
  console.log('🔍 Testing Stripe connection...')
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16' as any
      })
      
      // Test API call
      const account = await stripe.accounts.retrieve()
      testResults.tests.stripe = {
        connected: true,
        accountId: account.id,
        country: account.country,
        chargesEnabled: account.charges_enabled
      }
    } else {
      testResults.tests.stripe = {
        connected: false,
        error: 'STRIPE_SECRET_KEY missing'
      }
    }
  } catch (error: any) {
    console.error('❌ Stripe connection failed:', error.message)
    testResults.tests.stripe = {
      connected: false,
      error: error.message
    }
  }

  // Test 3: Supabase Connection
  console.log('🗄️ Testing Supabase connection...')
  try {
    // Test database connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      testResults.tests.supabase = {
        connected: false,
        error: error.message
      }
    } else {
      testResults.tests.supabase = {
        connected: true,
        message: 'Database connection successful'
      }
    }
  } catch (error: any) {
    console.error('❌ Supabase connection failed:', error.message)
    testResults.tests.supabase = {
      connected: false,
      error: error.message
    }
  }

  // Test 4: User Lookup (using your actual user data)
  console.log('👤 Testing user lookup...')
  try {
    const testUserId = 'bde707c9-68bd-4972-ba29-8a85a2a234cb'
    const testEmail = 'amitrana01@gmail.com'

    // Test lookup by ID
    const { data: userById, error: userByIdError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single()

    // Test lookup by email
    const { data: userByEmail, error: userByEmailError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single()

    testResults.tests.userLookup = {
      byId: {
        found: !userByIdError && !!userById,
        error: userByIdError?.message,
        credits: userById?.credits
      },
      byEmail: {
        found: !userByEmailError && !!userByEmail,
        error: userByEmailError?.message,
        credits: userByEmail?.credits
      }
    }
  } catch (error: any) {
    testResults.tests.userLookup = {
      error: error.message
    }
  }

  // Test 5: Webhook Signature Verification
  console.log('🔐 Testing webhook signature verification...')
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16' as any
      })
      
      // Test with dummy data
      const testBody = '{"test": true}'
      const testSig = 't=1234567890,v1=test'
      
      try {
        stripe.webhooks.constructEvent(testBody, testSig, process.env.STRIPE_WEBHOOK_SECRET)
        testResults.tests.webhookSignature = {
          canVerify: false,
          note: 'Test signature failed as expected (webhook secret is configured)'
        }
      } catch (error: any) {
        if (error.message.includes('timestamp')) {
          testResults.tests.webhookSignature = {
            canVerify: true,
            note: 'Webhook secret is properly configured (signature verification working)'
          }
        } else {
          testResults.tests.webhookSignature = {
            canVerify: false,
            error: error.message
          }
        }
      }
    } catch (error: any) {
      testResults.tests.webhookSignature = {
        canVerify: false,
        error: error.message
      }
    }
  } else {
    testResults.tests.webhookSignature = {
      canVerify: false,
      error: 'STRIPE_WEBHOOK_SECRET not configured'
    }
  }

  console.log('✅ Environment test completed:', testResults)
  return NextResponse.json(testResults, { status: 200 })
}