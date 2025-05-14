export function slugfy(text: string): string {
  if (typeof text !== "string") {
    return "";
  }

  let slug = text.toLowerCase();

  // 2. Remove acentos e caracteres diacríticos
  // Normaliza para decompor (ex: 'é' -> 'e', '\u0301')
  // Remove os caracteres diacríticos (intervalo Unicode \u0300-\u036f)
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 3. Substitui espaços e caracteres não-alfanuméricos por um hífen
  // [^a-z0-9] => Qualquer caractere que NÃO seja uma letra minúscula ou número
  // + => Corresponde a uma ou mais ocorrências do caractere anterior
  // g => Substitui todas as ocorrências
  slug = slug.replace(/[^a-z0-9]+/g, "-");

  // 4. Remove hifens do início e do fim da string
  // ^-+ => Um ou mais hifens no início da string
  // | => OU
  // -+$ => Um ou mais hifens no fim da string
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}
