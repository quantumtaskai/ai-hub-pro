'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'

// Complete agent data matching your original design
const AGENTS = [
  {
    id: 1,
    name: 'Smart Customer Support Agent',
    description: 'Automates customer inquiries with intelligent responses, reducing response time by 80% while maintaining high satisfaction rates.',
    category: 'customer-service',
    cost: 25,
    rating: 4.9,
    reviews: 2300,
    initials: 'CS',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: 2,
    name: 'Data Analysis Agent',
    description: 'Processes complex datasets and generates actionable insights with automated reporting and visualization capabilities.',
    category: 'analytics',
    cost: 45,
    rating: 4.8,
    reviews: 1800,
    initials: 'DA',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 3,
    name: 'Content Writing Agent',
    description: 'Creates high-quality, engaging content across multiple formats while maintaining brand voice and SEO optimization.',
    category: 'content',
    cost: 35,
    rating: 4.7,
    reviews: 3100,
    initials: 'CW',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 4,
    name: 'Email Automation Agent',
    description: 'Manages email campaigns with personalized content, smart scheduling, and performance tracking for maximum engagement.',
    category: 'email',
    cost: 30,
    rating: 4.9,
    reviews: 2700,
    initials: 'EA',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 5,
    name: 'Sales Assistant Agent',
    description: 'Qualifies leads, schedules meetings, and provides sales insights to accelerate your sales pipeline and close deals faster.',
    category: 'sales',
    cost: 40,
    rating: 4.6,
    reviews: 1900,
    initials: 'SA',
    gradient: 'from-indigo-500 to-blue-600'
  },
  {
    id: 6,
    name: 'Task Automation Agent',
    description: 'Streamlines repetitive workflows across multiple platforms, saving hours of manual work with intelligent automation.',
    category: 'utilities',
    cost: 20,
    rating: 4.8,
    reviews: 4200,
    initials: 'TA',
    gradient: 'from-teal-500 to-cyan-600'
  }
]

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

