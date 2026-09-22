import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, Suspense, useCallback, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

// Duração de cada fase. O intervalo entre trocas é ENTER + IDLE: a saída fica
// DE FORA da conta de propósito, para que o Pokémon seguinte comece a entrar no
// mesmo instante em que o atual começa a sair (a sobreposição pedida).
export const ENTER_MS = 1600
export const IDLE_MS = 5000
export const EXIT_MS = 1200
export const SLOT_MS = ENTER_MS + IDLE_MS

const ENTER_S = ENTER_MS / 1000
const EXIT_S = EXIT_MS / 1000

const TWO_PI = Math.PI * 2
// Fração do espaço visível que o Pokémon pode ocupar. A escala é derivada do
// viewport em vez de ser um número fixo, para ele caber inteiro em qualquer
// resolução — era por aqui que ele estourava para fora do banner.
const MAX_HEIGHT_RATIO = 0.78
const MAX_WIDTH_RATIO = 0.34
const ENTER_SCALE = 0.62
const FLOAT_AMPLITUDE = 0.045
const FLOAT_SPEED = 1.7

const easeOutCubic = (t) => 1 - (1 - t) ** 3
const easeInCubic = (t) => t * t * t

function Actor({ url, leaving }) {
  const { scene } = useGLTF(url)
  const groupRef = useRef(null)
  const startRef = useRef(null)
  const leaveStartRef = useRef(null)

  // SkeletonUtils.clone, não scene.clone: estes modelos são rigados (o .glb tem
  // skins) e o clone padrão do three não refaz o vínculo com o esqueleto.
  //
  // A medição precisa de dois cuidados, senão cada Pokémon vem com um tamanho e
  // uma altura diferentes:
  //   1. updateMatrixWorld antes de medir, para os ossos já estarem posicionados;
  //   2. setFromObject com precise=true, que percorre vértice a vértice usando
  //      getVertexPosition — método que o SkinnedMesh sobrescreve APLICANDO o
  //      skinning. No caminho padrão o three usa só a caixa da geometria em bind
  //      pose vezes a matriz do mesh (quase sempre identidade num modelo rigado),
  //      e o resultado não tem relação com o que aparece na tela.
  const { size, center, model } = useMemo(() => {
    const model = SkeletonUtils.clone(scene)
    model.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(model, true)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    return { size, center, model }
  }, [scene])

  const { viewport } = useThree()

  // Cabe pela altura E pela largura: o menor dos dois fatores manda. O guarda
  // contra medida degenerada existe para que um .glb problemático apareça em
  // tamanho neutro em vez de tomar a tela inteira.
  const safe = (value) => (Number.isFinite(value) && value > 0.0001 ? value : 1)
  const baseScale = Math.min(
    (viewport.height * MAX_HEIGHT_RATIO) / safe(size.y),
    (viewport.width * MAX_WIDTH_RATIO) / safe(size.x),
  )

  const halfWidth = viewport.width / 2
  const enterX = halfWidth + viewport.width * 0.3
  // Descansa à esquerda, já que a ficha do Pokémon ocupa a metade direita do
  // banner. Este fator é o ajuste fino entre os dois: quanto menor, mais para
  // o centro ele para.
  const restX = -halfWidth * 0.44
  const exitX = -halfWidth - viewport.width * 0.3

  // Posiciona o grupo já no commit, antes do primeiro paint. Sem isso o modelo
  // pisca por um frame na escala bruta do .glb — que costuma ser gigante.
  const attachGroup = useCallback(
    (group) => {
      groupRef.current = group
      if (!group) return
      group.scale.setScalar(baseScale * ENTER_SCALE)
      group.position.set(enterX, 0, 0)
    },
    [baseScale, enterX],
  )

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return

    // Marcos de tempo lidos do relógio absoluto da cena, não acumulando delta:
    // é isso que faz os 5 segundos de idle serem exatos e não derivarem.
    if (startRef.current === null) startRef.current = clock.elapsedTime
    const t = clock.elapsedTime - startRef.current

    // Flutuação contínua: calculada a partir do tempo total para não dar um
    // salto quando a fase muda, e proporcional à cena para ter a mesma leitura
    // em qualquer resolução.
    const float = Math.sin(t * FLOAT_SPEED) * viewport.height * FLOAT_AMPLITUDE

    if (leaving) {
      if (leaveStartRef.current === null) leaveStartRef.current = clock.elapsedTime
      const lt = Math.min((clock.elapsedTime - leaveStartRef.current) / EXIT_S, 1)
      const eased = easeInCubic(lt)

      // Saída: uma volta só, tamanho travado, acelerando para fora da esquerda.
      group.position.x = THREE.MathUtils.lerp(restX, exitX, eased)
      group.position.y = float
      group.rotation.y = -TWO_PI * lt
      group.scale.setScalar(baseScale)
      return
    }

    if (t < ENTER_S) {
      const eased = easeOutCubic(t / ENTER_S)

      // Entrada: 2 voltas completas terminando em 0 — acabar num múltiplo de
      // 2π é o que garante que ele pare virado exatamente de frente.
      group.position.x = THREE.MathUtils.lerp(enterX, restX, eased)
      group.position.y = float
      group.rotation.y = -2 * TWO_PI * (1 - eased)
      group.scale.setScalar(baseScale * THREE.MathUtils.lerp(ENTER_SCALE, 1, eased))
      return
    }

    // Idle: parado no ponto de descanso, só flutuando.
    group.position.x = restX
    group.position.y = float
    group.rotation.y = 0
    group.scale.setScalar(baseScale)
  })

  // Grupo interno só para centralizar. O modelo em si nunca é mutado: setar
  // position/scale direto no <primitive> sobrescreveria a transformação que o
  // .glb já traz na raiz e desalinharia a centralização.
  return (
    <group ref={attachGroup}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={model} />
      </group>
    </group>
  )
}

class ActorErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

// Um único Canvas para todos os atores. Antes cada Pokémon criava o seu, o que
// abria vários contextos WebGL (o navegador limita o número deles e vaza ao
// remontar) e impedia que os dois dividissem o mesmo relógio.
export default function PokemonStage({ actors, className }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 35 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 5]} intensity={1.5} />
        <directionalLight position={[-4, 1, -3]} intensity={0.8} color="#ff5dcd" />
        <directionalLight position={[4, -2, -4]} intensity={0.6} color="#8b7bff" />
        {/* Um Suspense POR ator. Com um boundary compartilhado, o modelo que
            ainda estava carregando escondia também o que já estava em cena — e
            como a timeline usa o relógio absoluto, o tempo seguia correndo
            escondido e o Pokémon reaparecia já parado, sem a entrada. */}
        {actors.map((actor) => (
          <Suspense key={actor.id} fallback={null}>
            <ActorErrorBoundary>
              <Actor url={actor.url} leaving={actor.leaving} />
            </ActorErrorBoundary>
          </Suspense>
        ))}
      </Canvas>
    </div>
  )
}
