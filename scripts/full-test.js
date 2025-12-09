const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

const SITE_URL = 'https://shavi-os.vercel.app'; // Update if using a different domain
const API_URL = `${SITE_URL}/api/debug-check`;
const CHECK_INTERVAL = 10000; // 10 seconds
const MAX_ATTEMPTS = 30; // 5 minutes max wait

function log(msg) {
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

async function triggerDeployment() {
    log('🚀 Triggering GitHub Deployment...');
    try {
        // 1. Modify README to trigger change
        fs.appendFileSync('README.md', `\n\n# Deployment Test – Trigger from GitHub ${new Date().toISOString()}`);

        // 2. Git Commit & Push
        execSync('git add README.md');
        execSync('git commit -m "chore: trigger vercel deployment verification"');
        execSync('git push');
        log('✅ Changes pushed to GitHub. Deployment should start.');
    } catch (e) {
        log(`❌ Failed to push changes: ${e.message}`);
        process.exit(1);
    }
}

function checkDeployment() {
    return new Promise((resolve) => {
        https.get(API_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const json = JSON.parse(data);
                        resolve({ success: true, data: json });
                    } else {
                        resolve({ success: false, status: res.statusCode });
                    }
                } catch (e) {
                    resolve({ success: false, error: e.message });
                }
            });
        }).on('error', (e) => resolve({ success: false, error: e.message }));
    });
}

async function runMonitor() {
    log(`📡 Monitoring Deployment at: ${API_URL}`);

    let attempts = 0;
    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        const result = await checkDeployment();

        if (result.success) {
            log('✅ Deployment Verified! API is responding.');
            console.log('\n--- 📊 SYSTEM HEALTH REPORT ---');
            console.log(JSON.stringify(result.data, null, 2));

            if (result.data.db_write.includes('SUCCESS') && result.data.env_vars.SUPABASE_URL) {
                log('🎉 FULL SUCCESS: Database Read/Write & Vercel Env Verified.');
            } else {
                log('⚠️  Partial Issues Found (check report above).');
            }
            return;
        } else {
            const status = result.status || result.error;
            log(`⏳ Waiting for deployment... (Attempt ${attempts}/${MAX_ATTEMPTS}) - Status: ${status}`);
            // If status is 404, it means route doesn't exist yet (good, waiting for deploy)
            // If status is 307, it means redirected? But API route shouldn't be protected by default unless configured.
        }

        await new Promise(r => setTimeout(r, CHECK_INTERVAL));
    }

    log('❌ Timeout waiting for deployment verification.');
}

// Main execution
(async () => {
    await triggerDeployment();
    log('Thinking... give Vercel a moment to recognize the push.');
    await new Promise(r => setTimeout(r, 5000));
    await runMonitor();
})();
