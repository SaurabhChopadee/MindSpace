'use client'

import { useEnvironment } from '@/lib/environment-store'
import { cn } from '@/lib/utils'

export function EnvironmentScene({ children }: { children: React.ReactNode }) {
  const { currentThemeId, visualsEnabled, activeTheme } = useEnvironment()

  const isAnimated = visualsEnabled && currentThemeId !== 'standard'

  return (
    <div className="relative min-h-svh w-full overflow-x-hidden transition-colors duration-700">
      {/* =========================================================================
          LAYER 1: Environmental Background (Video + Procedural Canvas)
          ========================================================================= */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-1000',
          !isAnimated && 'opacity-0',
        )}
      >
        {/* Optional Local Video Asset Support with Error Fallback */}
        {activeTheme.asset.videoSrc && (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={activeTheme.asset.posterSrc}
            className="absolute inset-0 size-full object-cover opacity-45"
          >
            <source src={activeTheme.asset.videoSrc} type="video/mp4" />
          </video>
        )}

        {/* 1. FOREST CANOPY ─ lush emerald world with sunlight piercing through canopy */}
        {currentThemeId === 'forest' && (
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/60 via-emerald-950/40 to-emerald-900/50">
            {/* Dappled sunlight orbs */}
            <div className="absolute -top-16 left-1/3 h-96 w-[32rem] -rotate-12 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />
            <div className="absolute top-10 right-1/4 h-80 w-80 rounded-full bg-emerald-400/18 blur-3xl animate-drift" />
            <div className="absolute bottom-1/4 left-1/5 h-64 w-64 rounded-full bg-lime-400/12 blur-3xl animate-drift" style={{ animationDelay: '4s' }} />

            {/* Falling leaves */}
            <div className="absolute inset-0">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-leaf absolute rounded-full bg-emerald-300/40 blur-[0.5px]"
                  style={{
                    top: `${(i * 17) % 92}%`,
                    left: `${(i * 21) % 96}%`,
                    width: `${7 + (i % 7)}px`,
                    height: `${12 + (i % 9)}px`,
                    animationDuration: `${9 + (i % 6)}s`,
                    animationDelay: `${i * 0.35}s`,
                    transform: `rotate(${i * 35}deg)`,
                  }}
                />
              ))}
            </div>

            {/* Firefly dots */}
            <div className="absolute inset-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={`ff-${i}`}
                  className="animate-twinkle absolute size-1 rounded-full bg-yellow-200/60"
                  style={{
                    top: `${20 + (i * 11) % 60}%`,
                    left: `${10 + (i * 17) % 80}%`,
                    animationDuration: `${3 + (i % 3)}s`,
                    animationDelay: `${i * 0.7}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. TRANQUIL OCEAN ─ deep sapphire depths with rolling light caustics */}
        {currentThemeId === 'ocean' && (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-800/50 via-blue-900/45 to-cyan-950/55">
            {/* Surface light shimmer */}
            <div className="absolute -top-24 left-1/4 h-72 w-[40rem] rounded-full bg-cyan-300/22 blur-3xl animate-drift" />
            <div className="absolute top-1/3 right-1/4 h-56 w-56 rounded-full bg-blue-300/15 blur-3xl animate-pulse" />

            {/* Rolling waves */}
            <div className="absolute inset-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-wave-flow absolute inset-x-0 h-40 rounded-full border-t border-cyan-300/30"
                  style={{
                    bottom: `${i * 14}%`,
                    animationDuration: `${13 + i * 3.5}s`,
                    animationDelay: `${i * 2.2}s`,
                    opacity: 0.25 + i * 0.12,
                  }}
                />
              ))}
            </div>

            {/* Light caustic dots */}
            <div className="absolute inset-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={`c-${i}`}
                  className="animate-drift absolute size-2 rounded-full bg-cyan-200/30 blur-[1px]"
                  style={{
                    top: `${(i * 19) % 80}%`,
                    left: `${(i * 23) % 90}%`,
                    animationDuration: `${10 + (i % 5)}s`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. AQUATIC LIFE ─ bioluminescent underwater sanctuary */}
        {currentThemeId === 'aquatic' && (
          <div className="absolute inset-0 bg-gradient-to-b from-teal-800/50 via-cyan-900/45 to-teal-950/55">
            {/* Bioluminescent glow orb */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-cyan-400/18 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-teal-300/15 blur-3xl animate-drift" />

            {/* Rising underwater bubbles */}
            <div className="absolute inset-0">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-aquatic-bubble absolute rounded-full border border-cyan-200/50 bg-cyan-300/25 backdrop-blur-[1px]"
                  style={{
                    left: `${(i * 13) % 94}%`,
                    bottom: '-5%',
                    width: `${6 + (i % 10)}px`,
                    height: `${6 + (i % 10)}px`,
                    animationDuration: `${7 + (i % 5) * 1.5}s`,
                    animationDelay: `${i * 0.4}s`,
                    opacity: 0.4 + (i % 4) * 0.15,
                  }}
                />
              ))}
            </div>

            {/* Floating bioluminescent micro-particles */}
            <div className="absolute inset-0">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={`p-${i}`}
                  className="animate-drift absolute size-1.5 rounded-full bg-teal-200/50 blur-[0.5px]"
                  style={{
                    top: `${(i * 19) % 85}%`,
                    left: `${(i * 23) % 90}%`,
                    animationDuration: `${14 + (i % 6)}s`,
                    animationDelay: `${i * 0.6}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. QUIET RAIN ─ moody blue-grey storm atmosphere */}
        {currentThemeId === 'rain' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700/50 via-slate-800/40 to-slate-900/55">
            {/* Storm cloud glow */}
            <div className="absolute -top-10 left-1/3 h-64 w-[36rem] rounded-full bg-slate-400/18 blur-3xl" />
            <div className="absolute top-1/4 right-1/3 h-40 w-80 rounded-full bg-blue-400/10 blur-3xl animate-pulse" />

            {/* Rain streaks */}
            <div className="absolute inset-0">
              {Array.from({ length: 40 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-rain-drop absolute w-[1.5px] bg-gradient-to-b from-transparent via-blue-200/50 to-transparent"
                  style={{
                    left: `${(i * 2.5) % 98}%`,
                    height: `${35 + (i % 30)}px`,
                    animationDuration: `${0.85 + (i % 5) * 0.18}s`,
                    animationDelay: `${i * 0.06}s`,
                    opacity: 0.35 + (i % 4) * 0.15,
                  }}
                />
              ))}
            </div>

            {/* Misty haze layer */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-600/15 to-transparent" />
          </div>
        )}

        {/* 5. NIGHT SANCTUARY ─ deep cosmic indigo sky with twinkling stars */}
        {currentThemeId === 'night' && (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-violet-950/45 to-indigo-900/50">
            {/* Moon glow */}
            <div className="absolute top-8 right-12 size-44 rounded-full bg-indigo-200/25 blur-2xl animate-pulse" />
            {/* Nebula wash */}
            <div className="absolute top-1/3 left-1/4 h-72 w-96 rounded-full bg-violet-400/10 blur-3xl animate-drift" />

            {/* Twinkling stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 45 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-twinkle absolute rounded-full bg-white"
                  style={{
                    top: `${(i * 13) % 90}%`,
                    left: `${(i * 19) % 95}%`,
                    width: `${i % 5 === 0 ? 3 : i % 3 === 0 ? 2.5 : 1.5}px`,
                    height: `${i % 5 === 0 ? 3 : i % 3 === 0 ? 2.5 : 1.5}px`,
                    opacity: 0.25 + (i % 5) * 0.15,
                    animationDuration: `${2.8 + (i % 4)}s`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>

            {/* Shooting star (subtle) */}
            <div className="absolute top-[15%] left-[60%] h-[1px] w-16 -rotate-45 bg-gradient-to-r from-white/50 to-transparent animate-drift" style={{ animationDuration: '20s' }} />
          </div>
        )}

        {/* 6. GOLDEN NATURE ─ warm sunset meadow with pollen and golden light */}
        {currentThemeId === 'nature' && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-800/45 via-orange-900/35 to-amber-900/50">
            {/* Sun orb */}
            <div className="absolute -top-20 -right-20 size-[32rem] rounded-full bg-amber-400/25 blur-3xl animate-pulse" />
            {/* Warm horizon glow */}
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-orange-500/15 to-transparent" />

            {/* Floating pollen/dust motes */}
            <div className="absolute inset-0">
              {Array.from({ length: 22 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-drift absolute size-2 rounded-full bg-amber-200/45 blur-[0.5px]"
                  style={{
                    top: `${(i * 17) % 88}%`,
                    left: `${(i * 23) % 94}%`,
                    animationDuration: `${12 + (i % 5)}s`,
                    animationDelay: `${i * 0.45}s`,
                  }}
                />
              ))}
            </div>

            {/* Warm sparkle dots */}
            <div className="absolute inset-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={`sp-${i}`}
                  className="animate-twinkle absolute size-1 rounded-full bg-yellow-100/50"
                  style={{
                    top: `${15 + (i * 13) % 60}%`,
                    left: `${10 + (i * 19) % 80}%`,
                    animationDuration: `${4 + (i % 3)}s`,
                    animationDelay: `${i * 0.8}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 7. ZEN SANCTUARY ─ meditative lavender aura, peaceful mandala rings & starlight */}
        {currentThemeId === 'zen' && (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-indigo-950/40 to-violet-950/50">
            {/* Radiant mindful aura */}
            <div className="absolute top-1/4 left-1/3 size-[28rem] rounded-full bg-violet-400/16 blur-3xl animate-pulse" />
            <div className="absolute top-10 right-1/4 size-72 rounded-full bg-purple-300/14 blur-3xl animate-drift" />
            {/* Concentric mindful halo rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full border border-violet-400/20 blur-[1px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[32rem] rounded-full border border-purple-400/15 blur-[1.5px] animate-drift" />

            {/* Floating meditative light orbs */}
            <div className="absolute inset-0">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-drift absolute size-2.5 rounded-full bg-purple-200/40 blur-[0.5px]"
                  style={{
                    top: `${(i * 19) % 86}%`,
                    left: `${(i * 23) % 92}%`,
                    animationDuration: `${14 + (i % 6)}s`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 8. STANDARD MODE: Completely non-animated, clean static backdrop */}
        {currentThemeId === 'standard' && (
          <div className="absolute inset-0 bg-background" />
        )}
      </div>

      {/* =========================================================================
          LAYER 2: Subtle Readability Scrim (light veil, NOT a dark washout)
          ========================================================================= */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-0 z-[1] transition-opacity duration-700',
          currentThemeId === 'standard'
            ? 'opacity-0'
            : 'bg-gradient-to-b from-transparent via-background/15 to-background/35',
        )}
      />

      {/* =========================================================================
          LAYER 3: Foreground Application UI
          ========================================================================= */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
