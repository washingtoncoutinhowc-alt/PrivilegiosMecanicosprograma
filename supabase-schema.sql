create table if not exists public.usuarios_autorizados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  perfil text not null check (perfil in ('admin', 'viewer')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  ultimo_acesso_em timestamptz
);

alter table public.usuarios_autorizados enable row level security;

create policy "usuarios podem ler a propria autorizacao"
on public.usuarios_autorizados
for select
to authenticated
using (lower(email) = lower((auth.jwt() ->> 'email')));

create policy "admins podem ler todos os usuarios"
on public.usuarios_autorizados
for select
to authenticated
using (
  exists (
    select 1
    from public.usuarios_autorizados ua
    where lower(ua.email) = lower((auth.jwt() ->> 'email'))
      and ua.perfil = 'admin'
      and ua.ativo = true
  )
);

create policy "admins podem cadastrar usuarios"
on public.usuarios_autorizados
for insert
to authenticated
with check (
  exists (
    select 1
    from public.usuarios_autorizados ua
    where lower(ua.email) = lower((auth.jwt() ->> 'email'))
      and ua.perfil = 'admin'
      and ua.ativo = true
  )
);

create policy "admins podem alterar usuarios"
on public.usuarios_autorizados
for update
to authenticated
using (
  exists (
    select 1
    from public.usuarios_autorizados ua
    where lower(ua.email) = lower((auth.jwt() ->> 'email'))
      and ua.perfil = 'admin'
      and ua.ativo = true
  )
);

create policy "admins podem remover usuarios"
on public.usuarios_autorizados
for delete
to authenticated
using (
  exists (
    select 1
    from public.usuarios_autorizados ua
    where lower(ua.email) = lower((auth.jwt() ->> 'email'))
      and ua.perfil = 'admin'
      and ua.ativo = true
  )
);

-- Depois de criar a tabela, cadastre seu e-mail como primeiro administrador:
-- insert into public.usuarios_autorizados (nome, email, perfil)
-- values ('Seu nome', 'seu-email@gmail.com', 'admin');
