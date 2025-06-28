import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  console.log('🔔 Webhook received:', {
    hasSignature: !!signature,
    bodyLength: body.length,
    timestamp: new Date().toISOString()
  })

  if (!signature) {
    console.error('❌ Missing stripe signature')
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('✅ Webhook signature verified. Event:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString()
    })

    // Handle successful checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id
      const customerEmail = session.customer_details?.email
      
      // Simple amount to credits mapping (AED pricing)
      const amountAED = Math.round((session.amount_total || 0) / 100 * 100) / 100 // Convert from fils to AED and round
      
      let credits: number = 0
      if (amountAED >= 499.99) credits = 500
      else if (amountAED >= 99.99) credits = 100
      else if (amountAED >= 49.99) credits = 50
      else if (amountAED >= 9.99) credits = 10

      console.log('💳 Processing payment:', {
        sessionId: session.id,
        userId,
        customerEmail,
        amountTotal: session.amount_total,
        amountAED,
        credits,
        paymentStatus: session.payment_status
      })

      if (!credits) {
        console.error('❌ Unknown payment amount:', { 
          amountTotal: session.amount_total,
          amountAED,
          expectedAmounts: [9.99, 49.99, 99.99, 499.99]
        })
        return NextResponse.json(
          { error: `Unknown payment amount: ${amountAED} AED (from ${session.amount_total} fils)` },
          { status: 400 }
        )
      }

      if (!userId && !customerEmail) {
        console.error('❌ No user identification:', { userId, customerEmail })
        return NextResponse.json(
          { error: 'Missing user identification' },
          { status: 400 }
        )
      }

      let userData, fetchError

      // Try to find user by ID first, then by email if ID lookup fails
      if (userId) {
        const result = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        userData = result.data
        fetchError = result.error
      }

      // If no user found by ID, or no ID provided, try email lookup
      if (!userData && customerEmail) {
        console.log('🔍 User not found by ID, trying email lookup:', customerEmail)
        const result = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', customerEmail)
          .single()
        userData = result.data
        fetchError = result.error
      }

      if (fetchError || !userData) {
        console.error('❌ Failed to fetch user:', { 
          fetchError: fetchError?.message,
          userId, 
          customerEmail,
          errorCode: fetchError?.code
        })
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        )
      }

      const currentCredits = userData.credits || 0
      const newTotal = currentCredits + credits

      console.log('📈 Adding credits:', {
        userId: userData.id,
        email: userData.email,
        currentCredits,
        creditsToAdd: credits,
        newTotal
      })

      // Simple credit update
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ credits: newTotal })
        .eq('id', userData.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Credit update failed:', updateError)
        return NextResponse.json(
          { error: 'Failed to update credits' },
          { status: 500 }
        )
      }

      console.log('✅ Credits added successfully:', {
        userId: userData.id,
        email: userData.email,
        oldCredits: currentCredits,
        newCredits: updatedUser.credits,
        creditsAdded: credits
      })

      return NextResponse.json({ 
        success: true,
        creditsAdded: credits,
        newTotal: updatedUser.credits
      })
    }

    console.log('ℹ️ Unhandled webhook event type:', event.type)
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Webhook error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    })

    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 400 }
    )
  }
}