# Pokedéx — Documentação Técnica

> Complementa [REQUISITOS.md](REQUISITOS.md). Define stack, integrações externas e modelagem de dados no `localStorage`.

## 1. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Build/dev server | **Vite** | Setup rápido, HMR, fácil deploy na Vercel. |
| Framework UI | **React** | Ecossistema maduro de libs de animação/3D. |
| Animação de interface | **Framer Motion** | Transições do carrossel, tilt/parallax das cartas, micro-interações. |
| 3D | **react-three-fiber** + **@react-three/drei** | Wrapper de Three.js para React; `drei` facilita loaders, controles de câmera e helpers. |
| Roteamento | **React Router** | Navegação entre home, detalhes, carrinho, checkout, perfil, admin, login/registro. |
| Estado global | **Context API** (ou Zustand, se o estado crescer muito) | Sessão do usuário, carrinho, coleção — sem necessidade de algo mais pesado como Redux. |
| Estilo | **Tailwind CSS** | Agilidade para o visual "moderno/gamer" com gradientes e efeitos. |
| Deploy | **Vercel** | Deploy gratuito e imediato para projetos Vite/React. |

## 2. Integrações externas

### 2.1 Pokémon TCG API (`pokemontcg.io`)

- Fornece dados das cartas: nome, tipo, edição/set, raridade, e imagens em alta resolução (`images.large`).
- Uso sem API key funciona para volume baixo; recomenda-se gerar uma key gratuita se o rate limit for atingido durante o desenvolvimento.
- **Estratégia de cache**: buscar os dados necessários (ex.: um conjunto de cartas para popular coleções e o catálogo de destaques) uma vez e salvar em `localStorage`, para não depender de rede a cada navegação e não estourar rate limit.

### 2.2 Pokemon3D API (`github.com/Pokemon-3D-api/assets`)

- Fornece modelos 3D em formato `.glb`, organizados por geração/forma.
- Usados no banner da home: carregados via `useLoader(GLTFLoader, url)` do `@react-three/fiber`/`@react-three/drei` (`useGLTF`).
- Como é um projeto/comunidade menor que a Pokémon TCG API, vale ter um **fallback**: se o modelo 3D de um Pokémon específico não existir/carregar, cair para uma versão simplificada do banner (ex.: só a arte 2D com parallax) para aquele slide, em vez de quebrar a página.

## 3. Modelo de dados no `localStorage`

Chaves sugeridas (prefixo `pokedex:` para não colidir com outras coisas do navegador):

### `pokedex:users`
```json
[
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "password": "string (texto simples, simulado)",
    "role": "user | admin",
    "balance": 1000,
    "status": "active | blocked",
    "createdAt": "ISO date"
  }
]
```

### `pokedex:session`
```json
{ "userId": "uuid | null" }
```

### `pokedex:collections`
Coleção de cartas por usuário (cartas que o usuário possui, estejam anunciadas ou não).
```json
{
  "<userId>": [
    {
      "cardId": "id da carta na Pokémon TCG API",
      "condition": "Nova | Seminova | Usada | Danificada",
      "acquiredAt": "ISO date"
    }
  ]
}
```

### `pokedex:listings`
Anúncios ativos (venda ou troca), referenciando uma carta da coleção de um usuário.
```json
[
  {
    "id": "uuid",
    "ownerId": "uuid do usuário",
    "cardId": "id da carta",
    "condition": "Nova | Seminova | Usada | Danificada",
    "type": "sale | trade",
    "price": 150,
    "createdAt": "ISO date"
  }
]
```

### `pokedex:transactions`
Histórico, por usuário.
```json
[
  {
    "id": "uuid",
    "type": "purchase | sale | trade_sent | trade_received",
    "userId": "uuid",
    "counterpartyId": "uuid | null",
    "cards": ["cardId", "..."],
    "value": 150,
    "status": "completed",
    "date": "ISO date"
  }
]
```

### `pokedex:cardsCache`
Cache local dos dados vindos da Pokémon TCG API (evita refetch a cada carregamento).
```json
{
  "fetchedAt": "ISO date",
  "cards": [ /* payload da API, já normalizado */ ]
}
```

### `pokedex:cart`
Carrinho de compra (separado do fluxo de troca, que não precisa de persistência própria — a proposta é resolvida na hora).
```json
[
  { "listingId": "uuid", "quantity": 1 }
]
```

## 4. Estrutura de rotas

| Rota | Descrição |
|---|---|
| `/` | Home: banner 3D, destaques, busca/filtros. |
| `/carta/:id` | Detalhes da carta. |
| `/login`, `/registro` | Autenticação simulada. |
| `/carrinho` | Carrinho de compra. |
| `/checkout` | Tela de checkout (frete/pagamento cosméticos). |
| `/perfil` | Coleção, anúncios ativos, histórico do usuário logado. |
| `/admin` | Área administrativa (usuários e cartas) — só para `role: admin`. |

## 5. Considerações de licenciamento

Os modelos 3D da Pokemon3D API e as imagens da Pokémon TCG API usam assets/dados de propriedade da The Pokémon Company/Nintendo/Game Freak. O uso aqui é **não comercial, para fins acadêmicos**, o que é a prática comum em projetos desse tipo — mas vale mencionar essa ressalva na entrega/apresentação do trabalho.

## 6. Ordem sugerida de implementação

1. Setup do projeto (Vite + React + Tailwind + rotas básicas).
2. Integração com Pokémon TCG API + cache em `localStorage`.
3. Autenticação simulada (registro/login/seed de usuários).
4. Home estática (destaques, busca/filtros) sem efeitos ainda.
5. Página de detalhes da carta + efeito holográfico/tilt.
6. Banner 3D (react-three-fiber + Pokemon3D API) — última parte visual, pois depende do resto já funcionar.
7. Carrinho + checkout cosmético.
8. Fluxo de troca.
9. Perfil + histórico de transações.
10. Área administrativa.
11. Ajustes de responsividade e deploy na Vercel.
