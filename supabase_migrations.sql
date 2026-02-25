-- Execute este script no SQL Editor do Supabase para criar as colunas ausentes

-- Adiciona a coluna extra_settings na tabela profiles (para armazenar CEP, intervalos, descrições, etc)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS extra_settings JSONB DEFAULT '{}'::jsonb;

-- Certifique-se de que a tabela products existe
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de segurança para products (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos são visíveis publicamente" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem gerenciar seus próprios produtos" 
ON public.products FOR ALL 
USING (auth.uid() = user_id);
