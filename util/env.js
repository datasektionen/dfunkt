const env = {
  session_secret: process.env.SESSION_SECRET,
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  login_key: process.env.LOGIN_KEY,
  login_api_url: process.env.LOGIN_API_URL || "https://login.datasektionen.se",
  login_frontend_url: process.env.LOGIN_FRONTEND_URL || "https://login.datasektionen.se",
  hive_url: process.env.HIVE_URL || "https://hive.datasektionen.se/api/v1",
  hive_api_key: process.env.HIVE_API_KEY
};

module.exports = env;
