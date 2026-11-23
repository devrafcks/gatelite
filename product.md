# product.md — Gatélite

> Documento de produto · versão 1.0 · 22/11/2026
> Status: **MVP construído** (Next.js 16 + shadcn/ui + Tabler Icons, sem banco de dados).

---

## 1. Resumo

**Gatélite** mostra o seu lugar pelos olhos dos satélites. Você escolhe um ponto no mapa e vê:

1. **A imagem de hoje**: o que os satélites fotografaram ali, em cor real, infravermelho, luzes da noite, fumaça ou temperatura.
2. **Quem passou por cima**: quais satélites de observação (Landsat, Sentinel-2, Terra, Aqua, CBERS, Amazonia-1…) cruzaram o céu nas últimas e nas próximas 24 h, se o lugar caiu dentro da faixa de imagem e, quando existe, a foto daquele dia.
3. **Como mudou**: time-lapse do mesmo dia do ano, de 2001 até hoje, e comparação antes/depois.
4. **O que está acontecendo**: queimadas, tempestades, vulcões e icebergs ativos (NASA EONET), perto de você e no planeta.
5. **A Terra inteira**: as fotos reais do planeta tiradas hoje pela câmera EPIC, a 1,5 milhão de km.

> *Gatélite* é gato com satélite: um gato curioso no alto do planeta, olhando o céu, enquanto os satélites olham de volta para a Terra.

**Por que existe:** os dados de observação da Terra são abertos, mas espalhados por portais técnicos (Worldview, Earthdata, CelesTrak). O Gatélite junta tudo num lugar só, em português, bonito e fácil, e liga duas coisas que ninguém liga de forma simples: **o satélite** e **a foto que ele tirou**.

---

## 2. Público

| Persona | O que quer |
|---|---|
| Curioso de ciência e espaço | Ver a própria casa ou cidade do espaço, saber "quem está olhando agora" |
| Produtor rural, ambientalista, jornalista | Acompanhar queimadas, desmatamento, enchentes e seca numa região |
| Estudante e professor | Material visual sobre sensoriamento remoto, órbitas e o clima |
| Comunidade dev e recrutadores | Projeto de portfólio com dados reais, performance e acessibilidade |

**Não-objetivos:** não é ferramenta GIS profissional, não baixa cenas brutas e não faz análise científica.

---

## 3. Funcionalidades

### 3.1 Explorar (`/explorar`) — o coração
Mapa em tela cheia com painel lateral (desktop) ou folha inferior (celular). O estado fica todo na URL (`lat`, `lng`, `z`, `data`, `camada`, `aba`), então qualquer visão vira link.

| Aba | O que faz | Fonte |
|---|---|---|
| **Imagem** | Data com dia anterior/seguinte, 10 camadas (cor real Terra/Aqua/NOAA-20/NOAA-21, Landsat + Sentinel 30 m, mosaico detalhado para ver a rua, infravermelho 7-2-1, luzes da noite, temperatura da superfície, aerossóis), opacidade | NASA GIBS (WMTS), Esri World Imagery |
| **Satélites** | Passagens dos últimos e próximos 24 h sobre o ponto: dentro ou fora da faixa, de dia ou de noite, a que distância. Clicar mostra o rastro e a faixa no mapa, e "ver a imagem desse dia" troca a camada | CelesTrak + SGP4 (satellite.js) |
| **Tempo** | Últimos 14 dias com a nuvem estimada de cada um e atalho para o dia mais limpo, nascer e pôr do Sol, time-lapse anual do mesmo dia (2001 → hoje) e antes/depois com cortina arrastável | NASA GIBS (WMS), astronomy-engine |
| **Eventos** | Eventos naturais ativos por distância do ponto, com voo até cada um | NASA EONET v3 |

Extras: busca de lugares, nome do ponto tocado no mapa, "minha localização", salvar lugar, copiar link.

### 3.2 Planeta (`/planeta`)
- Visualizador EPIC: as fotos do dia do planeta inteiro, girando, com escolha de data.
- Foto astronômica do dia (APOD).
- Panorama dos eventos ativos por categoria.

### 3.3 Satélites (`/satelites`)
- Globo com a posição ao vivo de cada satélite acompanhado (atualiza a cada segundo).
- Ficha de cada um: operador, sensor, resolução, largura da faixa, altitude, velocidade, se está no dia ou na noite.

### 3.4 Lugares (`/lugares`)
- Lugares salvos no aparelho, com miniatura da imagem mais recente de cada um.

### 3.5 Marca (`/marca`) e Sobre (`/sobre`)
- Logos, cores, tipografia e downloads dos SVGs.
- Fontes de dados, créditos, privacidade.

