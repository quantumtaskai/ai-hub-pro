'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { AgentService } from '@/lib/agentService'
import { Agent } from '@/lib/supabase'
import { getAgentSlug } from '@/lib/agentUtils'
import AuthModal from '@/components/AuthModal'
import ProfileModal from '@/components/ProfileModal'

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
  },
  {
    id: 7,
    name: 'Weather Reporter Agent',
    description: 'Get detailed weather reports for any location worldwide with current conditions, forecasts, and weather alerts.',
    category: 'utilities',
    cost: 15,
    rating: 4.9,
    reviews: 1650,
    initials: 'WR',
    gradient: 'from-sky-500 to-blue-600'
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
  const router = useRouter()
  const { user, signOut, updateCredits } = useUserStore()
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [selectedCreditPack, setSelectedCreditPack] = useState<any>(null)
  const [lastResult, setLastResult] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })

  // Credit packages
  const CREDIT_PACKAGES = [
    { id: 1, credits: 500, price: 9.99, popular: false },
    { id: 2, credits: 1500, price: 24.99, popular: true },
    { id: 3, credits: 3000, price: 49.99, popular: false },
    { id: 4, credits: 7500, price: 99.99, popular: false }
  ]

  // Load agents (use hardcoded agents for now)
  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setIsLoading(true)
      // Use hardcoded agents instead of database for this demo
      setAgents(AGENTS as any)
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

  // Purchase credits function (simulated for now)
  const purchaseCredits = async (packageData: any) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Simulate payment processing
    toast.loading('Processing payment...', { duration: 2000 })
    
    try {
      // In production, this would integrate with Stripe
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update credits in database
      await updateCredits(packageData.credits)
      
      setShowCreditModal(false)
      setSelectedCreditPack(null)
      toast.success(`Successfully added ${packageData.credits.toLocaleString()} credits!`)
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    }
  }

  const useAgent = (agent: Agent) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (user.credits < agent.cost) {
      toast.error(`Insufficient credits! You need ${agent.cost} credits but only have ${user.credits}.`)
      return
    }

    // Get agent slug and redirect to agent page
    const slug = getAgentSlug(agent.name)
    router.push(`/agent/${slug}?agentId=${agent.id}&cost=${agent.cost}`)
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
            <div 
              onClick={() => {
                if (user) {
                  window.location.href = '/';
                }
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                cursor: user ? 'pointer' : 'default',
                transition: 'transform 0.2s ease',
                padding: user ? '8px' : '0',
                borderRadius: '12px'
              }}
              onMouseEnter={(e) => {
                if (user) {
                  (e.target as HTMLElement).style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (user) {
                  (e.target as HTMLElement).style.transform = 'scale(1)';
                }
              }}
            >
              <img 
                src="/logo.png" 
                alt="AgentHub Logo"
                style={{
                  height: '60px',
                  width: 'auto'
                }}
                onError={(e) => {
                  // Fallback if logo image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextSibling) {
                    (target.nextSibling as HTMLElement).style.display = 'block';
                  }
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
            {!user && (
              <div style={{ display: 'flex', gap: '32px' }}>
                <span style={{ color: '#6366f1', fontWeight: '600' }}>Home</span>
                <span style={{ color: '#9ca3af', fontWeight: '500' }}>Agents</span>
                <span style={{ color: '#9ca3af', fontWeight: '500' }}>Categories</span>
                <span style={{ color: '#9ca3af', fontWeight: '500' }}>Pricing</span>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {user ? (
              <>
                <div 
                  onClick={() => setShowCreditModal(true)}
                  style={{
                    background: user.credits <= 100 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : user.credits <= 500
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: user.credits <= 100 
                      ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                      : user.credits <= 500
                      ? '0 4px 15px rgba(245, 158, 11, 0.3)'
                      : '0 4px 15px rgba(16, 185, 129, 0.3)',
                    animation: user.credits <= 100 ? 'pulse 2s infinite' : 'none',
                    minWidth: '140px',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(-1px) scale(1.02)'
                    ;(e.target as HTMLElement).style.boxShadow = user.credits <= 100 
                      ? '0 6px 20px rgba(239, 68, 68, 0.4)'
                      : user.credits <= 500
                      ? '0 6px 20px rgba(245, 158, 11, 0.4)'
                      : '0 6px 20px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
                    ;(e.target as HTMLElement).style.boxShadow = user.credits <= 100 
                      ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                      : user.credits <= 500
                      ? '0 4px 15px rgba(245, 158, 11, 0.3)'
                      : '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    <span>
                      {user.credits <= 100 ? '⚠️' : user.credits <= 500 ? '⚡' : '✨'}
                    </span>
                    <span>{user.credits.toLocaleString()} Credits</span>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: '900',
                      marginLeft: '4px',
                      opacity: '0.8'
                    }}>
                      +
                    </span>
                  </div>
                </div>
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + 8,
                      right: window.innerWidth - rect.right
                    });
                    setShowProfileModal(true);
                  }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    background: showProfileModal ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!showProfileModal) {
                      (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'
                      ;(e.target as HTMLElement).style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showProfileModal) {
                      (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)'
                      ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                    }
                  }}
                >
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
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    marginLeft: '4px'
                  }}>
                    ↓
                  </span>
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

      {/* Hero Section - Only show for non-logged-in users */}
      {!user && (
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
            width: '56px',
            height: '56px',
            background: 'rgba(16, 185, 129, 0.3)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
            animationDelay: '4s'
          }}></div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            AI Agents Marketplace
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 48px',
            lineHeight: '1.6'
          }}>
            Discover, deploy, and scale AI agents designed to automate your business processes. 
            From customer service to data analysis, find the perfect AI solution.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '9999px',
                fontSize: '18px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
            >
              Get Started Free
            </button>
            <button
              style={{
                background: 'transparent',
                color: '#6b7280',
                padding: '16px 32px',
                borderRadius: '9999px',
                fontSize: '18px',
                fontWeight: '500',
                border: '2px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor = '#3b82f6'
                ;(e.target as HTMLElement).style.color = '#3b82f6'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = '#e5e7eb'
                ;(e.target as HTMLElement).style.color = '#6b7280'
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Search and Filter Section */}
      <section style={{ padding: user ? '48px 24px 48px' : '0 24px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {/* Search Bar */}
            <div style={{
              position: 'relative',
              maxWidth: '600px',
              margin: '0 auto'
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
                  background: 'white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
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
              flexWrap: 'wrap'
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
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedCategory === category.id 
                      ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                      : '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      (e.target as HTMLElement).style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      (e.target as HTMLElement).style.transform = 'scale(1)'
                    }
                  }}
                >
                  <span style={{ marginRight: '8px' }}>{category.emoji}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Agents Grid */}
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                ⏳
              </div>
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
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(-8px)'
                    ;(e.target as HTMLElement).style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = 'translateY(0)'
                    ;(e.target as HTMLElement).style.boxShadow = 'none'
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
                        transition: 'all 0.2s ease',
                        opacity: isProcessing === agent.id ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (isProcessing !== agent.id) {
                          (e.target as HTMLElement).style.transform = 'scale(1.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isProcessing !== agent.id) {
                          (e.target as HTMLElement).style.transform = 'scale(1)'
                        }
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
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🔍
              </div>
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

      {/* Credit Purchase Modal */}
      {showCreditModal && (
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
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCreditModal(false)}
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
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Purchase Credits
            </h2>
            <p style={{
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              Choose a credit package to continue using AI agents
            </p>
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {CREDIT_PACKAGES.map(pack => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedCreditPack(pack)}
                  style={{
                    border: selectedCreditPack?.id === pack.id 
                      ? '2px solid #3b82f6' 
                      : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    background: selectedCreditPack?.id === pack.id ? '#eff6ff' : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {pack.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '16px',
                      background: '#3b82f6',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      POPULAR
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#1f2937'
                      }}>
                        {pack.credits.toLocaleString()} Credits
                      </div>
                      <div style={{
                        color: '#6b7280',
                        fontSize: '14px'
                      }}>
                        ${pack.price}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#3b82f6'
                    }}>
                      ${pack.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedCreditPack && (
              <button
                onClick={() => purchaseCredits(selectedCreditPack)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '24px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
              >
                Purchase ${selectedCreditPack.price}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={user.id}
          position={dropdownPosition}
        />
      )}


      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}