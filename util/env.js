const env = {
  session_secret: process.env.SESSION_SECRET,
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  login_key: process.env.LOGIN_KEY,
  login_api_url: process.env.LOGIN_API_URL || "https://login.datasektionen.se",
  login_frontend_url: process.env.LOGIN_FRONTEND_URL || "https://login.datasektionen.se",
  pls_url: process.env.PLS_URL || "https://pls.datasektionen.se"
};

module.exports = env;