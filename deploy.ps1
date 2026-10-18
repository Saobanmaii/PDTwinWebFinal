# P-DTwin Deploy Script
# Chay script nay de build va dong goi toan bo

$root = $PSScriptRoot

Write-Host "=== 1. Build Frontend ===" -ForegroundColor Cyan
Set-Location "$root\frontend"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend build FAILED" -ForegroundColor Red; exit 1 }

Write-Host "=== 2. Copy dist vao Spring Boot static ===" -ForegroundColor Cyan
$staticDir = "$root\backend\src\main\resources\static"
if (Test-Path $staticDir) { Remove-Item $staticDir -Recurse -Force }
New-Item -ItemType Directory -Path $staticDir | Out-Null
Copy-Item "$root\frontend\dist\*" $staticDir -Recurse
Write-Host "Copied dist to $staticDir"

Write-Host "=== 3. Build Backend JAR ===" -ForegroundColor Cyan
Set-Location "$root\backend"
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) { Write-Host "Backend build FAILED" -ForegroundColor Red; exit 1 }

Set-Location $root

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "JAR: $root\backend\target\pdtwin-backend-0.0.1-SNAPSHOT.jar"
Write-Host ""
Write-Host "=== HUONG DAN DEPLOY LEN SERVER ===" -ForegroundColor Yellow
Write-Host "1. Upload len server:"
Write-Host "   - backend\target\pdtwin-backend-0.0.1-SNAPSHOT.jar"
Write-Host "   - unity-builds\ (thu muc nay)"
Write-Host "   - start-server.bat"
Write-Host ""
Write-Host "2. Dam bao MySQL 8.0 da cai va dang chay tren server (port 3306)."
Write-Host "   Database 'pdtwin' se tu tao (createDatabaseIfNotExist=true)."
Write-Host ""
Write-Host "3. Chay tren server:"
Write-Host "   start-server.bat"
Write-Host ""
Write-Host "4. Hoac chay thu cong:"
Write-Host "   java -jar pdtwin-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod"
