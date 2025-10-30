const { initLiveAISocket } = require('./viewModels/socket.gateway.js');
const liveAIRoutes = require('./routes/liveAI.routes.js'); // This might be your HTTP routes

module.exports = {
  liveAIRoutes,  
  initLiveAISocket  
};