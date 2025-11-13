# Solução: Erro "Unable to deserialize cloned data" no Metro Bundler

## Problema

```
Error while reading cache, falling back to a full crawl:
Error: Unable to deserialize cloned data.
    at deserialize (node:v8:436:14)
    at DiskCacheManager.read
```

## Causa

O cache do Metro Bundler está corrompido. Isso pode acontecer quando:
- O processo do Metro é interrompido abruptamente
- Há problemas de permissão ao escrever no cache
- O cache fica em um estado inconsistente após atualizações
- Múltiplas instâncias do Metro tentam acessar o mesmo cache

## Solução Rápida

### Opção 1: Limpar cache e reiniciar (Recomendado)

```powershell
cd frontend
npm run clean
npm run start:clear
```

Ou manualmente:

```powershell
cd frontend
npx expo start --clear
```

### Opção 2: Usar o script de limpeza completo

```powershell
cd frontend
.\clear-cache.ps1
npm run start:clear
```

### Opção 3: Limpeza manual completa

```powershell
cd frontend

# Limpar cache do Expo
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Limpar cache do Metro
Remove-Item -Recurse -Force .metro -ErrorAction SilentlyContinue

# Limpar cache em node_modules
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\metro-file-map\.cache -ErrorAction SilentlyContinue

# Limpar arquivos temporários
Remove-Item -Recurse -Force "$env:TEMP\metro-*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:TEMP\react-*" -ErrorAction SilentlyContinue

# Reiniciar com cache limpo
npx expo start --clear
```

## Scripts Disponíveis no package.json

Após a atualização, você tem os seguintes comandos disponíveis:

```json
{
  "start:clear": "expo start --clear",
  "android:clear": "expo start --android --clear",
  "ios:clear": "expo start --ios --clear",
  "web:clear": "expo start --web --clear",
  "clean": "powershell -ExecutionPolicy Bypass -File ./clear-cache.ps1",
  "clean:all": "npm run clean && npm start -- --clear"
}
```

### Uso:

```powershell
# Limpar cache e iniciar normalmente
npm run clean:all

# Iniciar com cache limpo
npm run start:clear

# Limpar apenas o cache (sem iniciar)
npm run clean
```

## Verificação

Após limpar o cache, o Metro deve iniciar sem erros. Você verá:

```
Starting Metro Bundler
Metro waiting on exp://192.168.x.x:8082
```

**NÃO deve aparecer:**
- ❌ "Error while reading cache"
- ❌ "Unable to deserialize cloned data"
- ❌ "falling back to a full crawl"

## Prevenção

Para evitar que o problema aconteça novamente:

1. **Sempre pare o Metro corretamente:**
   - Pressione `Ctrl+C` no terminal
   - Aguarde o processo finalizar completamente

2. **Use `--clear` após atualizações:**
   ```powershell
   npm run start:clear
   ```

3. **Limpe o cache periodicamente:**
   ```powershell
   npm run clean
   ```

4. **Evite múltiplas instâncias:**
   - Verifique se não há outro Metro rodando antes de iniciar
   - Use `netstat -ano | findstr :8081` para verificar

## Troubleshooting Adicional

### Se o problema persistir:

1. **Verificar processos do Node:**
   ```powershell
   Get-Process node | Stop-Process -Force
   ```

2. **Reinstalar dependências:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

3. **Limpar cache do npm:**
   ```powershell
   npm cache clean --force
   ```

4. **Verificar permissões:**
   - Certifique-se de ter permissão de escrita no diretório do projeto
   - Execute o PowerShell como Administrador se necessário

## Referências

- [Expo - Troubleshooting](https://docs.expo.dev/troubleshooting/clear-cache/)
- [Metro Bundler - Cache](https://metrobundler.dev/docs/configuration/#cache)
- [React Native - Clearing Cache](https://reactnative.dev/docs/troubleshooting#clearing-cache)

---

**Última atualização:** $(Get-Date -Format "dd/MM/yyyy")

