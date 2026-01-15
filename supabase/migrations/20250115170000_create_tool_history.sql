-- AI Suite Tools Infrastructure Migration
-- This adds token tracking and tool usage history

-- Create user_tokens table for token balance tracking
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  token_balance INTEGER DEFAULT 1000,
  total_tokens_used INTEGER DEFAULT 0,
  total_generations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT user_tokens_pkey PRIMARY KEY (id)
);

-- Create ai_tool_history table for tracking all generations
CREATE TABLE IF NOT EXISTS public.ai_tool_history (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tool_id UUID REFERENCES ai_tools(id),
  tool_name TEXT NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB,
  tokens_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success', -- 'success', 'failed', 'pending'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ai_tool_history_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tool_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.user_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.user_tokens;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.user_tokens;
DROP POLICY IF EXISTS "Users can view their own history" ON public.ai_tool_history;
DROP POLICY IF EXISTS "System can insert history" ON public.ai_tool_history;

-- RLS Policies for user_tokens
CREATE POLICY "Users can view their own tokens"
ON public.user_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
ON public.user_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
ON public.user_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_tool_history
CREATE POLICY "Users can view their own history"
ON public.ai_tool_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert history"
ON public.ai_tool_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_tokens_user_id_idx ON public.user_tokens(user_id);
CREATE INDEX IF NOT EXISTS ai_tool_history_user_id_idx ON public.ai_tool_history(user_id);
CREATE INDEX IF NOT EXISTS ai_tool_history_tool_id_idx ON public.ai_tool_history(tool_id);
CREATE INDEX IF NOT EXISTS ai_tool_history_created_at_idx ON public.ai_tool_history(created_at DESC);

-- Function to initialize user tokens
CREATE OR REPLACE FUNCTION initialize_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, token_balance)
  VALUES (NEW.id, 1000)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create tokens for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION initialize_user_tokens();

-- Function to deduct tokens
CREATE OR REPLACE FUNCTION deduct_tokens(p_user_id UUID, p_tokens INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT token_balance INTO current_balance
  FROM public.user_tokens
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if enough tokens
  IF current_balance IS NULL OR current_balance < p_tokens THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct tokens
  UPDATE public.user_tokens
  SET 
    token_balance = token_balance - p_tokens,
    total_tokens_used = total_tokens_used + p_tokens,
    total_generations = total_generations + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger for user_tokens
DROP TRIGGER IF EXISTS update_user_tokens_updated_at ON public.user_tokens;
CREATE TRIGGER update_user_tokens_updated_at
BEFORE UPDATE ON public.user_tokens
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
