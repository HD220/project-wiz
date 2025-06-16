CREATE TABLE `jobs` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `payload` text NOT NULL,
  `data` text NOT NULL,
  `result` text,
  `max_attempts` integer NOT NULL,
  `attempts` integer NOT NULL,
  `max_retry_delay` integer NOT NULL,
  `retry_delay` integer NOT NULL,
  `delay` integer NOT NULL,
  `priority` integer NOT NULL,
  `status` text NOT NULL CHECK (`status` IN ('pending', 'waiting', 'delayed', 'finished', 'executing', 'failed')),
  `depends_on` text
);