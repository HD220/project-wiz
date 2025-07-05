# ADR-010: Padrões de Implementação para Entidades e Objetos de Valor (VOs)

**Status:** Proposto (Considerado Aprovado Conforme Instrução - Revisado para Construtores Públicos)

**Contexto:**
A clareza, consistência e robustez das Entidades de Domínio e Objetos de Valor são fundamentais para a manutenibilidade e a integridade da lógica de negócios no núcleo da aplicação (`core/domain/`). Esta ADR define os padrões para sua implementação.

**Decisão:**

Serão adotados os seguintes padrões para todas as Entidades e Objetos de Valor:

**1. Classes Base:**
    *   **Padrão:** Todas as Entidades devem herdar de `AbstractEntity` (localizada em `core/common/base.entity.ts`). Todos os VOs devem herdar de `AbstractValueObject` (localizada em `core/common/value-objects/base.vo.ts`).
    *   **Justificativa:** Promove DRY ao centralizar lógica comum como manipulação de ID e propriedades base para Entidades, e métodos de igualdade (`equals`) e serialização (`toPersistence()`) básicos para VOs e Entidades.
    *   **Detalhes:** `AbstractEntity` provê a propriedade `id` (do tipo `Identity` ou um VO de ID específico) e um método `equals()` baseado no ID. `AbstractValueObject` provê um método `equals()` baseado na igualdade estrutural de suas `props`.

**2. Instanciação e Validação via Construtor:**
    *   **Padrão:** Entidades e VOs DEVEM ser instanciados usando o operador `new` diretamente. Seus construtores (`constructor`) DEVEM ser `public` e são responsáveis por toda a validação e inicialização.
    *   **Exemplo (VO):**
        ```typescript
        // UserEmail.vo.ts
        import { z } from "zod";
        import { AbstractValueObject, ValueError } from "@shared"; // Exemplo de localização

        const UserEmailSchema = z.string().email("Formato de email inválido").min(5).max(255);
        interface UserEmailProps { value: string; }

        export class UserEmail extends AbstractValueObject<UserEmailProps> {
          public readonly value: string; // Propriedade agora pública e readonly

          public constructor(emailInput: string) { // Construtor público recebe valor primitivo
            const trimmedEmail = emailInput.toLowerCase().trim();
            const validationResult = UserEmailSchema.safeParse(trimmedEmail);
            if (!validationResult.success) {
              throw new ValueError('Email inválido', validationResult.error.flatten().fieldErrors);
            }
            super({ value: validationResult.data }); // Passa props validadas para a classe base
            this.value = validationResult.data; // Atribui à propriedade pública
          }
          // get value() não é mais estritamente necessário se a prop 'value' for public readonly
          // e AbstractValueObject não depender dele para equals() ou outras lógicas.
          // Se AbstractValueObject usar this.props.value, então o getter é opcional.
        }
        ```
    *   **Exemplo (Entidade):**
        ```typescript
        // User.entity.ts
        import { z } from "zod";
        import { AbstractEntity, EntityError, Result, success, failure } from "@shared"; // Exemplo
        import { UserId } from "./value-objects/user-id.vo"; // VO para ID
        import { UserEmail } from "./value-objects/user-email.vo"; // VO para Email
        // Supondo que UserProps seja a interface para os dados de entrada do construtor
        // e InternalUserProps a interface para this.props em AbstractEntity.

        // Esquema Zod para as props de entrada do construtor
        const UserConstructorPropsSchema = z.object({
          id: z.custom<UserId>(val => val instanceof UserId, "ID de usuário inválido"),
          email: z.custom<UserEmail>(val => val instanceof UserEmail, "Email inválido"),
          nickname: z.string().min(3),
          // ... outras props e seus VOs ou tipos primitivos validados
          // avatar: z.custom<AvatarVO>(val => val instanceof AvatarVO).optional(),
          // defaultLLMProviderConfigId: z.custom<Identity>(val => val instanceof Identity).optional(),
          // assistantId: z.custom<Identity>(val => val instanceof Identity).optional().nullable(),
          createdAt: z.date().optional(),
          updatedAt: z.date().optional(),
        });
        type UserConstructorProps = z.infer<typeof UserConstructorPropsSchema>;

        // Interface para o estado interno gerenciado por AbstractEntity
        interface InternalUserProps {
          id: UserId;
          email: UserEmail;
          nickname: string;
          // ... outras props internas
          // avatar?: AvatarVO;
          // defaultLLMProviderConfigId?: Identity;
          // assistantId?: Identity | null;
          createdAt: Date;
          updatedAt: Date;
        }

        export class User extends AbstractEntity<UserId, InternalUserProps> {
          // Propriedades são expostas via getters que acessam this.props da AbstractEntity

          public constructor(props: UserConstructorProps) { // Construtor público recebe UserConstructorProps
            const validationResult = UserConstructorPropsSchema.safeParse(props);
            if (!validationResult.success) {
              throw new EntityError("Props de User inválidas.", {
                details: validationResult.error.flatten().fieldErrors,
              });
            }

            const validatedProps = validationResult.data;
            const now = new Date();

            const internalProps: InternalUserProps = {
              id: validatedProps.id, // UserId já é uma instância de VO
              email: validatedProps.email, // UserEmail já é uma instância de VO
              nickname: validatedProps.nickname,
              // ...mapeia outras props validadas para InternalUserProps...
              // avatar: validatedProps.avatar,
              // defaultLLMProviderConfigId: validatedProps.defaultLLMProviderConfigId,
              // assistantId: validatedProps.assistantId === undefined ? null : validatedProps.assistantId,
              createdAt: validatedProps.createdAt || now,
              updatedAt: validatedProps.updatedAt || now,
            };
            super(internalProps.id, internalProps); // Passa ID (VO) e props internas para AbstractEntity
          }

          public get email(): UserEmail { return this.props.email; }
          public get nickname(): string { return this.props.nickname; }
          // ... outros getters e métodos de negócio ...
        }
        ```
    *   **Justificativa:** Simplifica a API de criação (uso direto de `new`), alinha-se com a construção de objetos padrão em JavaScript/TypeScript. A validação no construtor garante que um objeto nunca seja criado em um estado inválido. A responsabilidade de criar VOs passa para o código cliente (e.g., Casos de Uso) antes de chamar o construtor da Entidade.

