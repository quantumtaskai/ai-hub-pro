'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { getAgentInfo } from '@/lib/agentUtils'
import AgentLayout from '@/components/agent-shared/AgentLayout'
import FileUpload from '@/components/agent-shared/FileUpload'
import ProcessingStatus from '@/components/agent-shared/ProcessingStatus'
import ResultsDisplay from '@/components/agent-shared/ResultsDisplay'
import CreditCounter from '@/components/agent-shared/CreditCounter'

function DataAnalyzerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateCredits } = useUserStore()
  
  // Get agent info from URL params
  const agentId = searchParams.get('agentId')
  const cost = parseInt(searchParams.get('cost') || '45')
  
  // Component state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState('summary')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [results, setResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  // Get agent info
  const agentInfo = getAgentInfo('data-analyzer')

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setResults(null)
    setShowResults(false)
  }

  const processFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    setIsProcessing(true)
    setShowResults(false)
    setProcessingStatus('Uploading file...')

    try {
      // Step 1: Prepare FormData for n8n webhook
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('analysisType', analysisType)
      formData.append('userId', user.id)
      formData.append('agentId', agentId || '')
      formData.append('fileName', selectedFile.name)
      formData.append('fileSize', selectedFile.size.toString())

      // Step 2: Send to n8n webhook
      setProcessingStatus('Analyzing data with AI...')
      
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_DATA_ANALYZER
      
      if (!webhookUrl) {
        throw new Error('Data analyzer webhook not configured')
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
      }

      setProcessingStatus('Processing results...')
      
      // Get results directly from n8n response
      const results = await response.json()

      // Step 3: Display results
      setResults(results)
      setShowResults(true)

      // Step 4: Deduct credits only after successful completion
      await updateCredits(-cost)
      toast.success(`Analysis complete! ${cost} credits used.`)

    } catch (error) {
      console.error('Processing error:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not configured')) {
          toast.error('Data analyzer service not configured. Please contact support.')
        } else if (error.message.includes('Webhook failed')) {
          toast.error('Failed to connect to analysis service. Please try again.')
        } else {
          toast.error(`Analysis failed: ${error.message}`)
        }
      } else {
        toast.error('Failed to analyze file. Please try again.')
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
          {/* File Upload Section */}
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
              Upload Data File
            </h3>
            
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes=".pdf,.csv,.xlsx,.xls"
              maxSize={25}
              placeholder="Upload PDF, CSV, or Excel file for analysis"
              icon="📊"
            />
          </div>

          {/* Analysis Options */}
          {selectedFile && (
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
                Analysis Type
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {[
                  { id: 'summary', label: 'Data Summary', desc: 'Basic statistics and overview' },
                  { id: 'trends', label: 'Trend Analysis', desc: 'Identify patterns and trends' },
                  { id: 'insights', label: 'Business Insights', desc: 'AI-powered recommendations' },
                  { id: 'full', label: 'Complete Analysis', desc: 'All analysis types combined' }
                ].map(option => (
                  <label
                    key={option.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      border: `2px solid ${analysisType === option.id ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: analysisType === option.id ? '#eff6ff' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="analysisType"
                      value={option.id}
                      checked={analysisType === option.id}
                      onChange={(e) => setAnalysisType(e.target.value)}
                      style={{ margin: 0 }}
                    />
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
          )}

          {/* Processing Status */}
          <ProcessingStatus
            isProcessing={isProcessing}
            status={processingStatus}
          />

          {/* Results */}
          {showResults && results && (
            <ResultsDisplay
              results={results}
              title="Analysis Results"
              isVisible={showResults}
            />
          )}
        </div>

        {/* Sidebar */}
        <div>
          <CreditCounter
            cost={cost}
            onProcess={processFile}
            disabled={!selectedFile}
            processing={isProcessing}
          />
        </div>
      </div>
    </AgentLayout>
  )
}

export default function DataAnalyzerPage() {
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
      <DataAnalyzerForm />
    </Suspense>
  )
}