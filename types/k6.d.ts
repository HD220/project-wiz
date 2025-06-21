declare module 'k6' {
  export function check(val: any, sets: Record<string, (val: any) => boolean>): boolean;
  export function group(name: string, fn: () => void): void;
  export function sleep(seconds: number): void;
}

declare module 'k6/http' {
  export function get(url: string, params?: any): any;
  export function post(url: string, body?: any, params?: any): any;
}

declare module 'k6/metrics' {
  export class Trend {
    constructor(name: string);
    add(value: number): void;
  }
  
  export class Rate {
    constructor(name: string);
    add(value: number): void;
  }

  export class Counter {
    constructor(name: string);
    add(value: number): void;
  }
}

declare module 'https://jslib.k6.io/k6-summary/0.0.1/index.js' {
  export function htmlReport(data: any): string;
}