**3. Validação no Construtor:**
    *   **Padrão:** A validação dos dados de entrada para Entidades e VOs DEVEM ocorrer dentro de seus `constructor` públicos.
    *   **Ferramenta:** Zod é a biblioteca padrão para definir esquemas de validação para os dados de entrada do construtor.
    *   **Localização do Esquema:** Esquemas Zod para os parâmetros do construtor devem ser co-locados com o arquivo da Entidade/VO ou em um arquivo irmão (ex: `user.schema.ts` para `user.entity.ts`).
    *   **Tratamento de Erro:** Em caso de falha na validação (seja pela validação do esquema Zod ou por regras de negócio adicionais no construtor), o `constructor` deve lançar `ValueError` para VOs e `EntityError` para Entidades (ambos de `shared/errors/`). Estes erros devem incluir detalhes da falha, preferencialmente utilizando `error.flatten().fieldErrors` do Zod.
    *   **Exemplo (VO com Zod no construtor):**
        ```typescript
        // // JobId.vo.ts
        // import { z } from "zod";
        // import { AbstractValueObject, ValueError } from "@shared"; // Exemplo
        // import { randomUUID } from "crypto"; // Para Node.js, ou window.crypto.randomUUID() no browser

        // const JobIdSchema = z.string().uuid({ message: "Formato de Job ID inválido" });
        // interface JobIdProps { value: string; }

        // export class JobId extends AbstractValueObject<JobIdProps> {
        //   public readonly value: string;

        //   public constructor(idInput?: string) { // Permite criação com ou sem ID prévio
        //     const jobIdToValidate = idInput || randomUUID();
        //     const validationResult = JobIdSchema.safeParse(jobIdToValidate);
        //     if (!validationResult.success) {
        //       throw new ValueError(`Job ID inválido: ${jobIdToValidate}`, {
        //         details: validationResult.error.flatten().fieldErrors,
        //       });
        //     }
        //     super({ value: validationResult.data });
        //     this.value = validationResult.data; // Atribui à propriedade pública
        //   }
        // }
        ```
    *   **Autovalidação e Normalização em VOs:** VOs são responsáveis por validar e normalizar seus valores primitivos dentro de seus construtores. Ex: `UserEmail` deve converter o email para minúsculas, remover espaços extras e validar o formato antes de atribuir à sua propriedade interna.
    *   **Justificativa:** Garante a integridade dos dados desde a concepção do objeto. Zod oferece uma forma declarativa e type-safe de definir validações para os dados de entrada. Lançar exceções em caso de falha previne a criação de objetos em estado inconsistente.

