-- Criação da tabela para armazenar a memória dos agentes
CREATE TABLE IF NOT EXISTS agent_memory (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  metadata TEXT NOT NULL,
  tags TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  embedding TEXT NOT NULL
);

-- Índice para buscas por timestamp
CREATE INDEX IF NOT EXISTS idx_agent_memory_timestamp ON agent_memory(timestamp);

-- Índice para buscas por tags (usando JSON1)
CREATE INDEX IF NOT EXISTS idx_agent_memory_tags ON agent_memory(tags);