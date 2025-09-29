import { spawn, exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Maplyo - Full Stack Application');
console.log('═══════════════════════════════════════════════');

// Function to stop all Node.js processes
function stopAllProcesses() {
    return new Promise((resolve) => {
        console.log('🧹 Cleaning existing processes...');
        exec('Stop-Process -Name node -Force -ErrorAction SilentlyContinue', { shell: 'powershell' }, () => {
            setTimeout(() => {
                console.log('✅ Processes cleaned');
                resolve();
            }, 2000);
        });
    });
}

// Fonction pour démarrer le backend
function startBackend() {
    console.log('🔧 Démarrage du serveur backend...');
    const backend = spawn('npm', ['run', 'server:dev'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true
    });

    backend.on('error', (err) => {
        console.error('❌ Erreur backend:', err);
    });

    return backend;
}

// Fonction pour démarrer le frontend
function startFrontend() {
    console.log('🎨 Démarrage du serveur frontend...');
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true
    });

    frontend.on('error', (err) => {
        console.error('❌ Erreur frontend:', err);
    });

    return frontend;
}

// Démarrage séquentiel
async function startApplication() {
    try {
        // 1. Arrêter tous les processus existants
        await stopAllProcesses();
        
        // 2. Attendre un peu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. Démarrer le backend
        const backend = startBackend();
        
        // 4. Attendre que le backend soit prêt
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 5. Démarrer le frontend
        const frontend = startFrontend();
        
        console.log('');
        console.log('🎉 Maplyo Application started!');
        console.log('───────────────────────────────────');
        console.log('📍 Frontend: http://localhost:3000');
        console.log('🔧 Backend:  http://localhost:3001');
        console.log('');
        console.log('Press Ctrl+C to stop both servers');
        
        // Clean shutdown handling
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping servers...');
            backend.kill('SIGTERM');
            frontend.kill('SIGTERM');
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 Stopping servers...');
            backend.kill('SIGTERM');
            frontend.kill('SIGTERM');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Startup error:', error);
        process.exit(1);
    }
}

// Start the application
startApplication();
