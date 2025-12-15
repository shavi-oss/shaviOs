# =============================================
# Full System Analysis + PDF Report - Shavi OS
# =============================================

cd "D:\shavi acadimy\Shavierp"

# إنشاء مجلد لتخزين التقارير
$reportFolder = ".\Reports"
if (-Not (Test-Path $reportFolder)) { New-Item -ItemType Directory -Path $reportFolder }

Write-Host "🚀 Starting full system analysis..." -ForegroundColor Cyan

# ---------- 1️⃣ TypeScript ----------
npx tsc --noEmit 2>&1 | Out-File "$reportFolder\typescript-errors.txt" -Encoding UTF8

# ---------- 2️⃣ ESLint ----------
npx eslint src --ext .ts,.tsx 2>&1 | Out-File "$reportFolder\eslint-errors.txt" -Encoding UTF8

# ---------- 3️⃣ Tailwind CSS ----------
npx tailwindcss lint 2>&1 | Out-File "$reportFolder\tailwind-errors.txt" -Encoding UTF8

# ---------- 4️⃣ Next.js Build ----------
npm run build 2>&1 | Out-File "$reportFolder\nextjs-build.txt" -Encoding UTF8

# ---------- 5️⃣ Database ----------
$PG_HOST = "localhost"
$PG_PORT = 5432
$PG_USER = "postgres"
$PG_DB   = "shavi_academy"
$PG_PASSWORD = "your_password"

$env:PGPASSWORD = $PG_PASSWORD
psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DB -c "\dt; \dt+;" | Out-File "$reportFolder\database-schema.txt" -Encoding UTF8

# ---------- 6️⃣ دمج كل التقارير في ملف واحد ----------
$finalReport = "$reportFolder\Full_System_Report.txt"
Get-Content "$reportFolder\typescript-errors.txt" | Add-Content $finalReport
Add-Content $finalReport "`n`n========== ESLint ==========`n`n"
Get-Content "$reportFolder\eslint-errors.txt" | Add-Content $finalReport
Add-Content $finalReport "`n`n========== Tailwind CSS ==========`n`n"
Get-Content "$reportFolder\tailwind-errors.txt" | Add-Content $finalReport
Add-Content $finalReport "`n`n========== Next.js Build ==========`n`n"
Get-Content "$reportFolder\nextjs-build.txt" | Add-Content $finalReport
Add-Content $finalReport "`n`n========== Database Schema ==========`n`n"
Get-Content "$reportFolder\database-schema.txt" | Add-Content $finalReport

Write-Host "🎯 Full system analysis completed!" -ForegroundColor Green
Write-Host "📄 Report saved at: $finalReport" -ForegroundColor Cyan