/**
 * Location & Mental-Health Support Service
 *
 * Privacy-first:
 * - Requires explicit user permission.
 * - Does not silently collect or persist exact GPS coordinates.
 * - Resolves coordinates to a broad locality/city.
 * - Provides manual selection fallback.
 * - Uses only verified government and official helplines (e.g. Tele-MANAS, KIRAN).
 */

export type ServiceType =
  | 'government-helpline'
  | 'emergency'
  | 'clinical-hospital'
  | 'nonprofit-counseling'
  | 'wellness-support'

export interface SupportResource {
  id: string
  name: string
  organization: string
  type: ServiceType
  phone?: string
  altPhone?: string
  website?: string
  address?: string
  hours: string
  languages?: string[]
  isEmergency: boolean
  isGovernment: boolean
  isTollFree: boolean
  description: string
  region: string
  distanceKm?: number
}

export interface RegionInfo {
  id: string
  name: string
  stateOrCountry: string
  lat: number
  lng: number
  radiusKm: number
}

export const SUPPORTED_REGIONS: RegionInfo[] = [
  { id: 'delhi-ncr', name: 'Delhi NCR', stateOrCountry: 'Delhi, India', lat: 28.6139, lng: 77.209, radiusKm: 60 },
  { id: 'mumbai', name: 'Mumbai', stateOrCountry: 'Maharashtra, India', lat: 19.076, lng: 72.8777, radiusKm: 50 },
  { id: 'bengaluru', name: 'Bengaluru', stateOrCountry: 'Karnataka, India', lat: 12.9716, lng: 77.5946, radiusKm: 45 },
  { id: 'hyderabad', name: 'Hyderabad', stateOrCountry: 'Telangana, India', lat: 17.385, lng: 78.4867, radiusKm: 40 },
  { id: 'chennai', name: 'Chennai', stateOrCountry: 'Tamil Nadu, India', lat: 13.0827, lng: 80.2707, radiusKm: 40 },
  { id: 'pune', name: 'Pune', stateOrCountry: 'Maharashtra, India', lat: 18.5204, lng: 73.8567, radiusKm: 35 },
  { id: 'kolkata', name: 'Kolkata', stateOrCountry: 'West Bengal, India', lat: 22.5726, lng: 88.3639, radiusKm: 40 },
  { id: 'india-national', name: 'All India (National)', stateOrCountry: 'India', lat: 20.5937, lng: 78.9629, radiusKm: 2000 },
  { id: 'usa', name: 'United States', stateOrCountry: 'USA', lat: 37.0902, lng: -95.7129, radiusKm: 4000 },
  { id: 'international', name: 'International / Other', stateOrCountry: 'Global', lat: 0, lng: 0, radiusKm: 20000 },
]

/**
 * Verified Government and Official Resources
 * Absolutely NO fabricated phone numbers or organizations.
 */
