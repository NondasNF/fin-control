# FinControl

O **FinControl** é uma aplicação móvel de gestão financeira pessoal focada em simplicidade e eficiência. O projeto foi construído para ajudar usuários a aplicarem a famosa **Regra 50/30/20** de forma automatizada e visual.

## A Ideia

Muitas pessoas têm dificuldade em saber quanto podem gastar por dia ou como dividir sua renda. O FinControl resolve isso ao organizar suas finanças em três categorias principais:

1.  **50% - Gastos Fixos Mensais:** Aluguel, contas de luz, internet, etc.
2.  **30% - Gastos Variáveis Mensais:** Lazer, restaurantes, compras casuais.
3.  **20% - Guardar:** Reserva de emergência ou investimentos futuros.

O diferencial do app é o cálculo em tempo real do **Limite por Dia**, que diz exatamente quanto você ainda pode gastar no dia de hoje para chegar ao fim do mês dentro do seu orçamento.
x
## Principais Funcionalidades

-   **Dashboard Inteligente:** Resumo visual do mês, progresso da regra 50/30/20 e limite de gasto diário.
-   **Gestão de Gastos Fixos:** Cadastro de despesas que se repetem todos os meses para automação do orçamento.
-   **Controle de Transações:** Registro rápido de entradas e saídas.
-   **Relatórios Visuais:** Gráficos para entender para onde seu dinheiro está indo.
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
- Node.js instalado
- Expo Go instalado no seu celular (para testar) ou um emulador configurado

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/fin-control.git
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o projeto:
   ```bash
   npx expo start
   ```

## Licença

Este projeto está sob a licença [MIT](LICENSE).
