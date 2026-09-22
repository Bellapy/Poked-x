# Pokedéx

Marketplace simulado de compra, venda e troca de cartas Pokémon — trabalho acadêmico, 100% front-end, sem backend ou banco de dados real. Toda a persistência acontece no `localStorage` do navegador.

## Destaques

- **Banner 3D** com modelos de Pokémon entrando girando, flutuando e saindo em loop contínuo (`react-three-fiber`).
- **Efeito holográfico "rainbow"** nas cartas, reagindo ao cursor.
- **Mercado** separado em seções de venda e de troca, com busca e filtros por tipo, edição, raridade, conservação e preço.
- **Jornadas completas**: publicar anúncio, carrinho, checkout, proposta de troca, histórico de transações e área administrativa.
- **Detalhes de acabamento**: cursor de pokébola, animação de abertura e faíscas ao digitar.

## Stack

React 19 + Vite, Tailwind CSS 4, React Router, Framer Motion, three.js / react-three-fiber. Lint com `oxlint`.

## Rodando localmente

Pré-requisito: Node.js instalado.

```bash
npm install
```

```bash
npm run dev
```

O servidor sobe em `http://localhost:5173`.

### Usuários de teste

Os dados são semeados na primeira carga. Senha `123456` para todos, exceto o admin (`admin123`).

| E-mail | Perfil |
| --- | --- |
| `rafael@pokedex.com` | Vendedor — coleção maior e anúncios ativos |
| `ilana@pokedex.com` | Compradora — coleção enxuta, sem anúncios |
| `admin@pokedex.com` | Administrador — gerencia usuários e anúncios |

Vendedor e comprador **não são papéis do sistema**: ambos são usuários comuns com as mesmas permissões. A diferença está só nos dados semeados, refletindo as duas personas do trabalho. O único papel com permissão extra é o administrador.

### Variável de ambiente (opcional)

Copie `.env.example` para `.env` e preencha com uma chave gratuita da [Pokémon TCG API](https://pokemontcg.io/developer/). Sem ela a API funciona, mas retorna erros 500/502 com mais frequência.

```bash
cp .env.example .env
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento (Vite). |
| `npm run build` | Gera o build de produção. |
| `npm run preview` | Serve o build de produção localmente. |
| `npm run lint` | Roda o linter (`oxlint`). |

## Rotas

| Rota | Descrição |
| --- | --- |
| `/login`, `/registro` | Autenticação simulada — porta de entrada obrigatória. |
| `/` | Mercado: banner, roleta de raras e as seções de venda e troca. |
| `/carta/:id` | Detalhes da carta, ofertas e sugestões. |
| `/publicar` | Escolha de qual carta da coleção anunciar. |
| `/publicar/:itemId` | Formulário do anúncio (venda, troca ou ambos). |
| `/troca/:listingId` | Montagem da proposta de troca. |
| `/carrinho`, `/checkout` | Compra com PokeCoins. |
| `/perfil` | Coleção, anúncios ativos e histórico. |
| `/admin` | Gestão de usuários e anúncios (só administrador). |

## Estrutura do projeto

```
src/
  api/         # Clientes das APIs externas (Pokémon TCG API, modelos 3D)
  components/  # Componentes reutilizáveis
  context/     # Estado global (sessão, catálogo de cartas, carrinho)
  lib/         # Camada de domínio e utilitários
  pages/       # Uma página por rota
```

Toda regra de negócio vive em `src/lib/market.js` — comprar, publicar, trocar, mexer em saldo e gravar histórico. Nenhuma página acessa o `localStorage` diretamente.

## Deploy

Publicado na Vercel. O `vercel.json` traz o rewrite para `index.html`: sem ele, recarregar a página em qualquer rota interna retornaria 404, porque a Vercel procuraria um arquivo naquele caminho em vez de deixar o React Router resolver.

```bash
npx vercel --prod
```

## Documentação

- [PRODUCT.md](./PRODUCT.md) — visão de produto, usuários e princípios.
- [REQUISITOS.md](./REQUISITOS.md) — especificação funcional completa.
- [TECNICO.md](./TECNICO.md) — stack, integrações e modelo de dados.
- [DESIGN.md](./DESIGN.md) — identidade visual e diretrizes de UI.
- [personas.pdf](./personas.pdf) — as duas personas que guiaram as jornadas.

## Aviso

Projeto acadêmico sem fins comerciais. Usa assets e dados oficiais de Pokémon (imagens de cartas e modelos 3D) apenas para fins de estudo e demonstração. Pokémon é propriedade da The Pokémon Company, Nintendo e Game Freak.
