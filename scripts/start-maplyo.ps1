# Script de lancement Maplyo
Write-Host "🚀 Démarrage de Maplyo - Full Stack Application" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green

# Arrêter tous les processus Node.js existants
Write-Host "🧹 Nettoyage des processus existants..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Stop-Process -Name vite -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Obtenir le répertoire actuel
$currentDir = Get-Location

# Démarrer le backend en arrière-plan
Write-Host "🔧 Démarrage du serveur backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList @("-NoExit", "-Command", "Set-Location '$currentDir'; npm run server:dev") -WindowStyle Normal

# Attendre un peu que le backend démarre
Start-Sleep -Seconds 5

# Démarrer le frontend
Write-Host "🎨 Démarrage du serveur frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList @("-NoExit", "-Command", "Set-Location '$currentDir'; npm run dev") -WindowStyle Normal

Write-Host ""
Write-Host "🎉 Application Maplyo démarrée !" -ForegroundColor Green
Write-Host "───────────────────────────────────" -ForegroundColor Green
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les serveurs s'ouvriront dans des fenêtres séparées." -ForegroundColor White
Write-Host "Fermez les fenêtres PowerShell pour arrêter les serveurs." -ForegroundColor White

# Attendre un peu pour voir les messages
Start-Sleep -Seconds 2
