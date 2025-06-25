// Google Sheets API Integration Service

interface GoogleSheetsConfig {
  apiKey: string
  sheetId: string
  range?: string
}

interface SheetData {
  values: any[][]
  range: string
  majorDimension: string
}

interface ProcessedResults {
  headers: string[]
  rows: any[][]
  summary: {
    totalRows: number
    totalColumns: number
    lastUpdated: string
  }
  metadata?: Record<string, any>
}

class GoogleSheetsService {
  private static readonly BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'
  
  // Fetch data from Google Sheets
  static async fetchSheetData(config: GoogleSheetsConfig): Promise<SheetData> {
    const { apiKey, sheetId, range = 'A:Z' } = config
    
    if (!apiKey) {
      throw new Error('Google Sheets API key not configured')
    }

    try {
      const url = `${this.BASE_URL}/${sheetId}/values/${range}?key=${apiKey}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data as SheetData
    } catch (error) {
      console.error('Google Sheets fetch error:', error)
      throw error
    }
  }

  // Process and format sheet data
  static processSheetData(sheetData: SheetData): ProcessedResults {
    const { values } = sheetData
    
    if (!values || values.length === 0) {
      return {
        headers: [],
        rows: [],
        summary: {
          totalRows: 0,
          totalColumns: 0,
          lastUpdated: new Date().toISOString()
        }
      }
    }

    const headers = values[0] || []
    const rows = values.slice(1)

    return {
      headers,
      rows,
      summary: {
        totalRows: rows.length,
        totalColumns: headers.length,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Fetch agent results from specific sheet configurations
  static async fetchAgentResults(
    agentSlug: string, 
    resultId: string,
    userId: string
  ): Promise<ProcessedResults> {
    // Agent-specific sheet configurations
    const sheetConfigs: Record<string, GoogleSheetsConfig> = {
      'data-analyzer': {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '',
        sheetId: process.env.NEXT_PUBLIC_DATA_ANALYZER_SHEET_ID || '',
        range: 'Results!A:Z'
      },
      'content-writer': {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '',
        sheetId: process.env.NEXT_PUBLIC_CONTENT_WRITER_SHEET_ID || '',
        range: 'Content!A:Z'
      },
      'customer-support': {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '',
        sheetId: process.env.NEXT_PUBLIC_CUSTOMER_SUPPORT_SHEET_ID || '',
        range: 'Support!A:Z'
      }
    }

    const config = sheetConfigs[agentSlug]
    
    if (!config) {
      throw new Error(`No Google Sheets configuration for agent: ${agentSlug}`)
    }

    // Modify range to filter by user ID and result ID if needed
    if (resultId && userId) {
      // In a real implementation, you'd filter by these values
      // For now, we'll fetch all data and filter client-side
    }

    const sheetData = await this.fetchSheetData(config)
    const processedData = this.processSheetData(sheetData)

    // Filter results by user ID and result ID if applicable
    if (resultId && userId) {
      const filteredRows = processedData.rows.filter(row => {
        // Assuming columns 0 and 1 are userId and resultId
        return row[0] === userId && row[1] === resultId
      })
      
      processedData.rows = filteredRows
      processedData.summary.totalRows = filteredRows.length
    }

    return processedData
  }

  // Poll for new results (useful when waiting for n8n to populate sheets)
  static async pollForResults(
    agentSlug: string,
    resultId: string,
    userId: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000,
    onProgress?: (status: string) => void
  ): Promise<ProcessedResults> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        onProgress?.(`Checking results (${attempt}/${maxAttempts})...`)
        
        const results = await this.fetchAgentResults(agentSlug, resultId, userId)
        
        // Check if we have results (assuming non-empty rows indicate completion)
        if (results.rows.length > 0) {
          onProgress?.('Results found!')
          return results
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      } catch (error) {
        console.error(`Poll attempt ${attempt} failed:`, error)
        
        // On last attempt, throw the error
        if (attempt === maxAttempts) {
          throw error
        }
      }
    }
    
    throw new Error('Polling timeout - no results found in Google Sheets')
  }

  // Get sheet metadata
  static async getSheetMetadata(sheetId: string, apiKey: string): Promise<any> {
    try {
      const url = `${this.BASE_URL}/${sheetId}?key=${apiKey}&fields=properties,sheets.properties`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sheet metadata: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Sheet metadata error:', error)
      throw error
    }
  }

  // Format results for display
  static formatResultsForDisplay(results: ProcessedResults, agentSlug: string): any {
    const { headers, rows, summary } = results

    // Agent-specific formatting
    switch (agentSlug) {
      case 'data-analyzer':
        return this.formatDataAnalyzerResults(headers, rows, summary)
      
      case 'content-writer':
        return this.formatContentWriterResults(headers, rows, summary)
      
      case 'customer-support':
        return this.formatCustomerSupportResults(headers, rows, summary)
      
      default:
        return {
          headers,
          data: rows,
          summary,
          formatted: false
        }
    }
  }

  // Agent-specific formatters
  private static formatDataAnalyzerResults(headers: string[], rows: any[][], summary: any) {
    return {
      type: 'data-analysis',
      summary: {
        ...summary,
        insights: rows.filter(row => row[0] === 'insight').map(row => row[1]),
        charts: rows.filter(row => row[0] === 'chart').map(row => ({
          title: row[1],
          url: row[2],
          type: row[3]
        })),
        recommendations: rows.filter(row => row[0] === 'recommendation').map(row => row[1])
      },
      rawData: { headers, rows },
      formatted: true
    }
  }

  private static formatContentWriterResults(headers: string[], rows: any[][], summary: any) {
    return {
      type: 'content-creation',
      content: {
        title: rows.find(row => row[0] === 'title')?.[1] || '',
        body: rows.find(row => row[0] === 'content')?.[1] || '',
        wordCount: parseInt(rows.find(row => row[0] === 'word_count')?.[1] || '0'),
        seoScore: parseInt(rows.find(row => row[0] === 'seo_score')?.[1] || '0'),
        readabilityGrade: rows.find(row => row[0] === 'readability')?.[1] || ''
      },
      summary,
      rawData: { headers, rows },
      formatted: true
    }
  }

  private static formatCustomerSupportResults(headers: string[], rows: any[][], summary: any) {
    return {
      type: 'customer-support',
      response: {
        solution: rows.find(row => row[0] === 'solution')?.[1] || '',
        ticketId: rows.find(row => row[0] === 'ticket_id')?.[1] || '',
        category: rows.find(row => row[0] === 'category')?.[1] || '',
        priority: rows.find(row => row[0] === 'priority')?.[1] || '',
        estimatedResolutionTime: rows.find(row => row[0] === 'resolution_time')?.[1] || ''
      },
      summary,
      rawData: { headers, rows },
      formatted: true
    }
  }
}

export default GoogleSheetsService

// Helper function for common usage pattern
export const fetchAgentResultsFromSheets = async (
  agentSlug: string,
  resultId: string,
  userId: string,
  options: {
    poll?: boolean
    maxAttempts?: number
    intervalMs?: number
    onProgress?: (status: string) => void
  } = {}
): Promise<any> => {
  const { poll = false, maxAttempts = 30, intervalMs = 2000, onProgress } = options

  let results: ProcessedResults

  if (poll) {
    results = await GoogleSheetsService.pollForResults(
      agentSlug,
      resultId,
      userId,
      maxAttempts,
      intervalMs,
      onProgress
    )
  } else {
    results = await GoogleSheetsService.fetchAgentResults(agentSlug, resultId, userId)
  }

  return GoogleSheetsService.formatResultsForDisplay(results, agentSlug)
}