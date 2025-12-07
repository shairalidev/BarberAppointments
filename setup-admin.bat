@echo off
echo Setting up BarberPro Admin...
echo.

cd backend
echo Installing backend dependencies...
call npm install
echo.

echo Creating default admin user...
curl -X POST http://localhost:5000/api/auth/setup -H "Content-Type: application/json"
echo.

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Default admin credentials:
echo Username: admin
echo Password: admin
echo.
echo Please change these credentials after first login!
echo.
pause