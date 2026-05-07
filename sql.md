# Bolos
```
CREATE TABLE bolos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle TEXT, plate TEXT, owner TEXT,
  suspect TEXT, reason TEXT,
  priority TEXT DEFAULT 'high',
  resolved BOOLEAN DEFAULT false,
  ts TEXT, added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bolos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON bolos FOR ALL USING (true);
```

# Bolo_logs
```
CREATE TABLE bolo_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  bolo_summary TEXT,
  officer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bolo_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON bolo_logs FOR ALL USING (true);
```

# Debt_code
```
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_read" ON config FOR SELECT USING (true);

INSERT INTO config (key, value) VALUES ('dept_code', 'hg2gxJnQequc$DFqJ4&6');
```

# Auth_logs
```
CREATE TABLE auth_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  callsign TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON auth_logs FOR ALL USING (true);
```

# Quotes
```
create table quotes (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  said_by text not null,
  context text,
  submitted_by text not null,
  submitted_uid text not null,
  upvotes int default 0,
  created_at timestamptz default now()
);
```