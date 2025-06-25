// N8N Webhook Integration Service

interface N8NWebhookConfig {
  agentSlug: string
  webhookUrl: string
  method?: 'POST' | 'GET'
  headers?: Record<string, string>
}

interface N8NResponse {
  success: boolean
  data: any
  error?: string
  googleSheetsId?: string
  resultUrl?: string
}

class N8NService {
  private static webhookConfigs: Record<string, N8NWebhookConfig> = {
    'data-analyzer': {
      agentSlug: 'data-analyzer',
      webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_DATA_ANALYZER || '',
      method: 'POST'
    },
    'content-writer': {
      agentSlug: 'content-writer', 
      webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_CONTENT_WRITER || '',
      method: 'POST'
    },
    'customer-support': {
      agentSlug: 'customer-support',
      webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_CUSTOMER_SUPPORT || '',
      method: 'POST'
    },
    'email-automation': {
      agentSlug: 'email-automation',
      webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_EMAIL_AUTOMATION || '',
      method: 'POST'
    },
    'sales-assistant': {
      agentSlug: 'sales-assistant',
      webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_SALES_ASSISTANT || '',
      method: 'POST'
    },
    'task-automation': {
      agentSlug: 'task-automation',
      webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_TASK_AUTOMATION || '',
      method: 'POST'
    }
  }

  // Send data to n8n webhook
  static async sendToWebhook(
    agentSlug: string, 
    data: FormData | Record<string, any>,
    options: {
      userId: string
      agentId: string
      onProgress?: (status: string) => void
    }
  ): Promise<N8NResponse> {
    const config = this.webhookConfigs[agentSlug]
    
    if (!config || !config.webhookUrl) {
      throw new Error(`No webhook configured for agent: ${agentSlug}`)
    }

    options.onProgress?.('Connecting to workflow...')

    try {
      let body: FormData | string
      let headers: Record<string, string> = {
        'X-User-ID': options.userId,
        'X-Agent-ID': options.agentId,
        'X-Agent-Slug': agentSlug,
        ...config.headers
      }

      // Handle FormData vs JSON
      if (data instanceof FormData) {
        // Add metadata to FormData
        data.append('userId', options.userId)
        data.append('agentId', options.agentId)
        data.append('agentSlug', agentSlug)
        body = data
      } else {
        // JSON payload
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify({
          ...data,
          userId: options.userId,
          agentId: options.agentId,
          agentSlug: agentSlug
        })
      }

      options.onProgress?.('Sending data to workflow...')

      const response = await fetch(config.webhookUrl, {
        method: config.method || 'POST',
        headers: headers,
        body: body
      })

      options.onProgress?.('Processing workflow...')

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      options.onProgress?.('Workflow completed!')

      return {
        success: true,
        data: result,
        googleSheetsId: result.googleSheetsId,
        resultUrl: result.resultUrl
      }

    } catch (error) {
      console.error('N8N webhook error:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Poll for results (useful for async workflows)
  static async pollForResults(
    resultUrl: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000,
    onProgress?: (status: string) => void
  ): Promise<any> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        onProgress?.(`Checking results (${attempt}/${maxAttempts})...`)
        
        const response = await fetch(resultUrl)
        
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'completed') {
            return data.results
          }
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      } catch (error) {
        console.error(`Poll attempt ${attempt} failed:`, error)
      }
    }
    
    throw new Error('Polling timeout - results not ready')
  }

  // Get webhook status
  static async checkWebhookHealth(agentSlug: string): Promise<boolean> {
    const config = this.webhookConfigs[agentSlug]
    
    if (!config || !config.webhookUrl) {
      return false
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'OPTIONS'
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Get available agents with webhook status
  static async getWebhookStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {}
    
    for (const agentSlug of Object.keys(this.webhookConfigs)) {
      status[agentSlug] = await this.checkWebhookHealth(agentSlug)
    }
    
    return status
  }
}

export default N8NService

// Helper function for common workflow patterns
export const processWithN8N = async (
  agentSlug: string,
  data: FormData | Record<string, any>,
  options: {
    userId: string
    agentId: string
    onProgress?: (status: string) => void
    pollForResults?: boolean
    resultUrl?: string
  }
): Promise<any> => {
  // Send to webhook
  const webhookResponse = await N8NService.sendToWebhook(agentSlug, data, options)
  
  if (!webhookResponse.success) {
    throw new Error(webhookResponse.error || 'Webhook failed')
  }

  // If polling is requested and result URL is available
  if (options.pollForResults && webhookResponse.resultUrl) {
    options.onProgress?.('Waiting for results...')
    return await N8NService.pollForResults(webhookResponse.resultUrl, 30, 2000, options.onProgress)
  }

  return webhookResponse.data
}