# ADR-010: Padrões de Implementação para Entidades e Objetos de Valor (VOs)

**Status:** Proposto (Considerado Aprovado Conforme Instrução)

**Contexto:**
A clareza, consistência e robustez das Entidades de Domínio e Objetos de Valor são fundamentais para a manutenibilidade e a integridade da lógica de negócios no núcleo da aplicação (`core/domain/`). Esta ADR define os padrões para sua implementação.

**Decisão:**

Serão adotados os seguintes padrões para todas as Entidades e Objetos de Valor:

**1. Classes Base:**
    *   **Padrão:** Todas as Entidades devem herdar de `AbstractEntity` (localizada em `core/common/base.entity.ts`). Todos os VOs devem herdar de `AbstractValueObject` (localizada em `core/common/value-objects/base.vo.ts`).
    *   **Justificativa:** Promove DRY ao centralizar lógica comum como manipulação de ID e propriedades base para Entidades, e métodos de igualdade (`equals`) e serialização (`toPersistence()`) básicos para VOs e Entidades.
    *   **Detalhes:** `AbstractEntity` provê a propriedade `id` (do tipo `Identity` ou um VO de ID específico) e um método `equals()` baseado no ID. `AbstractValueObject` provê um método `equals()` baseado na igualdade estrutural de suas `props`.

**2. Instanciação Controlada:**
    *   **Padrão:** Entidades e VOs devem ser instanciados exclusivamente através de um método de fábrica estático público `create()`. Os construtores de classe (`constructor`) devem ser `private`.
    *   **Exemplo (VO):**
        ```typescript
        // UserEmail.vo.ts
        export class UserEmail extends AbstractValueObject<UserEmailProps> {
          private constructor(props: UserEmailProps) { super(props); }
          public static create(email: string): UserEmail {
            // ... lógica de validação e normalização ...
            return new UserEmail({ value: validatedEmail });
          }
          // ... getters ...
        }
        ```
    *   **Exemplo (Entidade):**
        ```typescript
        // User.entity.ts
        export class User extends AbstractEntity<UserId, InternalUserProps> {
          private constructor(props: InternalUserProps) { super(props); }
          public static create(props: UserProps): User {
            // ... lógica de validação das props de entrada ...
            // ... mapeamento para props internas, defaults ...
            return new User(internalProps);
          }
          // ... getters e métodos de negócio ...
        }
        ```
    *   **Justificativa:** Garante que toda a lógica de validação, normalização e inicialização complexa seja executada antes que uma instância do objeto seja criada, assegurando que o objeto sempre exista em um estado válido.

**3. Validação na Criação:**
    *   **Padrão:** A validação dos dados de entrada para Entidades e VOs deve ocorrer dentro do método estático `create()`, antes da instanciação.
    *   **Ferramenta:** Zod é a biblioteca padrão para definir esquemas de validação.
    *   **Localização do Esquema:** Esquemas Zod devem ser co-locados com o arquivo da Entidade/VO ou em um arquivo irmão (ex: `user.schema.ts` para `user.entity.ts`).
    *   **Tratamento de Erro:**
        *   Em caso de falha na validação, o método `create()` deve lançar um erro de domínio específico: `ValueError` para VOs, `EntityError` para Entidades (ambos de `core/domain/common/errors.ts`).
        *   Estes erros devem incluir detalhes da falha, preferencialmente utilizando `error.flatten().fieldErrors` do Zod.
        *   **Exemplo (VO com Zod):**
            ```typescript
            // JobId.vo.ts
            // const JobIdSchema = z.string().uuid(...);
            // public static create(id?: string): JobIdVO {
            //   const jobId = id || randomUUID();
            //   const validationResult = JobIdSchema.safeParse(jobId);
            //   if (!validationResult.success) {
            //     throw new ValueError(`Invalid Job ID format`, {
            //       details: validationResult.error.flatten().fieldErrors,
            //     });
            //   }
            //   return new JobIdVO({ value: validationResult.data });
            // }
            ```
    *   **Autovalidação e Normalização em VOs:** VOs são responsáveis por validar e normalizar seus valores primitivos. Ex: `UserEmail` deve converter o email para minúsculas, remover espaços extras e validar o formato.
    *   **Justificativa:** Garante a integridade dos dados desde a concepção do objeto. Zod oferece uma forma declarativa e type-safe de definir validações.

