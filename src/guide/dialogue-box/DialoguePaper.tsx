export default function DialoguePaper() {
  return (
    <svg
      className="dialogue-box__paper"
      viewBox="0 0 680 360"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="dialogue-box__shadow"
        d="M44 19 645 22Q671 25 670 50L667 325Q666 345 638 344L43 342Q21 342 21 318L23 142 4 125 24 116 25 44Q23 24 44 19Z"
      />
      <path
        className="dialogue-box__sheet"
        d="m40 10 198 3 196-4 203 7q23 0 26 26l-3 109 3 106-5 56q-1 22-27 22l-201-3-195 3-193-4q-22-1-23-23l3-107-2-63L1 120l21-11 1-68q-1-23 17-31Z"
      />
      <path
        className="dialogue-box__crease"
        d="m40 11-5 19-12 4m621-16-2 16 19 8M20 308l16 3 5 19m590 4 2-16 24-5"
      />
    </svg>
  )
}
