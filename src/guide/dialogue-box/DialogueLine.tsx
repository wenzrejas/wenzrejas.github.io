import KeyCap from './KeyCap'

const KEY_MARK = /\[([^\]]+)\]/

export default function DialogueLine({ line }: { line: string }) {
  return (
    <p className="dialogue-box__line">
      {line
        .split(KEY_MARK)
        .map((part, index) => (index % 2 === 1 ? <KeyCap key={index} label={part} /> : part))}
    </p>
  )
}
