require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3002;

// Create server
const server = http.createServer(app);

// Connect DB
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║       🌿 TradeMint API Server 🌿        ║
    ╠══════════════════════════════════════════╣
    ║  Mode:      ${process.env.NODE_ENV || 'development'}                 ║
    ║  Port:      ${PORT}                        ║
    ║  API:       http://localhost:${PORT}/api/v1  ║
    ╚══════════════════════════════════════════╝
    `);
  });
}).catch(err => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});
