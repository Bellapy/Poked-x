# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Colecionadores de cartas Pokémon que querem negociar cartas com outros colecionadores — comprando, vendendo ou trocando — numa experiência rápida e visualmente satisfatória, sem fricção de cadastro real.

## Product Purpose

Simular, inteiramente no navegador (sem backend, sem banco de dados real), um marketplace completo de cartas Pokémon: cadastro/login, coleção pessoal, publicação de anúncios de venda/troca, compra com moeda virtual, proposta e aceite de trocas, histórico de transações e uma área administrativa. É um trabalho de faculdade que também serve como peça de portfólio, então o acabamento visual e a qualidade de código importam tanto quanto a funcionalidade.

## Positioning

Diferente de um catálogo estático de cartas, este projeto reproduz o ciclo completo de negociação (moeda, trocas, histórico) e entrega uma experiência de "vitrine" com um banner 3D interativo (modelo do Pokémon reagindo ao mouse) e efeito holográfico/parallax nas próprias cartas — tudo isso sem exigir nenhum servidor.

## Operating Context

Rodado localmente via `npm run dev` (Vite) e publicado publicamente na Vercel para facilitar a correção. Usado em um único navegador por vez: os dados (usuários, saldo, coleção, anúncios, histórico) vivem no `localStorage` e não sincronizam entre dispositivos ou navegadores. Repositório: https://github.com/Bellapy/Poked-x.

## Capabilities and Constraints

- Sem backend, sem API própria, sem banco de dados real — toda a persistência é `localStorage`.
- Autenticação simulada: sem criptografia/hash de senha real (projeto acadêmico simulado).
- Moeda virtual "PokeCoins": saldo inicial fixo ao registrar, cresce vendendo cartas ou em trocas vantajosas; existe um botão de recarga fictício.
- Compra e troca são fluxos **separados** — não se misturam no mesmo carrinho/checkout.
- Checkout (frete, prazo, forma de pagamento) é inteiramente cosmético, sem processar nada de fato.
- Trocas são aceitas por uma regra automática — não existe uma segunda pessoa real do outro lado.
- Estado de conservação da carta usa escala simplificada em português: Nova, Seminova, Usada, Danificada.
- Área administrativa não tem fluxo de moderação/aprovação prévia — é apenas visualizar, editar e remover usuários/cartas já publicados.
- Dados e imagens de cartas vêm da Pokémon TCG API (pokemontcg.io), com cache local para não depender de rede a cada navegação.
- Modelos 3D do banner vêm da Pokemon3D API (github.com/Pokemon-3D-api/assets, `.glb`), com fallback gracioso se um modelo específico não carregar.
- Responsivo desktop-first: efeitos de tilt/parallax por mouse devem se desligar graciosamente em touch.

## Brand Commitments

Nome do projeto: **Pokedéx**. Usa assets e dados oficiais de Pokémon (imagens de cartas e modelos 3D) sob uso não comercial/acadêmico — essa ressalva deve ser mantida visível (ex.: rodapé ou apresentação do trabalho).

## Evidence on Hand

Nenhum dado de usuário real — apenas usuários fake seedados (incluindo 1 administrador) para demonstração. Especificação funcional completa em `REQUISITOS.md`; stack e modelo de dados em `TECNICO.md`.

## Product Principles

1. Impacto visual e interatividade (3D, holográfico) são requisito do trabalho, não polimento opcional.
2. Tudo precisa caber em `localStorage` — nenhuma funcionalidade nova pode assumir um servidor.
3. Compra e troca nunca se misturam no mesmo fluxo.
4. Onde não há uma pessoa real do outro lado (trocas, aprovação de anúncios), prefira uma regra simples e automática à simulação de realismo desnecessário.
5. Uso de propriedade intelectual de Pokémon é sempre não comercial/acadêmico.
