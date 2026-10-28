import KeyCap from './KeyCap'

const KEY_MARK = /\[([^\]]+)\]/

export default function KeyText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(KEY_MARK)
        .map((part, index) => (index % 2 === 1 ? <KeyCap key={index} label={part} /> : part))}
    </>
  )
}
