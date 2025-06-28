'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'

export default function TestPaymentPage() {
  const router = useRouter()
  const { user, initializeSession, refreshUser } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize session on component mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Handle payment success/cancel from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const cancelled = urlParams.get('cancelled')
    const sessionId = urlParams.get('session_id')

    if (success === 'true') {
      toast.success('🎉 Payment successful! Webhook should have processed the credit update.')
      // Refresh user data after a delay to show updated credits
      setTimeout(async () => {
        try {
          await refreshUser()
          toast.success('Credits refreshed!')
        } catch (error) {
          console.log('Failed to refresh credits after payment')
        }
      }, 3000)
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/test-payment')
    } else if (cancelled === 'true') {
      toast.error('Payment was cancelled.')
      // Clean up URL
      window.history.replaceState({}, document.title, '/test-payment')
    }
  }, [refreshUser])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const handleTestPayment = () => {
    if (!user) {
      toast.error('Please log in first')
      return
    }

    setIsLoading(true)
    
    try {
      // Test Payment Link provided by user
      const testPaymentUrl = 'https://buy.stripe.com/test_5kQ4gz2kkbBO4mgbLx2VG09'
      
      // Add user information for webhook processing
      const paymentUrl = `${testPaymentUrl}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`
      
      console.log('🧪 Starting test payment:', {
        userId: user.id,
        email: user.email,
        paymentUrl
      })
      
      toast.success('Opening test payment page...')
      
      // Open test payment in new tab
      window.open(paymentUrl, '_blank')
      
    } catch (error) {
      toast.error('Failed to open payment page')
      console.error('Payment error:', error)
    } finally {
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)',
      padding: '24px'
    }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '0 auto 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ←
          </button>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            🧪 Webhook Test Payment
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#3b82f6',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            User: {user.email}
          </div>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#10b981',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Current Credits: {user.credits}
          </div>
        </div>
      </div>

      {/* Test Payment Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '32px'
        }}>
          🧪
        </div>

        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Test Webhook Integration
        </h2>

        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          This will test the complete payment flow including webhook processing and credit updates.
        </p>

        {/* Webhook Details */}
        <div style={{
          background: 'rgba(249, 250, 251, 0.8)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            🔗 Webhook Configuration
          </h3>
          
          <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
            <div>
              <strong style={{ color: '#374151' }}>Endpoint URL:</strong>
              <br />
              <code style={{ 
                background: '#f3f4f6',
                padding: '4px 8px',
                borderRadius: '4px',
                color: '#1f2937',
                fontSize: '12px'
              }}>
                https://ai-hub-pro.vercel.app/api/stripe/webhook
              </code>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Webhook Secret:</strong>
              <br />
              <code style={{ 
                background: '#f3f4f6',
                padding: '4px 8px',
                borderRadius: '4px',
                color: '#1f2937',
                fontSize: '12px'
              }}>
                whsec_zUzeszCSE4Ckwe6E3tC0WKuc5JIojrib
              </code>
            </div>
            
            <div>
              <strong style={{ color: '#374151' }}>Payment Link:</strong>
              <br />
              <code style={{ 
                background: '#f3f4f6',
                padding: '4px 8px',
                borderRadius: '4px',
                color: '#1f2937',
                fontSize: '12px'
              }}>
                https://buy.stripe.com/test_5kQ4gz2kkbBO4mgbLx2VG09
              </code>
            </div>

            <div style={{ 
              marginTop: '12px',
              padding: '12px',
              background: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #f59e0b'
            }}>
              <strong style={{ color: '#92400e' }}>🔧 Configure Redirect URLs in Stripe:</strong>
              <br />
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <strong>Success URL:</strong>
                <br />
                <code style={{ 
                  background: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: '#1f2937'
                }}>
                  https://ai-hub-pro.vercel.app/test-payment?success=true
                </code>
                <br /><br />
                <strong>Cancel URL:</strong>
                <br />
                <code style={{ 
                  background: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: '#1f2937'
                }}>
                  https://ai-hub-pro.vercel.app/test-payment?cancelled=true
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Test Payment Button */}
        <button
          onClick={handleTestPayment}
          disabled={isLoading}
          style={{
            width: '100%',
            background: isLoading 
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '20px 32px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              (e.target as HTMLElement).style.transform = 'scale(1.02)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              (e.target as HTMLElement).style.transform = 'scale(1)'
            }
          }}
        >
          {isLoading ? '🔄 Opening Payment...' : '💳 Start Test Payment'}
        </button>

        {/* Instructions */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'rgba(59, 130, 246, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            📋 Test Instructions
          </h4>
          <ol style={{
            textAlign: 'left',
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6',
            paddingLeft: '20px'
          }}>
            <li>Click the test payment button above</li>
            <li>Complete the Stripe checkout process</li>
            <li>Return to this page to verify credits updated</li>
            <li>Check browser console for webhook logs</li>
            <li>Verify webhook delivery in Stripe Dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  )
}