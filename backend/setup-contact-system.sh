#!/bin/bash

# 🔧 Script de Configuration - Système de Contact et Notifications
# Ce script vous guide pour configurer le système

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🔧 Configuration - Système de Contact et Notifications    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si .env existe
if [ ! -f ".env" ]; then
    echo "📁 Création du fichier .env..."
    cp .env.example .env
    echo "✅ Fichier .env créé!"
else
    echo "ℹ️  Fichier .env déjà existant."
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📧 Configuration SMTP (Email)"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Instructions:"
echo "1. Aller sur https://myaccount.google.com/"
echo "2. Menu 'Sécurité' → Activer '2FA'"
echo "3. Aller sur https://myaccount.google.com/apppasswords"
echo "4. Générer un mot de passe d'application (16 caractères)"
echo ""
read -p "Entrer votre email Gmail: " SMTP_USER
read -sp "Entrer votre mot de passe d'application: " SMTP_PASS
echo ""

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📱 Configuration Twilio (SMS)"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Instructions:"
echo "1. Aller sur https://www.twilio.com/try-twilio"
echo "2. S'inscrire et vérifier votre numéro"
echo "3. Acheter un numéro Twilio"
echo "4. Aller dans Account → API keys & tokens"
echo ""
read -p "Entrer votre Account SID Twilio: " TWILIO_ACCOUNT_SID
read -p "Entrer votre Auth Token Twilio: " TWILIO_AUTH_TOKEN
read -p "Entrer votre numéro Twilio (+1234567890): " TWILIO_PHONE_NUMBER
echo ""

echo ""
echo "════════════════════════════════════════════════════════════"
echo "👤 Coordonnées Admin"
echo "════════════════════════════════════════════════════════════"
echo ""
read -p "Entrer l'email admin (defaut: mlamaranapalaga21@gmail.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-mlamaranapalaga21@gmail.com}

read -p "Entrer le téléphone admin (defaut: 53875648): " ADMIN_PHONE
ADMIN_PHONE=${ADMIN_PHONE:-53875648}

echo ""
echo "════════════════════════════════════════════════════════════"
echo "💾 Mise à jour du fichier .env..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Mettre à jour le fichier .env
sed -i "s|SMTP_USER=.*|SMTP_USER=$SMTP_USER|g" .env
sed -i "s|SMTP_PASS=.*|SMTP_PASS=$SMTP_PASS|g" .env
sed -i "s|TWILIO_ACCOUNT_SID=.*|TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID|g" .env
sed -i "s|TWILIO_AUTH_TOKEN=.*|TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN|g" .env
sed -i "s|TWILIO_PHONE_NUMBER=.*|TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER|g" .env
sed -i "s|ADMIN_EMAIL=.*|ADMIN_EMAIL=$ADMIN_EMAIL|g" .env
sed -i "s|ADMIN_PHONE=.*|ADMIN_PHONE=$ADMIN_PHONE|g" .env

echo "✅ Fichier .env mis à jour!"
echo ""

# Installer les dépendances
echo "════════════════════════════════════════════════════════════"
echo "📦 Installation des dépendances..."
echo "════════════════════════════════════════════════════════════"
echo ""
npm install

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Configuration terminée!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Prochaines étapes:"
echo "1. Vérifier le fichier .env"
echo "2. Lancer le backend: npm run dev"
echo "3. Tester le formulaire de contact"
echo ""
echo "📚 Documentation: Voir CONTACT_SYSTEM_GUIDE.md"
echo ""
