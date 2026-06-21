# Notificacoes automaticas

Este guia ativa o botao `Enviar por e-mail` da aba `Notificacoes`.

## 1. Criar a chave no Resend

1. Acesse o Resend.
2. Crie uma API Key.
3. Guarde a chave que comeca com `re_`.

Para teste, pode usar o remetente:

```text
Sistema de Privilegios <onboarding@resend.dev>
```

Depois, quando tiver dominio proprio verificado no Resend, troque para um e-mail da congregacao.

## 2. Rodar o SQL no Supabase

No Supabase, abra `SQL Editor` e rode o arquivo:

```text
app/supabase-schema.sql
```

Ele cria:

- usuarios autorizados;
- historico dos envios automaticos.

## 3. Publicar a funcao no Supabase

Publique esta pasta como Edge Function:

```text
supabase/functions/send-notifications
```

Nome da funcao:

```text
send-notifications
```

## 4. Configurar os secrets da funcao

No Supabase, configure estes secrets:

```text
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
NOTIFICATION_FROM=Sistema de Privilegios <onboarding@resend.dev>
```

O Supabase ja fornece automaticamente:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

## 5. Testar no sistema

1. Entre no sistema com Google usando um usuario `admin`.
2. Va em `Irmaos` e confirme que os irmaos tem e-mail cadastrado.
3. Va em `Notificacoes`.
4. Escolha o mes.
5. Clique em `Gerar avisos do mes`.
6. Clique em `Enviar por e-mail`.
7. Confirme o envio.

Resultado esperado:

```text
Envio concluido: X enviado(s), 0 com erro.
```

## Observacoes

- O envio automatico so funciona para usuario administrador.
- Irmaos sem e-mail cadastrado nao recebem aviso.
- Se algum e-mail falhar, o sistema mostra a lista de erros.
- Cada envio fica registrado na tabela `envios_notificacoes`.
