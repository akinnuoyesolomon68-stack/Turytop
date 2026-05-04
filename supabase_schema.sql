-- Supabase SQL Schema for Triumph Trinity Secondary School

-- 1. Students Table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Admissions Table
CREATE TABLE public.admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    dob TEXT,
    parent_contact TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'reviewed')),
    class_seeking TEXT,
    test_score INTEGER,
    registered BOOLEAN DEFAULT FALSE,
    student_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Results Table
CREATE TABLE public.results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    term TEXT NOT NULL,
    subjects JSONB NOT NULL, -- Array of {name, score, grade}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_ref TEXT UNIQUE NOT NULL,
    purpose TEXT DEFAULT 'School Fees',
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Public read for results/admissions lookup)
CREATE POLICY "Public results lookup" ON public.results FOR SELECT USING (true);
CREATE POLICY "Public admission status lookup" ON public.admissions FOR SELECT USING (true);

-- Admin Policies (Full access for authenticated admins)
-- Note: You'll need to define how you identify admins (e.g., specific email domain or metadata)
CREATE POLICY "Admin full access students" ON public.students ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access admissions" ON public.admissions ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access results" ON public.results ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access payments" ON public.payments ALL USING (auth.role() = 'authenticated');
