@echo off
REM Quick setup script for Paper-to-Prototype (Windows)

echo 📦 Installing dependencies...
call npm install

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Get a Groq API key at https://console.groq.com
echo 2. Edit .env.local and add: GROQ_API_KEY=gsk_YOUR_KEY
echo 3. Run: npm run dev
echo 4. Open http://localhost:3000
echo.
echo See GROQ_SETUP.md for detailed guide.
