@echo off
echo Setting up Barber Appointments Application...

echo.
echo Installing Backend Dependencies...
cd backend
npm install
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
npm install
cd ..

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Start MongoDB service
echo 2. Run: npm run dev (in backend folder)
echo 3. Run: npm run serve (in frontend folder)
echo.
pause