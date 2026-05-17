# 🗺️ Guia de Estrutura de Pastas — Síndico Digital

Este documento explica detalhadamente a arquitetura e a função de cada pasta no projeto **Síndico Digital**, um aplicativo React Native desenvolvido com Expo, TypeScript e Firebase para gestão de condomínios.

---

## 📂 Visão Geral do Diretório Raiz

Na raiz do projeto, temos as configurações de ambiente, dependências e o ponto de entrada principal:

*   **`.expo/`**: Pasta gerada automaticamente pelo Expo para controle de cache, build e logs locais. Não deve ser editada manualmente.
*   **`assets/`**: Contém arquivos de mídia estáticos, como o ícone do aplicativo, tela de splash, logo e imagens gerais.
*   **`node_modules/`**: Contém todas as dependências de terceiros instaladas via `npm`. Não é commitada no Git.
*   **`src/`**: A pasta principal de código-fonte onde reside toda a lógica, componentes, telas e serviços do app (detalhada abaixo).
*   **`App.tsx`**: Ponto de entrada (Entrypoint) da aplicação React Native. Inicializa os contextos globais (como autenticação), gerencia os toasts e monta o navegador raiz.
*   **`app.json`**: Arquivo de configuração de metadados do Expo (nome do app, ícone, permissões de câmera, splash screen, etc.).
*   **`firebase-rules.json`**: Regras de segurança locais para o banco de dados do Firebase.
*   **`tsconfig.json`**: Configurações do compilador do TypeScript.
*   **`package.json`**: Manifesto de dependências e scripts de execução (`npm run android`, `npm run ios`, `npm run web`, etc.).
*   **`.env`**: Variáveis de ambiente secretas (chaves do Firebase).

---

## 📂 Detalhamento da Pasta `/src`

Toda a organização do projeto segue princípios de modularidade, separando a camada de interface (UI), lógica de negócios, navegação e integração com serviços externos.

```
src/
├── components/     # Componentes de interface reutilizáveis
├── config/         # Configurações do Firebase e utilitários globais
├── constants/      # Paleta de cores, tipografia e mapeamentos estáticos
├── context/        # Gerenciamento de estado global (Autenticação)
├── hooks/          # Custom hooks reutilizáveis
├── navigation/     # Configuração e fluxos de telas (React Navigation)
├── screens/        # Telas da aplicação (divididas por domínio de acesso)
├── services/       # Integração com a API do Firebase (Firestore/Auth/Storage)
├── types/          # Declaração de tipos e interfaces do TypeScript
└── utils/          # Validadores e máscaras de dados
```

---

### 1. `/src/components` — Componentes Reutilizáveis
Centraliza elementos de interface que são consumidos por múltiplas telas, mantendo o padrão visual e de estilo uniforme.
*   **`/common`**: Componentes atômicos básicos:
    *   `Badge.tsx`: Exibição de tags de status ou prioridades (ex: ativo/inativo, urgência de avisos).
    *   `Button.tsx`: Botões padronizados com suporte a variantes (primário, perigo, outline), tamanho e estado de loading.
    *   `Card.tsx`: Container estilizado para agrupamento de informações.
    *   `ConfirmModal.tsx`: Modal genérico de confirmação para ações destrutivas ou importantes.
    *   `EmptyState.tsx`: Tela de placeholder exibida quando uma lista está vazia, com suporte a ícones vetoriais dinâmicos.
    *   `Input.tsx`: Campo de entrada de texto customizado com suporte a ícones esquerdos e mensagens de erro integradas.
    *   `LoadingSpinner.tsx`: Feedback visual de carregamento.
    *   `PhotoPicker.tsx`: Componente que abre a galeria para envio e recorte de fotos (ex: perfil ou visitante).
    *   `SearchBar.tsx`: Barra de pesquisa genérica.
    *   `SkeletonLoader.tsx`: Componente de animação simulando o esqueleto de carregamento antes do carregamento real dos dados.

---

### 2. `/src/config` — Configuração e Inicialização
Resguarda a integração técnica com ferramentas e serviços.
*   `firebase.ts`: Inicializa o cliente do Firebase SDK (Autenticação, Firestore Database e Storage) usando chaves de ambiente.
*   `ToastConfig.tsx`: Configuração de estilos globais para as notificações de Toast flutuantes (`react-native-toast-message`).

---

### 3. `/src/constants` — Design System e Chaves Estáticas
Armazena a identidade visual e os metadados fixos do app.
*   `colors.ts`: Paleta de cores centralizada (primary, accent, success, warning, error, etc.) para garantir uniformidade em modo claro ou escuro.
*   `typography.ts`: Definições globais de tamanhos de fonte, espaçamentos internos e arredondamentos de bordas (`BorderRadius`, `Spacing`, `Typography`).
*   `roles.ts`: Mapeamentos de texto estático, como rótulos de cargos (`síndico`, `porteiro`, `morador`), status de apartamentos, etc.

---

### 4. `/src/context` — Estado Global
Lida com estados acessíveis de qualquer ponto da hierarquia do aplicativo.
*   `AuthContext.tsx`: Contexto de Autenticação. Armazena as informações do usuário logado em tempo real, gerencia o login/logout e decide qual fluxo de navegação expor.

