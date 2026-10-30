'use client'

import { useState } from 'react'
import {
  MapPin,
  Phone,
  Globe,
  ShieldCheck,
  Building2,
  Navigation,
  AlertTriangle,
  Clock,
  Search,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  SUPPORTED_REGIONS,
  matchCoordinatesToRegion,
  getResourcesForRegion,
  type SupportResource,
} from '@/lib/location-service'
import { cn } from '@/lib/utils'

export function LocalSupport({ defaultRegion = 'delhi-ncr' }: { defaultRegion?: string }) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>(defaultRegion)
  const [isLocating, setIsLocating] = useState(false)
  const [isAutoDetected, setIsAutoDetected] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const activeRegion =
    SUPPORTED_REGIONS.find((r) => r.id === selectedRegionId) ?? SUPPORTED_REGIONS[0]

  const resources = getResourcesForRegion(selectedRegionId)

  const filteredResources = resources.filter((res) => {
    if (filterType === 'government' && !res.isGovernment) return false
    if (filterType === 'emergency' && !res.isEmergency) return false
    if (filterType === 'clinics' && res.type !== 'clinical-hospital') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = res.name.toLowerCase().includes(q)
      const matchOrg = res.organization.toLowerCase().includes(q)
      const matchDesc = res.description.toLowerCase().includes(q)
      return matchName || matchOrg || matchDesc
    }
    return true
  })

  // Request browser geolocation on user click
  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const { latitude, longitude } = position.coords
        const matched = matchCoordinatesToRegion(latitude, longitude)
        setSelectedRegionId(matched.id)
        setIsAutoDetected(true)
      },
      (error) => {
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access was not granted. You can select your city manually below.')
        } else {
          setLocationError('Could not determine your location. Please choose your city from the list.')
        }
      },
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-4" />
            Verified Support Directory
          </div>
          <h1 className="mt-1 font-serif text-3xl text-foreground sm:text-4xl">
            Local Support & Helplines
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Discover verified government helplines, hospital psychiatry clinics, and confidential crisis resources relevant to your location.
          </p>
        </div>

        {/* Detect location action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={requestLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
          >
            <Navigation className={cn('size-3.5', isLocating && 'animate-spin')} />
            {isLocating ? 'Locating...' : 'Detect My Location'}
          </button>
        </div>
      </header>

      {/* Region banner & manual selection */}
      <div className="mt-6 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Showing resources for
              </p>
              <p className="font-semibold text-foreground">
                {activeRegion.name}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({activeRegion.stateOrCountry})
                </span>
                {isAutoDetected && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[0.65rem] font-semibold text-success">
                    Approx. location detected
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="region-selector" className="text-xs font-medium text-muted-foreground">
              Change city:
            </label>
            <select
              id="region-selector"
              value={selectedRegionId}
              onChange={(e) => {
                setSelectedRegionId(e.target.value)
                setIsAutoDetected(false)
                setLocationError(null)
              }}
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
            >
              {SUPPORTED_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.stateOrCountry})
                </option>
              ))}
            </select>
          </div>
        </div>

        {locationError && (
          <p className="mt-3 text-xs text-amber flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 shrink-0" />
            {locationError}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-[0.72rem] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>
            Privacy guarantee: Exact GPS coordinates are never stored or displayed. Only your city area is used to suggest nearby care.
          </span>
        </div>
      </div>

      {/* Filter tabs & Search */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'government', label: 'Govt. Helplines' },
            { id: 'clinics', label: 'Hospitals & Clinics' },
            { id: 'emergency', label: 'Emergency / Crisis' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                filterType === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources or hospitals..."
            className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Resource cards list */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filteredResources.map((res) => (
          <ResourceCard key={res.id} resource={res} />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No resources found matching your search. Try adjusting your search term or selecting All India.
        </div>
      )}

      {/* Immediate danger banner */}
      <Card className="mt-8 flex items-start gap-4 border-destructive/20 bg-destructive/5 p-5">
        <AlertTriangle className="size-5 shrink-0 text-destructive mt-0.5" />
        <div className="text-xs leading-relaxed text-foreground/80">
          <p className="font-semibold text-foreground">Immediate Emergency Guidance</p>
          <p className="mt-1">
            If you or someone you know is in immediate physical danger, please call national emergency services (<strong>112</strong> in India, <strong>911</strong> in the US/Canada, <strong>999</strong> in the UK) or visit the nearest hospital casualty department immediately. MindSpace is a supportive wellness sanctuary and is not a substitute for clinical emergency care.
          </p>
        </div>
      </Card>
    </div>
  )
}

function ResourceCard({ resource }: { resource: SupportResource }) {
  return (
    <Card className="flex flex-col justify-between p-5 transition-all hover:border-primary/40 hover:shadow-md">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          {resource.isGovernment && (
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-primary">
              Government Official
            </span>
          )}
          {resource.isEmergency && (
            <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-destructive">
              24/7 Crisis
            </span>
          )}
          {resource.isTollFree && (
            <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-success">
              Toll-Free
            </span>
          )}
          {resource.type === 'clinical-hospital' && (
            <span className="rounded-full bg-sky/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-sky">
              Hospital Psychiatry
            </span>
          )}
        </div>

        <h3 className="mt-3 font-serif text-lg font-semibold text-foreground leading-snug">
          {resource.name}
        </h3>
        <p className="text-xs text-muted-foreground font-medium">{resource.organization}</p>

        <p className="mt-3 text-xs leading-relaxed text-foreground/80">{resource.description}</p>

        {resource.address && (
          <p className="mt-2.5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Building2 className="size-3.5 shrink-0 mt-0.5 text-primary" />
            <span>{resource.address}</span>
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5 text-primary" />
          <span>{resource.hours}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
        {resource.phone ? (
          <a
            href={`tel:${resource.phone.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          >
            <Phone className="size-3.5" />
            {resource.phone}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">Visit in person / online</span>
        )}

        {resource.website && (
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Official Website
            <Globe className="size-3.5" />
          </a>
        )}
      </div>
    </Card>
  )
}

