'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { toast } from 'react-hot-toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register' | 'reset'
  setAuthMode: (mode: 'login' | 'register' | 'reset') => void
}

export default function AuthModal({ isOpen, onClose, mode, setAuthMode }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  
  const { signIn, signUp, resetPassword, error, setError } = useUserStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'register') {
        await signUp(email, password, name)
        toast.success('Account created successfully! Welcome to AgentHub!')
        onClose()
        setEmail('')
        setPassword('')
        setName('')
      } else if (mode === 'reset') {
        await resetPassword(email)
        setResetEmailSent(true)
        toast.success('Password reset email sent! Check your inbox.')
      } else {
        await signIn(email, password)
        toast.success('Welcome back!')
        onClose()
        setEmail('')
        setPassword('')
        setName('')
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
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
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
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

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {mode === 'register' ? 'Create Account' : mode === 'reset' ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#6b7280' }}>
            {mode === 'register' 
              ? 'Join AgentHub and get 1,000 free credits!' 
              : mode === 'reset'
              ? 'Enter your email to receive a password reset link'
              : 'Sign in to your AgentHub account'
            }
          </p>
        </div>

        {resetEmailSent && mode === 'reset' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0369a1',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Check your email!</h3>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
            </div>
            <button
              onClick={() => {
                setResetEmailSent(false)
                setAuthMode('login')
                setEmail('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mode === 'register' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Enter your email"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Enter your password"
                />
                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null)
                        setAuthMode('reset')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => !isLoading && ((e.target as HTMLElement).style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => !isLoading && ((e.target as HTMLElement).style.transform = 'scale(1)')}
            >
              {isLoading ? 'Processing...' : (mode === 'register' ? 'Create Account' : mode === 'reset' ? 'Send Reset Email' : 'Sign In')}
            </button>
          </form>
        )}

        {!resetEmailSent && (
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>
              {mode === 'register' ? 'Already have an account?' : mode === 'reset' ? 'Remember your password?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setError(null)
                setEmail('')
                setPassword('')
                setName('')
                setResetEmailSent(false)
                setAuthMode(mode === 'register' ? 'login' : mode === 'reset' ? 'login' : 'register')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {mode === 'register' ? 'Sign in instead' : mode === 'reset' ? 'Back to Sign In' : 'Create account'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 