import { memo, type CSSProperties } from 'react'
import { CARTOUCHE_ART_URLS } from './constants'
import './Cartouche.scss'

const ART_STYLE = Object.fromEntries(
  Object.entries(CARTOUCHE_ART_URLS).map(([state, url]) => [`--art-${state}`, `url(${url})`])
) as CSSProperties

function Cartouche() {
  return (
    <span className="cartouche" style={ART_STYLE} aria-hidden="true">
      <span className="cartouche__art cartouche__art--default" />
      <span className="cartouche__art cartouche__art--hover" />
      <span className="cartouche__art cartouche__art--pressed" />
    </span>
  )
}

export default memo(Cartouche)
