---
name: Pokedéx
description: Marketplace de cartas Pokémon como uma máquina de cápsulas arcade — cada carta é uma vitrine iluminada.
colors:
  glow-rare: "#3ddbe0"
  glow-common: "#f2a33d"
  glow-ultra-a: "#ff6ad5"
  glow-ultra-b: "#7c8cff"
  arcade-bg: "#0d0e13"
  arcade-panel: "#23262f"
  arcade-panel-light: "#363a46"
  ink: "#f4f3f0"
  ink-muted: "#9b98ac"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "Space Grotesk, sans-serif"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Space Mono, monospace"
    fontWeight: 400
    letterSpacing: "normal"
rounded:
  pill: "999px"
  md: "12px"
  lg: "16px"
  xl: "28px"
components:
  button-nav:
    backgroundColor: "{colors.arcade-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px"
  input-search:
    backgroundColor: "{colors.arcade-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px 8px 44px"
  card-vitrine:
    backgroundColor: "{colors.arcade-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px"
---

# Design System: Pokedéx

## Overview

**Creative North Star: "A Máquina de Cápsulas"**

O Pokedéx não se parece com uma loja online — parece a parede de vidro retroiluminada de uma máquina de cápsulas arcade, num salão escuro. Cada carta é uma vitrine numerada com brilho próprio; a cor daquele brilho conta a raridade antes mesmo de você ler o nome. Não é um tema decorativo por cima de uma grade de cards genérica: é o próprio sistema de leitura da raridade e do estado da interface.

O fundo é sempre quase-preto (nunca preto puro), para que o brilho das vitrines seja a única fonte real de cor viva na tela — o resto (metal escovado dos painéis, tipografia clara) fica deliberadamente contido. Rejeitamos tanto o Pokédex vermelho-e-amarelo-arredondado (a leitura óbvia da marca) quanto o marketplace escuro genérico com gradiente neon roxo/azul (o clichê de qualquer clone de loja de cards).

**Key Characteristics:**
- Fundo quase-preto de cabine de arcade, nunca preto puro.
- Brilho colorido atrás de cada carta comunica raridade (âmbar → ciano → holo).
- Controles (botões, filtros) em blocos de cor chapada com cantos bem arredondados, como um painel físico.
- Etiquetas e preços em mono; nomes e títulos em uma grotesca geométrica com personalidade.

## Colors

A paleta é quase monocromática (quase-preto + metal) até que a raridade de uma carta acende um brilho — a cor é sempre informação, nunca decoração solta.

### Primary
- **Ciano Vitrine** (`#3ddbe0`): brilho de cartas raras, anel de foco de inputs/selects, indicador ativo do carrossel.

### Secondary
- **Âmbar Comum** (`#f2a33d`): brilho de cartas comuns/incomuns — o tom "de base" da máquina.

### Tertiary
- **Holo Magenta** (`#ff6ad5`) + **Holo Azul** (`#7c8cff`): par usado só no gradiente cônico de cartas ultra-raras (`.holo-glow`). Reservado — perde o efeito se usado em qualquer outro lugar.

### Neutral
- **Preto de Cabine** (`#0d0e13`): fundo base de toda a interface.
- **Painel Metal** (`#23262f`): fundo de cartões, inputs, selects, molduras.
- **Painel Metal Claro** (`#363a46`): bordas e divisores sobre o painel.
- **Marfim** (`#f4f3f0`): texto principal.
- **Lavanda Apagada** (`#9b98ac`): texto secundário — tingida de frio, nunca cinza puro.

### Named Rules
**The Glow-Is-Information Rule.** Uma cor de brilho só aparece atrás de uma carta para comunicar raridade. Nenhuma outra superfície da interface pode usar essas três cores como decoração genérica.

## Typography

**Display Font:** Space Grotesk (com fallback sans-serif)
**Body Font:** Space Grotesk (mesma família, peso mais leve)
**Label/Mono Font:** Space Mono

**Character:** Space Grotesk é uma grotesca geométrica com personalidade de hardware de console — carrega o "peso de aparelho" do tema sem recorrer a fontes decorativas ou clichês de ficção científica. Space Mono entra só onde há dado real (preço, raridade, código de vitrine), nunca como estilo.

