# Síndico Digital

Aplicativo mobile para gestão condominial em Presidente Prudente, SP.

## ✅ Pré-requisitos

- Node.js 18+
- Expo Go instalado no celular (iOS / Android)
- Conta no Firebase

## 🔥 Configuração do Firebase

### 1. Criar o projeto

1. Acesse `console.firebase.google.com`
2. Clique em "Adicionar projeto" → nome: `sindico-digital`
3. Desative o Google Analytics (opcional)

### 2. Autenticação

1. No menu lateral → Authentication → Começar
2. Aba Sign-in method → habilitar E-mail/senha

### 3. Realtime Database

1. No menu lateral → Realtime Database → Criar banco de dados
2. Selecione a região `us-central1` (ou South America se disponível)
3. Inicie em modo de teste por enquanto
4. Após criar, copie a URL do banco (ex: `https://sindico-digital-default-rtdb.firebaseio.com`)

### 4. Registrar o app Web

1. Na tela inicial do projeto → clique no ícone `</>`
2. Dê um nome (ex: `sindico-digital-app`)
3. Copie o `firebaseConfig` exibido

### 5. Configurar as credenciais

Edite o arquivo `app.json` e preencha a seção `extra`:

```json
"extra": {
  "firebaseApiKey":            "AIzaSy...",
  "firebaseAuthDomain":        "sindico-digital.firebaseapp.com",
  "firebaseDatabaseURL":       "https://sindico-digital-default-rtdb.firebaseio.com",
  "firebaseProjectId":         "sindico-digital",
  "firebaseStorageBucket":     "sindico-digital.appspot.com",
  "firebaseMessagingSenderId": "123456789",
  "firebaseAppId":             "1:123456789:web:abc123"
}
```

### 6. Criar o usuário Síndico

1. No Firebase Console → Authentication → Users → Adicionar usuário
2. Preencha e-mail e senha
3. Copie o UID gerado
4. No Realtime Database → clique no `+` e adicione manualmente:

```text
users/
  {UID_DO_SINDICO}/
    uid: "{UID_DO_SINDICO}"
    name: "Nome do Síndico"
    email: "sindico@email.com"
    role: "syndic"
    createdAt: {timestamp_atual_em_ms}
```

### 7. Aplicar as regras de segurança

1. No Realtime Database → aba Regras
2. Copie o conteúdo de `firebase-rules.json` e cole lá
3. Clique em Publicar

## 🚀 Rodando o projeto

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Iniciar o servidor de desenvolvimento
npx expo start

# Escaneie o QR Code com o Expo Go no celular
```

## 📁 Estrutura do Projeto

O código-fonte principal está concentrado dentro do diretório `src/`, organizado de forma modular e altamente desacoplada:

```text
src/
├── components/     # Componentes de interface compartilhados (botões, inputs, cards, etc.)
├── config/         # Inicialização do Firebase e configurações do Toast flutuante
├── constants/      # Design System (paleta de cores, tipografia, espaçamentos) e rótulos
├── context/        # Provedores de estado global, como o contexto de autenticação do usuário
├── hooks/          # Custom React Hooks reutilizáveis do projeto
├── navigation/     # Navegação dividida por perfis de acesso (Morador, Porteiro, Síndico)
├── screens/        # Telas da aplicação (separadas por domínios de permissão)
│   ├── auth/       # Telas de login, cadastro inicial e redefinição de senha
│   ├── syndic/     # Telas de controle do síndico (usuários, logs, estrutura de blocos e apts)
│   ├── gatekeeper/ # Telas da portaria (Leitor de QR Code de visitas)
│   └── shared/     # Telas comuns (mural de avisos, votações, reservas, visitantes, perfil)
├── services/       # Camada isolada de conexão e chamadas de API com o Firebase SDK
├── types/          # Interfaces e definições estritas do TypeScript para o ecossistema
└── utils/          # Validadores de regras de negócio e máscaras de inputs em tempo real
```

### Detalhamento das pastas

- **`components/`**: Centraliza os elementos atômicos da interface (UI) compartilhados (ex: botões personalizados com estados, caixas de input com ícones, modais genéricos de exclusão, cartões de contêiner, feedback de carregamento).
- **`config/`**: Configura a comunicação direta com o SDK do Firebase (`firebase.ts`) e o posicionamento/cores dos alertas flutuantes de notificação do Toast.
- **`constants/`**: Garante consistência visual definindo o guia de cores de marca (primária, acento, sucesso, erro), métricas de tipografia/espaçamento e tabelas fixas de rótulos de cargos.
- **`context/`**: Mantém o estado global da aplicação. O `AuthContext.tsx` gerencia se o usuário está logado, quem ele é no banco e quais permissões de visualização possui.
- **`navigation/`**: Organiza as pilhas e abas de telas do React Navigation com base no cargo do usuário conectado, bloqueando rotas indevidas de forma estrutural.
- **`screens/`**: Contém as telas finais montadas que os usuários visualizam. Telas administrativas ficam na pasta `syndic`, telas de porteiro na `gatekeeper`, telas de fluxo de entrada na `auth` e recursos compartilhados de morador na `shared`.
- **`services/`**: Camada que encapsula a lógica de comunicação direta com o Firebase Firestore e Realtime Database. As telas nunca tocam no banco diretamente; elas usam as funções desta pasta.
- **`types/`**: Contém os arquivos `.ts` que especificam cada entidade do condomínio (Perfil do Usuário, Visitante, Aviso, Espaço Comum, Reserva) para suporte a autocomplete completo e segurança contra erros de digitação.
- **`utils/`**: Funções auxiliares gerais, incluindo o cálculo de formatação de strings em tempo de execução (como máscaras de CPF, celulares e datas brasileiras).

## 👤 Perfis de Acesso

| Perfil | Acesso |
| --- | --- |
| Síndico | Dashboard completo, CRUD de tudo, aprovação de reservas |
| Morador | Avisos, reservas, votações, visitantes, perfil |
| Porteiro | Scanner QR, lista de visitantes, check-in/out |

## 🔑 Notas importantes

- O síndico deve ser criado manualmente no Firebase Console (ver passo 6 acima)
- Moradores e porteiros se cadastram pelo app ou são criados pelo síndico
- O QR Code funciona apenas em dispositivo físico (não no simulador)
- Notificações push requerem dispositivo físico e conta Expo (opcional)
