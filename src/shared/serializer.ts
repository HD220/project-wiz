/**
 * Serializador customizado para tipos complexos no IPC
 */
type Serializer<T, S = any> = {
  /**
   * Identificador único do serializador
   */
  id: string;

  /**
   * Verifica se o valor pode ser serializado por este transformador
   */
  canSerialize(value: unknown): value is T;

  /**
   * Converte o valor para formato simples (serialização)
   */
  toPlain(value: T): S;

  /**
   * Reconstrói o valor original (desserialização)
   */
  fromPlain(serialized: S): T;
};

/**
 * Serializador para objetos Date que usa formato ISO 8601 (UTC)
 *
 * Notas:
 * - toISOString() sempre serializa em UTC
 * - new Date() interpreta a string ISO corretamente em qualquer timezone
 * - Valores inválidos lançam erro explícito
 * - Aceita null/undefined como valores válidos
 */
const dateSerializer: Serializer<Date | null, string | null> = {
  id: "date-serializer",
  canSerialize(value: unknown): value is Date {
    return value instanceof Date;
  },
  toPlain(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString();
  },
  fromPlain(isoString: string | null): Date | null {
    if (isoString === null || isoString === undefined) return null;

    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new Error(
        `Failed to deserialize date from invalid ISO string: "${isoString}"`
      );
    }
    return date;
  },
};

// Implementação para bigint
const bigIntSerializer: Serializer<bigint, string> = {
  id: "bigint-serializer",
  canSerialize(value: unknown): value is bigint {
    return typeof value === "bigint";
  },
  toPlain(value: bigint): string {
    return value.toString();
  },
  fromPlain(str: string): bigint {
    return BigInt(str);
  },
};

// Implementação para objetos com métodos
const objectSerializer: Serializer<object, object> = {
  id: "object-serializer",
  canSerialize(value: unknown): value is object {
    return (
      typeof value === "object" &&
      value !== null &&
      Object.getPrototypeOf(value) !== Object.prototype
    );
  },
  toPlain(obj: object): object {
    return JSON.parse(JSON.stringify(obj));
  },
  fromPlain(plain: object): object {
    return plain;
  },
};

/**
 * Registro global de serializadores
 */
const serializers: Serializer<any, any>[] = [
  dateSerializer,
  bigIntSerializer,
  objectSerializer,
];

/**
 * Verifica se uma string está no formato ISO 8601 (simplificado)
 */
function isIsoDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(value);
}

/**
 * Serializa um valor usando os transformadores registrados
 */
export function serializeValue<T>(value: T): unknown {
  const serializer = serializers.find((s) => s.canSerialize(value));
  if (serializer) {
    return {
      __serialized: true,
      type: serializer.id,
      value: serializer.toPlain(value),
    };
  }
  return value;
}

/**
 * Desserializa um valor usando os transformadores registrados
 */
export function deserializeValue<T>(value: unknown): T {
  if (
    typeof value === "object" &&
    value !== null &&
    "__serialized" in value &&
    "type" in value &&
    "value" in value
  ) {
    const serialized = value as { type: string; value: unknown };
    const serializer = serializers.find((s) => s.id === serialized.type);
    if (serializer) {
      return serializer.fromPlain(serialized.value) as T;
    }
  }
  return value as T;
}

/**
 * Serializa recursivamente um objeto ou valor
 */
export function deepSerialize<T>(value: T): unknown {
  // Primeiro verifica se é um valor que precisa de serialização especial
  const serializer = serializers.find((s) => s.canSerialize(value));
  if (serializer) {
    return serializeValue(value);
  }

  if (Array.isArray(value)) {
    return value.map(deepSerialize);
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    const serialized: Record<string, unknown> = {};
    for (const key in obj) {
      const serializedValue = deepSerialize(obj[key]);
      // Preserva o marcador de serialização se existir
      if (typeof serializedValue === 'object' && serializedValue !== null && '__serialized' in serializedValue) {
        serialized[key] = serializedValue;
      } else {
        serialized[key] = serializeValue(serializedValue);
      }
    }
    return serialized;
  }

  return value;
}

/**
 * Desserializa recursivamente um objeto ou valor
 */
export function deepDeserialize<T>(value: unknown): T {
  // Primeiro verifica se é um valor serializado explicitamente
  if (
    typeof value === "object" &&
    value !== null &&
    "__serialized" in value &&
    "type" in value &&
    "value" in value
  ) {
    return deserializeValue(value) as T;
  }

  // Detecta strings ISO 8601 e converte para Date automaticamente
  if (typeof value === "string" && isIsoDateString(value)) {
    try {
      return dateSerializer.fromPlain(value) as T;
    } catch {
      // Se falhar, mantém o valor original
      return value as T;
    }
  }

  if (Array.isArray(value)) {
    return value.map(deepDeserialize) as unknown as T;
  }

  if (typeof value === "object" && value !== null) {
    // Verifica novamente se é um valor serializado (pode estar aninhado)
    if ("__serialized" in value && "type" in value && "value" in value) {
      return deserializeValue(value) as T;
    }

    const obj = value as Record<string, unknown>;
    const deserialized: Record<string, unknown> = {};
    for (const key in obj) {
      deserialized[key] = deepDeserialize(obj[key]);
    }
    return deserialized as T;
  }

  return value as T;
}