### Hierarchy
- **Display** (700, 1.75–2rem, 1.1): nomes de Pokémon no banner, títulos de seção.
- **Body** (500, 0.875–1rem, 1.5): texto corrido, nomes de carta na grade.
- **Label** (400, 0.6875–0.75rem, mono, tabular): código de vitrine ("PRC-1"), contagem de resultados, numeração do carrossel.

### Named Rules
**The Mono-Is-Data Rule.** Space Mono só aparece em cima de um valor real (preço, contagem, número de série). Usá-lo como flavor text tipográfico é proibido.

## Layout

Conteúdo centralizado em `max-w-6xl`, respiro generoso entre seções (`mt-12`). A grade de cartas é responsiva por `grid-cols`, de 2 colunas no mobile a 8–10 no desktop, sem grade fixa em pixels.

## Elevation & Depth

Não há sombra neutra de elevação — a profundidade vem do brilho colorido por trás de cada vitrine (um verdadeiro `box-shadow` com deslocamento vertical e blur, nunca um halo sem deslocamento) mais o anel metálico ao redor do vidro. A moldura externa do banner usa uma sombra escura neutra e pesada para separá-lo do fundo.

### Shadow Vocabulary
- **Brilho de raridade** (`0 10px 30px -8px var(--color-glow-*)`): atrás de cada vitrine no hover, cor conforme a raridade.
- **Sombra de moldura** (`0 20px 50px -20px rgba(0,0,0,0.8)`): sob o painel do banner, para separá-lo do fundo.

### Named Rules
**The Colored-Shadow-Has-a-Reason Rule.** Uma sombra colorida só existe onde há uma vitrine real de carta; qualquer outra superfície usa sombra neutra ou nenhuma sombra.

## Shapes

Cantos muito arredondados em toda parte que representa um controle físico: pills (`999px`) em inputs, selects e botões; `16px`–`28px` nas molduras de vidro/janela. Bordas finas de metal (`1–2px`, `--color-arcade-panel-light`) contornam cada vitrine e painel — nunca uma borda colorida lateral.

## Components

### Buttons (navegação do carrossel)
- **Shape:** círculo (`rounded-full`, 40px)
- **Estilo:** fundo `arcade-panel`, ícone traçado (nunca emoji/glifo Unicode)
- **Hover/Focus:** anel + sombra ciano (`ring-glow-rare`, `shadow-[...var(--color-glow-rare)]`)

### Inputs / Campos (busca)
- **Estilo:** pill (`rounded-full`), fundo `arcade-panel`, ícone de busca à esquerda
- **Focus:** anel ciano de 2px (`focus-visible:ring-glow-rare`)

### Selects (filtros)
- **Estilo:** mesma pill dos inputs, seta customizada desenhada (nunca a seta nativa do navegador)

### Cards / Vitrines
- **Corner Style:** `rounded-2xl` (16px)
- **Background:** `arcade-panel`, com halo desfocado da cor de raridade atrás da imagem
- **Shadow Strategy:** ver Elevation & Depth — brilho de raridade só no hover
- **Border:** anel de 1px `arcade-panel-light`, clareia no hover
- **Internal Padding:** `12px`

## Do's and Don'ts

### Do:
- **Do** usar a cor de brilho (âmbar/ciano/holo) exclusivamente para indicar raridade.
- **Do** manter o fundo quase-preto, nunca preto puro (`#0d0e13`, não `#000`).
- **Do** desenhar ícones como SVG de traço único — nunca emoji ou glifo Unicode.
- **Do** usar Space Mono só sobre dado real (preço, contagem, código).

### Don't:
- **Don't** aplicar o gradiente holo em texto — ele existe só como brilho/fundo atrás da vitrine.
- **Don't** usar a estrutura de "card genérico" (ícone + título + texto) fora do contexto de vitrine de carta.
- **Don't** introduzir uma quarta cor de acento fora das três de raridade.
- **Don't** usar borda colorida lateral (`border-left`) em qualquer elemento.
