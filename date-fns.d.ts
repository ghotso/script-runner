declare module 'date-fns' {
  export function format(date: Date | number, format: string, options?: {}): string;
  export function formatDistanceToNow(date: Date | number, options?: {}): string;
}

