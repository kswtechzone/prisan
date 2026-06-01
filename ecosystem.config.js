module.exports = {
  apps: [
    {
      name: "prisan-beauty",
      script: "server.js",
      cwd: "./.next/standalone",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3005,
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/pm2/err.log",
      out_file: "./logs/pm2/out.log",
      log_file: "./logs/pm2/combined.log",
      time: true,
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
    },
  ],
};
