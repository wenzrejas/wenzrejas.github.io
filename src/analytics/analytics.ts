type AnalyticsEvent =
  | 'loading_completed'
  | 'webgl_failed'
  | 'island_discovered'
  | 'panel_opened'
  | 'project_gallery_opened'
  | 'project_link_clicked'
  | 'social_link_clicked'
  | 'contact_form_submitted'
  | 'contact_form_failed'
  | 'world_map_opened'
  | 'fast_travel'
  | 'depths_entered'
  | 'milestone_viewed'
  | 'regatta_started'
  | 'regatta_finished'
  | 'regatta_abandoned'
  | 'bottle_found'
  | 'achievement_earned'

type EventData = Record<string, string | number | boolean>

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void }
  }
}

export function trackEvent(event: AnalyticsEvent, data?: EventData) {
  const send = () => window.umami?.track(event, data)
  if (document.readyState === 'complete') send()
  else window.addEventListener('load', send, { once: true })
}
