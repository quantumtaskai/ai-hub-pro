'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'

// Credit packages matching Stripe Payment Links configuration
const CREDIT_PACKAGES = [
  {
    id: 1,
    credits: 10,
    price: 9.99,
    popular: false,
    description: 'Perfect for trying out our AI agents',
    features: ['10 AI agent uses', 'Basic support', 'Valid for 30 days'],
    package: 'basic'
  },
  {
    id: 2,
    credits: 50,
    price: 49.99,
    popular: true,
    description: 'Great for regular users',
    features: ['50 AI agent uses', 'Priority support', 'Valid for 60 days', 'Best value!'],
    package: 'popular'
  },
  {
    id: 3,
    credits: 100,
    price: 99.99,
    popular: false,
    description: 'Ideal for power users',
    features: ['100 AI agent uses', 'Premium support', 'Valid for 90 days', 'Advanced features'],
    package: 'premium'
  },
  {
    id: 4,
    credits: 500,
    price: 499.99,
    popular: false,
    description: 'Perfect for teams and businesses',
    features: ['500 AI agent uses', '24/7 support', 'Valid for 6 months', 'Team collaboration'],
    package: 'enterprise'
  }
]

function PricingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser, purchaseCredits, updateCredits, initializeSession } = useUserStore()
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize session on component mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Handle payment success/cancellation from URL params
  useEffect(() => {
    const success = searchParams.get('success')
    const payment = searchParams.get('payment') // Current format from Stripe
    const cancelled = searchParams.get('cancelled')
    const sessionId = searchParams.get('session_id')

    if (success === 'true' || payment === 'success') {
      toast.success('Payment successful! Credits have been added to your account.')
      // Force refresh user data to show new credits (with delay to ensure webhook processed)
      setTimeout(async () => {
        try {
          await refreshUser()
        } catch (error) {
          console.log('Failed to refresh after payment, but payment was successful')
        }
      }, 2000)
      // Clean up URL
      router.replace('/pricing')
    } else if (cancelled === 'true') {
      toast.error('Payment was cancelled.')
      // Clean up URL
      router.replace('/pricing')
    }
  }, [searchParams, refreshUser, router])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const handlePurchase = (packageData: any) => {
    setSelectedPackage(packageData.id)
    setIsProcessing(true)

    try {
      toast.success('Redirecting to Stripe payment...')
      
      // Use the purchaseCredits function from userStore
      purchaseCredits(packageData.credits)
      
    } catch (error) {
      toast.error('Payment redirection failed. Please try again.')
    } finally {
      // Reset processing state after a short delay
      setTimeout(() => {
        setIsProcessing(false)
        setSelectedPackage(null)
      }, 1000)
    }
  }

  const handleTestCredits = async (credits: number) => {
    try {
      await updateCredits(credits)
      toast.success(`${credits} test credits added!`)
      refreshUser()
    } catch (error) {
      toast.error('Failed to add test credits')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)'
    }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '16px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Choose Your Credits
            </h1>
          </div>
          
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '12px 20px',
            color: '#3b82f6',
            fontWeight: '600'
          }}>
            Current Balance: {user.credits} credits
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px'
      }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Power Up Your AI Experience
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Choose the perfect credit package for your needs. Use credits to access our powerful AI agents and unlock unlimited possibilities.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {CREDIT_PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '32px',
                border: pkg.popular ? '2px solid #3b82f6' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: pkg.popular 
                  ? '0 20px 25px -5px rgba(59, 130, 246, 0.25)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                transform: selectedPackage === pkg.id && isProcessing ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: '8px 24px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  {pkg.credits}
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  marginBottom: '16px'
                }}>
                  Credits
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  marginBottom: '8px'
                }}>
                  {pkg.price} AED
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {pkg.description}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                {pkg.features.map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px',
                      fontSize: '14px',
                      color: '#374151'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  background: pkg.popular 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isProcessing && selectedPackage === pkg.id ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    (e.target as HTMLElement).style.transform = 'scale(1.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) {
                    (e.target as HTMLElement).style.transform = 'scale(1)'
                  }
                }}
              >
                {isProcessing && selectedPackage === pkg.id
                  ? 'Processing...'
                  : `Purchase ${pkg.credits} Credits`
                }
              </button>
            </div>
          ))}
        </div>

        {/* Test Credits Section (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '60px',
            padding: '32px',
            background: 'rgba(255, 248, 220, 0.8)',
            borderRadius: '16px',
            border: '2px dashed #f59e0b',
            maxWidth: '600px',
            margin: '60px auto 0'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#92400e',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              🚧 Development Mode - Test Credits
            </h3>
            <p style={{
              color: '#92400e',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Skip payments and add credits directly for testing
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              {[10, 50, 100, 500].map(credits => (
                <button
                  key={credits}
                  onClick={() => handleTestCredits(credits)}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                >
                  +{credits}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div style={{
          marginTop: '80px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '48px'
          }}>
            Frequently Asked Questions
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '32px',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                How do credits work?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Each AI agent costs a certain number of credits to use. For example, the Data Analyzer costs 45 credits, while the Weather Reporter costs 15 credits.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Do credits expire?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Credits expire based on the package you choose. Basic packages last 30 days, while premium packages can last up to 6 months.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Can I get a refund?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                We offer a 7-day money-back guarantee for all credit packages. Contact support if you're not satisfied with your purchase.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Is payment secure?
              </h4>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Yes! All payments are processed securely through Stripe with industry-standard encryption and security measures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Loading pricing...
        </div>
      </div>
    }>
      <PricingForm />
    </Suspense>
  )
}