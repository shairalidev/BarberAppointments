@echo off
echo Setting up BarberPro for single barber operation...

cd backend
echo Installing backend dependencies...
call npm install

echo Seeding database with single barber data...
node seed-data.js

cd ../frontend
echo Installing frontend dependencies...
call npm install

echo Setup complete! 
echo.
echo To start the application:
echo 1. Run: start-backend.bat
echo 2. Run: start-frontend.bat
echo 3. Run: setup-admin.bat (first time only)
echo.
pause