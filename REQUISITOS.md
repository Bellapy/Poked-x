# Pokedéx — Especificação de Requisitos

> Sistema de compra, venda e troca de cartas Pokémon. Trabalho de faculdade, individual, sem prazo fixo. Interface web totalmente client-side (sem backend, sem banco de dados real) — toda persistência acontece no `localStorage` do navegador.

## 1. Visão geral

O Pokedéx é um marketplace simulado de cartas Pokémon. Usuários se cadastram, recebem uma coleção inicial de cartas e um saldo em **PokeCoins** (moeda virtual), e podem comprar, vender e trocar cartas entre si dentro do próprio navegador. Não existe um servidor real por trás: tudo — usuários, cartas, saldo, anúncios e histórico — é simulado e persistido localmente.

O diferencial do projeto é visual e interativo: banner com modelos 3D de Pokémon reagindo ao mouse, cartas com efeito holográfico/parallax, e imagens de cartas em alta resolução vindas de uma API pública.

## 2. Escopo

**Está dentro do escopo:**
- Cadastro/login simulado, sem servidor real.
- Compra e venda de cartas usando moeda virtual (PokeCoins).
- Proposta e aceite de trocas de cartas entre usuários (simulado).
- Busca, filtros e destaques de cartas na home.
- Perfil do usuário com coleção, anúncios ativos e histórico de transações.
- Área administrativa para gerenciar usuários e cartas cadastradas.
- Efeitos visuais 3D/holográficos como diferencial de interface.

**Está fora do escopo (explicitamente):**
- Qualquer backend, API própria ou banco de dados real.
- Processamento real de pagamento (o checkout é inteiramente cosmético).
- Autenticação segura (sem hashing/criptografia de senha — é um projeto acadêmico simulado).
- Comunicação real entre usuários (trocas são aceitas por uma regra automática, não por outra pessoa real).
- Persistência entre dispositivos/navegadores (dados vivem só no `localStorage` daquele navegador).

## 3. Perfis de usuário

| Perfil | Descrição |
|---|---|
| **Visitante** | Não autenticado. Pode navegar na home, buscar/filtrar cartas e ver detalhes, mas não pode comprar, vender, propor troca ou acessar perfil/admin. |
| **Usuário autenticado** | Tem coleção própria, saldo em PokeCoins, pode publicar anúncios, comprar, propor trocas e ver seu histórico. |
| **Administrador** | Usuário autenticado com permissão extra: acessa área de administração para ver/gerenciar todos os usuários e todas as cartas cadastradas no sistema. |

O sistema já é semeado (seed) com usuários fake pré-cadastrados, incluindo pelo menos um administrador, para facilitar testes e a correção do trabalho.

## 4. Funcionalidades detalhadas

### 4.1 Página inicial

- **Banner principal**: carrossel dinâmico. Cada slide mostra um Pokémon em destaque com:
  - Fundo: arte oficial em alta resolução daquele Pokémon, desfocada (`blur`), sobreposta a um gradiente de cor.
  - Primeiro plano: modelo 3D do Pokémon, girando sozinho e reagindo ao movimento do mouse (parallax/rotação adicional).
  - Avança automaticamente após alguns segundos, ou o usuário pode navegar manualmente (setas/dots).
  - Os Pokémon exibidos são escolhidos dinamicamente a partir das cartas em destaque do momento (sem curadoria manual).
- **Cartas em destaque**: mistura de cartas raras (raridade alta) e cartas anunciadas recentemente, com rotação/aleatoriedade a cada carregamento.
- **Busca e filtros**: campo de busca por nome, com filtros por tipo do Pokémon, edição/set, raridade, faixa de preço, estado de conservação e tipo de anúncio (venda ou troca).
- Cada carta exibida usa efeito holográfico/tilt ao passar o mouse (efeito 3D construído sobre a arte 2D da carta, sem malha poligonal).

### 4.2 Cadastro e autenticação (simulados)

- Tela de registro: nome, e-mail, senha (armazenada em texto simples — não há criptografia real, é um projeto acadêmico simulado). Ao registrar, o usuário recebe:
  - Saldo inicial fixo em PokeCoins.
  - Uma coleção inicial de cartas, sorteada a partir da Pokémon TCG API.
- Tela de login: confere e-mail/senha contra os usuários salvos no `localStorage`.
- Sessão do usuário logado também é mantida no `localStorage`.
- Seed inicial: 2–3 usuários fake pré-cadastrados (um deles administrador), para não depender de cadastro manual na demonstração.

