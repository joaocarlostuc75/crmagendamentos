-- Execute este script no SQL Editor do Supabase para corrigir todas as tabelas e criar o Bucket de imagens

-- 1. Criação do Bucket de Imagens
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de segurança para o Bucket
CREATE POLICY "Imagens públicas" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Usuários podem atualizar suas imagens" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Usuários podem deletar suas imagens" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 2. Atualização da tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS extra_settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Atualização da tabela collaborators
CREATE TABLE IF NOT EXISTS public.collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialty TEXT,
    commission DECIMAL(5,2) DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.collaborators ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.collaborators ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.collaborators ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.collaborators ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.collaborators ADD COLUMN IF NOT EXISTS commission DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.collaborators ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Atualização da tabela services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 5. Atualização da tabela products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. Políticas de RLS para as tabelas
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas de SELECT (Públicas)
CREATE POLICY "Colaboradores visíveis publicamente" ON public.collaborators FOR SELECT USING (true);
CREATE POLICY "Serviços visíveis publicamente" ON public.services FOR SELECT USING (true);
CREATE POLICY "Produtos visíveis publicamente" ON public.products FOR SELECT USING (true);

-- Políticas de ALL (Apenas dono)
CREATE POLICY "Dono gerencia colaboradores" ON public.collaborators FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Dono gerencia serviços" ON public.services FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Dono gerencia produtos" ON public.products FOR ALL USING (auth.uid() = user_id);

-- 7. Criação da tabela orders (Pedidos)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_method TEXT NOT NULL,
    delivery_address TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dono gerencia pedidos" ON public.orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Qualquer um pode criar pedidos" ON public.orders FOR INSERT WITH CHECK (true);

-- 8. Adicionar coluna additional_items na tabela appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS additional_items JSONB DEFAULT '[]'::jsonb;

