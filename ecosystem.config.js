module.exports = {
  apps: [{
    name: 'barberapp-backend',
    script: 'npm',
    args: 'run start',
    cwd: '/var/www/BarberAppointments/backend',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/barberapp-backend-error.log',
    out_file: '/var/log/pm2/barberapp-backend-out.log',
    log_file: '/var/log/pm2/barberapp-backend.log'
  }]
};