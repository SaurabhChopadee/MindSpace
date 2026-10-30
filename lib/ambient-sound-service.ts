/**
 * Web Audio Procedural Ambient Sound Service
 *
 * 100% Client-side synthetic audio:
 * - Zero external mp3/audio files needed (no copyright issues, no 404s, zero network payload).
 * - OFF by default. Never auto-plays on load.
 * - Rich, warm acoustic synthesis with elevated, clear volume headroom.
 * - Smooth volume transitions and realistic atmospheric textures.
 */

export type AmbientSoundTrack =
  | 'soft-ambient'
  | 'rain'
  | 'forest'
  | 'ocean'
  | 'aquatic'
  | 'night'
  | 'sitar-meditation'
  | 'nature-stream'
  | 'zen-bell'

export interface SoundTrackInfo {
  id: AmbientSoundTrack
  name: string
  description: string
  category: 'meditation' | 'nature' | 'focus'
}

export const AMBIENT_TRACKS: SoundTrackInfo[] = [
  { id: 'soft-ambient', name: 'Celestial Healing Pad', description: 'Lush, warm 5-voice harmonic chords with slow breathing swell', category: 'meditation' },
  { id: 'forest', name: 'Forest Canopy & Birds', description: 'Gentle breeze through swaying leaves with peaceful songbirds', category: 'nature' },
  { id: 'ocean', name: 'Tranquil Ocean Swell', description: 'Deep rhythmic coastal waves with gentle foam wash', category: 'nature' },
  { id: 'aquatic', name: 'Aquatic Sanctuary', description: 'Deep floating hydro-resonance with crystal water chimes', category: 'nature' },
  { id: 'rain', name: 'Calming Rain & Droplets', description: 'Soothing rain shower with delicate individual droplet impacts', category: 'nature' },
  { id: 'night', name: 'Night Starlight & Crickets', description: 'Midnight peace with warm field crickets and distant wind chime', category: 'focus' },
  { id: 'nature-stream', name: 'Mountain Brook', description: 'Lively bubbling stream with crisp flowing water texture', category: 'nature' },
  { id: 'sitar-meditation', name: 'Tanpura & Sitar Drone', description: 'Resonant classical 136.1 Hz Cosmic Om meditative harmonics', category: 'meditation' },
  { id: 'zen-bell', name: 'Tibetan Singing Bowl', description: '432 Hz healing bowl with metallic resonance and long decay', category: 'meditation' },
]

export class AmbientSoundService {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private activeGenerators: { stop: () => void }[] = []
  private currentTrack: AmbientSoundTrack = 'soft-ambient'
  private volume: number = 0.75
  private isMuted: boolean = false
  private isPlaying: boolean = false

  public getTrack(): AmbientSoundTrack {
    return this.currentTrack
  }

  public getVolume(): number {
    return this.volume
  }

  public getIsPlaying(): boolean {
    return this.isPlaying
  }

