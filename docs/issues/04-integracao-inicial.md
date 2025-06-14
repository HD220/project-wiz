## [Integração] Conexão inicial entre Queue e Worker
**Responsável:** @dev-backend  
**Prioridade:** Alta  
**Estimativa:** 2 dias  

### Descrição  
Implementar a integração básica entre Queue e Worker para processamento de jobs  

### Critérios de Aceitação  
- [ ] Worker consegue consumir jobs da Queue  
- [ ] Fluxo básico de enqueue -> process -> complete  
- [ ] Tratamento inicial de erros na integração  
- [ ] Testes de integração básicos  

### Dependências  
- Issue #01 (Queue básica)  
- Issue #02 (Worker básico)  
- Issue #03 (Job value object)