# Publicacao na rede

## Caminho recomendado

Use Firebase para:

- Hosting: publicar o sistema.
- Authentication: login com Google.
- Firestore: guardar programacao, usuarios, datas e cadastros para todos verem a mesma informacao.

## Passos

1. Criar um projeto no Firebase.
2. Ativar Authentication com provedor Google.
3. Criar um app Web no Firebase.
4. Copiar as chaves do app Web para `firebase-config.js`.
5. Copiar `.firebaserc.example` para `.firebaserc` e trocar o ID do projeto.
6. Publicar com Firebase Hosting.

## Observacao importante

Na versao atual, os dados ainda ficam no navegador local. Para uso real com varios usuarios, o proximo ajuste deve ser ligar o sistema no Firestore.
