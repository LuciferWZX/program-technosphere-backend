export default () => ({
  http: {
    app_port: process.env.SERVER_PORT || 3000,
    app_global_prefix: process.env.APP_GLOBAL_PRFEFIX || 'api',
  },
  dataBase: {
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PWD || '123456',
    database: process.env.DB_DB || 'program_tech',
    synchronize: process.env.DB_SYN || true,
  },
  redis: {
    closeClient: process.env.REDIS_CLOSE_CIENT || false,
    password: process.env.REDIS_PASSWORD
      ? `:${process.env.REDIS_PASSWORD}`
      : '',
    host: process.env.REDIS_HOST,
    db: process.env.REDIS_DB ? `/${process.env.REDIS_DB}` : '',
    port: process.env.REDIS_PORT || 6379,
  },
});
