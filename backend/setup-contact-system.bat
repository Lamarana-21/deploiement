@echo off
REM 🔧 Script de Configuration - Système de Contact et Notifications
REM Version Windows

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   🔧 Configuration - Système de Contact et Notifications    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Vérifier si .env existe
if not exist ".env" (
    echo 📁 Création du fichier .env...
    copy .env.example .env
    echo ✅ Fichier .env créé!
) else (
    echo ℹ️  Fichier .env déjà existant.
)

echo.
echo ════════════════════════════════════════════════════════════
echo 📧 Configuration SMTP (Email)
echo ════════════════════════════════════════════════════════════
echo.
echo Instructions:
echo 1. Aller sur https://myaccount.google.com/
echo 2. Menu 'Sécurité' - Activer '2FA'
echo 3. Aller sur https://myaccount.google.com/apppasswords
echo 4. Générer un mot de passe d'application (16 caractères)
echo.
set /p SMTP_USER="Entrer votre email Gmail: "
set /p SMTP_PASS="Entrer votre mot de passe d'application: "

echo.
echo ════════════════════════════════════════════════════════════
echo 📱 Configuration Twilio (SMS)
echo ════════════════════════════════════════════════════════════
echo.
echo Instructions:
echo 1. Aller sur https://www.twilio.com/try-twilio
echo 2. S'inscrire et vérifier votre numéro
echo 3. Acheter un numéro Twilio
echo 4. Aller dans Account - API keys ^& tokens
echo.
set /p TWILIO_ACCOUNT_SID="Entrer votre Account SID Twilio: "
set /p TWILIO_AUTH_TOKEN="Entrer votre Auth Token Twilio: "
set /p TWILIO_PHONE_NUMBER="Entrer votre numéro Twilio (+1234567890): "
echo.

echo.
echo ════════════════════════════════════════════════════════════
echo 👤 Coordonnées Admin
echo ════════════════════════════════════════════════════════════
echo.
set /p ADMIN_EMAIL="Entrer l'email admin (defaut: mlamaranapalaga21@gmail.com): "
if "%ADMIN_EMAIL%"=="" set "ADMIN_EMAIL=mlamaranapalaga21@gmail.com"

set /p ADMIN_PHONE="Entrer le téléphone admin (defaut: 53875648): "
if "%ADMIN_PHONE%"=="" set "ADMIN_PHONE=53875648"

echo.
echo ════════════════════════════════════════════════════════════
echo 💾 Mise à jour du fichier .env...
echo ════════════════════════════════════════════════════════════
echo.

REM Créer un fichier temporaire avec les modifications
setlocal enabledelayedexpansion
(
    for /f "delims=" %%i in (.env.example) do (
        set "line=%%i"
        if "!line:~0,10!"=="SMTP_USER=" (
            echo SMTP_USER=%SMTP_USER%
        ) else if "!line:~0,10!"=="SMTP_PASS=" (
            echo SMTP_PASS=%SMTP_PASS%
        ) else if "!line:~0,20!"=="TWILIO_ACCOUNT_SID=" (
            echo TWILIO_ACCOUNT_SID=%TWILIO_ACCOUNT_SID%
        ) else if "!line:~0,19!"=="TWILIO_AUTH_TOKEN=" (
            echo TWILIO_AUTH_TOKEN=%TWILIO_AUTH_TOKEN%
        ) else if "!line:~0,22!"=="TWILIO_PHONE_NUMBER=" (
            echo TWILIO_PHONE_NUMBER=%TWILIO_PHONE_NUMBER%
        ) else if "!line:~0,12!"=="ADMIN_EMAIL=" (
            echo ADMIN_EMAIL=%ADMIN_EMAIL%
        ) else if "!line:~0,12!"=="ADMIN_PHONE=" (
            echo ADMIN_PHONE=%ADMIN_PHONE%
        ) else (
            echo !line!
        )
    )
) > .env.tmp
move /y .env.tmp .env

echo ✅ Fichier .env mis à jour!
echo.

echo ════════════════════════════════════════════════════════════
echo 📦 Installation des dépendances...
echo ════════════════════════════════════════════════════════════
echo.
call npm install

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ Configuration terminée!
echo ════════════════════════════════════════════════════════════
echo.
echo 🚀 Prochaines étapes:
echo 1. Vérifier le fichier .env
echo 2. Lancer le backend: npm run dev
echo 3. Tester le formulaire de contact
echo.
echo 📚 Documentation: Voir CONTACT_SYSTEM_GUIDE.md
echo.
pause
