# Casos de Uso - [NOME_DA_FEATURE]

**Data de Criação:** [DATA]  
**Última Atualização:** [DATA]  
**Relacionado aos Requisitos:** [Link para requirements.md]

---

## Visão Geral dos Casos de Uso

### Atores Principais

- **[ATOR_1]:** [Descrição do papel/responsabilidade]
- **[ATOR_2]:** [Descrição do papel/responsabilidade]
- **Agentes IA:** [Como os agentes participam dos casos de uso]
- **Sistema:** [Como o sistema e infraestrutura participam]

### Resumo dos Casos de Uso

| ID    | Nome do Caso de Uso     | Ator Principal | Complexidade       |
| ----- | ----------------------- | -------------- | ------------------ |
| UC001 | [Nome do caso de uso 1] | [Ator]         | [Alta/Média/Baixa] |
| UC002 | [Nome do caso de uso 2] | [Ator]         | [Alta/Média/Baixa] |
| UC003 | [Nome do caso de uso 3] | [Ator]         | [Alta/Média/Baixa] |

---

## UC001 - [NOME_DO_CASO_DE_USO]

### Informações Gerais

**Ator Principal:** [Nome do ator]  
**Atores Secundários:** [Outros atores envolvidos]  
**Objetivo:** [O que o ator quer alcançar]  
**Pré-condições:** [O que deve estar verdadeiro antes do caso de uso começar]  
**Pós-condições:** [O que deve estar verdadeiro após o caso de uso terminar]

### Fluxo Principal

1. [Ação do ator ou sistema - passo 1]
2. [Ação do ator ou sistema - passo 2]
3. [Ação do ator ou sistema - passo 3]
4. [Ação do ator ou sistema - passo 4]
5. [Resultado final]

### Fluxos Alternativos

#### FA001 - [Nome do fluxo alternativo]

**Condição:** [Quando este fluxo ocorre]  
**Passos:**

1. [Passo alternativo 1]
2. [Passo alternativo 2]
3. [Retorna ao fluxo principal no passo X]

#### FA002 - [Nome do fluxo alternativo]

**Condição:** [Quando este fluxo ocorre]  
**Passos:**

1. [Passo alternativo 1]
2. [Passo alternativo 2]

### Fluxos de Exceção

#### FE001 - [Nome da exceção]

**Condição:** [Quando esta exceção ocorre]  
**Tratamento:**

1. [Como o sistema trata a exceção]
2. [Ações de recuperação]
3. [Resultado final]

### Regras de Negócio Aplicadas

- **RN001:** [Referência à regra do requirements.md]
- **RN002:** [Referência à regra do requirements.md]

### Domínios Afetados

- **[DOMINIO_1]:** [projects/agents/users/llm - como é afetado]
- **[DOMINIO_2]:** [projects/agents/users/llm - como é afetado]

### Object Calisthenics Aplicados

- **Entidades Ricas:** [Quais entidades terão comportamentos específicos]
- **Value Objects:** [Quais primitivos serão encapsulados]
- **Functions vs Services:** [Quais operações serão implementadas como funções simples]

### Requisitos Relacionados

- **RF001:** [Referência ao requisito funcional]
- **RF002:** [Referência ao requisito funcional]

---

## UC002 - [NOME_DO_SEGUNDO_CASO_DE_USO]

[Repetir a estrutura acima para cada caso de uso]

---

## Diagramas de Casos de Uso

### Diagrama Geral

```
[Inserir diagrama ou descrição textual das relações entre casos de uso]

Exemplo textual:
- Usuario -> UC001: Criar Novo Item
- Usuario -> UC002: Editar Item Existente
- Sistema -> UC003: Validar Dados
```

### Relações Entre Casos de Uso

#### Dependências

- **UC001** depende de **UC003** (validação é sempre necessária)
- **UC002** inclui **UC003** (reutiliza validação)

#### Extensões

- **UC001** pode estender para **UC004** (caso específico)
- **UC002** pode estender para **UC005** (caso específico)

---

## Cenários de Teste

### CT001 - Cenário de Sucesso para UC001

**Dados de Entrada:**

- [Campo 1: valor válido]
- [Campo 2: valor válido]

**Passos:**

1. [Passo do teste 1]
2. [Passo do teste 2]
3. [Passo do teste 3]

**Resultado Esperado:** [O que deve acontecer]

### CT002 - Cenário de Exceção para UC001

**Dados de Entrada:**

- [Campo 1: valor inválido]
- [Campo 2: valor válido]

**Passos:**

1. [Passo do teste 1]
2. [Passo do teste 2]

**Resultado Esperado:** [Como a exceção deve ser tratada]

---

## Protótipos e Mockups

### Telas Relacionadas

- **Tela 1:** [Descrição da interface para UC001]
- **Tela 2:** [Descrição da interface para UC002]

### Fluxos de Navegação

```
Tela Inicial -> [Ação] -> Tela UC001 -> [Sucesso] -> Tela Confirmação
                       -> [Erro] -> Tela Erro
```

---

## Observações e Considerações

### Pontos de Atenção

- [Aspectos importantes na implementação]
- [Cuidados especiais com UX]
- [Considerações de performance]
- **Object Calisthenics:** [Métodos ≤10 linhas, máximo 1 nível indentação]
- **Value Objects:** [Todos os primitivos devem ser encapsulados]
- **Infraestrutura Transparente:** [Usar getDatabase(), getLogger(), publishEvent()]

### Casos Especiais

- [Situações excepcionais não cobertas nos fluxos principais]
- [Comportamentos específicos do sistema]

### Melhorias Futuras

- [Funcionalidades que poderiam ser adicionadas]
- [Otimizações possíveis]
