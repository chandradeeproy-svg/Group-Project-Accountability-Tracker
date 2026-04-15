"use strict";

require("dotenv/config");

const { app } = require("./app");

const PORT = process.env.GATEWAY_PORT || 4000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Gateway health endpoint: http://localhost:${PORT}/health`);
});
