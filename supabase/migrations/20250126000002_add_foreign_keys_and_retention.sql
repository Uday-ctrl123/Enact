-- Add foreign key constraints and data retention policies
-- Migration: 20250126000002_add_foreign_keys_and_retention

-- Add ON DELETE CASCADE to messages table if not already present
-- This ensures messages are deleted when conversation is deleted
DO $$ 
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_conversation_id_fkey'
  ) THEN
    ALTER TABLE messages DROP CONSTRAINT messages_conversation_id_fkey;
  END IF;
  
  -- Add foreign key with CASCADE
  ALTER TABLE messages 
  ADD CONSTRAINT messages_conversation_id_fkey 
  FOREIGN KEY (conversation_id) 
  REFERENCES conversations(id) 
  ON DELETE CASCADE;
END $$;

-- Add soft delete column to conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add soft delete column to messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index on deleted_at for efficient filtering
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at 
ON conversations(deleted_at) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_deleted_at 
ON messages(deleted_at) 
WHERE deleted_at IS NULL;

-- Function to soft delete a conversation and its messages
CREATE OR REPLACE FUNCTION soft_delete_conversation(conversation_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE conversations 
  SET deleted_at = NOW() 
  WHERE id = conversation_uuid AND deleted_at IS NULL;
  
  UPDATE messages 
  SET deleted_at = NOW() 
  WHERE conversation_id = conversation_uuid AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete old soft-deleted records (90 days)
CREATE OR REPLACE FUNCTION cleanup_old_deleted_records()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete messages older than 90 days
  WITH deleted AS (
    DELETE FROM messages 
    WHERE deleted_at < NOW() - INTERVAL '90 days'
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  -- Delete conversations older than 90 days
  DELETE FROM conversations 
  WHERE deleted_at < NOW() - INTERVAL '90 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive old conversations (older than 1 year)
CREATE TABLE IF NOT EXISTS archived_conversations (
  LIKE conversations INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS archived_messages (
  LIKE messages INCLUDING ALL
);

CREATE OR REPLACE FUNCTION archive_old_conversations()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive conversations older than 1 year
  WITH archived AS (
    INSERT INTO archived_conversations
    SELECT * FROM conversations
    WHERE created_at < NOW() - INTERVAL '1 year'
    AND deleted_at IS NULL
    RETURNING *
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Archive associated messages
  INSERT INTO archived_messages
  SELECT m.* FROM messages m
  INNER JOIN archived_conversations ac ON m.conversation_id = ac.id;
  
  -- Soft delete archived conversations
  UPDATE conversations
  SET deleted_at = NOW()
  WHERE created_at < NOW() - INTERVAL '1 year'
  AND deleted_at IS NULL;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION soft_delete_conversation IS 'Soft deletes a conversation and all its messages';
COMMENT ON FUNCTION cleanup_old_deleted_records IS 'Permanently deletes records soft-deleted more than 90 days ago';
COMMENT ON FUNCTION archive_old_conversations IS 'Archives conversations older than 1 year';
