# Script para limpar todos os caches do Metro Bundler e Expo
# Execute: .\clear-cache.ps1

Write-Host "=== Limpando Caches do Metro Bundler e Expo ===" -ForegroundColor Cyan
Write-Host ""

# 1. Limpar cache do Expo
Write-Host "1. Limpando cache do Expo..." -ForegroundColor Yellow
if (Test-Path .expo) {
    Remove-Item -Recurse -Force .expo
    Write-Host "   [OK] Cache .expo removido" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Cache .expo nao encontrado" -ForegroundColor Gray
}

# 2. Limpar cache do Metro
Write-Host "2. Limpando cache do Metro..." -ForegroundColor Yellow
if (Test-Path .metro) {
    Remove-Item -Recurse -Force .metro
    Write-Host "   [OK] Cache .metro removido" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Cache .metro nao encontrado" -ForegroundColor Gray
}

# 3. Limpar cache dentro de node_modules
Write-Host "3. Limpando cache em node_modules..." -ForegroundColor Yellow
$cacheDirs = @(
    "node_modules\.cache",
    "node_modules\metro-file-map\.cache",
    "node_modules\.expo"
)

foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Host "   [OK] Removido: $dir" -ForegroundColor Green
    }
}

# 4. Limpar cache do Watchman (se instalado)
Write-Host "4. Limpando cache do Watchman..." -ForegroundColor Yellow
try {
    $watchmanPath = Get-Command watchman -ErrorAction SilentlyContinue
    if ($watchmanPath) {
        watchman watch-del-all 2>$null
        Write-Host "   [OK] Cache do Watchman limpo" -ForegroundColor Green
    } else {
        Write-Host "   [INFO] Watchman nao instalado" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [INFO] Watchman nao disponivel" -ForegroundColor Gray
}

# 5. Limpar cache do npm (opcional)
Write-Host "5. Verificando cache do npm..." -ForegroundColor Yellow
$npmCache = npm config get cache 2>$null
if ($npmCache -and $npmCache -ne "undefined") {
    Write-Host "   [INFO] Cache do npm: $npmCache" -ForegroundColor Gray
    Write-Host "   [DICA] Execute 'npm cache clean --force' se necessario" -ForegroundColor Yellow
}

# 6. Limpar arquivos temporarios do Metro
Write-Host "6. Procurando arquivos de cache do Metro..." -ForegroundColor Yellow
$tempDirs = @(
    "$env:TEMP\metro-*",
    "$env:TEMP\react-*",
    "$env:LOCALAPPDATA\Temp\metro-*"
)

$found = $false
foreach ($pattern in $tempDirs) {
    $items = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    if ($items) {
        $items | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   [OK] Limpos arquivos temporarios do Metro" -ForegroundColor Green
        $found = $true
    }
}

if (-not $found) {
    Write-Host "   [INFO] Nenhum arquivo temporario encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Limpeza Concluida ===" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute: npm start -- --clear" -ForegroundColor Yellow
Write-Host "   ou" -ForegroundColor Gray
Write-Host "2. Execute: npx expo start --clear" -ForegroundColor Yellow
Write-Host ""
