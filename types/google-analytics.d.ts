export {};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: string, targetId: string | Date, config?: Record<string, unknown>) => void;
  }
}