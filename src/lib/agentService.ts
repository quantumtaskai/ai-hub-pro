import { supabase, Agent, UsageHistory } from './supabase'

export class AgentService {
  // Fetch all active agents from database
  static async getAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching agents:', error)
      throw new Error('Failed to fetch agents')
    }

    return data || []
  }

  // Use an agent and track usage
  static async useAgent(userId: string, agentId: number, agentName: string, cost: number): Promise<string> {
    // First, create usage record
    const { data: usageData, error: usageError } = await supabase
      .from('usage_history')
      .insert([
        {
          user_id: userId,
          agent_id: agentId,
          agent_name: agentName,
          cost,
          status: 'processing'
        }
      ])
      .select()
      .single()

    if (usageError) {
      console.error('Error creating usage record:', usageError)
      throw new Error('Failed to start agent usage')
    }

    // Simulate AI processing (in production, this would call real AI APIs)
    const result = await this.simulateAIProcessing(agentName)

    // Update usage record with result
    const { error: updateError } = await supabase
      .from('usage_history')
      .update({ 
        status: 'completed',
        result 
      })
      .eq('id', usageData.id)

    if (updateError) {
      console.error('Error updating usage record:', updateError)
    }

    return result
  }

  // Get user's usage history
  static async getUserUsageHistory(userId: string): Promise<UsageHistory[]> {
    const { data, error } = await supabase
      .from('usage_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching usage history:', error)
      throw new Error('Failed to fetch usage history')
    }

    return data || []
  }

  // Simulate AI processing (replace with real AI integrations later)
  private static async simulateAIProcessing(agentName: string): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

    const results = {
      'Smart Customer Support Agent': '✅ Customer Support Complete!\n\n📞 Inquiry: Product return request\n💡 Solution: Generated return label #RT-2024-1847\n📊 Resolution time: 2.3 minutes\n😊 Customer satisfaction: 98%',
      'Data Analysis Agent': '📊 Data Analysis Complete!\n\n📈 Key Insights:\n• Revenue increased 23% this quarter\n• Top product: Premium Widget (+45%)\n• Peak sales time: 2-4 PM daily\n• Customer retention: 87% (+12%)',
      'Content Writing Agent': '✍️ Content Created!\n\n📄 Blog Post: "10 Productivity Hacks for Remote Teams"\n📝 Word count: 1,247 words\n🎯 SEO score: 94/100 (Excellent)\n📖 Readability: Grade A',
      'Email Automation Agent': '📧 Email Campaign Launched!\n\n📊 Campaign Stats:\n• 5,000 emails sent successfully\n• Open rate: 32% (+8% above average)\n• Click-through rate: 12%\n• Conversions: 47 sales',
      'Sales Assistant Agent': '💰 Sales Task Complete!\n\n🎯 Lead Qualification:\n• 23 leads processed\n• 12 qualified prospects\n• 8 meetings scheduled\n• Pipeline value: $47,500',
      'Task Automation Agent': '⚡ Automation Complete!\n\n🔗 Workflow Created:\n• Slack → Notion → Gmail connected\n• 23 repetitive tasks eliminated\n• Time savings: 4.5 hours/week\n• Efficiency boost: +67%'
    }

    return results[agentName as keyof typeof results] || 'Task completed successfully! ✅'
  }
} 