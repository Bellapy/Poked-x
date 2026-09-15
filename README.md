# Pokedéx

Marketplace simulado de compra, venda e troca de cartas Pokémon — trabalho acadêmico, 100% front-end, sem backend ou banco de dados real. Toda a persistência acontece no `localStorage` do navegador.

## Destaques

- Banner com modelos 3D de Pokémon interativos (`react-three-fiber`), reagindo ao mouse.
- Efeito holográfico/parallax nas cartas.
- Imagens de cartas em alta resolução via [Pokémon TCG API](https://pokemontcg.io/).
- Autenticação, moeda virtual (PokeCoins), compra, venda e troca de cartas — tudo simulado no `localStorage`.

## Stack

React + Vite, Tailwind CSS, React Router, Framer Motion, three.js / react-three-fiber.

## Rodando localmente

```bash
npm install
npm run dev
```

## Documentação

- [REQUISITOS.md](./REQUISITOS.md) — especificação funcional completa.
- [TECNICO.md](./TECNICO.md) — stack, integrações e modelo de dados.
