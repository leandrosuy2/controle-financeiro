# Comandos para build – Finança Pro

## 1. Instalar EAS CLI (uma vez no PC)

```bash
npm install -g eas-cli
```

## 2. Login na conta Expo

```bash
eas login
```

(Crie conta em https://expo.dev se não tiver.)

## 3. Configurar o projeto para EAS Build (uma vez)

```bash
npm run build:configure
```

ou:

```bash
eas build:configure
```

(Escolha o tipo de build e confirme.)

---

## 4. Gerar o build

**Importante:** Cada vez que você roda `build:android`, `build:ios` ou `build:all`, a **versão é incrementada automaticamente** no `app.json` (ex: 1.0.0 → 1.0.1), junto com `versionCode` (Android) e `buildNumber` (iOS). A versão que aparece nas Configurações do app é lida daí.

### Só Android (APK ou AAB)

```bash
npm run build:android
```

ou:

```bash
eas build --platform android
```

### Só iOS

```bash
npm run build:ios
```

ou:

```bash
eas build --platform ios
```

### Android + iOS

```bash
npm run build:all
```

ou:

```bash
eas build --platform all
```

---

## 5. Build local (sem EAS, no seu PC)

### Gerar pastas nativas (android/ e ios/)

```bash
npm run prebuild
```

ou:

```bash
npx expo prebuild
```

### Rodar no Android (emulador ou celular conectado)

```bash
npm run android
```

ou:

```bash
npx expo run:android
```

### Rodar no iOS (só no Mac)

```bash
npm run ios
```

ou:

```bash
npx expo run:ios
```

---

## Resumo rápido

| O que você quer              | Comando                |
|-----------------------------|------------------------|
| Configurar EAS (1ª vez)     | `npm run build:configure` |
| Build Android (EAS)         | `npm run build:android`   |
| Build iOS (EAS)             | `npm run build:ios`      |
| Build Android + iOS (EAS)   | `npm run build:all`      |
| Gerar projeto nativo local | `npm run prebuild`       |
| Rodar no Android local      | `npm run android`       |
| Rodar no iOS local (Mac)    | `npm run ios`            |

Depois do build no EAS, o link para baixar o app aparece no terminal e no dashboard: https://expo.dev

---

## Se o build Android falhar (Gradle)

1. Rode `npx expo-doctor` e corrija versões de pacotes e configuração.
2. Use dependências compatíveis com o Expo SDK do projeto (ex.: `npx expo install --fix`).
3. **Ícone do app:** `icon` e `android.adaptiveIcon.foregroundImage` em `app.json` devem apontar para uma imagem **quadrada** (ex.: 1024×1024). Imagens não quadradas podem gerar aviso no `expo-doctor`; em alguns casos é preciso usar uma arte quadrada para o build passar.
