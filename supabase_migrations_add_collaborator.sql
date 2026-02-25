-- Add collaborator_id to appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS collaborator_id UUID REFERENCES public.collaborators(id);
