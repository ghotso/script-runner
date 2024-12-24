declare module 'color' {
  interface Color {
    (color: string): Color;
    hsl(): Color;
    isLight(): boolean;
    toString(): string;
  }

  const color: Color;
  export = color;
}