**4. Imutabilidade:**
    *   **Objetos de Valor (VOs):** Devem ser estritamente imutáveis. Todas as suas propriedades (`props`) devem ser `readonly`. Nenhum método deve permitir a alteração do estado interno após a criação.
        *   **Justificativa:** A imutabilidade garante que VOs possam ser compartilhados e comparados por valor de forma segura, sem efeitos colaterais.
    *   **Entidades:**
        *   **Padrão Preferencial (Imutabilidade Funcional):** Métodos que modificam o estado de uma entidade devem retornar uma *nova instância* da entidade com o estado atualizado. As propriedades internas da entidade devem ser tratadas como `readonly` após a instanciação inicial. O padrão visto em `UserEntity` (e.g., `changeEmail`, `updateProfile`) é o preferido.
            ```typescript
            // User.entity.ts
            // public changeEmail(newEmail: UserEmail): User {
            //   // ... validações ...
            //   const newProps = { ...this.props, email: newEmail, updatedAt: new Date() };
            //   return new User(newProps); // Retorna nova instância
            // }
            ```
        *   **Exceção (Mutação Interna Controlada - Requer Justificativa Forte):** Em casos raros onde a performance é crítica e o estado sendo modificado é puramente interno, encapsulado, e não afeta a identidade ou o contrato público da entidade (e.g., coleções internas de logs, flags de rastreamento de mudanças em `JobEntity` como `_progressChanged`), a mutação interna controlada *pode* ser considerada. No entanto, isso deve ser uma exceção justificada e documentada, e a lógica de mutação deve estar contida em métodos da entidade. A preferência é sempre por retornar novas instâncias.
        *   **Justificativa (Imutabilidade Funcional para Entidades):** Reduz efeitos colaterais, simplifica o rastreamento de mudanças de estado (especialmente em UIs reativas), facilita a depuração e o CQS (Command Query Separation). Embora possa haver um pequeno overhead de criação de objetos, a previsibilidade e segurança geralmente compensam.

**5. Acesso a Propriedades:**
    *   **Objetos de Valor (VOs):** Devem expor seu(s) valor(es) primitivo(s) através de `get` accessors públicos (e.g., `public get value(): string { return this.props.value; }`).
    *   **Entidades:** Devem expor suas propriedades (que são frequentemente outros VOs ou Entidades) através de `get` accessors públicos. Evitar a exposição direta do objeto `props` da entidade.
        *   **Exemplo:**
            ```typescript
            // User.entity.ts
            // public get email(): UserEmail { return this.props.email; }
            // public get nickname(): UserNickname { return this.props.nickname; }
            ```
    *   **Justificativa:** Controla o acesso ao estado interno, reforça o encapsulamento e permite que a representação interna mude sem quebrar o contrato público da classe. Para VOs, garante que o valor seja acessado de forma padronizada.

**6. Igualdade:**
    *   **Objetos de Valor (VOs):** A igualdade é baseada no valor estrutural de suas `props`. O método `equals(other?: SelfType): boolean` herdado de `AbstractValueObject` (que compara `this.props` com `other.props`) geralmente é suficiente.
    *   **Entidades:** A igualdade é baseada em seu Identificador (ID). O método `equals(other?: SelfType): boolean` herdado de `AbstractEntity` (que compara `this.id` com `other.id`) é o padrão.
    *   **Justificativa:** Define corretamente a semântica de igualdade para cada tipo de objeto de domínio.