### 4.3 Página de detalhes da carta

Exibe:
- Nome, imagem em alta resolução, tipo, edição/set, raridade.
- Estado de conservação (escala simplificada em português: **Nova, Seminova, Usada, Danificada**).
- Se está à venda: preço em PokeCoins e botão "Adicionar ao carrinho".
- Se está disponível para troca: botão "Propor troca".
- Efeito holográfico/tilt reagindo ao mouse.

### 4.4 Publicação de cartas (venda ou troca)

- O usuário publica anúncios **a partir da própria coleção** (não cadastra cartas "do nada" — a coleção já vem seedada e pode crescer por compras/trocas).
- Ao publicar, escolhe: tipo de anúncio (venda ou troca), preço (se venda) ou aceita ofertas de troca (se troca), e confirma o estado de conservação.

### 4.5 Carrinho de compra e proposta de troca

Fluxos **separados** (não se misturam no mesmo checkout):

- **Carrinho de compra**: usuário adiciona cartas à venda, define quantidade, e segue para o checkout de compra.
- **Proposta de troca**: usuário escolhe uma carta alheia disponível para troca e seleciona uma ou mais cartas da própria coleção para oferecer em troca. O aceite é automático/simulado (ex.: aceita sempre, ou aceita quando o valor de mercado somado das cartas ofertadas é maior ou igual ao valor da carta desejada).

### 4.6 Checkout de compra

Tela cosmética, sem processamento real, exibindo:
- Valor total da(s) carta(s).
- Quantidade.
- Valor estimado de frete (calculado de forma fictícia).
- Prazo de entrega (fixo ou aleatório dentro de uma faixa).
- Forma de pagamento (seleção visual, ex.: Pix / Cartão / Boleto — sem processar nada de fato).
- Ao confirmar: debita o saldo em PokeCoins, transfere a carta para a coleção do comprador, e registra a transação no histórico.

### 4.7 Perfil do usuário

- Dados do usuário e saldo atual em PokeCoins.
- Lista de cartas da própria coleção.
- Lista de anúncios ativos (à venda / disponíveis para troca).
- Histórico de transações: data, tipo de operação (compra, venda, troca enviada, troca recebida), carta(s) envolvida(s), valor (quando aplicável) e status.

### 4.8 Área administrativa

Acessível apenas para usuários com perfil de administrador:
- **Gerenciar usuários**: listar todos os usuários, ver saldo e coleção de cada um, bloquear/desbloquear ou remover uma conta.
- **Gerenciar cartas**: visualizar todas as cartas/anúncios cadastrados no sistema, editar ou remover qualquer um. Não há fluxo de aprovação prévia — os anúncios já entram visíveis no mercado assim que publicados.

## 5. Regras de negócio

- **Moeda**: PokeCoins. Todo novo usuário recebe um saldo inicial fixo. O saldo aumenta vendendo cartas ou recebendo em trocas vantajosas; existe também um botão de "adicionar saldo" fictício (sem gateway real), para não travar testes/demonstração caso o saldo zere.
- **Estado de conservação**: Nova, Seminova, Usada, Danificada — definido pelo vendedor ao publicar o anúncio.
- **Trocas**: sempre exigem que o proponente ofereça ao menos uma carta da própria coleção; o aceite é decidido por uma regra automática (não há uma "outra pessoa real" para aprovar manualmente).

## 6. Requisitos não funcionais

- **Persistência**: 100% em `localStorage` do navegador — nenhum dado sai da máquina do usuário, nenhuma chamada a servidor próprio.
- **Responsividade**: desktop-first, mas funcional em mobile. Efeitos de tilt/parallax por mouse são desabilitados graciosamente em dispositivos touch.
- **Performance visual**: uso de bibliotecas de animação/3D deve manter a interface fluida mesmo com múltiplos efeitos simultâneos (banner 3D + cartas com tilt).
- **Deploy**: publicado em um link público na Vercel, além de poder rodar localmente via `npm run dev`.

## 7. Fontes de dados externas

- **Pokémon TCG API** (pokemontcg.io): dados e imagens em alta resolução das cartas (nome, tipo, edição, raridade, artwork).
- **Pokemon3D API** (github.com/Pokemon-3D-api/assets): modelos 3D (`.glb`) dos Pokémon usados no banner.

Detalhes de integração, cache e modelagem de dados estão no documento técnico ([TECNICO.md](TECNICO.md)).
