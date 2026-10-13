# FinControl

O **FinControl** é uma aplicação móvel de gestão financeira pessoal focada em simplicidade e eficiência. O projeto foi construído para ajudar usuários a aplicarem a famosa **Regra 50/30/20** de forma automatizada e visual.

## A Ideia

Muitas pessoas têm dificuldade em saber quanto podem gastar por dia ou como dividir sua renda. O FinControl resolve isso ao organizar suas finanças em três categorias principais:

1.  **50% - Gastos Fixos Mensais:** Aluguel, contas de luz, internet, etc.
2.  **30% - Gastos Variáveis Mensais:** Lazer, restaurantes, compras casuais.
3.  **20% - Guardar:** Reserva de emergência ou investimentos futuros.

O diferencial do app é o cálculo em tempo real do **Limite por Dia**, que diz exatamente quanto você ainda pode gastar no dia de hoje para chegar ao fim do mês dentro do seu orçamento.

## Principais Funcionalidades

-   **Dashboard Inteligente:** Resumo visual do mês, progresso da regra 50/30/20 e limite de gasto diário.
-   **Gestão de Gastos Fixos:** Cadastro de despesas que se repetem todos os meses para automação do orçamento.
-   **Controle de Transações:** Registro rápido de entradas e saídas.
-   **Relatórios Visuais:** Gráficos para entender para onde seu dinheiro está indo.
-   **Alertas de Orçamento:** Acompanhe quando o restante mensal cair abaixo de 30% e receba aviso de limite excedido.
-   **Notificações de Compras:** Receba um aviso na barra de notificações do dispositivo quando uma despesa for registrada.
-   **Banco de Dados Local:** Total privacidade. Seus dados financeiros não saem do seu celular (utiliza SQLite).
-   **Backup e Restauração:** Segurança para seus dados através de exportação/importação de arquivos JSON.

## Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as tecnologias mais modernas do ecossistema React Native:

-   **[React Native](https://reactnative.dev/):** Framework para desenvolvimento mobile nativo.
-   **[Expo](https://expo.dev/):** Plataforma para facilitar o desenvolvimento e publicação.
-   **[SQLite (expo-sqlite)](https://docs.expo.dev/versions/latest/sdk/sqlite/):** Banco de dados local robusto e performático.
-   **[Lucide React Native](https://lucide.dev/):** Conjunto de ícones minimalistas e modernos.
-   **[React Navigation](https://reactnavigation.org/):** Gestão de rotas e navegação em abas.
-   **Context API:** Gerenciamento de estado global da aplicação.

## Estrutura do Projeto

```text
src/
├── components/    # Componentes reutilizáveis (Cards, ProgressBars, etc.)
├── context/       # Provedores de estado (DataContext)
├── database/      # Configuração do SQLite e Repositórios
├── navigation/    # Configuração de rotas (Tab Navigator)
├── screens/       # Telas principais da aplicação
├── services/      # Lógica de negócio e cálculos financeiros
├── types/         # Definições de tipos TypeScript
└── utils/         # Formatadores e funções auxiliares
```

## Como Começar

### Pré-requisitos

- Node.js e npm instalados.
- Git, para clonar o repositório.
- Para testar em um celular Android/iOS: o app **Expo Go** instalado.
- Alternativamente, um emulador Android configurado no Android Studio.

### Instalação e execução no Windows

Os comandos do Expo devem ser executados na **raiz do projeto**, a pasta que contém `package.json`. Não os execute dentro da pasta `android`: ela não contém o `package.json` do app, por isso `npx expo start` falha com `ConfigError`.

Abra o PowerShell e execute:

```powershell
git clone https://github.com/NondasNF/fin-control.git
cd fin-control
npm install
npx expo start
```

Se o projeto já estiver clonado, navegue até a pasta raiz existente. Por exemplo:

```powershell
cd C:\Users\nonda\StudioProjects\fin-control
npm install
npx expo start
```

Antes de iniciar, confirme que está na raiz:

```powershell
Get-Location
Test-Path .\package.json
```

O segundo comando deve retornar `True`. Se estiver em `...\fin-control\android`, volte um nível com `cd ..` e confirme novamente.

### Abrir o app

- **Celular:** mantenha o computador e o celular na mesma rede Wi-Fi, abra o Expo Go e escaneie o QR code mostrado no terminal ou no navegador.
- **Emulador Android:** inicie o emulador pelo Android Studio e pressione `a` no terminal onde o Expo está rodando.
- **Reiniciar limpando o cache:** pare o servidor com `Ctrl+C` e rode `npx expo start --clear` na raiz do projeto.

Este projeto usa Expo SDK 54. O comando `npx expo start` inicia o servidor de desenvolvimento; não é necessário executar `npm install` dentro de `android`. Avisos de vulnerabilidades do `npm install` não são a causa do erro de `package.json` ausente. Revise-os separadamente antes de considerar `npm audit fix`, especialmente a opção `--force`, que pode atualizar dependências com mudanças incompatíveis.

O app usa notificações locais do dispositivo (não exige servidor ou token push). Para testar a captura de compras do Nubank, é necessário um build Android de desenvolvimento; o Expo Go não contém o serviço nativo de leitura de notificações.

Na raiz do projeto, com um aparelho Android conectado via USB com depuração ativada ou um emulador aberto, execute:

```powershell
npx expo run:android
```

No app instalado, abra **Configurações > Captura de compras Nubank > Configurar**. Permita notificações para o FinControl e habilite o acesso especial a notificações na tela do Android. Esse acesso pode ler notificações do dispositivo; o serviço do FinControl filtra o pacote do Nubank e só registra avisos de compra aprovada que contenham valor em reais.

Para validar, faça uma compra no crédito que gere uma notificação visível no Nubank. O FinControl deve mostrar uma notificação do sistema e registrar uma despesa na categoria **Compras Nubank**, usando o estabelecimento encontrado após “APROVADA em” como descrição. Se o app estava fechado, a captura é salva pelo serviço Android; os dados aparecem no FinControl quando ele for aberto novamente. O listener não funciona no iOS nem no Expo Go.

Para conferir a captura pelo log do Android, em outro terminal com `adb` disponível execute:

```powershell
adb logcat -s NubankNotificationListener
```

Ao chegar uma notificação do Nubank, o log deve mostrar `Notificação do Nubank recebida.`; para uma compra reconhecida, também deve mostrar `Compra aprovada do Nubank capturada e registrada.`. Se aparecer que a notificação foi ignorada, envie o título e texto exatos do aviso (removendo dados pessoais) para ajustar o parser. O log não imprime o conteúdo financeiro da notificação.

## Licença

Este projeto está sob a licença [MIT](LICENSE).