**4. Imutabilidade:**
    *   **Objetos de Valor (VOs):** Devem ser estritamente imutáveis. Todas as suas propriedades (`props` ou propriedades públicas diretas) devem ser `readonly`. Nenhum método deve permitir a alteração do estado interno após a criação.
        *   **Justificativa:** A imutabilidade garante que VOs possam ser compartilhados e comparados por valor de forma segura, sem efeitos colaterais.
    *   **Entidades:**
        *   **Padrão Preferencial (Imutabilidade Funcional):** Métodos que modificam o estado de uma entidade devem retornar uma *nova instância* da entidade com o estado atualizado. As propriedades internas da entidade (`this.props` em `AbstractEntity`) devem ser tratadas como `readonly` após a instanciação inicial.
            ```typescript
            // User.entity.ts
            // public changeEmail(newEmail: UserEmail): User {
            //   // Validações de regras de negócio para a mudança de email, se houver.
            //   // Ex: if (this.isDeactivated()) throw new Error("Usuário desativado não pode mudar email.");

            //   // Cria um novo objeto de props para a nova instância
            //   // As props para o construtor devem corresponder a UserConstructorProps
            //   const constructorProps: UserConstructorProps = {
            //     id: this.id, // Reutiliza o mesmo ID (UserId VO)
            //     email: newEmail, // Novo email (UserEmail VO)
            //     nickname: this.nickname, // Mantém nickname existente (string)
            //     // ... outras props existentes mapeadas para UserConstructorProps
            //     // Por exemplo, se this.nickname é um getter para this.props.nickname:
            //     // nickname: this.props.nickname,
            //     // avatar: this.props.avatar,
            //     // defaultLLMProviderConfigId: this.props.defaultLLMProviderConfigId,
            //     // assistantId: this.props.assistantId,
            //     createdAt: this.props.createdAt, // Mantém createdAt original
            //     updatedAt: new Date(), // Atualiza updatedAt
            //   };
            //   return new User(constructorProps); // Retorna nova instância de User
            // }
            ```
        *   **Exceção (Mutação Interna Controlada - Requer Justificativa Forte):** Em casos raros onde a performance é crítica e o estado sendo modificado é puramente interno, encapsulado, e não afeta a identidade ou o contrato público da entidade (e.g., coleções internas de logs, flags de rastreamento de mudanças em `JobEntity` como `_progressChanged`), a mutação interna controlada *pode* ser considerada. No entanto, isso deve ser uma exceção justificada e documentada, e a lógica de mutação deve estar contida em métodos da entidade. A preferência é sempre por retornar novas instâncias.
        *   **Justificativa (Imutabilidade Funcional para Entidades):** Reduz efeitos colaterais, simplifica o rastreamento de mudanças de estado (especialmente em UIs reativas ou para auditoria), facilita a depuração e o CQS (Command Query Separation). Embora possa haver um pequeno overhead de criação de objetos, a previsibilidade e segurança geralmente compensam.

**5. Acesso a Propriedades:**
    *   **Objetos de Valor (VOs):** Devem expor seu(s) valor(es) primitivo(s) através de propriedades `public readonly` (e.g., `public readonly value: string;`) ou, alternativamente, através de `get` accessors públicos se a propriedade interna for `private` e houver lógica adicional no getter (o que é menos comum para VOs simples). A preferência é por `public readonly` para simplicidade.
    *   **Entidades:** Devem expor suas propriedades (que são frequentemente outros VOs ou representações primitivas de VOs) através de `get` accessors públicos que lêem de `this.props` (herdado de `AbstractEntity`). Evitar a exposição direta do objeto `this.props` da entidade.
        *   **Exemplo:**
            ```typescript
            // User.entity.ts
            // public get email(): UserEmail { return this.props.email; } // Retorna o VO UserEmail
            // public get nickname(): string { return this.props.nickname; } // Retorna o primitivo
            ```
    *   **Justificativa:** Controla o acesso ao estado interno, reforça o encapsulamento e permite que a representação interna mude sem quebrar o contrato público da classe. Para VOs, garante que o valor seja acessado de forma padronizada e imutável.

