-- Create AI Models table
CREATE TABLE public.ai_models (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'deepseek', 'custom'
  model_name TEXT NOT NULL, -- e.g., 'gpt-4', 'claude-3-opus', 'gemini-pro'
  display_name TEXT NOT NULL, -- User-friendly name
  description TEXT,
  api_endpoint TEXT, -- Base API endpoint URL
  model_id TEXT NOT NULL, -- The actual model identifier used in API calls
  
  -- Model capabilities
  supports_streaming BOOLEAN DEFAULT true,
  supports_functions BOOLEAN DEFAULT false,
  supports_vision BOOLEAN DEFAULT false,
  
  -- Default parameters
  default_temperature DECIMAL(3,2) DEFAULT 0.7,
  default_max_tokens INTEGER DEFAULT 2000,
  default_top_p DECIMAL(3,2) DEFAULT 1.0,
  
  -- Pricing (for display purposes)
  price_per_1k_input DECIMAL(10,6),
  price_per_1k_output DECIMAL(10,6),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_tested_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT, -- 'connected', 'failed', 'not_tested'
  
  CONSTRAINT ai_models_pkey PRIMARY KEY (id),
  CONSTRAINT ai_models_provider_model_unique UNIQUE (provider, model_name)
);

-- Create AI Model API Keys table (for secure storage)
CREATE TABLE public.ai_model_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE, -- One key per provider
  encrypted_api_key TEXT NOT NULL, -- Encrypted API key
  encryption_iv TEXT NOT NULL, -- Initialization vector for decryption
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT ai_model_api_keys_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_models
-- Allow public read access to active models (for workspace)
CREATE POLICY "Allow public read access to active ai models"
ON public.ai_models
FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated admins full access
CREATE POLICY "Allow full access to authenticated users for ai models"
ON public.ai_models
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for ai_model_api_keys
-- Only authenticated users (admins) can access API keys
CREATE POLICY "Allow authenticated users to read api keys"
ON public.ai_model_api_keys
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert api keys"
ON public.ai_model_api_keys
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update api keys"
ON public.ai_model_api_keys
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete api keys"
ON public.ai_model_api_keys
FOR DELETE
TO authenticated
USING (true);

-- Indexes for faster queries
CREATE INDEX ai_models_provider_idx ON public.ai_models(provider);
CREATE INDEX ai_models_is_active_idx ON public.ai_models(is_active);
CREATE INDEX ai_models_display_order_idx ON public.ai_models(display_order);

-- Seed some default AI models (without API keys - those will be added via admin panel)
INSERT INTO public.ai_models (
  provider, model_name, display_name, description, api_endpoint, model_id,
  supports_streaming, supports_functions, supports_vision,
  default_temperature, default_max_tokens, default_top_p,
  price_per_1k_input, price_per_1k_output, currency,
  is_active, display_order, connection_status
) VALUES
  -- OpenAI Models
  (
    'openai', 'gpt-4o', 'GPT-4o', 
    'Most advanced OpenAI model with vision and function calling',
    'https://api.openai.com/v1', 'gpt-4o',
    true, true, true,
    0.7, 4000, 1.0,
    0.0025, 0.01, 'USD',
    false, 1, 'not_tested'
  ),
  (
    'openai', 'gpt-4-turbo', 'GPT-4 Turbo', 
    'Fast and capable GPT-4 model',
    'https://api.openai.com/v1', 'gpt-4-turbo',
    true, true, true,
    0.7, 4000, 1.0,
    0.01, 0.03, 'USD',
    false, 2, 'not_tested'
  ),
  (
    'openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 
    'Fast and efficient model for most tasks',
    'https://api.openai.com/v1', 'gpt-3.5-turbo',
    true, true, false,
    0.7, 2000, 1.0,
    0.0005, 0.0015, 'USD',
    false, 3, 'not_tested'
  ),
  
  -- Anthropic Models
  (
    'anthropic', 'claude-3-opus', 'Claude 3 Opus', 
    'Most capable Claude model for complex tasks',
    'https://api.anthropic.com/v1', 'claude-3-opus-20240229',
    true, true, true,
    0.7, 4000, 1.0,
    0.015, 0.075, 'USD',
    false, 4, 'not_tested'
  ),
  (
    'anthropic', 'claude-3-sonnet', 'Claude 3 Sonnet', 
    'Balanced performance and speed',
    'https://api.anthropic.com/v1', 'claude-3-sonnet-20240229',
    true, true, true,
    0.7, 4000, 1.0,
    0.003, 0.015, 'USD',
    false, 5, 'not_tested'
  ),
  (
    'anthropic', 'claude-3-haiku', 'Claude 3 Haiku', 
    'Fastest Claude model for simple tasks',
    'https://api.anthropic.com/v1', 'claude-3-haiku-20240307',
    true, true, true,
    0.7, 4000, 1.0,
    0.00025, 0.00125, 'USD',
    false, 6, 'not_tested'
  ),
  
  -- Google Models
  (
    'google', 'gemini-2.0-flash', 'Gemini 2.0 Flash', 
    'Latest and fastest Gemini model',
    'https://generativelanguage.googleapis.com/v1beta', 'gemini-2.0-flash-exp',
    true, true, true,
    0.7, 8000, 1.0,
    0.0, 0.0, 'USD',
    true, 7, 'not_tested'
  ),
  (
    'google', 'gemini-pro', 'Gemini Pro', 
    'Versatile Gemini model for various tasks',
    'https://generativelanguage.googleapis.com/v1beta', 'gemini-1.5-pro',
    true, true, true,
    0.7, 8000, 1.0,
    0.00125, 0.005, 'USD',
    false, 8, 'not_tested'
  ),
  
  -- DeepSeek Models
  (
    'deepseek', 'deepseek-chat', 'DeepSeek Chat', 
    'Cost-effective Chinese AI model',
    'https://api.deepseek.com/v1', 'deepseek-chat',
    true, false, false,
    0.7, 4000, 1.0,
    0.00014, 0.00028, 'USD',
    false, 9, 'not_tested'
  ),
  (
    'deepseek', 'deepseek-coder', 'DeepSeek Coder', 
    'Specialized model for code generation',
    'https://api.deepseek.com/v1', 'deepseek-coder',
    true, false, false,
    0.7, 4000, 1.0,
    0.00014, 0.00028, 'USD',
    false, 10, 'not_tested'
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON public.ai_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_model_api_keys_updated_at BEFORE UPDATE ON public.ai_model_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
