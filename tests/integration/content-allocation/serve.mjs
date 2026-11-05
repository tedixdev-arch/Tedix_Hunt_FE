import { createServer } from 'vite'
// Isolated real-API browser entry. Never targets the configured development backend.
const server = await createServer({
  configFile: false, envDir: false,
  define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') },
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3002' } },
})
await server.listen()
console.log('Allocation browser harness: http://127.0.0.1:5173/tests/browser/templateAllocation.html')
