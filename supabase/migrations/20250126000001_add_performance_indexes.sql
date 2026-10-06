-- Add performance indexes for better query performance
-- Migration: 20250126000001_add_performance_indexes

-- Index on conversations.user_id for faster user conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
ON conversations(user_id);

-- Index on conversations.created_at for sorting
CREATE INDEX IF NOT EXISTS idx_conversations_created_at 
ON conversations(created_at DESC);

-- Index on messages.conversation_id for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- Composite index on messages for conversation + timestamp queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Index on messages.language for language-specific queries
CREATE INDEX IF NOT EXISTS idx_messages_language 
ON messages(language);

-- Index on messages.role for filtering by user/assistant
CREATE INDEX IF NOT EXISTS idx_messages_role 
ON messages(role);

-- Add comments for documentation
COMMENT ON INDEX idx_conversations_user_id IS 'Improves user conversation lookup performance';
COMMENT ON INDEX idx_messages_conversation_id IS 'Improves message retrieval by conversation';
COMMENT ON INDEX idx_messages_conversation_created IS 'Optimizes conversation message history queries';
COMMENT ON INDEX idx_messages_language IS 'Enables efficient language-based filtering';
