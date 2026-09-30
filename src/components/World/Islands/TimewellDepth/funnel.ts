import { WHIRLPOOL_FUNNEL_CURVE, WHIRLPOOL_FUNNEL_DEPTH } from './constants'

export const funnelDip = (share: number) =>
  WHIRLPOOL_FUNNEL_DEPTH * Math.max(0, 1 - share) ** WHIRLPOOL_FUNNEL_CURVE
