import { useState, useEffect, useCallback } from 'react'

export interface User {
  id: string
  name: string
  email: string
  credits: number
  createdAt: string
}

export interface Usage {
  id: string
  agentName: string
  cost: number
  timestamp: string
  status: 'completed' | 'processing' | 'failed'
  result?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [usageHistory, setUsageHistory] = useState<Usage[]>([])
  const [loading, setLoading] = useState(true)

  // Load user data from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user')
      const usageData = localStorage.getItem('usageHistory')
      
      if (userData) {
        setUser(JSON.parse(userData))
      }
      
      if (usageData) {
        setUsageHistory(JSON.parse(usageData))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save user data to localStorage
  const saveUser = useCallback((userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  // Save usage history to localStorage
  const saveUsageHistory = useCallback((history: Usage[]) => {
    setUsageHistory(history)
    localStorage.setItem('usageHistory', JSON.stringify(history))
  }, [])

  // Register new user
  const register = useCallback((email: string, password: string, name?: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email,
      credits: 1000, // Give new users 1000 credits
      createdAt: new Date().toISOString()
    }
    saveUser(newUser)
    return newUser
  }, [saveUser])

  // Login existing user (for POC, just create a new user)
  const login = useCallback((email: string, password: string) => {
    // In POC, we'll just create a new user for any login attempt
    const existingUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      credits: 1000,
      createdAt: new Date().toISOString()
    }
    saveUser(existingUser)
    return existingUser
  }, [saveUser])

  // Logout user
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
  }, [])

  // Use credits for agent
  const useCredits = useCallback((agentName: string, cost: number) => {
    if (!user || user.credits < cost) {
      return false
    }

    const updatedUser = { ...user, credits: user.credits - cost }
    saveUser(updatedUser)

    // Add to usage history
    const newUsage: Usage = {
      id: Math.random().toString(36).substr(2, 9),
      agentName,
      cost,
      timestamp: new Date().toISOString(),
      status: 'completed'
    }

    const updatedHistory = [...usageHistory, newUsage]
    saveUsageHistory(updatedHistory)

    return true
  }, [user, usageHistory, saveUser, saveUsageHistory])

  // Add credits (for purchases)
  const addCredits = useCallback((amount: number) => {
    if (!user) return false

    const updatedUser = { ...user, credits: user.credits + amount }
    saveUser(updatedUser)
    return true
  }, [user, saveUser])

  // Get user stats
  const getStats = useCallback(() => {
    if (!user || usageHistory.length === 0) {
      return {
        totalSpent: 0,
        totalTasks: 0,
        thisWeekTasks: 0,
        favoriteAgent: null
      }
    }

    const totalSpent = usageHistory.reduce((sum, usage) => sum + usage.cost, 0)
    const totalTasks = usageHistory.length

    // Tasks this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const thisWeekTasks = usageHistory.filter(usage => 
      new Date(usage.timestamp) > weekAgo
    ).length

    // Most used agent
    const agentCounts = usageHistory.reduce((acc, usage) => {
      acc[usage.agentName] = (acc[usage.agentName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteAgent = Object.entries(agentCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null

    return {
      totalSpent,
      totalTasks,
      thisWeekTasks,
      favoriteAgent
    }
  }, [user, usageHistory])

  return {
    user,
    usageHistory,
    loading,
    register,
    login,
    logout,
    useCredits,
    addCredits,
    getStats
  }
}