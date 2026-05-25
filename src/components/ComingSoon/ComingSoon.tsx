import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Scene from './Scene'
import styles from './ComingSoon.module.css'

const TITLE = 'WENZ'

export default function ComingSoon() {
  const wrapperRef  = useRef()
  const cursorRef   = useRef()
  const glowRef     = useRef()
  const badgeRef    = useRef()
  const titleRef    = useRef()
  const lettersRef  = useRef([])
  const nameRef     = useRef()
  const taglineRef  = useRef()
  const linksRef    = useRef()

  useEffect(() => {
    // ── Cursor tracking ──────────────────────────────────
    const xCursor = gsap.quickTo(cursorRef.current, 'x', { duration: 0.15, ease: 'power2.out' })
    const yCursor = gsap.quickTo(cursorRef.current, 'y', { duration: 0.15, ease: 'power2.out' })
    const xGlow   = gsap.quickTo(glowRef.current,   'x', { duration: 0.7,  ease: 'power2.out' })
    const yGlow   = gsap.quickTo(glowRef.current,   'y', { duration: 0.7,  ease: 'power2.out' })

    const onMouseMove = (e) => {
      xCursor(e.clientX); yCursor(e.clientY)
      xGlow(e.clientX);   yGlow(e.clientY)
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Entrance animation ───────────────────────────────
    const validLetters = lettersRef.current.filter(Boolean)
    const linkEls      = Array.from(linksRef.current?.children ?? [])

    gsap.set(
      [badgeRef.current, validLetters, nameRef.current, taglineRef.current, ...linkEls],
      { opacity: 0 },
    )

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    tl.fromTo(badgeRef.current,
      { opacity: 0, y: 30, scale: 0.85 },
      { opacity: 1, y: 0,  scale: 1,   duration: 0.9 },
      0.3
    )
    .fromTo(validLetters,
      { opacity: 0, y: 160 },
      { opacity: 1, y: 0,  duration: 1.1, stagger: 0.07, ease: 'expo.out' },
      0.4
    )
    .fromTo(nameRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0,  duration: 0.7 },
      1.2
    )
    .fromTo(taglineRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0,  duration: 0.7 },
      1.4
    )
    .fromTo(linkEls,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0,  duration: 0.5, stagger: 0.1 },
      1.6
    )

    // ── Letter hover bounce ──────────────────────────────
    validLetters.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { y: -14, duration: 0.3, ease: 'power2.out' })
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
        })
      })
    })

    // ── Breathing letter-spacing ─────────────────────────
    const breathDelay = gsap.delayedCall(2.5, () => {
      gsap.to(titleRef.current, {
        letterSpacing: '0.08em',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      tl.kill()
      breathDelay.kill()
      gsap.killTweensOf(badgeRef.current)
      gsap.killTweensOf(titleRef.current)
    }
  }, [])

  return (
    <div ref={wrapperRef} className={styles.csWrapper}>
      <div ref={cursorRef} className={styles.cursor} />
      <div ref={glowRef}   className={styles.cursorGlow} />

      <div className={styles.csScene}>
        <Scene />
      </div>

      <div className={styles.csOverlay}>
        <div className={styles.csContent}>

          <div ref={badgeRef} className={styles.csBadge}>
            <span className={styles.csBadgeDot} />
            Loading Portfolio &mdash; Coming Soon
          </div>

          <h1 ref={titleRef} className={styles.csTitle}>
            {TITLE.split('').map((char, i) => (
              <span
                key={i}
                ref={(el) => { lettersRef.current[i] = el }}
                className={styles.csLetter}
              >
                {char}
              </span>
            ))}
          </h1>

          <div ref={nameRef} className={styles.csName}>
            <span className={styles.csNameLabel}>Creative Frontend Developer</span>
            {/* <span className={styles.csNameLine} />
            <span className={styles.csNameValue}>Wenz</span> */}
          </div>

          <p ref={taglineRef} className={styles.csTagline}>
            I build things that look good<br />
            and work even better.
          </p>

          <div ref={linksRef} className={styles.csLinks}>
            <a href="mailto:wenzrej@gmail.com" className={`${styles.csLink} ${styles.csLinkPrimary}`}>
              Get in touch
            </a>
            <a href="https://github.com/wenzrejas" target="_blank" className={`${styles.csLink} ${styles.csLinkSecondary}`}>
              GitHub
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
