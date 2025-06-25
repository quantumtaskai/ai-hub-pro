'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { AgentService } from '@/lib/agentService'
import { Agent } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'

const CATEGORIES = [
  { id: 'all', name: 'All Agents', emoji: '🤖' },
  { id: 'customer-service', name: 'Customer Service', emoji: '💬' },
  { id: 'analytics', name: 'Analytics', emoji: '📊' },
  { id: 'content', name: 'Content', emoji: '📝' },
  { id: 'email', name: 'Email', emoji: '📧' },
  { id: 'utilities', name: 'Utilities', emoji: '🔧' },
  { id: 'sales', name: 'Sales', emoji: '💰' },
  { id: 'marketing', name: 'Marketing', emoji: '📈' }
]

export default function HomePage() {
  const { user, signOut, updateCredits } = useUserStore()
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [lastResult, setLastResult] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load agents from database
  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setIsLoading(true)
      const agentsData = await AgentService.getAgents()
      setAgents(agentsData)
    } catch (error) {
      console.error('Failed to load agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Logout handler  
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const useAgent = async (agent: Agent) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (user.credits < agent.cost) {
      toast.error(`Insufficient credits! You need ${agent.cost} credits but only have ${user.credits}.`)
      return
    }

    setIsProcessing(agent.id)
    toast.loading('Agent is processing your request...', { duration: 2000 })

    try {
      // Use agent and get result
      const result = await AgentService.useAgent(user.id, agent.id, agent.name, agent.cost)
      
      // Update credits in database
      await updateCredits(-agent.cost)

      // Show result
      setLastResult(result)
      setShowResultModal(true)
      toast.success(`${agent.name} completed! ${agent.cost} credits used.`)
    } catch (error) {
      toast.error('Failed to use agent. Please try again.')
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)'
    }}>
      <Toaster position="top-right" />
      
      {/* Debug indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        User: {user ? `${user.name} (${user.credits} credits)` : 'Not logged in'}
      </div>

      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '20px 24px',
        backdropFilter: 'blur(30px)',
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AgentHub
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {user ? (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                }}>
                  <span style={{ marginRight: '8px' }}>✨</span>
                  {user.credits.toLocaleString()} Credits
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{user.name}</span>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px'
          }}>
            AI Agents Marketplace
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            Discover, deploy, and scale AI agents designed to automate your business processes.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section style={{ padding: '0 24px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Search Bar */}
          <div style={{
            position: 'relative',
            maxWidth: '600px',
            margin: '0 auto 24px'
          }}>
            <input
              type="text"
              placeholder="Search for AI agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 48px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '16px',
                background: 'white'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px'
            }}>
              🔍
            </span>
          </div>

          {/* Category Filters */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '48px'
          }}>
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  background: selectedCategory === category.id 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'white',
                  color: selectedCategory === category.id ? 'white' : '#6b7280',
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  border: selectedCategory === category.id ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <span style={{ marginRight: '8px' }}>{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Agents Grid */}
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p>Loading AI agents...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '24px'
            }}>
              {filteredAgents.map(agent => (
                <div
                  key={agent.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '20px',
                    padding: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  {/* Agent Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${agent.gradient})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '20px'
                    }}>
                      {agent.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>
                        {agent.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: '#fbbf24' }}>⭐</span>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>
                          {agent.rating} ({agent.reviews.toLocaleString()} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agent Description */}
                  <p style={{
                    color: '#6b7280',
                    lineHeight: '1.6',
                    marginBottom: '24px'
                  }}>
                    {agent.description}
                  </p>

                  {/* Agent Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✨</span>
                      <span style={{ color: '#1f2937', fontWeight: '600' }}>
                        {agent.cost} credits
                      </span>
                    </div>
                    <button
                      onClick={() => useAgent(agent)}
                      disabled={isProcessing === agent.id}
                      style={{
                        background: isProcessing === agent.id
                          ? '#9ca3af'
                          : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: isProcessing === agent.id ? 'not-allowed' : 'pointer',
                        opacity: isProcessing === agent.id ? 0.7 : 1
                      }}
                    >
                      {isProcessing === agent.id ? 'Processing...' : 'Use Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredAgents.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p>No agents found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setAuthMode={setAuthMode}
      />

      {/* Result Modal */}
      {showResultModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowResultModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              Task Completed! 🎉
            </h2>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              whiteSpace: 'pre-line',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {lastResult}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 