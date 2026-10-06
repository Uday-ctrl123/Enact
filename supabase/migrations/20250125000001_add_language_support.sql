-- Add language support to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en'
CHECK (preferred_language IN ('en', 'te', 'ta', 'hi', 'ml'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(preferred_language);

-- Add language column to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'en'
CHECK (language IN ('en', 'te', 'ta', 'hi', 'ml'));

-- Add index for language-based queries
CREATE INDEX IF NOT EXISTS idx_messages_language ON messages(language);

-- Add comment for documentation
COMMENT ON COLUMN profiles.preferred_language IS 'User preferred language: en (English), te (Telugu), ta (Tamil), hi (Hindi), ml (Malayalam)';
COMMENT ON COLUMN messages.language IS 'Language of the message content';