  public getIsMuted(): boolean {
    return this.isMuted
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()

      this.masterGain = this.ctx.createGain()
      // Enhanced volume multiplier (0.90 for rich, clear presence)
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.9, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol))
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume * 0.9, this.ctx.currentTime + 0.1)
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume * 0.9
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1)
    }
  }

  public play(track?: AmbientSoundTrack) {
    this.initAudio()
    if (!this.ctx || !this.masterGain) return

    if (track) {
      this.currentTrack = track
    }

    this.stopActive()
    this.isPlaying = true

    switch (this.currentTrack) {
      case 'soft-ambient':
        this.generateSoftAmbient()
        break
      case 'rain':
        this.generateRain()
        break
      case 'ocean':
        this.generateOcean()
        break
      case 'aquatic':
        this.generateAquatic()
        break
      case 'forest':
        this.generateForest()
        break
      case 'night':
        this.generateNight()
        break
      case 'sitar-meditation':
        this.generateSitarMeditation()
        break
      case 'nature-stream':
        this.generateStream()
        break
      case 'zen-bell':
        this.generateZenBell()
        break
      default:
        this.generateSoftAmbient()
    }
  }

  public stop() {
    this.stopActive()
    this.isPlaying = false
  }

  private stopActive() {
    this.activeGenerators.forEach((g) => {
      try {
        g.stop()
      } catch {}
    })
    this.activeGenerators = []
  }

  // --- 1: Celestial Healing Pad (Lush, warm 5-voice harmonic pad) ---
  private generateSoftAmbient() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 850
    filter.Q.value = 0.8
    filter.connect(this.masterGain)

    // Rich pentatonic/diatonic harmony: A2 (110Hz), E3 (164.8Hz), A3 (220Hz), C#4 (277.2Hz), E4 (329.6Hz)
    const freqs = [110, 164.81, 220, 277.18, 329.63]
    const oscs = freqs.map((f, i) => {
      const o = ctx.createOscillator()
      o.type = i === 1 || i === 3 ? 'triangle' : 'sine'
      o.frequency.value = f
      o.detune.value = i % 2 === 0 ? -5 : 6

      const g = ctx.createGain()
      g.gain.value = i === 0 ? 0.45 : 0.32
      o.connect(g)
      g.connect(filter)
      o.start()
      return o
    })

    // Gentle slow breathing LFO modulating the filter
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.09 // 11-second natural breathing rate
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 180
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()

    this.activeGenerators.push({
      stop: () => {
        oscs.forEach((o) => o.stop())
        lfo.stop()
      },
    })
  }

  // --- 2: Calming Rain & Droplets (Multi-layered pink rain + gentle droplet pings) ---
  private generateRain() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx
    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      output[i] = (b0 + b1 + b2) * 0.22 // Boosted from 0.11
    }

    const rainNoise = ctx.createBufferSource()
    rainNoise.buffer = noiseBuffer
    rainNoise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1450
    rainNoise.connect(filter)
    filter.connect(this.masterGain)
    rainNoise.start()

    // Gentle individual raindrop impacts on foliage
    const dropInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return
      try {
        const drop = this.ctx.createOscillator()
        const dropGain = this.ctx.createGain()
        const dropFreq = 900 + Math.random() * 650
        drop.type = 'sine'
        drop.frequency.setValueAtTime(dropFreq, this.ctx.currentTime)
        drop.frequency.exponentialRampToValueAtTime(dropFreq * 0.7, this.ctx.currentTime + 0.08)

        dropGain.gain.setValueAtTime(0.04, this.ctx.currentTime)
        dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.09)

        drop.connect(dropGain)
        dropGain.connect(this.masterGain)
        drop.start()
        drop.stop(this.ctx.currentTime + 0.1)
      } catch {}
    }, 700)

    this.activeGenerators.push({
      stop: () => {
        window.clearInterval(dropInterval)
        rainNoise.stop()
      },
    })
  }

  // --- 3: Tranquil Ocean Swell (Deep rhythmic waves with coastal foam wash) ---
  private generateOcean() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx
    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.32 // Boosted from 0.18
    }

    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 380
    filter.Q.value = 0.9

    // 9-second wave cycle
    const waveLfo = ctx.createOscillator()
    waveLfo.frequency.value = 0.11
    const waveLfoGain = ctx.createGain()
    waveLfoGain.gain.value = 320
    waveLfo.connect(waveLfoGain)
    waveLfoGain.connect(filter.frequency)

    noise.connect(filter)
    filter.connect(this.masterGain)

    noise.start()
    waveLfo.start()

    this.activeGenerators.push({
      stop: () => {
        noise.stop()
        waveLfo.stop()
      },
    })
  }

  // --- 4: Aquatic Sanctuary (Deep floating resonance + crystal water chimes) ---
  private generateAquatic() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx

    // Warm sub-bass drone
    const subOsc = ctx.createOscillator()
    subOsc.type = 'sine'
    subOsc.frequency.value = 65.41 // C2
    const subGain = ctx.createGain()
    subGain.gain.value = 0.2
    subOsc.connect(subGain)
    subGain.connect(this.masterGain)
    subOsc.start()

    // 5th overtone for weightless sensation
    const harmonicOsc = ctx.createOscillator()
    harmonicOsc.type = 'sine'
    harmonicOsc.frequency.value = 98.0 // G2
    harmonicOsc.detune.value = 4
    const harmonicGain = ctx.createGain()
    harmonicGain.gain.value = 0.14
    harmonicOsc.connect(harmonicGain)
    harmonicGain.connect(this.masterGain)
    harmonicOsc.start()

    // Gentle filtered current wash
    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.22
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true

    const lpFilter = ctx.createBiquadFilter()
    lpFilter.type = 'lowpass'
    lpFilter.frequency.value = 320
    lpFilter.Q.value = 1.8

    const currentLfo = ctx.createOscillator()
    currentLfo.frequency.value = 0.07
    const currentLfoGain = ctx.createGain()
    currentLfoGain.gain.value = 140
    currentLfo.connect(currentLfoGain)
    currentLfoGain.connect(lpFilter.frequency)

    noise.connect(lpFilter)
    lpFilter.connect(this.masterGain)
    noise.start()
    currentLfo.start()

    // Crystal water chime droplets (528 Hz transformation frequency)
    const bubbleInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return
      try {
        const osc = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        const pentatonic = [528, 660, 792, 1056]
        const startFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)]
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.35, this.ctx.currentTime + 0.14)
        g.gain.setValueAtTime(0.045, this.ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15)
        osc.connect(g)
        g.connect(this.masterGain)
        osc.start()
        osc.stop(this.ctx.currentTime + 0.16)
      } catch {}
    }, 2400)

    this.activeGenerators.push({
      stop: () => {
        window.clearInterval(bubbleInterval)
        subOsc.stop()
        harmonicOsc.stop()
        noise.stop()
        currentLfo.stop()
      },
    })
  }

  // --- 5: Forest Canopy & Birds (Rustling leaves + natural songbird calls) ---
  private generateForest() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx

    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.18 // Clear forest rustle
    }

    const wind = ctx.createBufferSource()
    wind.buffer = noiseBuffer
    wind.loop = true

    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'lowpass'
    windFilter.frequency.value = 650
    wind.connect(windFilter)
    windFilter.connect(this.masterGain)
    wind.start()

    // Authentic melodic birdsong chirps
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return
      try {
        const chirp = this.ctx.createOscillator()
        const chirpGain = this.ctx.createGain()
        chirp.type = 'sine'
        const baseFreq = 2400 + Math.random() * 700
        chirp.frequency.setValueAtTime(baseFreq, this.ctx.currentTime)
        chirp.frequency.exponentialRampToValueAtTime(baseFreq + 500, this.ctx.currentTime + 0.1)
        chirp.frequency.exponentialRampToValueAtTime(baseFreq - 200, this.ctx.currentTime + 0.22)

        chirpGain.gain.setValueAtTime(0.045, this.ctx.currentTime)
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.24)

        chirp.connect(chirpGain)
        chirpGain.connect(this.masterGain)
        chirp.start()
        chirp.stop(this.ctx.currentTime + 0.25)
      } catch {}
    }, 3800)

    this.activeGenerators.push({
      stop: () => {
        wind.stop()
        window.clearInterval(interval)
      },
    })
  }

  // --- 6: Night Starlight & Crickets (Cosmic drone + evening crickets + chime) ---
  private generateNight() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx

    // Starlight root drone (E2 82.4Hz + B2 123.5Hz)
    const drone1 = ctx.createOscillator()
    drone1.type = 'sine'
    drone1.frequency.value = 82.41
    const drone1Gain = ctx.createGain()
    drone1Gain.gain.value = 0.28
    drone1.connect(drone1Gain)
    drone1Gain.connect(this.masterGain)
    drone1.start()

    const drone2 = ctx.createOscillator()
    drone2.type = 'sine'
    drone2.frequency.value = 123.47
    drone2.detune.value = 3
    const drone2Gain = ctx.createGain()
    drone2Gain.gain.value = 0.18
    drone2.connect(drone2Gain)
    drone2Gain.connect(this.masterGain)
    drone2.start()

    // Rhythmic night cricket texture
    const cricket = ctx.createOscillator()
    cricket.type = 'triangle'
    cricket.frequency.value = 4200
    const cricketGain = ctx.createGain()
    cricketGain.gain.value = 0.02

    const cricketLfo = ctx.createOscillator()
    cricketLfo.frequency.value = 4.2
    cricketLfo.connect(cricketGain.gain)

    cricket.connect(cricketGain)
    cricketGain.connect(this.masterGain)
    cricket.start()
    cricketLfo.start()

    // Soft celestial wind chime ping every 8 seconds
    const chimeInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return
      try {
        const chime = this.ctx.createOscillator()
        const chimeGain = this.ctx.createGain()
        const notes = [1318.5, 1567.98, 1760.0, 2093.0]
        const freq = notes[Math.floor(Math.random() * notes.length)]
        chime.type = 'sine'
        chime.frequency.setValueAtTime(freq, this.ctx.currentTime)

        chimeGain.gain.setValueAtTime(0.035, this.ctx.currentTime)
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8)

        chime.connect(chimeGain)
        chimeGain.connect(this.masterGain)
        chime.start()
        chime.stop(this.ctx.currentTime + 1.9)
      } catch {}
    }, 7500)

    this.activeGenerators.push({
      stop: () => {
        window.clearInterval(chimeInterval)
        drone1.stop()
        drone2.stop()
        cricket.stop()
        cricketLfo.stop()
      },
    })
  }

  // --- 7: Tanpura & Sitar Drone (Resonant 136.1 Hz Cosmic Om) ---
  private generateSitarMeditation() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx

    // Tanpura string fundamental: 136.1 Hz (Cosmic Om frequency in classical Indian music)
    // Harmonics: 136.1 (Sa), 204.15 (Pa), 272.2 (Sa high), 408.3 Hz
    const freqs = [136.1, 204.15, 272.2, 408.3]
    const oscs = freqs.map((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = i === 1 ? 'triangle' : 'sawtooth'
      osc.frequency.value = f
      osc.detune.value = i % 2 === 0 ? -4 : 5

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 520
      filter.Q.value = 2.4 // Acoustic gourd resonance

      const gain = ctx.createGain()
      gain.gain.value = i === 0 ? 0.35 : 0.22 / (i * 0.7 + 1)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain!)
      osc.start()
      return osc
    })

    this.activeGenerators.push({
      stop: () => oscs.forEach((o) => o.stop()),
    })
  }

  // --- 8: Mountain Brook (Crisp flowing water with pebble splashes) ---
  private generateStream() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx
    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.22 // Boosted from 0.1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true

    const filter1 = ctx.createBiquadFilter()
    filter1.type = 'bandpass'
    filter1.frequency.value = 950
    filter1.Q.value = 1.0

    const filter2 = ctx.createBiquadFilter()
    filter2.type = 'lowpass'
    filter2.frequency.value = 1800

    noise.connect(filter1)
    filter1.connect(filter2)
    filter2.connect(this.masterGain)
    noise.start()

    this.activeGenerators.push({
      stop: () => noise.stop(),
    })
  }

  // --- 9: Tibetan Singing Bowl (432 Hz healing bowl with metallic resonance) ---
  private generateZenBell() {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx

    // Warm continuous singing bowl drone (432 Hz + 864 Hz)
    const bowl1 = ctx.createOscillator()
    bowl1.type = 'sine'
    bowl1.frequency.value = 432
    const bowl1Gain = ctx.createGain()
    bowl1Gain.gain.value = 0.26
    bowl1.connect(bowl1Gain)
    bowl1Gain.connect(this.masterGain)
    bowl1.start()

    const bowl2 = ctx.createOscillator()
    bowl2.type = 'sine'
    bowl2.frequency.value = 864
    bowl2.detune.value = 2.5
    const bowl2Gain = ctx.createGain()
    bowl2Gain.gain.value = 0.12
    bowl2.connect(bowl2Gain)
    bowl2Gain.connect(this.masterGain)
    bowl2.start()

    // Periodic singing strike ring every 6 seconds
    const strikeInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return
      try {
        const strike = this.ctx.createOscillator()
        const strikeGain = this.ctx.createGain()
        strike.type = 'triangle'
        strike.frequency.setValueAtTime(432, this.ctx.currentTime)

        strikeGain.gain.setValueAtTime(0.12, this.ctx.currentTime)
        strikeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5)

        strike.connect(strikeGain)
        strikeGain.connect(this.masterGain)
        strike.start()
        strike.stop(this.ctx.currentTime + 4.6)
      } catch {}
    }, 6000)

    this.activeGenerators.push({
      stop: () => {
        window.clearInterval(strikeInterval)
        bowl1.stop()
        bowl2.stop()
      },
    })
  }
}

// Global singleton instance for component usage
export const ambientAudioService = new AmbientSoundService()
