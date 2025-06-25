-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    credits INTEGER DEFAULT 1000 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table
CREATE TABLE public.agents (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    cost INTEGER NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    initials TEXT NOT NULL,
    gradient TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_history table
CREATE TABLE public.usage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    agent_id INTEGER REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
    agent_name TEXT NOT NULL,
    cost INTEGER NOT NULL,
    result TEXT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('completed', 'processing', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE public.credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund')),
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_usage_history_user_id ON public.usage_history(user_id);
CREATE INDEX idx_usage_history_created_at ON public.usage_history(created_at);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_agents_category ON public.agents(category);
CREATE INDEX idx_agents_is_active ON public.agents(is_active);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for agents table (public read, admin write)
CREATE POLICY "Anyone can view active agents" ON public.agents
    FOR SELECT USING (is_active = true);

-- RLS Policies for usage_history table
CREATE POLICY "Users can view own usage history" ON public.usage_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage history" ON public.usage_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for credit_transactions table
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit transactions" ON public.credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample agents data
INSERT INTO public.agents (name, description, category, cost, rating, reviews, initials, gradient) VALUES
('Smart Customer Support Agent', 'Automates customer inquiries with intelligent responses, reducing response time by 80% while maintaining high satisfaction rates.', 'customer-service', 25, 4.9, 2300, 'CS', 'from-blue-500 to-purple-600'),
('Data Analysis Agent', 'Processes complex datasets and generates actionable insights with automated reporting and visualization capabilities.', 'analytics', 45, 4.8, 1800, 'DA', 'from-green-500 to-emerald-600'),
('Content Writing Agent', 'Creates high-quality, engaging content across multiple formats while maintaining brand voice and SEO optimization.', 'content', 35, 4.7, 3100, 'CW', 'from-orange-500 to-red-600'),
('Email Automation Agent', 'Manages email campaigns with personalized content, smart scheduling, and performance tracking for maximum engagement.', 'email', 30, 4.9, 2700, 'EA', 'from-purple-500 to-pink-600'),
('Sales Assistant Agent', 'Qualifies leads, schedules meetings, and provides sales insights to accelerate your sales pipeline and close deals faster.', 'sales', 40, 4.6, 1900, 'SA', 'from-indigo-500 to-blue-600'),
('Task Automation Agent', 'Streamlines repetitive workflows across multiple platforms, saving hours of manual work with intelligent automation.', 'utilities', 20, 4.8, 4200, 'TA', 'from-teal-500 to-cyan-600');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 