-- Add support for message editing
-- Migration: 20250126000003_add_message_edit_support

-- Add edited column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE;

-- Add updated_at column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add comment for documentation
COMMENT ON COLUMN messages.edited IS 'Indicates if the message has been edited';
COMMENT ON COLUMN messages.updated_at IS 'Timestamp of last update';

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_messages_updated_at 
ON messages(updated_at DESC);
