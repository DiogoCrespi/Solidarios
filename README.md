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
cd ./frontend

```
```bash
http://localhost:8082

```

Na pasta frontend, você pode executar usando:
```bash
npm start
```

**Obs:** Caso não tenha emulador android, você poderá rodar web passando a flag 'w' quando requisitada

---

## Usuários de Teste

### Administrador
Para criar um usuário administrador, use um dos seguintes comandos:

**Via endpoint `/users` (requer autenticação):**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@sanem.com",
    "password": "admin123",
    "role": "ADMIN",
    "phone": "(11) 99999-9999",
    "address": "Rua da Administração, 123"
  }'
```
**Windows:**
```bash
$body = @{
    name = "Administrador3"
    email = "admin3@sanem.com"
    password = "admin123"
    role = "ADMIN"
    phone = "(11) 99999-9999"
    address = "Rua da Administração, 123"
} | ConvertTo-Json; $response = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $body -ContentType "application/json"; $response | ConvertTo-Json -Depth 3

```
**Via endpoint `/auth/register` (público):**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@sanem.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

**PowerShell (Windows):**
```powershell
$body = @{name='Administrador';email='admin@sanem.com';password='admin123';role='ADMIN'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/auth/register' -Method POST -Body $body -ContentType 'application/json'
```

**Login:**
- **Email:** `admin@sanem.com`
- **Senha:** `admin123`

### Doador Anônimo
Para criar um doador anônimo (usado para doações sem identificação), use:

**Via endpoint `/auth/register`:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Doador Anônimo",
    "email": "anonimo@solidarios.com",
    "password": "anonimo123",
    "role": "DOADOR"
  }'
```

**PowerShell (Windows):**
```powershell
$body = @{name='Doador Anônimo';email='anonimo@solidarios.com';password='anonimo123';role='DOADOR'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/auth/register' -Method POST -Body $body -ContentType 'application/json'
```

**Uso:**
- Este usuário é usado automaticamente quando você seleciona "Anônimo" no campo "Doador" ao cadastrar um item.
- Não é necessário fazer login com este usuário.

---

