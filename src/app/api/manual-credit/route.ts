import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: Request) {
  console.log('🔧 Manual credit update endpoint called')
  
  try {
    const { userId, credits, reason } = await request.json()
    
    console.log('📝 Manual credit request:', { userId, credits, reason })
    
    if (!userId || !credits) {
      return NextResponse.json(
        { error: 'Missing userId or credits' },
        { status: 400 }
      )
    }

    // Find user
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !userData) {
      console.error('❌ User not found:', fetchError?.message)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('👤 Found user:', { id: userData.id, email: userData.email, currentCredits: userData.credits })

    // Update credits
    const currentCredits = userData.credits || 0
    const newTotal = currentCredits + credits

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        credits: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to update credits' },
        { status: 500 }
      )
    }

    console.log('✅ Credits updated successfully:', {
      userId,
      oldCredits: currentCredits,
      newCredits: updatedUser.credits,
      creditsAdded: credits,
      reason
    })

    return NextResponse.json({
      success: true,
      oldCredits: currentCredits,
      newCredits: updatedUser.credits,
      creditsAdded: credits,
      user: {
        id: updatedUser.id,
        email: updatedUser.email
      }
    })

  } catch (error: any) {
    console.error('❌ Manual credit update failed:', error.message)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}