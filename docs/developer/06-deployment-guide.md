# Guia de Deploy em Produção - Project Wiz

## 1. Requisitos de Infraestrutura

### 1.1 Hardware Mínimo
- **Servidor**: 
  - CPU: 4 núcleos
  - Memória: 8GB RAM
  - Disco: 50GB SSD

### 1.2 Dependências
- Node.js: v18+
- SQLite: v3.35+
- Electron: v25+

## 2. Configuração de Ambiente

### 2.1 Variáveis de Ambiente
```ini
# .env.production
NODE_ENV=production
ELECTRON_ENV=production
API_BASE_URL=https://api.projectwiz.com
DATABASE_URL=file:/var/lib/projectwiz/database.sqlite
```

### 2.2 Configurações Específicas
- **Limites de Recursos**:
  - Máximo de jobs concorrentes: 10
  - Tamanho máximo de payload: 5MB

## 3. Procedimento de Deploy

### 3.1 Checklist Pré-Deploy
- [ ] Executar testes de integração
- [ ] Validar migrações de banco de dados
- [ ] Verificar configurações de ambiente
- [ ] Confirmar backup do banco atual

### 3.2 Passo a Passo
1. Build da aplicação:
   ```bash
   npm run build:production
   ```

2. Executar migrações:
   ```bash
   npm run migrate:production
   ```

3. Iniciar serviço:
   ```bash
   npm start
   ```

## 4. Verificação Pós-Deploy
- Monitorar logs iniciais
- Validar endpoints críticos
- Verificar processamento de jobs