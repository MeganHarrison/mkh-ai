-- Create content_ideas table
CREATE TABLE IF NOT EXISTS content_ideas (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content_type TEXT,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'Idea',
    author_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read" ON content_ideas FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON content_ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON content_ideas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete" ON content_ideas FOR DELETE USING (true);