---

## 4. Fontes de dados (testadas em 22/11/2026)

| API | Uso | Chave | Status |
|---|---|---|---|
| **NASA GIBS WMTS/WMS** `gibs.earthdata.nasa.gov` | Camadas diárias, HLS 30 m, luzes da noite, time-lapse | Não | ✅ |
| **NASA EPIC** `epic.gsfc.nasa.gov/api` | Fotos do planeta inteiro (~13/dia, atraso de 1 a 3 dias) | Não | ✅ |
| **NASA EONET v3** `eonet.gsfc.nasa.gov/api/v3` | Eventos naturais ativos | Não | ✅ (às vezes lento: cache + reserva) |
| **NASA APOD** `api.nasa.gov/planetary/apod` | Foto astronômica do dia | `NASA_API_KEY` (opcional, DEMO_KEY por padrão) | ✅ (DEMO_KEY tem limite: cache de horas) |
| **CelesTrak GP** `celestrak.org` | Elementos orbitais (OMM) dos satélites | Não | ✅ (cache ≥ 2 h + cópia local de reserva) |
| **Photon / Open-Meteo Geocoding** | Busca de lugares | Não | ✅ |
| NASA FIRMS | Focos de calor | Chave gratuita | Fora do MVP |
| ❌ Mars Rover Photos, Earth Imagery (Landsat), DONKI FLR | — | — | Fora do ar, evitadas |

---

## 5. Arquitetura

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components, `use cache`) |
| UI | shadcn/ui (Base UI) + Tailwind CSS v4 + Tabler Icons |
| Mapa | MapLibre GL 6 (globo + raster GIBS) |
| Órbitas | satellite.js (SGP4) a partir de OMM da CelesTrak |
| Astronomia | astronomy-engine (Sol no lugar e na hora da passagem) |
| Estado | URL (nuqs) para a visão; Zustand persistido para lugares salvos |
| Dados no cliente | TanStack Query |
| Testes | Vitest no domínio |

**Sem banco de dados:** a URL guarda a visão, o aparelho guarda os lugares, o servidor só faz cache das APIs externas (`use cache` + `cacheLife`). Os elementos orbitais têm uma cópia local de reserva.

```
src/
  domain/      regras puras, testadas: catálogo de satélites, órbitas e passagens, camadas GIBS, eventos
  server/      clientes das APIs externas com cache e reserva
  app/         páginas e rotas /api
  components/  ui (shadcn), mapa, explorar, planeta, site, marca
```

---

## 6. Marca

- **Nome:** Gatélite (gato + satélite). **Slogan:** *A Terra de hoje, vista de cima.*
- **Símbolo:** um gato sentado no alto de um planeta, de costas, olhando uma estrela laranja. Ilustração geométrica: o planeta é feito de faixas paralelas, o gato tem listras cortadas nas costas e o rabo termina num cacho (referência: o rei geométrico).
- **Logotipo:** GATÉLITE em Anybody larga (150%), SemiBold, com o **I em laranja**.
- **Cores:** noite `#08090D`, tinta `#0E0E12`, laranja `#FF5A1F`, âmbar `#FFB547`, atmosfera `#2B5BD7`, papel `#F4F3F1`.
- **Tipografia:** Anybody (display, larga) · Geist (interface) · Geist Mono (medidas).
- **Ícones:** Tabler Icons, traço 1,5. **Tema:** só escuro.
- **Adesivos:** selo "olha pra cima", satélite, planeta com anel, cometa, lua, o gato, pino, na mesma linguagem geométrica.
- Referências visuais: [`references/README.md`](references/README.md).

---

## 7. Roadmap

- **Feito (MVP):** explorar com 4 abas, planeta, satélites ao vivo, lugares, marca, sobre, APIs com cache.
- **Próximo:** focos de calor FIRMS (chave gratuita), alerta de "satélite passando agora" com notificação local, exportar time-lapse como vídeo/GIF, PWA instalável, inglês e espanhol.
- **Depois:** comparar dois lugares, camadas de radar (Sentinel-1), índice de vegetação (NDVI).

## 8. Riscos

| Risco | Mitigação |
|---|---|
| APIs da NASA lentas ou fora do ar | Cache no servidor, timeout, reserva local e mensagem clara na tela |
| Limite do DEMO_KEY | Cache de horas e `NASA_API_KEY` opcional |
| Imagens HLS esparsas (só onde houve cena sem nuvem) | A interface avisa e sugere a camada diária |
| WebGL pesado no celular | Globo leve no MapLibre, imagens sob demanda |
