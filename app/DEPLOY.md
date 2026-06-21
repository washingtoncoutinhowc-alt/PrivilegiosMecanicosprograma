# Publicacao na rede

## Caminho recomendado

Use Supabase, GitHub e Vercel para:

- Vercel: publicar o sistema.
- Supabase Authentication: login com Google.
- Supabase Database: guardar programacao, usuarios, datas e cadastros para todos verem a mesma informacao.

## Passos

1. Criar ou usar o projeto no Supabase.
2. Ativar Authentication com provedor Google.
3. Copiar `Project URL` e `anon public key` para `supabase-config.js`.
4. Rodar o SQL de `supabase-schema.sql` no Supabase SQL Editor.
5. Criar o projeto na Vercel usando o repositorio do GitHub.
6. Publicar com Output Directory `app`.

## Observacao importante

Na versao atual, o login Google ja esta apontado para Supabase. O proximo ajuste e migrar cadastros, escalas e historico do navegador local para tabelas do Supabase.

## Notificacoes automaticas por e-mail

A funcao `send-notifications` envia os avisos pelo Resend. Para ativar:

1. Crie uma conta no Resend.
2. Copie a API Key do Resend.
3. No Supabase, va em Edge Functions e publique a pasta `supabase/functions/send-notifications`.
4. Configure os secrets da funcao:
   - `RESEND_API_KEY`: chave do Resend.
   - `NOTIFICATION_FROM`: remetente aprovado no Resend. Exemplo: `Sistema de Privilegios <avisos@seudominio.com>`.
   - `SUPABASE_SERVICE_ROLE_KEY`: chave service role do projeto Supabase.
5. Entre no sistema com uma conta Google cadastrada como `admin`.
6. Va em `Notificacoes`, escolha o mes e clique em `Enviar por e-mail`.

Enquanto o dominio do remetente nao estiver verificado no Resend, use o remetente de teste permitido pelo Resend.

O passo a passo completo esta em `NOTIFICACOES-AUTOMATICAS.md`.
