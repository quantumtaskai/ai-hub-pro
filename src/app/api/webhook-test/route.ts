import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('🚨 TEST WEBHOOK CALLED!')
  console.log('Time:', new Date().toISOString())
  console.log('Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    const body = await request.text()
    console.log('Body length:', body.length)
    console.log('Body preview:', body.substring(0, 200))
  } catch (error) {
    console.log('Error reading body:', error)
  }

  return NextResponse.json({ received: true, time: new Date().toISOString() })
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook test endpoint is working',
    time: new Date().toISOString(),
    env: {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  })
}