export const VERIFIED_RESOURCES: SupportResource[] = [
  // --- National Official Helplines (India) ---
  {
    id: 'res-telemanas',
    name: 'Tele-MANAS (National Tele Mental Health Programme)',
    organization: 'Ministry of Health and Family Welfare, Govt. of India',
    type: 'government-helpline',
    phone: '14416',
    altPhone: '1800-891-4416',
    website: 'https://telemanas.mohfw.gov.in',
    hours: '24/7, 365 days',
    languages: ['Hindi', 'English', '20+ Regional Languages'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: true,
    description:
      'Official 24x7 government helpline providing free, confidential mental health counseling and crisis intervention by trained clinical psychologists and counselors across all States/UTs.',
    region: 'india-national',
  },
  {
    id: 'res-kiran',
    name: 'KIRAN Mental Health Helpline',
    organization: 'Ministry of Social Justice and Empowerment, Govt. of India',
    type: 'government-helpline',
    phone: '1800-599-0019',
    website: 'https://niepid.nic.in',
    hours: '24/7, 365 days',
    languages: ['Hindi', 'English', '13 Languages'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: true,
    description:
      'National toll-free helpline providing early screening, first-aid, psychological support, distress management, and mental health rehabilitation referrals.',
    region: 'india-national',
  },
  {
    id: 'res-vandrevala',
    name: 'Vandrevala Foundation Mental Health Helpline',
    organization: 'Cyrus & Priya Vandrevala Foundation',
    type: 'nonprofit-counseling',
    phone: '9999 666 555',
    website: 'https://www.vandrevalafoundation.com',
    hours: '24/7, 365 days',
    languages: ['Hindi', 'English', 'Gujarati', 'Marathi', 'Bengali', 'Tamil', 'Telugu'],
    isEmergency: false,
    isGovernment: false,
    isTollFree: true,
    description:
      'Leading free mental health counseling service in India operated by qualified clinical psychologists and experienced mental health professionals.',
    region: 'india-national',
  },
  {
    id: 'res-aasra',
    name: 'AASRA Suicide Prevention Helpline',
    organization: 'AASRA Mental Health NGO',
    type: 'emergency',
    phone: '91-9820466726',
    website: 'http://www.aasra.info',
    hours: '24/7, 365 days',
    languages: ['English', 'Hindi'],
    isEmergency: true,
    isGovernment: false,
    isTollFree: false,
    description:
      'Voluntary crisis intervention center providing compassionate, confidential, non-judgmental support for people experiencing severe distress or suicidal crisis.',
    region: 'india-national',
  },
  {
    id: 'res-emergency-india',
    name: 'National Emergency Helpline (India)',
    organization: 'Ministry of Home Affairs, Govt. of India',
    type: 'emergency',
    phone: '112',
    altPhone: '108 (Ambulance)',
    website: 'https://112.gov.in',
    hours: '24/7 Emergency Dispatch',
    languages: ['All Regional Languages'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: true,
    description:
      'Unified pan-India emergency number for immediate life safety, medical emergencies, and ambulance dispatch.',
    region: 'india-national',
  },

  // --- Delhi NCR Verified Hospital Clinics ---
  {
    id: 'res-aiims-delhi',
    name: 'AIIMS Department of Psychiatry & Behavioral Sciences',
    organization: 'All India Institute of Medical Sciences (AIIMS Delhi)',
    type: 'clinical-hospital',
    phone: '011-26588500',
    website: 'https://www.aiims.edu',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
    hours: 'Mon-Sat 8:30 AM - 4:00 PM (Emergency 24/7)',
    languages: ['Hindi', 'English'],
    isEmergency: false,
    isGovernment: true,
    isTollFree: false,
    description:
      'Premier tertiary care government psychiatric facility providing outpatient consultations, specialized psychotherapy, and adolescent wellness clinics.',
    region: 'delhi-ncr',
  },
  {
    id: 'res-ihbas-delhi',
    name: 'IHBAS (Institute of Human Behaviour & Allied Sciences)',
    organization: 'Government of NCT of Delhi',
    type: 'clinical-hospital',
    phone: '011-22599750',
    website: 'https://ihbas.delhigovt.nic.in',
    address: 'Taharpur Road, Dilshad Garden, Delhi 110095',
    hours: 'OPD 9:00 AM - 4:00 PM (Emergency 24/7)',
    languages: ['Hindi', 'English'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: false,
    description:
      'Autonomous government neuro-psychiatric hospital offering comprehensive inpatient and outpatient mental health care, addiction treatment, and counseling.',
    region: 'delhi-ncr',
  },

  // --- Mumbai Verified Clinics ---
  {
    id: 'res-kem-mumbai',
    name: 'KEM Hospital Department of Psychiatry',
    organization: 'Seth GS Medical College & KEM Hospital',
    type: 'clinical-hospital',
    phone: '022-24107000',
    website: 'https://www.kem.edu',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    hours: 'Mon-Fri 8:30 AM - 3:30 PM (Casualty 24/7)',
    languages: ['Marathi', 'Hindi', 'English'],
    isEmergency: false,
    isGovernment: true,
    isTollFree: false,
    description:
      'Public psychiatric hospital service offering cognitive behavioral therapy, anxiety and depression clinics, and emergency crisis intervention.',
    region: 'mumbai',
  },
  {
    id: 'res-tiss-icall',
    name: 'iCall Psychosocial Helpline',
    organization: 'Tata Institute of Social Sciences (TISS Mumbai)',
    type: 'nonprofit-counseling',
    phone: '9152987821',
    website: 'https://icallhelpline.org',
    address: 'TISS Campus, VN Purav Marg, Deonar, Mumbai 400088',
    hours: 'Mon-Sat 10:00 AM - 8:00 PM',
    languages: ['Hindi', 'English', 'Marathi'],
    isEmergency: false,
    isGovernment: false,
    isTollFree: false,
    description:
      'Free, confidential telephone and email counseling service run by trained mental health professionals at the Tata Institute of Social Sciences.',
    region: 'mumbai',
  },

  // --- Bengaluru Verified Centers ---
  {
    id: 'res-nimhans-blr',
    name: 'NIMHANS Centre for Well Being & Psychiatry OPD',
    organization: 'National Institute of Mental Health and Neuro Sciences',
    type: 'clinical-hospital',
    phone: '080-46110007',
    altPhone: '080-26995000',
    website: 'https://nimhans.ac.in',
    address: 'Hosur Road, Lakkasandra, Bengaluru, Karnataka 560029',
    hours: 'Mon-Sat 8:00 AM - 4:30 PM (Emergency 24/7)',
    languages: ['Kannada', 'English', 'Hindi', 'Tamil', 'Telugu'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: false,
    description:
      'India’s apex national institute of mental health, providing world-class psychiatric assessment, psychological therapies, stress management, and 24/7 neuro-psychiatric emergency services.',
    region: 'bengaluru',
  },

  // --- Hyderabad Verified Clinics ---
  {
    id: 'res-imh-hyderabad',
    name: 'Institute of Mental Health (IMH Hyderabad)',
    organization: 'Osmania Medical College & Govt. of Telangana',
    type: 'clinical-hospital',
    phone: '040-23814441',
    website: 'https://telangana.gov.in',
    address: 'Erragadda, Sanath Nagar, Hyderabad, Telangana 500018',
    hours: 'Mon-Sat 9:00 AM - 3:00 PM (Emergency 24/7)',
    languages: ['Telugu', 'Hindi', 'English', 'Urdu'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: false,
    description:
      'Government tertiary mental health facility providing outpatient consultation, counseling, psychiatric rehabilitation, and emergency crisis support.',
    region: 'hyderabad',
  },

  // --- Chennai Verified Clinics ---
  {
    id: 'res-imh-chennai',
    name: 'Institute of Mental Health (Kilpauk, Chennai)',
    organization: 'Madras Medical College & Govt. of Tamil Nadu',
    type: 'clinical-hospital',
    phone: '044-26442111',
    website: 'https://tnhealth.tn.gov.in',
    address: 'Medavakkam Tank Road, Kilpauk, Chennai, Tamil Nadu 600010',
    hours: 'Mon-Sat 8:30 AM - 4:00 PM (Emergency 24/7)',
    languages: ['Tamil', 'English'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: false,
    description:
      'Historic public mental health institute offering psychiatric care, community outreach, psychological counseling, and crisis response.',
    region: 'chennai',
  },

  // --- Pune Verified Clinics ---
  {
    id: 'res-sassoon-pune',
    name: 'Sassoon General Hospital Department of Psychiatry',
    organization: 'BJ Government Medical College, Pune',
    type: 'clinical-hospital',
    phone: '020-26128000',
    website: 'https://bjmcpune.org',
    address: 'Jai Prakash Narayan Road, Near Pune Railway Station, Pune 411001',
    hours: 'Mon-Sat 8:30 AM - 3:30 PM (Emergency 24/7)',
    languages: ['Marathi', 'Hindi', 'English'],
    isEmergency: false,
    isGovernment: true,
    isTollFree: false,
    description:
      'Tertiary government psychiatric clinic providing stress management, mood disorder care, psychotherapy, and clinical psychology assessments.',
    region: 'pune',
  },

  // --- Kolkata Verified Clinics ---
  {
    id: 'res-iop-kolkata',
    name: 'Institute of Psychiatry (IOP - COE Kolkata)',
    organization: 'IPGME&R / SSKM Hospital, Govt. of West Bengal',
    type: 'clinical-hospital',
    phone: '033-22236040',
    website: 'https://www.ipgmer.gov.in',
    address: '7 DL Khan Road, Bhowanipore, Kolkata, West Bengal 700025',
    hours: 'Mon-Sat 9:00 AM - 3:00 PM (Emergency 24/7)',
    languages: ['Bengali', 'Hindi', 'English'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: false,
    description:
      'Designated Centre of Excellence in mental health offering clinical psychology, child guidance, adult psychiatric OPD, and emergency care.',
    region: 'kolkata',
  },

  // --- International / US Support ---
  {
    id: 'res-988-usa',
    name: '988 Suicide & Crisis Lifeline',
    organization: 'SAMHSA, U.S. Department of Health and Human Services',
    type: 'government-helpline',
    phone: '988',
    website: 'https://988lifeline.org',
    hours: '24/7, 365 days',
    languages: ['English', 'Spanish', '240+ via Language Line'],
    isEmergency: true,
    isGovernment: true,
    isTollFree: true,
    description:
      'National network of local crisis centers providing free, confidential emotional support to people in suicidal crisis or emotional distress across the United States.',
    region: 'usa',
  },
  {
    id: 'res-findahelpline',
    name: 'Find A Helpline (Global Directory)',
    organization: 'ThroughLine / Tech4Good Free Service',
    type: 'wellness-support',
    website: 'https://findahelpline.com',
    hours: '24/7 Directory',
    languages: ['50+ Countries Supported'],
    isEmergency: false,
    isGovernment: false,
    isTollFree: true,
    description:
      'Free, confidential global lookup connecting you with vetted local crisis lines, helplines, and emotional support services in over 130 countries.',
    region: 'international',
  },
]

/**
 * Calculate approximate distance using Haversine formula
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

/**
 * Find the closest supported region to given coordinates
 */
export function matchCoordinatesToRegion(lat: number, lng: number): RegionInfo {
  // Check cities first (excluding national/international)
  const cityRegions = SUPPORTED_REGIONS.filter(
    (r) => r.id !== 'india-national' && r.id !== 'usa' && r.id !== 'international',
  )

  let closest: RegionInfo = SUPPORTED_REGIONS[0]
  let minDistance = Infinity

  for (const region of cityRegions) {
    const dist = calculateDistanceKm(lat, lng, region.lat, region.lng)
    if (dist < minDistance) {
      minDistance = dist
      closest = region
    }
  }

  // If within 150km of an Indian metro, associate with that metro
  if (minDistance <= 150) {
    return closest
  }

  // If in Indian subcontinent bounding box (lat 6-37, lng 68-98)
  if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 98) {
    return (
      SUPPORTED_REGIONS.find((r) => r.id === 'india-national') ?? SUPPORTED_REGIONS[0]
    )
  }

  // If North America
  if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -65) {
    return SUPPORTED_REGIONS.find((r) => r.id === 'usa') ?? SUPPORTED_REGIONS[0]
  }

  return SUPPORTED_REGIONS.find((r) => r.id === 'international') ?? SUPPORTED_REGIONS[0]
}

/**
 * Retrieve resources relevant to a detected or selected region
 */
export function getResourcesForRegion(regionId: string, userCoords?: { lat: number; lng: number }): SupportResource[] {
  // Always include national Indian helplines for Indian regions
  const isIndianRegion =
    regionId === 'india-national' ||
    SUPPORTED_REGIONS.some(
      (r) => r.id === regionId && r.stateOrCountry.includes('India'),
    )

  const relevant = VERIFIED_RESOURCES.filter((res) => {
    if (res.region === regionId) return true
    if (isIndianRegion && res.region === 'india-national') return true
    if (regionId === 'usa' && res.region === 'usa') return true
    if (res.region === 'international') return true
    return false
  })

  // Attach approximate distances if coordinates are provided
  return relevant.map((res) => {
    const regionMeta = SUPPORTED_REGIONS.find((r) => r.id === res.region)
    if (userCoords && regionMeta && regionMeta.id !== 'international') {
      const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, regionMeta.lat, regionMeta.lng)
      return { ...res, distanceKm: dist }
    }
    return res
  })
}