**6. Igualdade:**
    *   **Objetos de Valor (VOs):** A igualdade é baseada no valor estrutural de suas `props`. O método `equals(other?: SelfType): boolean` herdado de `AbstractValueObject` (que compara `this.props` com `other.props` usando uma comparação profunda) geralmente é suficiente.
    *   **Entidades:** A igualdade é baseada em seu Identificador (ID). O método `equals(other?: SelfType): boolean` herdado de `AbstractEntity` (que compara `this.id.equals(other.id)`) é o padrão.
    *   **Justificativa:** Define corretamente a semântica de igualdade para cada tipo de objeto de domínio, crucial para coleções, testes e lógica condicional.

**7. Métodos de Persistência (Serialização/Desserialização):**
    *   **Padrão (Atualizado):**
        *   Entidades DEVEM implementar um método de instância `toPersistence()` que retorna um POJO (Plain Old JavaScript Object) contendo apenas primitivas, arrays/objetos de primitivas, ou representações serializáveis de VOs (e.g., `email.value` em vez do objeto `UserEmail` completo). Este POJO é o que será usado pelos Mappers da camada de infraestrutura para interagir com o banco de dados ou outras formas de persistência.
        *   A reconstrução de Entidades a partir de dados de persistência (o inverso de `toPersistence()`) é responsabilidade exclusiva da camada de Repositório (ou seus Mappers específicos da infraestrutura). O Repositório usará o `constructor` público da Entidade (e os construtores/métodos `create` dos VOs) para recriar as instâncias, passando os dados desserializados e já validados (ou validando-os no processo de mapeamento). **Entidades não devem mais ter um método `static fromPersistenceData()`**.
    *   **Exemplo Conceitual (`UserEntity.toPersistence()`):**
        ```typescript
        // interface UserPersistenceData { id: string; email: string; nickname: string; /* ... createdAt: Date; updatedAt: Date; */ }
        // public toPersistence(): UserPersistenceData {
        //   return {
        //     id: this.props.id.value, // Supondo que UserId (this.props.id) tenha .value
        //     email: this.props.email.value, // Supondo que UserEmail (this.props.email) tenha .value
        //     nickname: this.props.nickname, // Nickname pode ser uma string primitiva em props
        //     createdAt: this.props.createdAt,
        //     updatedAt: this.props.updatedAt,
        //     // ... outras props primitivas ou valores de VOs
        //   };
        // }
        ```
    *   **Justificativa (Atualizada):** Decoupla a Entidade do conhecimento específico sobre formatos de persistência ou o processo de reconstrução a partir de dados crus. Alinha-se melhor com a ignorância da camada de domínio sobre a persistência (Dependency Inversion Principle). Repositórios (e seus Mappers) são o local apropriado para essa lógica de reconstrução, pois eles já lidam com a camada de infraestrutura de dados. A Entidade apenas precisa saber como se apresentar para persistência.

**8. Interfaces de Props:**
    *   **Padrão:**
        *   Definir uma interface `[Entity/VO_Name]ConstructorProps` (ou similar, e.g. `[Entity/VO_Name]InputProps` ou simplesmente `[Entity/VO_Name]Props` se for a única interface de props pública) para os parâmetros do `constructor` público, especialmente se ele aceitar um objeto de props em vez de múltiplos parâmetros individuais. Esta interface define o contrato de entrada para criar uma instância.
        *   A interface `Internal[Entity/VO_Name]Props` (para `this.props` em `AbstractEntity` ou `AbstractValueObject`) continua relevante para tipar o estado interno gerenciado pela classe base. Esta interface não deve ser exposta publicamente.
    *   **Nomenclatura:** Sufixo `Props` para a interface de entrada do construtor (e.g., `UserConstructorProps`). Sufixo `InternalProps` para o estado interno (e.g., `InternalUserProps`).
    *   **Justificativa:** Clareza e type-safety para os dados de construção e para o estado interno dos objetos. Separa o contrato de entrada do contrato de estado interno.

