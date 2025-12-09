const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

function log(message, type = 'info') {
    const symbols = {
        success: '✅ ',
        error: '❌ ',
        info: 'ℹ️  ',
        warning: '⚠️  '
    };

    let color = colors.reset;
    if (type === 'success') color = colors.green;
    if (type === 'error') color = colors.red;
    if (type === 'warning') color = colors.yellow;
    if (type === 'info') color = colors.blue;

    console.log(`${color}${symbols[type] || ''}${message}${colors.reset}`);
}

// Simple dotenv parser since we can't assume dotenv is installed globally
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            log('.env.local file not found!', 'error');
            return {};
        }
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        log(`Error loading .env.local: ${e.message}`, 'error');
        return {};
    }
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper to make HTTP requests
function httpRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'System-Verifier-Script' } }, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(res.statusCode);
            } else {
                reject(new Error(`Status Code: ${res.statusCode}`));
            }
        }).on('error', (e) => reject(e));
    });
}

async function verifySupabase() {
    console.log(`\n${colors.bold}--- 1. Testing Supabase Connection ---${colors.reset}`);
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        log('Missing Supabase credentials in .env.local', 'error');
        return;
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        // Try to fetch 1 record from 'leads' table
        const { data, error, count } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        log('Connected to Supabase successfully!', 'success');
        log(`Database is reachable.`, 'success');
        if (count !== null) {
            log(`Found ${count} leads in the database.`, 'info');
        }

    } catch (error) {
        log(`Connection failed: ${error.message}`, 'error');
        if (error.code === 'PGRST301') {
            log('Hint: Check your Row Level Security (RLS) policies.', 'warning');
        }
    }
}

async function verifyVercel() {
    console.log(`\n${colors.bold}--- 2. Testing Vercel Deployment ---${colors.reset}`);

    // User needs to manually set this or we ask
    // For now we use a placeholder or try to read from args
    const vercelUrl = process.argv[2];

    if (!vercelUrl) {
        log('No Vercel URL provided. Skipping direct HTTP check.', 'warning');
        log('Usage: node scripts/verify-system.js <YOUR_VERCEL_URL>', 'info');
        return;
    }

    try {
        log(`Checking URL: ${vercelUrl}...`, 'info');
        await httpRequest(vercelUrl);
        log('Vercel deployment is UP and responding (200 OK).', 'success');

        // Optional: Check a data page
        // const dataUrl = `${vercelUrl}/marketing/leads`;
        // await httpRequest(dataUrl); // Might redirect to login, returning 307 or 200
        // log('Data pages are accessible.', 'success');

    } catch (error) {
        log(`Failed to reach Vercel deployment: ${error.message}`, 'error');
    }
}

async function verifyGitHub() {
    console.log(`\n${colors.bold}--- 3. Testing GitHub Repository ---${colors.reset}`);
    // Check if public repo is accessible
    const repoUrl = 'https://api.github.com/repos/shavi-oss/shaviOs';

    try {
        await httpRequest(repoUrl);
        log('GitHub repository is accessible / public.', 'success');

        // Check latest commit (simplified)
        // const commitsUrl = `${repoUrl}/commits/main`;
        // await httpRequest(commitsUrl);
        // log('Can read latest commits.', 'success');
    } catch (error) {
        log(`Could not verify GitHub repo (might be private or token needed): ${error.message}`, 'warning');
    }
}

async function run() {
    console.log(`${colors.bold}Starting System Verification...${colors.reset}`);
    await verifySupabase();
    await verifyVercel();
    await verifyGitHub();
    console.log(`\n${colors.bold}Verification Complete.${colors.reset}\n`);
}

run();