**7. Métodos de Persistência (Serialização/Desserialização):**
    *   **Padrão:**
        *   Entidades devem implementar um método `toPersistence()` que retorna um objeto simples (Plain Old JavaScript Object - POJO) contendo apenas primitivas, arrays/objetos de primitivas, ou representações serializáveis de VOs (e.g., `email.value` em vez do objeto `UserEmail`). Este POJO é o que será usado pelos mappers da camada de infraestrutura.
        *   Entidades devem ter um método estático `fromPersistenceData(data: PersistenceData): EntityType` (onde `PersistenceData` é uma interface que descreve o POJO) para reconstruir a entidade e seus VOs a partir de dados vindos da camada de persistência. Este método chamará os métodos `create()` dos VOs apropriados.
    *   **Exemplo Conceitual (`UserEntity`):**
        ```typescript
        // interface UserPersistenceData { id: string; email: string; nickname: string; /* ... */ }
        // public toPersistence(): UserPersistenceData {
        //   return {
        //     id: this.props.id.value,
        //     email: this.props.email.value,
        //     nickname: this.props.nickname.value,
        //     // ...
        //   };
        // }
        // public static fromPersistenceData(data: UserPersistenceData): User {
        //   return User.create({
        //     id: UserId.create(data.id),
        //     email: UserEmail.create(data.email),
        //     nickname: UserNickname.create(data.nickname),
        //     // ...
        //   });
        // }
        ```
    *   **Justificativa:** Decoupla a representação do domínio da representação de persistência. Permite que a camada de domínio opere com objetos ricos (VOs), enquanto a camada de persistência lida com dados mais simples e serializáveis. Facilita o mapeamento em repositórios.

**8. Interfaces de Props:**
    *   **Padrão:**
        *   Definir uma interface `[Entity/VO_Name]Props` para os parâmetros do método `create()`.
        *   Se a estrutura interna das propriedades armazenadas na classe (`this.props`) diferir da estrutura de entrada do `create()` (e.g., devido a valores padrão, transformações), definir uma interface `Internal[Entity/VO_Name]Props` para tipar `this.props`.
    *   **Nomenclatura:** Sufixo `Props`. Ex: `UserProps`, `InternalUserProps`, `UserEmailProps`.
    *   **Justificativa:** Clareza e type-safety para os dados de construção e estado interno dos objetos.

**9. VO Genérico `Identity`:**
    *   **Padrão:** Utilizar o VO `Identity` (de `core/common/value-objects/identity.vo.ts`) para representar identificadores genéricos (UUIDs) que servem como chaves estrangeiras ou referências a outras entidades, quando um VO de ID específico para aquela entidade referenciada não é necessário ou prático no contexto atual.
    *   **Exemplo:** `User.defaultLLMProviderConfigId: Identity`.
    *   **Justificativa:** Promove consistência no tratamento de IDs genéricos e reutiliza a lógica de validação de UUID.

**10. Validação de Instâncias de VO em Esquemas Zod de Entidades:**
    *   **Padrão:** Ao definir um esquema Zod para as props de uma Entidade (e.g., `UserPropsSchema`), valide que as propriedades que devem ser instâncias de VOs são, de fato, essas instâncias.
    *   **Exemplo:**
        ```typescript
        // const UserPropsSchema = z.object({
        //   id: z.custom<UserId>((val) => val instanceof UserId, "ID de usuário inválido"),
        //   email: z.custom<UserEmail>((val) => val instanceof UserEmail, "Email de usuário inválido"),
        //   // ...
        // });
        ```
    *   **Justificativa:** Garante que a Entidade seja construída com VOs já validados e corretamente instanciados, reforçando a integridade do modelo de domínio.

**Consequências:**
*   Maior consistência e robustez na camada de domínio.
*   Melhor encapsulamento e clareza das regras de negócio.
*   Facilidade de manutenção e teste dos objetos de domínio.
*   Desenvolvedores (humanos e LLMs) terão um guia claro para implementar novos objetos de domínio ou modificar existentes.

---
**Notas de Implementação para LLMs:**
*   Ao criar uma nova Entidade ou VO, sempre comece definindo a interface `Props` e o esquema Zod para validação no método `create()`.
*   Certifique-se de que os construtores sejam `private`.
*   Para Entidades, implemente métodos de alteração de estado retornando novas instâncias. Para VOs, garanta imutabilidade total.
*   Use `get` accessors para expor propriedades.
*   Implemente `toPersistence()` e `static fromPersistenceData()` em Entidades.
