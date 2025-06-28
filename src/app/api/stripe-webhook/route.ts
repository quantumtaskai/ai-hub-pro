import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any
})

export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('🔔 Stripe webhook received at:', new Date().toISOString())

  try {
    // Read request body
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    console.log('📥 Webhook details:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })

    // Check environment variables
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    if (!signature) {
      console.error('❌ Missing stripe signature')
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
      console.log('✅ Webhook signature verified:', event.type)
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle checkout.session.completed (Payment Links)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('💳 Processing Payment Link checkout:', {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        status: session.status,
        amountTotal: session.amount_total,
        currency: session.currency,
        clientReferenceId: session.client_reference_id,
        customerEmail: session.customer_details?.email,
        metadata: session.metadata
      })

      // Only process completed payments
      if (session.payment_status !== 'paid' || session.status !== 'complete') {
        console.log('ℹ️ Payment not complete yet, skipping:', {
          paymentStatus: session.payment_status,
          status: session.status
        })
        return NextResponse.json({ received: true })
      }

      // Calculate credits from amount (Payment Links don't always have metadata)
      const amountAED = Math.round((session.amount_total || 0) / 100 * 100) / 100
      let credits = 0
      if (amountAED >= 499.99) credits = 500
      else if (amountAED >= 99.99) credits = 100
      else if (amountAED >= 49.99) credits = 50
      else if (amountAED >= 9.99) credits = 10

      // Also try to get credits from metadata if available
      const metadataCredits = session.metadata?.credits ? parseInt(session.metadata.credits) : 0
      if (metadataCredits > 0) {
        credits = metadataCredits
      }

      console.log('🧮 Credit calculation:', {
        amountTotal: session.amount_total,
        amountAED,
        calculatedCredits: credits,
        metadataCredits: session.metadata?.credits
      })

      if (!credits) {
        console.error('❌ Could not determine credits:', { amountAED, metadata: session.metadata })
        return NextResponse.json(
          { error: `Could not determine credits for amount: ${amountAED} AED` },
          { status: 400 }
        )
      }

      // Find user
      const userId = session.client_reference_id
      const customerEmail = session.customer_details?.email
      let userData = null

      console.log('🔍 Looking up user:', { userId, customerEmail })

      // Try user lookup by ID first
      if (userId) {
        try {
          const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()
          
          if (!error && data) {
            userData = data
            console.log('✅ User found by ID:', { id: data.id, email: data.email, credits: data.credits })
          } else {
            console.log('❌ User not found by ID:', error?.message)
          }
        } catch (err: any) {
          console.error('❌ Error looking up user by ID:', err.message)
        }
      }

      // Try user lookup by email if ID failed
      if (!userData && customerEmail) {
        try {
          const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', customerEmail)
            .single()
          
          if (!error && data) {
            userData = data
            console.log('✅ User found by email:', { id: data.id, email: data.email, credits: data.credits })
          } else {
            console.log('❌ User not found by email:', error?.message)
          }
        } catch (err: any) {
          console.error('❌ Error looking up user by email:', err.message)
        }
      }

      if (!userData) {
        console.error('❌ User not found anywhere:', { userId, customerEmail })
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Update credits
      const currentCredits = userData.credits || 0
      const newTotal = currentCredits + credits

      console.log('📈 Updating credits:', {
        userId: userData.id,
        email: userData.email,
        currentCredits,
        creditsToAdd: credits,
        newTotal
      })

      try {
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({ 
            credits: newTotal,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ Failed to update credits:', updateError)
          return NextResponse.json(
            { error: 'Failed to update credits' },
            { status: 500 }
          )
        }

        const processingTime = Date.now() - startTime
        console.log('✅ Credits updated successfully:', {
          userId: userData.id,
          email: userData.email,
          oldCredits: currentCredits,
          newCredits: updatedUser.credits,
          creditsAdded: credits,
          sessionId: session.id,
          processingTimeMs: processingTime
        })

        return NextResponse.json({
          success: true,
          creditsAdded: credits,
          newTotal: updatedUser.credits,
          processingTimeMs: processingTime
        })

      } catch (err: any) {
        console.error('❌ Database error:', err.message)
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        )
      }
    }

    // Other webhook events
    console.log('ℹ️ Unhandled webhook event:', event.type)
    return NextResponse.json({ received: true })

  } catch (error: any) {
    const processingTime = Date.now() - startTime
    console.error('❌ Webhook processing failed:', {
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime
    })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}