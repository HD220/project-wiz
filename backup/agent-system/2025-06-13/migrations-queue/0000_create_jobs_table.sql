CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  payload TEXT NOT NULL,
  data TEXT,
  result TEXT,
  status TEXT NOT NULL,
  depends_on TEXT NOT NULL,
  max_attempts INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  priority INTEGER NOT NULL,
  delay INTEGER NOT NULL,
  max_retry_delay INTEGER NOT NULL,
  retry_delay INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);