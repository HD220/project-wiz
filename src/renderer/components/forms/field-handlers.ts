export function createTextChangeHandler(
  onChange: (value: string) => void,
  transformer?: (value: string) => string,
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = transformer ? transformer(e.target.value) : e.target.value;
    onChange(value);
  };
}

export function createTextareaChangeHandler(onChange: (value: string) => void) {
  return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
}

export function createNumberChangeHandler(onChange: (value: number) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    onChange(isNaN(numValue) ? 0 : numValue);
  };
}