---

### 5. `/src/hooks` — Hooks Personalizados
Lógica compartilhada baseada em hooks nativos do React.
*   Exemplos futuros podem incluir hook para controle de formulários, controle de teclado físico de dispositivos, etc.

---

### 6. `/src/navigation` — Rotas e Fluxo de Telas
Gerencia a arquitetura de navegação com base no perfil de acesso do usuário atual (Autenticação baseada em Role-based Access Control).
*   `AppNavigator.tsx`: Decisor principal. Lê o estado do `AuthContext` e escolhe qual navegador carregar (Auth, Resident, Syndic ou Gatekeeper).
*   `AuthNavigator.tsx`: Fluxo para usuários deslogados (Login, Cadastro de Morador e Recuperação de Senha).
*   `SyndicNavigator.tsx`: Navegação exclusiva do **Síndico**, contendo abas de administração de moradores, porteiros, áreas comuns, logs do sistema e estrutura física.
*   `ResidentNavigator.tsx`: Navegação exclusiva do **Morador**, contendo abas de reservas de espaços comuns, avisos do condomínio, visitantes cadastrados e perfil pessoal.
*   `GatekeeperNavigator.tsx`: Navegação simplificada e segura para o **Porteiro**, com foco em leitura de QR Code, pesquisa rápida e histórico de visitas.

---

### 7. `/src/screens` — Telas e Páginas (UI)
As telas estão organizadas de forma lógica com base nas regras de negócio e no público-alvo de cada fluxo.
*   **`/auth`**: Telas de login e recuperação de senha (`LoginScreen.tsx`, `ForgotPasswordScreen.tsx`).
*   **`/gatekeeper`**: Funcionalidades específicas da portaria, como o scanner de visitantes (`ScanQRScreen.tsx`).
*   **`/syndic`**: Telas exclusivas de gerenciamento:
    *   `AdminLogsScreen.tsx`: Auditoria de ações administrativas.
    *   `UsersListScreen.tsx` e `CreateEditUserScreen.tsx`: Cadastro e controle de moradores e porteiros.
    *   **`/structure`**: CRUD dinâmico da estrutura do condomínio (`BlocksListScreen.tsx` e `ApartmentsListScreen.tsx`).
*   **`/shared`**: Módulos compartilhados entre moradores e a administração:
    *   **`/visitors`**: Cadastro e controle de autorização de visitas.
    *   **`/reservations`**: Controle de solicitações de uso dos espaços comuns.
    *   **`/spaces`**: Lista de áreas comuns (piscina, salão, churrasqueira).
    *   **`/notices`**: Mural de avisos do condomínio de diferentes prioridades.
    *   **`/votings`**: Enquetes e assembleias digitais.
    *   **`/profile`**: Visualização e alteração de dados de cadastro pessoais.
    *   **`/map`**: Mapa esquemático interativo das áreas e blocos.

---

### 8. `/src/services` — Conexão com Firebase (Lógica de Dados)
Isola o restante da aplicação dos detalhes internos de comunicação com o Firebase, agrupando as chamadas assíncronas do Firestore em funções modulares.
*   `auth.service.ts`: Lógica de registro, login, logout e redefinição de senha.
*   `users.service.ts`: Controle e verificação de dados de perfis de moradores e funcionários.
*   `structure.service.ts`: Gestão relacional dos blocos e unidades físicas (apartamentos).
*   `visitors.service.ts`: Registro, controle de status (pendente, entrada, saída) e geração de código QR de visitantes.
*   `spaces.service.ts` e `reservations.service.ts`: Criação de espaços e agendamentos de moradores.
*   `notices.service.ts`: CRUD e mural do feed de avisos.
*   `votings.service.ts`: Lógica para criação e computação de votos.
*   `logs.service.ts`: Serviço interno para rastreabilidade de eventos executados por síndicos.

---

### 9. `/src/types` — Tipagem Estrita
*   `index.ts`: Arquivo que centraliza todas as definições e interfaces TypeScript (`UserProfile`, `Visitor`, `Notice`, `Voting`, `Space`, `Reservation`, `Block`, `Apartment`) garantindo o desenvolvimento seguro, autocomplete no VS Code e reduzindo bugs em tempo de execução.

---

### 10. `/src/utils` — Funções Utilitárias e Auxiliares
*   `validators.ts`: Contém regex de validação (CPF, E-mail, Telefone) e funções de mascaramento para inputs dinâmicos em tempo de digitação, além de formatação de datas em padrão brasileiro (DD/MM/AAAA).

---

## 🛠️ Boas Práticas da Arquitetura do Projeto

1.  **Separação de Preocupações (SoC)**: Uma tela (`/screens`) nunca deve fazer requisições diretas ao Firebase SDK. Ela sempre chama uma função contida em um arquivo correspondente dentro da pasta `/services`.
2.  **Modularidade por Navegadores**: O controle de acesso a páginas sensíveis é feito a nível do React Navigation. Se o usuário atual não tiver o cargo necessário, o navigator correspondente sequer é instanciado na árvore de views, blindando a segurança do app.
3.  **Tipagem Forte**: Toda e qualquer função assíncrona ou objeto manipulado deve seguir fielmente os contratos estabelecidos no `/types/index.ts`.
