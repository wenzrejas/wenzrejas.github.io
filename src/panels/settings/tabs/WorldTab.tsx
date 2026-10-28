import { SETTINGS_COPY } from '@/data/settingsCopy'
import { DAY_LENGTH_CHOICES, TIME_CHOICES, WEATHER_CHOICES, WILDLIFE_CHOICES } from '../constants'
import ResetProgressRow from '../rows/ResetProgressRow'
import SettingChoiceRow from '../rows/SettingChoiceRow'
import SettingSwitchRow from '../rows/SettingSwitchRow'

const { world } = SETTINGS_COPY

export default function WorldTab() {
  return (
    <>
      <SettingChoiceRow
        label={world.timeOfDay}
        setting="timeOfDay"
        choices={TIME_CHOICES}
        names={world.timeChoices}
      />
      <SettingChoiceRow
        label={world.weather}
        setting="weather"
        choices={WEATHER_CHOICES}
        names={world.weatherChoices}
      />
      <SettingChoiceRow
        label={world.dayLength}
        setting="dayLength"
        choices={DAY_LENGTH_CHOICES}
        names={world.dayLengthChoices}
      />
      <SettingChoiceRow
        label={world.wildlife}
        setting="wildlife"
        choices={WILDLIFE_CHOICES}
        names={world.wildlifeChoices}
      />
      <SettingSwitchRow label={world.remarks} setting="areRemarksOn" />
      <ResetProgressRow />
    </>
  )
}
