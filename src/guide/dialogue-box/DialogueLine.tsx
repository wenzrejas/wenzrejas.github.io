import KeyText from '@/panels/shared/key-cap/KeyText'

export default function DialogueLine({ line }: { line: string }) {
  return (
    <p className="dialogue-box__line">
      <KeyText text={line} />
    </p>
  )
}
