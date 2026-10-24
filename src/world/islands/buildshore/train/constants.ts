// ── Model nodes ───────────────────────────────────────────────────────────────
export const TRAIN_ROUTE_NODE = 'Buildshore_TrainRoute'
export const CONNECTING_ROD_ROLE = 'train_connecting_rod'
export const CRANK_PIN_NAME = 'rod_pin'

// ── Motion (model units, seconds) ─────────────────────────────────────────────
export const TRAIN_CRUISE_SPEED = 3.2
export const TRAIN_ACCELERATION = 0.9
export const TRAIN_BRAKING = 1.2
export const STATION_DWELL_SECONDS = 5
export const STATION_ARRIVAL_GAP = 0.005

// ── Sound (world units from the ship; levels are shares of full volume) ───────
export const TRAIN_SOUND_FULL_DISTANCE = 40
export const TRAIN_SOUND_SILENT_DISTANCE = 200
export const TRAIN_ENGINE_IDLE_LEVEL = 0.35
export const TRAIN_SOUND_RAMP_SECONDS = 0.6
export const TRAIN_SOUND_FADE_SECONDS = 1.5
export const TRAIN_SOUND_LEVEL_STEP = 0.02
export const TRAIN_WHISTLE_MIN_NEARNESS = 0.05
