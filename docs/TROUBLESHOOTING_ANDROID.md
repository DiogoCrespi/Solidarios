# Troubleshooting: Dispositivo Android Offline no ADB

## Problema
```
[ADB] Couldn't reverse port 8082: adb.exe: device offline
Error: adb.exe: device offline
```

## Causas Possíveis

### 1. Dispositivo não autorizado para depuração USB
O dispositivo Android precisa autorizar o computador para depuração USB.

### 2. Driver USB não instalado ou desatualizado
O Windows precisa dos drivers corretos para reconhecer o dispositivo.

### 3. ADB precisa ser reiniciado
O servidor ADB pode estar em um estado inconsistente.

### 4. Modo de depuração USB desativado
O dispositivo pode não estar com a depuração USB ativada.

## Soluções (em ordem de prioridade)

### Solução 1: Verificar e Autorizar Depuração USB no Dispositivo

1. **No dispositivo Android:**
   - Vá em **Configurações** → **Sobre o telefone**
   - Toque 7 vezes em **Número da versão** (para ativar Opções do desenvolvedor)
   - Volte para **Configurações** → **Sistema** → **Opções do desenvolvedor**
   - Ative **Depuração USB**
   - Conecte o dispositivo via USB
   - Quando aparecer o popup "Permitir depuração USB?", marque **Sempre permitir deste computador** e toque em **OK**

### Solução 2: Reiniciar o Servidor ADB

Execute os seguintes comandos no PowerShell (como Administrador):

```powershell
# Parar o servidor ADB
adb kill-server

# Iniciar o servidor ADB
adb start-server

# Verificar dispositivos conectados
adb devices
```

O dispositivo deve aparecer como `device` (não `offline` ou `unauthorized`).

### Solução 3: Instalar/Atualizar Drivers USB

#### Para dispositivos Samsung:
- Instale o [Samsung USB Driver](https://developer.samsung.com/mobile/android-usb-driver.html)

#### Para dispositivos genéricos:
- Instale o [Google USB Driver](https://developer.android.com/studio/run/win-usb)
- Ou use o [Universal ADB Driver](https://adb.clockworkmod.com/)

#### Verificar no Gerenciador de Dispositivos:
1. Abra **Gerenciador de Dispositivos** (Win + X → Gerenciador de Dispositivos)
2. Com o dispositivo conectado, procure por:
   - **Dispositivos Android** ou **Android Phone**
   - Se aparecer com um ponto de exclamação (⚠️), o driver está faltando
3. Clique com botão direito → **Atualizar driver** → **Procurar automaticamente**

### Solução 4: Usar TCP/IP (Wi-Fi) em vez de USB

Se o USB continuar com problemas, você pode usar Wi-Fi:

```powershell
# Conectar via USB primeiro (para configurar)
adb tcpip 5555

# Desconectar USB e conectar via Wi-Fi
# Substitua IP_DO_DISPOSITIVO pelo IP do seu dispositivo Android
adb connect IP_DO_DISPOSITIVO:5555

# Verificar conexão
adb devices
```

**Para descobrir o IP do dispositivo:**
- **Configurações** → **Sobre o telefone** → **Status** → **Endereço IP**

### Solução 5: Usar Expo Go via QR Code (Recomendado)

Se o problema persistir, você pode usar o Expo Go sem precisar do ADB:

1. **No dispositivo Android:**
   - Instale o app **Expo Go** da Play Store
   - Abra o Expo Go

2. **No computador:**
   - Certifique-se de que o dispositivo e o computador estão na mesma rede Wi-Fi
   - Escaneie o QR code que aparece no terminal do Expo
   - O app será carregado automaticamente

### Solução 6: Usar Emulador Android

Se você tiver o Android Studio instalado:

```powershell
# Listar emuladores disponíveis
emulator -list-avds

# Iniciar um emulador
emulator -avd NOME_DO_AVD

# Depois, no terminal do Expo, pressione 'a' para abrir no Android
```

## Verificação Rápida

Execute este script para diagnosticar o problema:

```powershell
# Verificar se ADB está funcionando
adb version

# Ver dispositivos conectados
adb devices

# Se aparecer "offline", tente:
adb kill-server
adb start-server
adb devices

# Se aparecer "unauthorized", autorize no dispositivo
# Se aparecer "device", está tudo OK!
```

## Status Esperado

Após resolver, o comando `adb devices` deve mostrar:

```
List of devices attached
af94d800    device
```

**Não deve aparecer:**
- `offline` ❌
- `unauthorized` ❌
- Lista vazia ❌

## Alternativa: Usar Web

Se nenhuma solução funcionar, você pode usar a versão web:

```bash
cd frontend
npm start
# Pressione 'w' quando solicitado
```

O app abrirá em `http://localhost:8082`

## Referências

- [Documentação do Expo - Android](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Troubleshooting ADB](https://developer.android.com/studio/command-line/adb#troubleshooting)
- [Expo Go - Guia de Uso](https://docs.expo.dev/get-started/expo-go/)


