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
