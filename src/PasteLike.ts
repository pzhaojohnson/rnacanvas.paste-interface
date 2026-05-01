/**
 * Like a paste event.
 */
export type PasteLike = {
  clipboardData: {
    getData(format: string): string;

    files?: {
      [index: number]: File;

      readonly length: number;
    } | null;
  }

  preventDefault(): void;

  stopPropagation(): void;
};
