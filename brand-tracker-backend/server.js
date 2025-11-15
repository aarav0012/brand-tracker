const app = require('./src/app');
const config = require('./src/config/config');

app.listen(config.port, () => {
  console.log(`🚀 Backend server running on http://localhost:${config.port}`);
});