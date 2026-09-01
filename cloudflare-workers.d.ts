type D1Database = any;
type Fetcher = any;

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
  };
}
