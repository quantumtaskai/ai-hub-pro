'use client'

interface ResultsDisplayProps {
  results: any
  title?: string
  isVisible: boolean
}

export default function ResultsDisplay({ results, title = "Results", isVisible }: ResultsDisplayProps) {
  if (!isVisible || !results) return null

  const renderResults = () => {
    if (typeof results === 'string') {
      return (
        <div style={{
          whiteSpace: 'pre-line',
          lineHeight: '1.6',
          color: '#374151'
        }}>
          {results}
        </div>
      )
    }

    if (Array.isArray(results)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.map((item, index) => (
            <div key={index} style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
            </div>
          ))}
        </div>
      )
    }

    if (typeof results === 'object') {
      // Check if it's an n8n response with specific format
      if (results.status && results.analysis) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              alignSelf: 'flex-start'
            }}>
              <div style={{
                background: results.status === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {results.status === 'success' ? '✅ Analysis Complete' : '❌ Analysis Failed'}
              </div>
              {results.processed_at && (
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  {new Date(results.processed_at).toLocaleString()}
                </span>
              )}
            </div>

            {/* Analysis Content */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                📊 Analysis Results
              </h4>
              <div style={{
                whiteSpace: 'pre-line',
                lineHeight: '1.7',
                color: '#374151',
                fontSize: '15px'
              }}>
                {results.analysis}
              </div>
            </div>

            {/* Additional fields if present */}
            {Object.keys(results).filter(key => !['status', 'analysis', 'processed_at'].includes(key)).map(key => (
              <div key={key} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }}>
                  {key.replace(/_/g, ' ')}
                </h5>
                <div style={{ color: '#374151' }}>
                  {typeof results[key] === 'object' ? JSON.stringify(results[key], null, 2) : String(results[key])}
                </div>
              </div>
            ))}
          </div>
        )
      }

      // Fallback for other object types
      return (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '14px',
          overflow: 'auto'
        }}>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )
    }

    return <div>{String(results)}</div>
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      marginTop: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '24px'
        }}>
          ✅
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          {title}
        </h3>
      </div>

      <div style={{
        fontSize: '16px'
      }}>
        {renderResults()}
      </div>

      {/* Download/Copy Actions */}
      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => {
            const text = typeof results === 'string' ? results : JSON.stringify(results, null, 2)
            navigator.clipboard.writeText(text)
          }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          📋 Copy Results
        </button>
        
        <button
          onClick={() => {
            const text = typeof results === 'string' ? results : JSON.stringify(results, null, 2)
            const blob = new Blob([text], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `agent-results-${Date.now()}.txt`
            a.click()
            URL.revokeObjectURL(url)
          }}
          style={{
            background: 'white',
            color: '#374151',
            border: '2px solid #e5e7eb',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          💾 Download
        </button>
      </div>
    </div>
  )
}