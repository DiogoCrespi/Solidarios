# Script para diagnosticar e corrigir problemas de ADB no Windows
# Execute como Administrador para melhores resultados

Write-Host "=== Diagnóstico ADB - Android ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se ADB está instalado
Write-Host "1. Verificando instalação do ADB..." -ForegroundColor Yellow
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbPath) {
    Write-Host "   ❌ ADB não encontrado no PATH" -ForegroundColor Red
    Write-Host "   💡 Instale o Android SDK Platform Tools:" -ForegroundColor Yellow
    Write-Host "      https://developer.android.com/studio/releases/platform-tools" -ForegroundColor Gray
    exit 1
} else {
    Write-Host "   ✅ ADB encontrado: $($adbPath.Source)" -ForegroundColor Green
    $adbVersion = adb version
    Write-Host "   Versão: $($adbVersion[0])" -ForegroundColor Gray
}

Write-Host ""

# Verificar status do servidor ADB
Write-Host "2. Verificando status do servidor ADB..." -ForegroundColor Yellow
$devices = adb devices
Write-Host $devices

Write-Host ""

# Verificar dispositivos
Write-Host "3. Analisando dispositivos conectados..." -ForegroundColor Yellow
$deviceList = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match '\S' }

if ($deviceList.Count -eq 0) {
    Write-Host "   ⚠️  Nenhum dispositivo encontrado" -ForegroundColor Yellow
    Write-Host "   💡 Verifique se:" -ForegroundColor Yellow
    Write-Host "      - O dispositivo está conectado via USB" -ForegroundColor Gray
    Write-Host "      - A depuração USB está ativada" -ForegroundColor Gray
    Write-Host "      - O cabo USB permite transferência de dados" -ForegroundColor Gray
} else {
    $hasOffline = $false
    $hasUnauthorized = $false
    $hasDevice = $false
    
    foreach ($device in $deviceList) {
        if ($device -match 'offline') {
            $hasOffline = $true
            Write-Host "   ❌ Dispositivo OFFLINE detectado" -ForegroundColor Red
        } elseif ($device -match 'unauthorized') {
            $hasUnauthorized = $true
            Write-Host "   ⚠️  Dispositivo NÃO AUTORIZADO" -ForegroundColor Yellow
            Write-Host "   💡 Autorize a depuração USB no dispositivo Android" -ForegroundColor Yellow
        } elseif ($device -match 'device') {
            $hasDevice = $true
            Write-Host "   ✅ Dispositivo conectado corretamente" -ForegroundColor Green
        }
    }
    
    if ($hasOffline -or $hasUnauthorized) {
        Write-Host ""
        Write-Host "4. Tentando corrigir problemas..." -ForegroundColor Yellow
        
        # Reiniciar servidor ADB
        Write-Host "   Reiniciando servidor ADB..." -ForegroundColor Gray
        adb kill-server | Out-Null
        Start-Sleep -Seconds 2
        adb start-server | Out-Null
        Start-Sleep -Seconds 2
        
        Write-Host "   Verificando novamente..." -ForegroundColor Gray
        $devicesAfter = adb devices
        Write-Host $devicesAfter
        
        if ($devicesAfter -match 'offline') {
            Write-Host ""
            Write-Host "   ⚠️  Dispositivo ainda offline" -ForegroundColor Yellow
            Write-Host "   💡 Tente:" -ForegroundColor Yellow
            Write-Host "      1. Desconectar e reconectar o cabo USB" -ForegroundColor Gray
            Write-Host "      2. Desativar e reativar a depuração USB no dispositivo" -ForegroundColor Gray
            Write-Host "      3. Verificar se os drivers USB estão instalados" -ForegroundColor Gray
            Write-Host "      4. Tentar outro cabo USB" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "=== Informações Adicionais ===" -ForegroundColor Cyan
Write-Host ""

# Verificar porta 8082
Write-Host "5. Verificando porta 8082..." -ForegroundColor Yellow
$port8082 = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if ($port8082) {
    Write-Host "   ✅ Porta 8082 está em uso (Expo provavelmente está rodando)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Porta 8082 não está em uso" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Soluções Recomendadas ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. No dispositivo Android:" -ForegroundColor Yellow
Write-Host "   - Configurações → Sistema → Opções do desenvolvedor" -ForegroundColor Gray
Write-Host "   - Ative 'Depuração USB'" -ForegroundColor Gray
Write-Host "   - Autorize este computador quando solicitado" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Use Expo Go via QR Code (mais fácil):" -ForegroundColor Yellow
Write-Host "   - Instale Expo Go no dispositivo" -ForegroundColor Gray
Write-Host "   - Escaneie o QR code do terminal" -ForegroundColor Gray
Write-Host "   - Não precisa de ADB!" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Use a versão Web:" -ForegroundColor Yellow
Write-Host "   - Pressione 'w' no terminal do Expo" -ForegroundColor Gray
Write-Host "   - Abre em http://localhost:8082" -ForegroundColor Gray
Write-Host ""


