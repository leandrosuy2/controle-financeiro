# Finança Pro

<p align="center">
  <img src="assets/images/logo.png" alt="Finança Pro" width="240" />
</p>

<p align="center">
  <strong>Controle de contas a pagar e a receber</strong><br />
  App em React Native (Expo) com tema claro/escuro, notificações e resumo financeiro.
</p>

<p align="center">
  <a href="https://github.com/leandrosuy2/controle-financeiro">Repositório no GitHub</a>
</p>

---

## O que o app faz

O **Finança Pro** é um aplicativo de controle financeiro pessoal para você cadastrar **contas a pagar** e **contas a receber**, acompanhar o **saldo previsto do mês**, ver **próximos vencimentos** e receber **lembretes** no dia (e horário) do vencimento.

### Principais funcionalidades

- **Dashboard** – Saldo previsto do mês, gráfico receitas x despesas, contas próximas a vencer (7 dias), alertas (vencendo hoje / atrasadas).
- **Contas** – Lista com filtros por período (dia, semana, mês, todos), tipo (a pagar / a receber) e status (pendentes, pagos, atrasados). Cadastro e edição com data, valor, categoria, recorrência e horário do lembrete.
- **Lembretes** – Notificação local no dia do vencimento (e no horário definido, se configurado). Funciona em *development build*; no Expo Go as notificações ficam desativadas.
- **Configurações** – Tema claro/escuro e informações do app.
- **Tema fintech** – Verde (#22C55E), azul e dourado, com suporte a modo escuro.

---

## Tecnologias

| Stack | Uso |
|-------|-----|
| **React Native** + **Expo (SDK 54)** | App multiplataforma |
| **Expo Router** | Navegação (tabs + stack) |
| **expo-sqlite** | Banco local (contas) |
| **expo-notifications** | Lembretes no vencimento |
| **expo-linear-gradient** | Botões e cards em gradiente |
| **react-native-toast-message** | Feedback rápido (sucesso/erro) |
| **@react-native-community/datetimepicker** | Data e hora no formulário |

---

## Pré-requisitos

- **Node.js** 18 ou superior  
- **npm** ou **yarn**  
- **Expo Go** (para testar no celular) ou **Android Studio** / **Xcode** (para build nativo)

---

## Como rodar o projeto

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/leandrosuy2/controle-financeiro.git
cd controle-financeiro
npm install
```

### 2. Subir o app (Expo Go ou emulador)

```bash
npm start
```

Abra no **Expo Go** (QR code no terminal) ou pressione:

- `a` – Android  
- `i` – iOS (Mac)  
- `w` – Web  

**Modo offline** (se der erro de rede no `expo start`):

```bash
npm run start:offline
```

### 3. Rodar em dispositivo/emulador (build nativo)

Gera as pastas `android/` e `ios/` e roda o app:

```bash
npm run prebuild
npm run android
```

No Mac, para iOS:

```bash
npm run ios
```

---

## Como gerar o build (APK/AAB/iOS)

Para gerar o instalável na nuvem (EAS Build):

1. Instalar dependências (inclui `eas-cli`):

   ```bash
   npm install
   ```

2. Login na Expo (uma vez):

   ```bash
   npx eas login
   ```

3. Configurar o projeto (uma vez):

   ```bash
   npm run build:configure
   ```

4. Gerar o build:

   - **Android:** `npm run build:android`
   - **iOS:** `npm run build:ios`
   - **Os dois:** `npm run build:all`

O link para baixar o app aparece no terminal e em [expo.dev](https://expo.dev).

### Android: APK ou AAB

Por padrão o EAS Build gera **AAB** (Android App Bundle), usado na Play Store. Este projeto está configurado no **eas.json** para gerar **APK**, instalável direto no celular (sem precisar publicar na loja).

- **Perfil `production`** (padrão ao rodar `npm run build:android`): gera **APK**.
- **Perfil `preview`** (testes internos): também gera **APK**.

Para usar um perfil específico:

```bash
# APK para produção (padrão)
npx eas build --platform android --profile production

# APK para testes internos
npx eas build --platform android --profile preview
```

Se no futuro quiser voltar a gerar **AAB** (para publicar na Play Store), remova ou altere em **eas.json** a opção `"android": { "buildType": "apk" }` no perfil desejado.

Passo a passo detalhado: **[BUILD.md](./BUILD.md)**.

---

## Estrutura do projeto

```
controle-financeiro/
├── app/                    # Rotas (Expo Router)
│   ├── _layout.tsx         # Tabs (Dashboard, Contas, Configurações)
│   ├── index.tsx          # Dashboard
│   ├── contas/            # Lista, detalhe, nova conta
│   └── configuracoes/     # Configurações
├── assets/
│   └── images/            # logo.png, splash-icon.png, etc.
├── src/
│   ├── components/        # UI (Button, Input, CardConta, FormConta, SplashScreen)
│   ├── screens/           # Telas (Dashboard, ListaContas, DetalheConta, Configurações)
│   ├── services/          # contas (CRUD), notifications (lembretes)
│   ├── database/          # SQLite (schema, getDb)
│   ├── theme/             # tokens (cores, tipografia), ThemeContext
│   └── types/             # Conta, etc.
├── app.json               # Nome do app, ícone, splash, plugins
├── BUILD.md               # Comandos de build
└── README.md              # Este arquivo
```

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Sobe o Metro/Expo (QR code + atalhos) |
| `npm run start:offline` | Sobe o Expo em modo offline |
| `npm run android` | Roda no Android (após `prebuild`) |
| `npm run ios` | Roda no iOS – Mac (após `prebuild`) |
| `npm run web` | Abre no navegador |
| `npm run prebuild` | Gera pastas nativas `android/` e `ios/` |
| `npm run build:configure` | Configura EAS Build (1ª vez) |
| `npm run build:android` | Build Android (EAS) |
| `npm run build:ios` | Build iOS (EAS) |
| `npm run build:all` | Build Android + iOS (EAS) |
| `npm run lint` | Roda o ESLint |

---

## Nome e ícones

- **Nome do app:** Finança Pro  
- **Ícone do app:** `assets/images/splash-icon.png`  
- **Splash screen:** `assets/images/logo.png` em fundo `#111827`  
- **Logo (marca):** `assets/images/logo.png`  

Configuração em **app.json** (Expo).

---

## Licença

Projeto privado. Uso conforme definido pelo autor.
