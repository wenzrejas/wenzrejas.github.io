export default function Lighting() {
  return (
    <>
      {/* Sky-to-ocean ambient — pale blue from above, deep blue from below */}
      <hemisphereLight args={['#c8e0ff', '#1a3a5c', 2.5]} />

      {/* Sun — matches Sky component sunPosition={[1, 0.3, 0]}, warm golden */}
      <directionalLight position={[10, 3, 0]} intensity={4.0} color="#ffe8b0" />
    </>
  )
}
