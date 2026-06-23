import { defineConfig } from 'orval';

export default defineConfig({
  kanbanApi: {
    input: 'http://localhost:8080/v3/api-docs', // Point directly to your backend contract
    output: {
      mode: 'split',                         // Separates types, operations, and instances nicely
      target: './src/api/generated/kanban.ts', // Where the code will be generated
      schemas: './src/api/generated/model',   // Where DTO interfaces will live
      client: 'axios',                        // Generate Axios fetchers
    },
  },
});