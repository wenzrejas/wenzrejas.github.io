interface ChoiceRowProps<Choice extends string> {
  label: string
  choices: readonly Choice[]
  names: Record<Choice, string>
  chosen: Choice
  onChoose: (choice: Choice) => void
}

export default function ChoiceRow<Choice extends string>({
  label,
  choices,
  names,
  chosen,
  onChoose,
}: ChoiceRowProps<Choice>) {
  return (
    <div className="settings__row">
      <span className="settings__label">{label}</span>
      <div className="settings__choices" role="group" aria-label={label}>
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            className="settings__choice"
            aria-pressed={choice === chosen}
            onClick={() => choice !== chosen && onChoose(choice)}
          >
            <span className="settings__choice-name">{names[choice]}</span>
            <span className="settings__choice-sizer" aria-hidden="true">
              {names[choice]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