**9. VO Genérico `Identity`:**
    *   **Padrão:** Utilizar o VO `Identity` (de `core/common/value-objects/identity.vo.ts` ou similar) para representar identificadores únicos (UUIDs). As Entidades devem ter seu ID tipado com uma classe VO específica que herda de `Identity` (e.g., `class UserId extends Identity {}`). Para chaves estrangeiras ou referências a outras entidades, usar diretamente estes VOs de ID específicos (e.g., `props.userId: UserId`).
    *   **Exemplo:** `UserEntity` tem `id: UserId`. `ProjectEntity` pode ter `props.ownerId: UserId`.
    *   **Justificativa:** Promove consistência e type-safety no tratamento de IDs, reutilizando a lógica de validação de UUID de `Identity` e garantindo que IDs de diferentes tipos de entidades não sejam confundidos.

**10. Validação de Instâncias de VO em Esquemas Zod de Entidades:**
    *   **Padrão:** Ao definir um esquema Zod para as props de entrada do construtor de uma Entidade (e.g., `UserConstructorPropsSchema`), valide que as propriedades que devem ser VOs já instanciados sejam, de fato, instâncias dessas classes de VO.
    *   **Exemplo (dentro de `UserConstructorPropsSchema`):**
        ```typescript
        // const UserConstructorPropsSchema = z.object({
        //   id: z.custom<UserId>((val) => val instanceof UserId, "ID de usuário deve ser uma instância de UserId VO"),
        //   email: z.custom<UserEmail>((val) => val instanceof UserEmail, "Email deve ser uma instância de UserEmail VO"),
        //   nickname: z.string().min(1, "Nickname é obrigatório"),
        //   // ... outras props
        // });
        ```
    *   **Justificativa:** Garante que a Entidade seja construída com VOs já validados e corretamente instanciados, reforçando a integridade do modelo de domínio. A criação dos VOs (com `new VoClass(primitiveValue)`) deve ocorrer *antes* da tentativa de criação da Entidade, tipicamente no Caso de Uso ou Serviço de Aplicação que orquestra a operação.

**Consequências:**
*   Maior consistência e robustez na camada de domínio.
*   Melhor encapsulamento e clareza das regras de negócio.
*   Facilidade de manutenção e teste dos objetos de domínio.
*   API de criação de objetos mais alinhada com as práticas comuns de TypeScript/JavaScript.
*   Responsabilidade de reconstrução de entidades a partir da persistência claramente definida na camada de Repositório/Mapper.
*   Desenvolvedores (humanos e LLMs) terão um guia claro para implementar novos objetos de domínio ou modificar existentes.

---
**Notas de Implementação para LLMs (Atualizado):**
*   Ao criar uma nova Entidade ou VO:
    *   Defina a interface de props para o construtor (e.g., `UserConstructorProps` para uma entidade, ou diretamente os tipos primitivos para VOs simples).
    *   Defina um esquema Zod para validar essas props de entrada do construtor.
    *   Implemente um `public constructor` que:
        *   Receba as props de entrada.
        *   Valide-as com o esquema Zod.
        *   Lance `ValueError` (para VOs) ou `EntityError` (para Entidades) em caso de falha na validação.
        *   Para VOs, normalize e atribua os valores validados às propriedades `public readonly`.
        *   Para Entidades, inicialize as `InternalProps` (que podem incluir a instanciação de VOs se eles não foram passados já instanciados, embora a ADR agora sugira que VOs sejam passados já instanciados) e passe o ID (VO) e as `InternalProps` para `super()`.
    *   Para Entidades, implemente métodos de alteração de estado que retornem novas instâncias da entidade (e.g., `return new UserEntity(newConstructorProps);`).
    *   Para VOs, garanta imutabilidade total e exponha valores via propriedades `public readonly` ou, se necessário, getters.
    *   Implemente o método `toPersistence()` em Entidades para retornar um POJO.
    *   Lembre-se que a reconstrução de Entidades a partir de dados de persistência (o antigo `fromPersistenceData`) agora é responsabilidade dos Repositórios/Mappers, que utilizarão os construtores públicos das Entidades e VOs.
