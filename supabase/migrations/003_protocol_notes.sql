-- Protocol notes: personal notes users can add to any protocol
create table if not exists protocol_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  protocol_id uuid not null references protocols(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, protocol_id)
);

-- RLS: users can only access their own notes
alter table protocol_notes enable row level security;

create policy "Users can read own notes"
  on protocol_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on protocol_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on protocol_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on protocol_notes for delete
  using (auth.uid() = user_id);
