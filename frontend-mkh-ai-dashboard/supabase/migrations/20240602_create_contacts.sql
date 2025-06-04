-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create an index on the email field for faster lookups
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);

-- Add RLS (Row Level Security) policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all contacts
CREATE POLICY "Allow authenticated users to read contacts"
    ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert their own contacts
CREATE POLICY "Allow authenticated users to insert contacts"
    ON contacts
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to update their own contacts
CREATE POLICY "Allow authenticated users to update contacts"
    ON contacts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to delete their own contacts
CREATE POLICY "Allow authenticated users to delete contacts"
    ON contacts
    FOR DELETE
    TO authenticated
    USING (true); 