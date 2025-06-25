'use client'

import { useUserStore } from '@/store/userStore'

interface CreditCounterProps {
  cost: number
  onProcess: () => void
  disabled?: boolean
  processing?: boolean
}

export default function CreditCounter({ cost, onProcess, disabled = false, processing = false }: CreditCounterProps) {
  const { user } = useUserStore()

  if (!user) return null

  const hasEnoughCredits = user.credits >= cost
  const buttonDisabled = disabled || processing || !hasEnoughCredits

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            Credit Cost
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px'
          }}>
            This operation will cost {cost} credits
          </p>
        </div>
        
        <div style={{
          textAlign: 'right'
        }}>
          <div style={{
            background: hasEnoughCredits 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            {user.credits.toLocaleString()} Credits Available
          </div>
          {!hasEnoughCredits && (
            <p style={{
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Insufficient credits
            </p>
          )}
        </div>
      </div>

      <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <span style={{ color: '#6b7280' }}>Current Balance:</span>
          <span style={{ fontWeight: '600' }}>{user.credits.toLocaleString()} credits</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          <span style={{ color: '#6b7280' }}>Cost:</span>
          <span style={{ color: '#ef4444', fontWeight: '600' }}>-{cost} credits</span>
        </div>
        <div style={{
          borderTop: '1px solid #d1d5db',
          marginTop: '8px',
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <span style={{ fontWeight: '600' }}>After Processing:</span>
          <span style={{ 
            fontWeight: '600',
            color: hasEnoughCredits ? '#059669' : '#ef4444'
          }}>
            {(user.credits - cost).toLocaleString()} credits
          </span>
        </div>
      </div>

      <button
        onClick={onProcess}
        disabled={buttonDisabled}
        style={{
          width: '100%',
          background: buttonDisabled 
            ? '#9ca3af' 
            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: 'white',
          border: 'none',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: buttonDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {processing ? 'Processing...' : 
         !hasEnoughCredits ? 'Insufficient Credits' :
         `Process Agent (${cost} credits)`}
      </button>

      {!hasEnoughCredits && (
        <p style={{
          textAlign: 'center',
          marginTop: '12px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
            Purchase more credits
          </a> to use this agent
        </p>
      )}
    </div>
  )
}