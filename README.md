Instituição: SANEM – Sociedade de Amparo ao Necessitado Medianeirense
Time 2: Inimigos da PhP
Integrantes 
Radames Giona 
Gilvan Emerson Sfredo Junior 
Lucas Fernando Begnini 
Rocque dos Reis Pennafort 

Este projeto tem como objetivo desenvolver um sistema web para gerenciamento de doações em instituições sociais.
A plataforma permite cadastrar doações, beneficiários e controlar o estoque em tempo real, além de oferecer ferramentas para distribuição organizada, emissão de relatórios e acompanhamento histórico.

Para rodar o projeto:

BackEnd:

### 1. Acesse a pasta do backend
```bash
cd backend/
```

Após isso, crie o arquivo .env, insira os pares chave-valor:
```text
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME= # Por exemplo: postgres
DB_PASSWORD= # Por exemplo: postgres
DB_DATABASE=# Por exemplo: solidarios_db

# JWT
JWT_SECRET= # Por exemplo: seu_segredo_jwt_aqui
JWT_EXPIRATION_TIME= #Por exemplo: 15m
REFRESH_TOKEN_EXPIRATION_DAYS= #Por exemplo: 7

# App
PORT=3000
```

Agora você pode inserir o seguinte comando para subir o container do banco de dados (com as migrations efetuadas) juntamente com o back-end:
```bash
docker compose up -d --build
```

Após isso, você pode ir direto para a pasta do Front-end

```bash
cd ../frontend

```
```bash
http://localhost:8082

```

Na pasta frontend, você pode executar usando:
```bash
npm start
```

**Obs:** Caso não tenha emulador android, você poderá rodar web passando a flag 'w' quando requisitada