// AI responses for demo
const AI_RESPONSES = {
  'Smart Customer Support Agent': '✅ Customer Support Complete!\n\n📞 Inquiry: Product return request\n💡 Solution: Generated return label #RT-2024-1847\n📊 Resolution time: 2.3 minutes\n😊 Customer satisfaction: 98%',
  'Data Analysis Agent': '📊 Data Analysis Complete!\n\n📈 Key Insights:\n• Revenue increased 23% this quarter\n• Top product: Premium Widget (+45%)\n• Peak sales time: 2-4 PM daily\n• Customer retention: 87% (+12%)',
  'Content Writing Agent': '✍️ Content Created!\n\n📄 Blog Post: "10 Productivity Hacks for Remote Teams"\n📝 Word count: 1,247 words\n🎯 SEO score: 94/100 (Excellent)\n📖 Readability: Grade A',
  'Email Automation Agent': '📧 Email Campaign Launched!\n\n📊 Campaign Stats:\n• 5,000 emails sent successfully\n• Open rate: 32% (+8% above average)\n• Click-through rate: 12%\n• Conversions: 47 sales',
  'Sales Assistant Agent': '💰 Sales Task Complete!\n\n🎯 Lead Qualification:\n• 23 leads processed\n• 12 qualified prospects\n• 8 meetings scheduled\n• Pipeline value: $47,500',
  'Task Automation Agent': '⚡ Automation Complete!\n\n🔗 Workflow Created:\n• Slack → Notion → Gmail connected\n• 23 repetitive tasks eliminated\n• Time savings: 4.5 hours/week\n• Efficiency boost: +67%'
}

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [isProcessing, setIsProcessing] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [selectedCreditPack, setSelectedCreditPack] = useState(null)
  const [lastResult, setLastResult] = useState('')

  // Credit packages
  const CREDIT_PACKAGES = [
    { id: 1, credits: 500, price: 9.99, popular: false },
    { id: 2, credits: 1500, price: 24.99, popular: true },
    { id: 3, credits: 3000, price: 49.99, popular: false },
    { id: 4, credits: 7500, price: 99.99, popular: false }
  ]

  // Initialize with NO user (start logged out)
  useEffect(() => {
    // Don't auto-login, start with no user
    setUser(null)
  }, [])

  // Filter agents
  const filteredAgents = AGENTS.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Auth handler - simplified and working
  const handleAuth = (email, password, name) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email,
      credits: 1000
    }
    
    console.log('Creating user:', newUser) // Debug log
    setUser(newUser)
    setShowAuthModal(false)
    toast.success(`Welcome ${newUser.name}! You have 1,000 credits to start.`)
  }

  // Logout handler  
  const handleLogout = () => {
    console.log('Logging out user') // Debug log
    setUser(null)
    toast.success('Logged out successfully')
  }

  // Purchase credits function
  const purchaseCredits = (packageData) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Simulate payment processing
    toast.loading('Processing payment...', { duration: 2000 })
    
    setTimeout(() => {
      const updatedUser = { 
        ...user, 
        credits: user.credits + packageData.credits 
      }
      setUser(updatedUser)
      setShowCreditModal(false)
      setSelectedCreditPack(null)
      toast.success(`Successfully added ${packageData.credits.toLocaleString()} credits!`)
    }, 2000)
  }
  const useAgent = async (agent) => {
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

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

    // Update credits
    const updatedUser = { ...user, credits: user.credits - agent.cost }
    setUser(updatedUser)

    // Show result
    setLastResult(AI_RESPONSES[agent.name] || 'Task completed successfully! ✅')
    setShowResultModal(true)
    setIsProcessing(null)

    toast.success(`${agent.name} completed! ${agent.cost} credits used.`)
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
              <img 
                src="/logo.png" 
                alt="AgentHub Logo"
                style={{
                  height: '60px',
                  width: 'auto'
                }}
                onError={(e) => {
                  // Fallback if logo image doesn't exist
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'none' // Hidden by default, shows if logo fails to load
              }}>
                AgentHub
              </div>
            </div>
            <div style={{ display: 'flex', gap: '32px' }}>
              <span style={{ color: '#6366f1', fontWeight: '600' }}>Home</span>
              <span style={{ color: '#9ca3af', fontWeight: '500' }}>Agents</span>
              <span style={{ color: '#9ca3af', fontWeight: '500' }}>Categories</span>
              <span style={{ color: '#9ca3af', fontWeight: '500' }}>Pricing</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {user ? (
              <>
                <div 
                  onClick={() => setShowCreditModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <span style={{ marginRight: '8px' }}>✨</span>
                  {user.credits.toLocaleString()} Credits
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '14px', 
                    opacity: '0.8' 
                  }}>
                    +
                  </span>
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
                      cursor: 'pointer',
                      marginLeft: '8px'
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
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
      <section style={{ position: 'relative', padding: '64px 24px', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Floating Elements */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '80px',
            width: '80px',
            height: '80px',
            background: 'rgba(147, 51, 234, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '128px',
            width: '64px',
            height: '64px',
            background: 'rgba(59, 130, 246, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '2s'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '33%',
            width: '48px',
            height: '48px',
            background: 'rgba(236, 72, 153, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '4s'
          }}></div>

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 'bold',
            marginBottom: '32px',
            lineHeight: '1.1'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AI Agents
            </span>
            <br />
            <span style={{ color: '#1f2937' }}>Ready to Use</span>
          </h1>

          {/* Search */}
          <div style={{ maxWidth: '512px', margin: '0 auto 64px auto' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search AI agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '20px 32px',
                  borderRadius: '24px',
                  fontSize: '18px',
                  border: 'none',
                  outline: 'none',
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  color: '#000000'
                }}
              />
              <svg style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                color: '#9ca3af'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          {/* Category Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '64px'
          }}>
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  background: selectedCategory === category.id
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.7)',
                  color: selectedCategory === category.id ? 'white' : '#374151'
                }}
              >
                <span style={{ marginRight: '8px' }}>{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section style={{ padding: '0 24px 80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                style={{
                  borderRadius: '24px',
                  padding: '32px',
                  backdropFilter: 'blur(30px)',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-16px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 40px 80px rgba(0, 0, 0, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    backgroundImage: agent.gradient.includes('blue') ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' :
                      agent.gradient.includes('green') ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                        agent.gradient.includes('orange') ? 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)' :
                          agent.gradient.includes('purple') ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' :
                            agent.gradient.includes('indigo') ? 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' :
                              'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    {agent.initials}
                  </div>
                  <span style={{
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {agent.category.replace('-', ' ')}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  {agent.name}
                </h3>

                <p style={{
                  color: '#6b7280',
                  marginBottom: '24px',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}>
                  {agent.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    color: '#fbbf24',
                    fontSize: '14px',
                    marginRight: '8px'
                  }}>
                    {'★'.repeat(Math.floor(agent.rating))}{'☆'.repeat(5 - Math.floor(agent.rating))}
                  </div>
                  <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>
                    {agent.rating} ({agent.reviews.toLocaleString()})
                  </span>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '16px',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}>
                  {agent.cost} Credits per use
                </div>

                <button
                  onClick={() => useAgent(agent)}
                  disabled={isProcessing === agent.id}
                  style={{
                    width: '100%',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    border: 'none',
                    cursor: isProcessing === agent.id ? 'not-allowed' : 'pointer',
                    background: isProcessing === agent.id
                      ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    opacity: isProcessing === agent.id ? 0.5 : 1
                  }}
                >
                  {isProcessing === agent.id ? 'Processing...' : 'Use Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Purchase Modal */}
      {showCreditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backdropFilter: 'blur(20px)',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <span style={{ fontSize: '40px' }}>💳</span>
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Add Credits
              </h3>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Choose a credit package to power your AI agents
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {CREDIT_PACKAGES.map(pack => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedCreditPack(pack)}
                  style={{
                    border: selectedCreditPack?.id === pack.id ? '3px solid #667eea' : '2px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    background: selectedCreditPack?.id === pack.id ? '#f8faff' : 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {pack.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      POPULAR
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px'
                  }}>
                    {pack.credits.toLocaleString()}
                  </div>
                  <div style={{ color: '#6b7280', marginBottom: '12px' }}>Credits</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#059669'
                  }}>
                    ${pack.price}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '4px'
                  }}>
                    ${(pack.price / pack.credits * 1000).toFixed(2)}/1K credits
                  </div>
                </div>
              ))}
            </div>

            {selectedCreditPack && (
              <div style={{
                background: '#f8faff',
                border: '1px solid #e0e7ff',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#374151', marginBottom: '8px' }}>
                  You're purchasing <strong>{selectedCreditPack.credits.toLocaleString()} credits</strong> for <strong>${selectedCreditPack.price}</strong>
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Your new balance will be: <strong>{((user?.credits || 0) + selectedCreditPack.credits).toLocaleString()} credits</strong>
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowCreditModal(false)
                  setSelectedCreditPack(null)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  if (selectedCreditPack) {
                    purchaseCredits(selectedCreditPack)
                  }
                }}
                disabled={!selectedCreditPack}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: selectedCreditPack 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  cursor: selectedCreditPack ? 'pointer' : 'not-allowed',
                  opacity: selectedCreditPack ? 1 : 0.5
                }}
              >
                {selectedCreditPack ? `Purchase ${selectedCreditPack.credits.toLocaleString()} Credits` : 'Select a Package'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backdropFilter: 'blur(20px)',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              {authMode === 'login' ? 'Welcome Back!' : 'Get Started'}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const email = formData.get('email')
              const password = formData.get('password')
              const name = formData.get('name')
              handleAuth(email, password, name)
            }}>
              {authMode === 'register' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8b5cf6',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '8px'
                }}
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
              <br />
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backdropFilter: 'blur(20px)',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <span style={{ fontSize: '40px' }}>🎉</span>
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Task Complete!
              </h3>
            </div>

            <div style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <pre style={{
                fontSize: '14px',
                color: '#374151',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {lastResult}
              </pre>
            </div>

            <button
              onClick={() => setShowResultModal(false)}
              style={{
                width: '100%',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section style={{ padding: '0 24px 80px 24px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))',
            borderRadius: '24px',
            padding: '48px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px'
            }}>
              Ready to Build Your AI Team?
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'white',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Join thousands of businesses already using AI agents to streamline operations and boost productivity.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button style={{
                background: 'white',
                color: '#1f2937',
                padding: '16px 32px',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}>
                Start Free Trial
              </button>
              <button style={{
                border: '2px solid white',
                background: 'transparent',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '18px',
                cursor: 'pointer'
              }}>
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 24px',
        background: '#1f2937'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <img 
                  src="/logo-white.png" 
                  alt="Quantum Task AI Logo"
                  style={{
                    height: '60px',
                    width: 'auto'
                  }}
                  onError={(e) => {
                    // Fallback if white logo image doesn't exist
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{
                  display: 'none', // Hidden by default, shows if logo fails to load
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px'
                  }}></div>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    Quantum Task AI
                  </span>
                </div>
              </div>
              <p style={{ color: '#9ca3af' }}>
                The future of AI automation is here. Build, deploy, and scale AI agents for your business.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px'
              }}>
                Product
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Agents</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Marketplace</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Integrations</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>API</a>
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px'
              }}>
                Company
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>About</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Blog</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Careers</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px'
              }}>
                Support
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Documentation</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Help Center</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Community</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Status</a>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ color: '#9ca3af' }}>© 2025 Quantum Task AI. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-30px) rotate(10deg); 
          }
        }
      `}</style>
    </div>
  )
}