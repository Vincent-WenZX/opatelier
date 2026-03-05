import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Craftsmanship.css'

const PHOTO_SVG = (
  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
)

const CRAFT_NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Collection', to: '/collection' },
  { label: 'Men', to: '/collection/men' },
  { label: 'Story', to: '/craftsmanship' },
]

export default function Craftsmanship() {
  const canvasRef = useRef(null)
  const hintRef = useRef(null)
  const animRef = useRef(null)
  const stateRef = useRef(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('[data-craft-reveal]')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.15 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Scroll hint hide
  useEffect(() => {
    const onScroll = () => {
      if (hintRef.current) {
        hintRef.current.style.opacity = window.scrollY > 80 ? '0' : ''
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Canvas animation — exact port from plum-story-v2.html
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = window.innerWidth
    const H = canvas.height = window.innerHeight

    // --- Plum classes ---
    class PlumBranch {
      constructor(x, y, angle, len, depth) {
        this.x = x; this.y = y; this.angle = angle; this.length = len; this.depth = depth; this.progress = 0
      }
    }
    class PlumBlossom {
      constructor() {
        this.x = Math.random() * W * 0.3; this.y = Math.random() * H
        this.baseSize = 5 + Math.random() * 14; this.rotation = Math.random() * Math.PI * 2
        this.rotSpeed = (Math.random() - 0.5) * 0.0008; this.depth = 0.2 + Math.random() * 0.8
        this.opacity = 0; this.bloom = 0; this.variant = Math.random()
      }
      color(a) {
        const v = this.variant
        if (v < 0.3) return `rgba(185,125,135,${a})`
        if (v < 0.6) return `rgba(200,155,158,${a})`
        return `rgba(215,175,178,${a})`
      }
      update(sp) {
        const halfSp = Math.min(1, sp / 0.5)
        const offset = this.depth * 0.1
        const local = Math.max(0, Math.min(1, (halfSp - offset) / 0.7))
        this.opacity += (Math.min(1, local * 2.5) - this.opacity) * 0.04
        this.bloom += (Math.min(1, local * 2.2) - this.bloom) * 0.03
        this.rotation += this.rotSpeed
      }
      draw(ctx, alpha) {
        if (this.opacity < 0.01 || alpha < 0.01) return
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity * (0.2 + this.depth * 0.5) * alpha
        const s = this.baseSize * (0.2 + this.bloom * 0.8)
        for (let i = 0; i < 5; i++) {
          ctx.save(); ctx.rotate((i / 5) * Math.PI * 2)
          const pL = s * (0.5 + this.bloom * 0.5), pW = s * 0.32 * (0.3 + this.bloom * 0.7)
          ctx.beginPath(); ctx.moveTo(0, 0)
          ctx.bezierCurveTo(pW * 0.7, -pL * 0.3, pW, -pL * 0.7, 0, -pL)
          ctx.bezierCurveTo(-pW, -pL * 0.7, -pW * 0.7, -pL * 0.3, 0, 0)
          ctx.fillStyle = this.color(0.65); ctx.fill(); ctx.restore()
        }
        if (this.bloom > 0.5) {
          ctx.globalAlpha = this.opacity * this.depth * (this.bloom - 0.5) * 2 * 0.5 * alpha
          ctx.beginPath(); ctx.arc(0, 0, s * 0.07, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(155,110,105,0.6)'; ctx.fill()
        }
        ctx.restore()
      }
    }
    class PlumPetal {
      constructor() { this.reset(); this.y = Math.random() * H }
      reset() {
        this.x = Math.random() * W * 0.28; this.y = -10 - Math.random() * H * 0.3
        this.size = 2 + Math.random() * 4; this.rot = Math.random() * Math.PI * 2
        this.rotS = (Math.random() - 0.5) * 0.025; this.vy = 0.15 + Math.random() * 0.35
        this.vx = 0.05 + Math.random() * 0.15; this.swP = Math.random() * Math.PI * 2
        this.op = 0.12 + Math.random() * 0.2
      }
      update(t, sp) {
        const halfSp = Math.min(1, sp / 0.5); if (halfSp < 0.3) return
        const i = Math.min(1, (halfSp - 0.3) * 2.5)
        this.x += this.vx * i + Math.sin(t * 0.001 + this.swP) * 0.3 * i
        this.y += this.vy * i; this.rot += this.rotS * i
        if (this.y > H + 15 || this.x > W * 0.45) this.reset()
      }
      draw(ctx, sp, alpha) {
        const halfSp = Math.min(1, sp / 0.5)
        if (halfSp < 0.3 || alpha < 0.01) return
        const i = Math.min(1, (halfSp - 0.3) * 2.5)
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot)
        ctx.globalAlpha = this.op * i * alpha
        ctx.beginPath(); ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(195,148,152,0.55)'; ctx.fill(); ctx.restore()
      }
    }

    // --- Orchid classes ---
    class OrchidBranch {
      constructor(x, y, angle, len, depth) {
        this.x = x; this.y = y; this.angle = angle; this.length = len; this.depth = depth; this.progress = 0
      }
    }
    class OrchidBlossom {
      constructor() {
        this.x = W * 0.7 + Math.random() * W * 0.28; this.y = Math.random() * H
        this.baseSize = 6 + Math.random() * 16; this.rotation = Math.random() * Math.PI * 2
        this.rotSpeed = (Math.random() - 0.5) * 0.0006; this.depth = 0.2 + Math.random() * 0.8
        this.opacity = 0; this.bloom = 0; this.variant = Math.random()
      }
      outerColor(a) {
        const v = this.variant
        if (v < 0.35) return `rgba(150,170,190,${a})`
        if (v < 0.65) return `rgba(165,180,200,${a})`
        return `rgba(175,185,205,${a})`
      }
      innerColor(a) { return `rgba(170,185,210,${a})` }
      update(sp) {
        const halfSp = Math.max(0, Math.min(1, (sp - 0.4) / 0.55))
        const offset = this.depth * 0.1
        const local = Math.max(0, Math.min(1, (halfSp - offset) / 0.7))
        this.opacity += (Math.min(1, local * 2.5) - this.opacity) * 0.04
        this.bloom += (Math.min(1, local * 2.2) - this.bloom) * 0.03
        this.rotation += this.rotSpeed
      }
      draw(ctx, alpha) {
        if (this.opacity < 0.01 || alpha < 0.01) return
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity * (0.2 + this.depth * 0.5) * alpha
        const s = this.baseSize * (0.2 + this.bloom * 0.8), spread = this.bloom
        for (let i = 0; i < 3; i++) {
          ctx.save(); ctx.rotate((i / 3) * Math.PI * 2)
          const pL = s * (0.7 + spread * 0.5), pW = s * 0.18 * (0.3 + spread * 0.7)
          ctx.beginPath(); ctx.moveTo(0, 0)
          ctx.bezierCurveTo(pW, -pL * 0.35, pW * 1.2, -pL * 0.75, 0, -pL)
          ctx.bezierCurveTo(-pW * 1.2, -pL * 0.75, -pW, -pL * 0.35, 0, 0)
          ctx.fillStyle = this.outerColor(0.55); ctx.fill(); ctx.restore()
        }
        for (let i = 0; i < 2; i++) {
          ctx.save(); ctx.rotate(Math.PI * 0.3 + i * Math.PI * 0.4)
          const pL = s * (0.45 + spread * 0.35), pW = s * 0.28 * (0.35 + spread * 0.65)
          ctx.beginPath(); ctx.moveTo(0, 0)
          ctx.bezierCurveTo(pW, -pL * 0.3, pW * 0.9, -pL * 0.8, 0, -pL)
          ctx.bezierCurveTo(-pW * 0.9, -pL * 0.8, -pW, -pL * 0.3, 0, 0)
          ctx.fillStyle = this.outerColor(0.5); ctx.fill(); ctx.restore()
        }
        if (this.bloom > 0.3) {
          const lipAlpha = Math.min(1, (this.bloom - 0.3) / 0.4)
          ctx.globalAlpha = this.opacity * this.depth * lipAlpha * 0.6 * alpha
          const lipS = s * 0.3
          ctx.beginPath(); ctx.ellipse(0, lipS * 0.1, lipS * 0.7, lipS * 0.45, 0, 0, Math.PI * 2)
          ctx.fillStyle = this.innerColor(0.6); ctx.fill()
          ctx.beginPath(); ctx.arc(0, 0, s * 0.06, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(140,160,190,0.5)'; ctx.fill()
        }
        ctx.restore()
      }
    }
    class OrchidPetal {
      constructor() { this.reset(); this.y = Math.random() * H }
      reset() {
        this.x = W * 0.72 + Math.random() * W * 0.26; this.y = -10 - Math.random() * H * 0.3
        this.size = 2 + Math.random() * 4; this.rot = Math.random() * Math.PI * 2
        this.rotS = (Math.random() - 0.5) * 0.02; this.vy = 0.12 + Math.random() * 0.3
        this.vx = -0.05 - Math.random() * 0.12; this.swP = Math.random() * Math.PI * 2
        this.op = 0.1 + Math.random() * 0.18
      }
      update(t, sp) {
        const halfSp = Math.max(0, Math.min(1, (sp - 0.4) / 0.55)); if (halfSp < 0.3) return
        const i = Math.min(1, (halfSp - 0.3) * 2.5)
        this.x += this.vx * i + Math.sin(t * 0.0012 + this.swP) * 0.25 * i
        this.y += this.vy * i; this.rot += this.rotS * i
        if (this.y > H + 15 || this.x < W * 0.55) this.reset()
      }
      draw(ctx, sp, alpha) {
        const halfSp = Math.max(0, Math.min(1, (sp - 0.4) / 0.55))
        if (halfSp < 0.3 || alpha < 0.01) return
        const i = Math.min(1, (halfSp - 0.3) * 2.5)
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot)
        ctx.globalAlpha = this.op * i * alpha
        ctx.beginPath(); ctx.ellipse(0, 0, this.size * 1.2, this.size * 0.4, this.rot * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(155,175,200,0.45)'; ctx.fill(); ctx.restore()
      }
    }

    // --- Init data ---
    const plumBranches = [], plumBlossoms = [], plumPetals = []
    const orchidBranches = [], orchidBlossoms = [], orchidPetals = []

    function addPlumBranch(x, y, a, l, d) {
      if (d > 5 || l < 18) return
      plumBranches.push(new PlumBranch(x, y, a, l, d))
      const ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l
      if (ex > W * 0.32) return
      const n = d < 1 ? 2 : (Math.random() < 0.5 ? 2 : 1)
      for (let i = 0; i < n; i++) {
        addPlumBranch(ex, ey, a + (Math.random() - 0.5) * 0.6 + (i === 0 ? -0.12 : 0.12), l * (0.58 + Math.random() * 0.15), d + 1)
      }
    }
    addPlumBranch(-8, H * 0.88, -Math.PI * 0.3, 110 + Math.random() * 25, 0)
    addPlumBranch(-8, H * 0.52, -Math.PI * 0.22, 85 + Math.random() * 20, 0)
    const plumCount = Math.floor(W * H / 14000)
    for (let i = 0; i < plumCount; i++) plumBlossoms.push(new PlumBlossom())
    for (let i = 0; i < 16; i++) plumPetals.push(new PlumPetal())

    function addOrchidBranch(x, y, a, l, d) {
      if (d > 5 || l < 20) return
      orchidBranches.push(new OrchidBranch(x, y, a, l, d))
      const ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l
      if (ex < W * 0.68) return
      const n = d < 1 ? 2 : (Math.random() < 0.5 ? 2 : 1)
      for (let i = 0; i < n; i++) {
        addOrchidBranch(ex, ey, a + (Math.random() - 0.5) * 0.55 + (i === 0 ? -0.1 : 0.1), l * (0.6 + Math.random() * 0.15), d + 1)
      }
    }
    addOrchidBranch(W + 8, H * 0.85, -Math.PI * 0.72, 105 + Math.random() * 25, 0)
    addOrchidBranch(W + 8, H * 0.5, -Math.PI * 0.78, 80 + Math.random() * 20, 0)
    const orchidCount = Math.floor(W * H / 15000)
    for (let i = 0; i < orchidCount; i++) orchidBlossoms.push(new OrchidBlossom())
    for (let i = 0; i < 14; i++) orchidPetals.push(new OrchidPetal())

    stateRef.current = { ctx, W, H, plumBranches, plumBlossoms, plumPetals, orchidBranches, orchidBlossoms, orchidPetals }
  }, [])

  useEffect(() => {
    initCanvas()
    const onResize = () => initCanvas()
    window.addEventListener('resize', onResize)

    function getScrollProgress() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      return maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0
    }
    function getPlumAlpha(sp) { return sp < 0.35 ? 1 : Math.max(0, 1 - (sp - 0.35) / 0.15) }
    function getOrchidAlpha(sp) { return sp < 0.35 ? 0 : Math.min(1, (sp - 0.35) / 0.15) }

    function drawBranches(ctx, list, sp, alpha, isOrchid) {
      if (alpha < 0.01) return
      const mapSp = isOrchid ? Math.max(0, (sp - 0.4) / 0.55) : Math.min(1, sp / 0.5)
      list.forEach(br => {
        const df = br.depth / 5
        const target = Math.min(1, Math.max(0, mapSp * 4 - df * 0.35))
        br.progress += (target - br.progress) * 0.035
        if (br.progress < 0.005) return
        const ex = br.x + Math.cos(br.angle) * br.length * br.progress
        const ey = br.y + Math.sin(br.angle) * br.length * br.progress
        const thick = Math.max(0.3, (5 - br.depth) * 0.55)
        const mx = (br.x + ex) / 2 + Math.sin(br.angle) * br.length * 0.02
        const my = (br.y + ey) / 2 + Math.cos(br.angle) * br.length * 0.02
        ctx.beginPath(); ctx.moveTo(br.x, br.y); ctx.quadraticCurveTo(mx, my, ex, ey)
        const c = isOrchid
          ? `rgba(120,140,165,${(0.08 + (1 - df) * 0.14) * alpha})`
          : `rgba(155,128,122,${(0.1 + (1 - df) * 0.15) * alpha})`
        ctx.strokeStyle = c; ctx.lineWidth = thick; ctx.lineCap = 'round'; ctx.stroke()
      })
    }

    function render(t) {
      const s = stateRef.current
      if (!s) { animRef.current = requestAnimationFrame(render); return }
      const { ctx, W, H, plumBranches, plumBlossoms, plumPetals, orchidBranches, orchidBlossoms, orchidPetals } = s
      const sp = getScrollProgress()
      const plumA = getPlumAlpha(sp), orchidA = getOrchidAlpha(sp)

      ctx.fillStyle = '#f7f4f1'; ctx.fillRect(0, 0, W, H)

      drawBranches(ctx, plumBranches, sp, plumA, false)
      plumBlossoms.forEach(b => { b.update(sp); b.draw(ctx, plumA) })
      plumPetals.forEach(p => { p.update(t, sp); p.draw(ctx, sp, plumA) })

      drawBranches(ctx, orchidBranches, sp, orchidA, true)
      orchidBlossoms.forEach(b => { b.update(sp); b.draw(ctx, orchidA) })
      orchidPetals.forEach(p => { p.update(t, sp); p.draw(ctx, sp, orchidA) })

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => {
      window.removeEventListener('resize', onResize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [initCanvas])

  return (
    <>
      <canvas ref={canvasRef} className="craft-canvas" />

      {/* Floating nav */}
      <nav className="fixed top-0 inset-x-0 z-10 flex items-center justify-end px-5 sm:px-8 lg:px-12 py-7 opacity-0" style={{ animation: 'craftFadeIn 1.5s ease 0.3s forwards' }}>
        {/* Desktop links */}
        <div className="hidden md:flex items-center" style={{ gap: 'clamp(20px, 3vw, 48px)' }}>
          {CRAFT_NAV_LINKS.map(link => (
            <Link key={link.label} to={link.to} className="text-[11px] tracking-[0.18em] uppercase text-[#8a7275] no-underline transition-colors hover:text-[#3a2a2e]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1.5"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Menu"
        >
          <div className="flex flex-col justify-center gap-[5px] w-[20px]">
            <span className={`h-px bg-[#5a4548] transition-all duration-300 origin-center ${mobileNavOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`h-px bg-[#5a4548] transition-all duration-300 origin-center ${mobileNavOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile nav dropdown */}
      <div
        className={`fixed inset-x-0 top-0 z-[9] pt-[72px] pb-8 px-5 flex flex-col items-center gap-6 md:hidden transition-all duration-400 ${
          mobileNavOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ background: 'rgba(247,244,241,0.96)', backdropFilter: 'blur(12px)' }}
      >
        {CRAFT_NAV_LINKS.map(link => (
          <Link
            key={link.label}
            to={link.to}
            onClick={() => setMobileNavOpen(false)}
            className="text-[12px] tracking-[0.25em] uppercase text-[#5a4548] no-underline transition-colors hover:text-[#3a2a2e]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div ref={hintRef} className="craft-scroll-hint">
        <span>Scroll</span>
        <div className="craft-scroll-line" />
      </div>

      <div className="craft-content">
        {/* Hero */}
        <section className="craft-hero">
          <Link to="/" className="craft-hero-logo">
            <img src="/images/logo_icon.png" alt="Orchid & Plum" />
          </Link>

          <div className="craft-hero-label-float">Our Story</div>

          <div className="craft-hero-center">
            <h1 className="craft-hero-title">梅令人高，兰令人幽</h1>
            <p className="craft-hero-subtitle">The plum inspires nobility;<br/>the orchid, quiet grace.</p>
          </div>

          <div className="craft-hero-aside">
            <div className="craft-divider" />
            <p className="craft-hero-desc">Two flowers, one philosophy — the bold dignity of the plum and the understated refinement of the orchid guide every stitch, every silhouette, every detail we craft.</p>
          </div>
        </section>

        {/* Founder */}
        <section className="craft-section craft-section-right">
          <div className="craft-section-inner align-right" data-craft-reveal>
            <div className="craft-photo">
              {PHOTO_SVG}
              <span>Founder Portrait</span>
            </div>
            <div className="craft-label">The Beginning</div>
            <h2 className="craft-heading">A Vision Born<br/>in Winter</h2>
            <div className="craft-text">
              <p>Founded in the quiet of a Beijing winter, Orchid & Plum was born from a singular observation</p>
            </div>
          </div>
        </section>

        {/* Quote 1 */}
        <div className="craft-quote craft-quote-right">
          <div className="craft-quote-inner" data-craft-reveal>
            <div className="craft-quote-mark">&ldquo;</div>
            <p className="craft-quote-text">This Is A Quote From Larry Li</p>
            <div className="craft-divider" />
            <div className="craft-quote-author">Larry Li, Founder of Orchid & Plum</div>
          </div>
        </div>

        {/* Transition */}
        <div className="craft-transition">
          <div className="craft-transition-line" />
        </div>

        {/* Atelier */}
        <section className="craft-section craft-section-left">
          <div className="craft-section-inner align-left" data-craft-reveal>
            <div className="craft-photo craft-photo-wide">
              {PHOTO_SVG}
              <span>Atelier Interior</span>
            </div>
            <div className="craft-label">The Atelier</div>
            <h2 className="craft-heading">Craft Without<br/>Compromise</h2>
            <div className="craft-text">
              <p>Lorem ipsum dolor sit amet, est nibh detraxit ea. Usu utroque accusata in. Eos id libris tritani necessitatibus. Ei oblique scaevola his, amet fugit iriure sit ea, ex odio clita per. An per fugit denique, per te altera saperet partiendo, no duo aeterno assentior scripserit. Aeque habemus pertinax eu nec. Eum augue novum eu, nonumy option theophrastus id eam, ad ius summo recusabo.</p>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="craft-section craft-section-left">
          <div className="craft-section-inner align-left" data-craft-reveal>
            <div className="craft-photo">
              {PHOTO_SVG}
              <span>Collection Detail</span>
            </div>
            <div className="craft-label">Philosophy</div>
            <h2 className="craft-heading">Less, but Better</h2>
            <div className="craft-text">
              <p>Lorem ipsum dolor sit amet, est nibh detraxit ea. Usu utroque accusata in. Eos id libris tritani necessitatibus. Ei oblique scaevola his, amet fugit iriure sit ea, ex odio clita per. An per fugit denique, per te altera saperet partiendo, no duo aeterno assentior scripserit. Aeque habemus pertinax eu nec. Eum augue novum eu, nonumy option theophrastus id eam, ad ius summo recusabo.</p>
              <p>WLorem ipsum dolor sit amet, est nibh detraxit ea. Usu utroque accusata in. Eos id libris tritani necessitatibus. Ei oblique scaevola his, amet fugit iriure sit ea, ex odio clita per. An per fugit denique, per te altera saperet partiendo, no duo aeterno assentior scripserit. Aeque habemus pertinax eu nec. Eum augue novum eu, nonumy option theophrastus id eam, ad ius summo recusabo.</p>
            </div>
          </div>
        </section>

        {/* Quote 2 */}
        <div className="craft-quote craft-quote-center">
          <div className="craft-quote-inner" data-craft-reveal style={{ textAlign: 'left' }}>
            <div className="craft-quote-mark">&ldquo;</div>
            <p className="craft-quote-text">In stillness, the orchid teaches us that beauty needs no audience.</p>
            <div className="craft-divider" />
            <div className="craft-quote-author">— Larry Li, Founder of Orchid & Plum</div>
          </div>
        </div>
      </div>
    </>
  )
}
