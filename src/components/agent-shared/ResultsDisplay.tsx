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
      // Check if it's a weather report
      if (results.location && results.current) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Location Header */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 8px 0'
              }}>
                🌍 {results.location}
              </h3>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Generated at {new Date(results.generated_at).toLocaleString()}
              </div>
            </div>

            {/* Current Weather */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🌡️ Current Weather
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {`https://openweathermap.org/img/w/${results.current.icon}.png` ? 
                      <img src={`https://openweathermap.org/img/w/${results.current.icon}.png`} alt="weather" style={{ width: '50px', height: '50px' }} /> : 
                      '🌤️'
                    }
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                    {results.current.temperature}°C
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                    {results.current.weather_description}
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Feels Like</div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>{results.current.feels_like}°C</div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Humidity</div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>{results.current.humidity}%</div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Wind Speed</div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>{results.current.wind_speed} km/h</div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Pressure</div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>{results.current.pressure} hPa</div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Visibility</div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>{results.current.visibility} km</div>
                </div>
              </div>
            </div>

            {/* Forecast if available */}
            {results.forecast && results.forecast.length > 0 && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📅 5-Day Forecast
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px'
                }}>
                  {results.forecast.slice(0, 5).map((day: any, index: number) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <img 
                        src={`https://openweathermap.org/img/w/${day.weather[0].icon}.png`} 
                        alt="weather" 
                        style={{ width: '40px', height: '40px', margin: '0 auto 8px auto' }}
                      />
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>
                        {Math.round(day.main.temp)}°C
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                        {day.weather[0].description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }

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