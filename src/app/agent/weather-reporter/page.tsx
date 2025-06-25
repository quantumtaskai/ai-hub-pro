'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import ProcessingStatus from '@/components/agent-shared/ProcessingStatus'
import ResultsDisplay from '@/components/agent-shared/ResultsDisplay'
import CreditCounter from '@/components/agent-shared/CreditCounter'

interface WeatherData {
  location: string
  current: {
    temperature: number
    feels_like: number
    humidity: number
    pressure: number
    visibility: number
    wind_speed: number
    wind_direction: number
    weather_condition: string
    weather_description: string
    icon: string
  }
  forecast?: any[]
  alerts?: any[]
  generated_at: string
}

function WeatherReporterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateCredits } = useUserStore()
  
  // Get agent info from URL params
  const agentId = searchParams.get('agentId')
  const cost = parseInt(searchParams.get('cost') || '15')
  
  // Component state
  const [location, setLocation] = useState('')
  const [reportType, setReportType] = useState('current')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState<WeatherData | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Get agent info
  const agentInfo = getAgentInfo('weather-reporter')

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const getWeatherReport = async () => {
    if (!location.trim()) {
      toast.error('Please enter a location')
      return
    }

    setIsProcessing(true)
    setShowResults(false)
    setProcessingStatus('Getting weather data...')

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      
      if (!apiKey) {
        throw new Error('OpenWeatherMap API key not configured')
      }

      // Step 1: Get coordinates from location name
      setProcessingStatus('Finding location...')
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
      )

      if (!geoResponse.ok) {
        throw new Error('Failed to find location')
      }

      const geoData = await geoResponse.json()
      
      if (!geoData || geoData.length === 0) {
        throw new Error('Location not found. Please try a different location.')
      }

      const { lat, lon, name, country } = geoData[0]
      const fullLocationName = `${name}, ${country}`

      // Step 2: Get weather data
      setProcessingStatus('Fetching weather data...')
      
      let weatherData: any = {}

      if (reportType === 'current' || reportType === 'detailed') {
        // Current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        )
        
        if (!currentResponse.ok) {
          throw new Error('Failed to fetch current weather')
        }
        
        const currentData = await currentResponse.json()
        weatherData.current = currentData
      }

      if (reportType === 'forecast' || reportType === 'detailed') {
        // 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        )
        
        if (!forecastResponse.ok) {
          throw new Error('Failed to fetch weather forecast')
        }
        
        const forecastData = await forecastResponse.json()
        weatherData.forecast = forecastData.list
      }

      // Step 3: Format the results
      setProcessingStatus('Formatting weather report...')
      
      const formattedResults: WeatherData = {
        location: fullLocationName,
        current: {
          temperature: Math.round(weatherData.current?.main?.temp || 0),
          feels_like: Math.round(weatherData.current?.main?.feels_like || 0),
          humidity: weatherData.current?.main?.humidity || 0,
          pressure: weatherData.current?.main?.pressure || 0,
          visibility: Math.round((weatherData.current?.visibility || 0) / 1000),
          wind_speed: Math.round((weatherData.current?.wind?.speed || 0) * 3.6), // Convert m/s to km/h
          wind_direction: weatherData.current?.wind?.deg || 0,
          weather_condition: weatherData.current?.weather?.[0]?.main || 'Unknown',
          weather_description: weatherData.current?.weather?.[0]?.description || 'No description',
          icon: weatherData.current?.weather?.[0]?.icon || '01d'
        },
        forecast: weatherData.forecast || [],
        generated_at: new Date().toISOString()
      }

      // Step 4: Display results
      setResults(formattedResults)
      setShowResults(true)

      // Step 5: Deduct credits only after successful completion
      await updateCredits(-cost)
      toast.success(`Weather report generated! ${cost} credits used.`)

    } catch (error) {
      console.error('Weather API error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('not configured')) {
          toast.error('Weather service not configured. Please contact support.')
        } else if (error.message.includes('not found')) {
          toast.error('Location not found. Please try a different location.')
        } else if (error.message.includes('Failed to fetch')) {
          toast.error('Unable to get weather data. Please try again.')
        } else {
          toast.error(`Weather lookup failed: ${error.message}`)
        }
      } else {
        toast.error('Failed to get weather report. Please try again.')
      }
    } finally {
      setIsProcessing(false)
      setProcessingStatus('')
    }
  }

  return (
    <AgentLayout
      title={agentInfo.title}
      description={agentInfo.description}
      icon={agentInfo.icon}
      cost={cost}
    >
      <Toaster position="top-right" />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Main Content */}
        <div>
          {/* Location Input Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              📍 Enter Location
            </h3>
            
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name, address, or coordinates..."
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                marginBottom: '16px',
                transition: 'border-color 0.2s ease'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  getWeatherReport()
                }
              }}
              onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#e5e7eb'}
            />

            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Examples: "New York", "London, UK", "Tokyo, Japan", "37.7749,-122.4194"
            </div>
          </div>

          {/* Report Type Selection */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              📊 Report Type
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {[
                { id: 'current', label: 'Current Weather', desc: 'Real-time conditions', icon: '🌡️' },
                { id: 'forecast', label: '5-Day Forecast', desc: 'Extended weather outlook', icon: '📅' },
                { id: 'detailed', label: 'Detailed Report', desc: 'Current + forecast combined', icon: '📋' }
              ].map(option => (
                <label
                  key={option.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    border: `2px solid ${reportType === option.id ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: reportType === option.id ? '#eff6ff' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={option.id}
                    checked={reportType === option.id}
                    onChange={(e) => setReportType(e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <div style={{ fontSize: '20px' }}>{option.icon}</div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {option.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Processing Status */}
          <ProcessingStatus
            isProcessing={isProcessing}
            status={processingStatus}
          />

          {/* Results */}
          {showResults && results && (
            <ResultsDisplay
              results={results}
              title="Weather Report"
              isVisible={showResults}
            />
          )}
        </div>

        {/* Sidebar */}
        <div>
          <CreditCounter
            cost={cost}
            onProcess={getWeatherReport}
            disabled={!location.trim()}
            processing={isProcessing}
          />
        </div>
      </div>
    </AgentLayout>
  )
}

export default function WeatherReporterPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 50%, #f0f7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#3b82f6', fontSize: '18px' }}>Loading...</div>
      </div>
    }>
      <WeatherReporterForm />
    </Suspense>
  )
}