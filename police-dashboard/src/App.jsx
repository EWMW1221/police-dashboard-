import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import './App.css'
import image1 from './images 1.jpg'

const translations = {
  en: {
    headerLabel: 'Hawassa City Police',
    headerTitle: 'Hawassa City Crime Reporting System',
    navHome: 'Home',
    navAbout: 'About',
    navHelp: 'Help',
    languageLabel: 'Language:',
    languageOptionAm: 'አማርኛ',
    languageOptionEn: 'English',
    pageTitle: 'Online Crime Reporting',
    pageSubtitle: 'Welcome to the Hawassa City Police Department’s Online Reporting System.',
    victimText: 'You can use the system to report a crime.',
    emergencyTitle: 'Is this an emergency? (If yes, please call 8295 immediately)',
    emergencyText: 'Emergencies should be reported immediately by dialing 8295 on your telephone instead of submitting a police report online.',
    suspectTitle: 'Who is the suspect?',
    suspectText: 'Please provide the name or description of the suspect if you know it.',
    felonyText: 'If the incident involves serious harm or a felony, contact emergency services immediately.',
    continueAlert: 'If you have answered NO to the above question, please continue.',
    noteLabel: 'Note:',
    falseReportText: 'Filing a false police report is a crime! Under the Criminal Code of Ethiopia (2004 E.C.), falsely accusing someone or submitting a false charge or report is a punishable offense; the key provision is as follows: Filing a false charge or report — Article 447 If a person—knowing the individual to be innocent or without having verified fact submiting a false complaint, report, or charge to the police, a public prosecutor, or legal authorities: Standard penalty: Punishable by simple imprisonment or, depending on the case, severe imprisonment. Aggravated case: If, as a result of the false report, the innocent person was arrested and detained, convicted, or suffered serious harm, the penalty may extend to rigorous imprisonment of up to 10 years or more.',
    
    falseReportTitle: 'Do you understand that filing a false police report is a crime?',
    falseReportExplain: 'It is required that you understand that filing a false police report is a crime if you would like to submit a police report online.',
    locationTitle: 'Did the incident occur within the Hawassa city limits?',
    locationText: 'If the incident did not occur within the Hawassa city limits, you should contact the city where the incident occurred instead of submitting a police report online with the Hawassa city.',
    ageTitle: 'Are you eighteen (18) years of age or older?',
    ageText: 'If you are under the age of eighteen (18) years of age, you cannot submit a police report online. Please have a parent or guardian submit the police report for you.',
    emailTitle: 'Do you have an email address? (A valid return email address is required in order to file an online report.)',
    emailText: 'A valid return email address is required in order to submit a police report online so that we can email you your temporary police report number.',
    startReporting: 'Start reporting',
    trackReport: 'Track report',
    reportChoiceTitle: 'How would you like to report?',
    reportChoiceText: 'Choose one of the options below to continue.',
    reportAnonymous: 'Report anonymously',
    reportWithInfo: 'Add your information',
    backButton: 'Back',
    contactTitle: 'Contact Us',
    contactPhone: 'Phone: ',
    contactNonEmergency: 'Non-emergency: ',
    contactEmail: 'Email: ',
    contactAddress: 'Address: Hawassa City Police Department, Hawassa, Sidama Region',
  },
  am: {
    headerLabel: 'ሀዋሳ ከተማ ፖሊስ',
    headerTitle: 'የሀዋሳ ከተማ የወንጀል ሪፖርት ስርዓት',
    navHome: 'መነሻ',
    navAbout: 'ስለ እኛ',
    navHelp: 'እገዛ',
    languageLabel: 'ቋንቋ:',
    languageOptionAm: 'አማርኛ',
    languageOptionEn: 'እንግሊዝኛ',
    pageTitle: 'ኦንላይን የወንጀል ሪፖርት',
    pageSubtitle: 'እንኳን ወደ ሀዋሳ ከተማ ፖሊስ ዳይሬክተር ኦንላይን ሪፖርት ስርዓት በደህና መጡ።',
    victimText: 'ይህን ስርዓት ወንጀል ለማመልከት መጠቀም ይችላሉ።',
    emergencyTitle: 'ይህ አስቸኳይ ነው? (አዎን ከሆነ በፍጥነት ወደ 8295 ይደውሉ)',
    emergencyText: 'በአፋጣኝ ምላሽ ሚፈልግ ጉዳይ ከሆነ 8295 ላይ በመደወል ያመልክቱ ።',
    continueAlert: 'ከላይ ጠየቁትን ጥያቄዎች ሁሉ አይ እንደሆነ ከሆነ እባክዎን ቀጥሉ።',
    noteLabel: 'ማስታወቂያ:',
    falseReportText: `የሐሰት የፖሊስ ሪፖርት ማስገባት ወንጀል ነው! በኢትዮጵያ የወንጀል ሕግ (2004 ዓ.ም) መሠረት ሰውን በሐሰት መወንጀል ወይም የሐሰት ክስ/ጥቆማ ማቅረብ በወንጀል የሚያስጠይቅ ድርጊት ሲሆን፣ ዋናዉ ይህ ነው ፦
​ የሐሰት ክስ ወይም ጥቆማ ማቅረብ — አንቀፅ 447
​አንድ ሰው ንጹሕ እንደሆነ እያወቀ ወይም ሳይመረምር፣ ለፖሊስ፣ ለዐቃቤ ሕግ ወይም ለሕግ አካላት የሐሰት አቤቱታ፣ ጥቆማ ወይም ክስ ካቀረበ፦
​መደበኛ ቅጣት፦ በቀላል እስራት ወይም እንደ ነገሩ ከባድነት በፅኑ እስራት ያስቀጣል።
​ከባድ ከሆነ፦ ቀደም ሲል በቀረበው የሐሰት ጥቆማ ምክንያት ንጹሑ ሰው ተይዞ የታሰረ፣ የተፈረደበት ወይም ከባድ ጉዳት የደረሰበት ከሆነ፣ ቅጣቱ እስከ 10 ዓመት ወይም ከዚያ በላይ በሚደርስ ፅኑ እስራት ሊያደርስ ይችላል።`,
    falseReportTitle: 'የሐሰት የፖሊስ ሪፖርት ማስገባት ወንጀል እንደሆነ እርግጠኛ ነህ?',
    falseReportExplain: 'ኦንላይን የፖሊስ ሪፖርት ማስገባት ከፈለጉ የሐሰት የፖሊስ ሪፖርት ማስገባት ወንጀል እንደሆነ መረዳት ያስፈልጋል።',
    locationTitle: 'ጥቆማው የሀዋሳ ከተማ ውስጥ ነው?',
    locationText: 'ጥቆማው የሀዋሳ ከተማ ውስጥ ካልሆነ ወንጀሉ ለተፈጸመበት ከተማ ፖሊስ ያሳውቁ።',
    ageTitle: '18 ዓመት ወይም ከዚያ በላይ ኖት?',
    ageText: 'ከ18 ዓመት በታች ከሆኑ በኦንላይን የፖሊስ ሪፖርት ማስገባት አይችሉም። እባክዎ ከወላጅ ወይም ከአሳዳጊ በመሆን ሪፖርት ያድርጉ።',
    emailTitle: 'ኢሜይል አድራሻ አለዎት? (ትክክለኛ የኢሜይል አድራሻ የኦንላይን ሪፖርት ለማስገባት ያስፈልጋል.)',
    emailText: 'ትክክለኛ የሆነ የኢሜይል አድራሻ በኦንላይን የ ወንጀል ጥቆማ ለመስጠት እንዲሁም የጊዜያዊ የወንጀል ጥቆማ መቆጣጠርያ ቁጥር እንድንልክሎት ያገለግላል።',
    startReporting: 'ሪፖርት ጀምር',
    trackReport: 'ሪፖርት ይከታተሉ',
    reportChoiceTitle: 'እንዴት ሪፖርት ማድረግ ትፈልጋለህ?',
    reportChoiceText: 'ለመቀጥል ከሚከተሉት አማራጮች ይምረጡ።',
    reportAnonymous: 'ያለማንነት ሪፖርት ያድርጉ',
    reportWithInfo: 'መረጃዎን ይጨምሩ',
    backButton: 'ወደ ኋላ',
    contactTitle: 'እኛን ያግኙ',
    contactPhone: 'ስልክ: ',
  
    contactEmail: 'ኢሜይል: ',
    contactAddress: 'አድራሻ: ሀዋሳ ከተማ ፖሊስ፣ ሲዳማ ክልል',
  },
}

const emptyDashboardStats = {
  total: 0,
  pending: 0,
  resolved: 0,
  byType: [],
  byArea: [],
  reports: [],
}

const subcityLanguagePairs = [
  ['Tabor', 'ታቦር'],
  ['Addis ketema', 'አዲስ ከተማ'],
  ['Hayk Dar', 'ሐይቅ ዳር'],
  ['Mehal', 'መሃል'],
  ['Bahil adarash', 'ባህል አዳራሽ'],
  ['Misrak', 'ምስራቅ'],
  ['Menahariya', 'መናሃሪያ'],
  ['Tula', 'ቱላ'],
]

const kebelesBySubcity = {
  Tula: [
    ['Dato Odahe', 'ዳቶ ኦዳሄ'],
    ['Chafe Koti Jebesa', 'ጨፌ ኮቲ ጀበሣ'],
    ['Gemeto Gale', 'ገመጦ ጋሌ'],
    ['Hawela Wendo', 'ሀዌላ ወንዶ'],
    ['Gara Rikata', 'ጋራ ሪቃታ'],
    ['Chafasne', 'ጫፋስኔ'],
    ['Alemura', 'አለሙራ'],
    ['Tulo', 'ቱሎ'],
    ['Finchawa', 'ፍንጫዋ'],
    ['Haranfama', 'ሀራንፋማ'],
    ['Tula Rural', 'ቱላ ገጠር'],
    ['Tula 01', 'ቱላ 01'],
  ],
  Tabor: [
    ['Hogane Wacho', 'ሆጋነ ዋጮ'],
    ['Dume', 'ዱሜ'],
    ['Htata', 'ሕጣታ'],
    ['Tilte', 'ጥልቴ'],
    ['Fara', 'ፋራ'],
  ],
  Menahariya: [
    ['Piassa', 'ፒያሳ'],
    ['Millennium', 'ሚሊኒየም'],
    ['Guwe', 'ጉዌ'],
  ],
  'Hayk Dar': [
    ['Gudumale', 'ጉዱማለ'],
    ['Gebeya Dar', 'ገበያ ዳር'],
  ],
  'Addis ketema': [
    ['Daka', 'ዳካ'],
    ['Philadelphia', 'ፍላደልፊያ'],
  ],
  Misrak: [
    ['Teso', 'ቴሶ'],
    ['Wukro', 'ውቅሮ'],
  ],
  'Bahil adarash': [
    ['Harar', 'ሀረር'],
    ['Bahil adarash', 'ባህል አደራሽ'],
    ['Andinet', 'አንድነት'],
  ],
  Mehal: [
    ['Laku', 'ለኩ'],
    ['Addis Ababa', 'አዲስ አበባ'],
    ['Nigat Kokeb', 'ንጋት ኮኮብ'],
  ],
}

const subcityPairByKey = new Map(
  subcityLanguagePairs.flatMap(([english, amharic]) => [[english, [english, amharic]], [amharic, [english, amharic]]]),
)

const subcityAliases = {
  'Hayek dar': 'Hayk Dar',
  'ሃይቅ ዳር': 'ሐይቅ ዳር',
  'Tulla (Hawela-tula)': 'Tula',
  'ቱላ (ሐዌላ-ቱላ)': 'ቱላ',
}

const subcityDisplayName = (value) => {
  const rawValue = String(value || '').trim()
  const canonicalValue = subcityAliases[rawValue] || rawValue
  const pair = subcityPairByKey.get(canonicalValue)
    || subcityLanguagePairs.find(([english, amharic]) => normalizeKey(english) === normalizeKey(canonicalValue) || normalizeKey(amharic) === normalizeKey(canonicalValue))
  return pair ? pair.join(' / ') : value || '-'
}

const normalizeSubcity = (value) => {
  const rawValue = String(value || '').trim()
  const canonicalValue = subcityAliases[rawValue] || rawValue
  const pair = subcityPairByKey.get(canonicalValue)
  const normalized = normalizeKey(pair?.[0] || canonicalValue)
  const aliases = {
    haykdar: 'hayekdar',
    tula: 'tullahawelatula',
    tulla: 'tullahawelatula',
    tullahawelatula: 'tullahawelatula',
  }
  return aliases[normalized] || normalized
}

const normalizeKey = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\s_-]+/g, '')
  .replace(/[^\p{L}\p{N}]/gu, '')

const kebeleDisplayNames = {
  ...Object.fromEntries(Object.values(kebelesBySubcity).flat()),
  'Gebeya dar': 'Gebeya Dar / ገበያ ዳር',
  'Hogane wacho': 'Hogane Wacho / ሆጋነ ዋጮ',
  Hitata: 'Htata / ሕጣታ',
  Fura: 'Fara / ፋራ',
  Piyasa: 'Piassa / ፒያሳ',
  Minilium: 'Millennium / ሚሊኒየም',
  Gudumale: 'Gudumale / ጉዱማለ',
  Harer: 'Harar / ሀረር',
  ukire: 'Wukro / ውቅሮ',
  Leku: 'Laku / ለኩ',
  'Addis abeba': 'Addis Ababa / አዲስ አበባ',
  'Chefe koti jebesa': 'Chafe Koti Jebesa / ጨፌ ኮቲ ጀበሣ',
  'Gemeto gale': 'Gemeto Gale / ገመጦ ጋሌ',
  'Hawela wendo': 'Hawela Wendo / ሀዌላ ወንዶ',
  'Gara rikata': 'Gara Rikata / ጋራ ሪቃታ',
  Chafasine: 'Chafasne / ጫፋስኔ',
  Alamura: 'Alemura / አለሙራ',
  'Tula geter': 'Tula Rural / ቱላ ገጠር',
}

const incidentTypeDisplayNames = {
  Theft: 'Theft / ስርቆት',
  'ስርቆት': 'Theft / ስርቆት',
  'Physical assault': 'Physical assault / አካላዊ ጥቃት',
  'Illegal trade and drug trafficking': 'Illegal trade and drug trafficking / ሕጋዊ ያልሆነ ንግድ እና የአደንዛዥ እጽ ሽያጭ',
  'Fraud and scam': 'Fraud and scam / ማታለል እና ማጭበርበር',
  'Missing person': 'Missing person / የጠፋ ሰው',
  'Family and marriage related crimes': 'Family and marriage related crimes / ከቤተሰብ እና ከጋብቻ ጋር የተያያዙ ወንጀሎች',
  'Sexual violence': 'Sexual violence / ፆታዊ ጥቃት',
  'Lost property': 'Lost property / የጠፋ ንብረት',
  Other: 'Other / ሌላ',
}

const displayName = (value, names) => {
  const directMatch = names[value]
  if (directMatch) return directMatch
  const normalizedValue = normalizeKey(value)
  const normalizedMatch = Object.entries(names).find(([name, label]) => (
    normalizeKey(name) === normalizedValue
      || normalizeKey(label) === normalizedValue
      || normalizeKey(label.split(' / ').at(-1)) === normalizedValue
  ))
  return normalizedMatch?.[1] || value || '-'
}

const formatDisplayDate = (value, language = 'en', options = { dateStyle: 'medium', timeStyle: 'short' }) => {
  if (!value) return '-'
  const rawValue = String(value)
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
    ? new Date(`${rawValue}T00:00:00Z`)
    : new Date(rawValue)
  if (Number.isNaN(date.getTime())) return rawValue
  const locale = language === 'am' ? 'am-ET-u-ca-ethiopic' : 'en-US-u-ca-gregory'
  return new Intl.DateTimeFormat(locale, options).format(date)
}

function PasswordInput({ id, value, onChange, required, minLength }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <span className="password-input-wrapper">
      <input
        id={id}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        className="password-visibility-button"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {isVisible ? <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 9 4.2 10 8a10.8 10.8 0 0 1-2.2 4.1M6.1 6.1C3.9 7.6 2.5 10 2 12c1 3.8 4.8 8 10 8 1.1 0 2.1-.2 3.1-.5" /> : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>}
        </svg>
      </button>
    </span>
  )
}

const normalizeIncidentType = (value) => {
  const stringValue = String(value || '').trim()
  if (!stringValue) return ''
  const lowerValue = stringValue.toLowerCase()
  if (['theft', 'theft and scam', 'ስርቆት'].includes(lowerValue) || stringValue === 'ስርቆት') return 'Theft'
  return stringValue
}

const yearlyAnalyticsSubcityOptions = [
  'Addis ketema',
  'Bahil adarash',
  'Hayk Dar',
  'Mehal',
  'Menahariya',
  'Misrak',
  'Tabor',
  'Tula',
]

const yearlyAnalyticsCrimeTypeOptions = [
  'Family and marriage related crimes',
  'Fraud and scam',
  'Illegal trade and drug trafficking',
  'Lost property',
  'Missing person',
  'Other',
  'Physical assault',
  'Sexual violence',
  'Theft',
]

function CrimeAnalytics({ subCity = '' }) {
  const [analytics, setAnalytics] = useState({ total: 0, totalAllYears: 0, year: '', years: [], byYear: [], yearTotals: [], byType: [], bySubcity: [], byKebele: [], subcities: [], kebeles: [], crimeTypes: [], reports: [] })
  const [filters, setFilters] = useState({ year: '', subcity: subCity || '', kebele: '', crime_type: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      setError('')
      try {
        const query = new URLSearchParams(Object.fromEntries(Object.entries({ ...filters, subcity: subCity || filters.subcity }).filter(([, value]) => value)))
        const response = await fetch(`/api/crime-analytics?${query}`)
        if (!response.ok) throw new Error(response.statusText || 'Unable to load crime analytics')
        const result = await response.json()
        setAnalytics(result)
        setFilters((current) => current.year ? current : ({ ...current, year: String(result.year || '') }))
      } catch (loadError) {
        console.error('Crime analytics loading failed:', loadError)
        setError('Crime analytics are unavailable right now.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [subCity, filters])

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }))
  const typeOptions = yearlyAnalyticsCrimeTypeOptions
  const kebeleOptions = analytics.kebeles || []
  const renderBars = (items, formatter = (name) => name, onSelect) => {
    const mergedItems = new Map()
    items.forEach((item) => {
      const label = formatter(item.name)
      const key = normalizeKey(label)
      const existing = mergedItems.get(key)
      mergedItems.set(key, existing
        ? { ...existing, count: existing.count + item.count }
        : { name: label, value: item.name, count: item.count })
    })
    const displayItems = [...mergedItems.values()].sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    const maximum = Math.max(...displayItems.map((item) => item.count), 1)
    return displayItems.length === 0
      ? <p className="analytics-empty">No data for this selection.</p>
      : <div className="analytics-chart-list">{displayItems.map((item) => (
        <button type="button" className="analytics-chart-row" key={item.name} onClick={() => onSelect?.(item.value)}>
          <div className="analytics-chart-label"><span>{formatter(item.name)}</span><strong>{item.count}</strong></div>
          <div className="analytics-bar-track"><span style={{ width: `${(item.count / maximum) * 100}%` }} /></div>
        </button>
      ))}</div>
  }
  const formatReportDate = (value) => value ? formatDisplayDate(value, 'en', { dateStyle: 'medium' }) : '-'
  const reportRows = analytics.reports || []

  return (
    <section className="crime-analytics" aria-labelledby="crime-analytics-title">
      <div className="dashboard-section-heading">
        <h2 id="crime-analytics-title">Crime analytics</h2>
        <p className="analytics-summary">{isLoading ? 'Loading PostgreSQL results...' : `${analytics.total} reports in ${analytics.year || 'the selected year'} · ${analytics.totalAllYears} across all years`}</p>
      </div>
      <div className="analytics-filters" aria-label="Crime analytics filters">
        <label>Year
          <select value={filters.year} onChange={(event) => updateFilter('year', event.target.value)}>
            {analytics.years.map((year) => {
              const yearTotal = analytics.yearTotals.find((item) => item.year === Number(year))?.count || 0
              return <option key={year} value={year}>{year}{yearTotal === 0 ? ' - No reports' : ` - ${yearTotal} reports`}</option>
            })}
          </select>
        </label>
        <label>Sub-city
          {subCity
            ? <input value={subcityDisplayName(subCity)} readOnly aria-label="Assigned sub-city" />
            : <select value={filters.subcity} onChange={(event) => updateFilter('subcity', event.target.value)}><option value="">All sub-cities</option>{yearlyAnalyticsSubcityOptions.map((name) => <option key={name} value={name}>{subcityDisplayName(name)}</option>)}</select>}
        </label>
        <label>Kebele
          <select value={filters.kebele} onChange={(event) => updateFilter('kebele', event.target.value)}><option value="">All kebeles</option>{kebeleOptions.map((name) => <option key={name} value={name}>{displayName(name, kebeleDisplayNames)}</option>)}</select>
        </label>
        <label>Crime type
          <select value={filters.crime_type} onChange={(event) => updateFilter('crime_type', event.target.value)}><option value="">All crime types</option>{typeOptions.map((name) => <option key={name} value={name}>{displayName(name, incidentTypeDisplayNames)}</option>)}</select>
        </label>
      </div>
      {error ? <p className="analytics-error">{error}</p> : (
        <>
          <div className="analytics-kpi-grid">
            <article className="analytics-kpi"><span>Selected year</span><strong>{analytics.total}</strong><small>{analytics.year || '-'}</small></article>
            <article className="analytics-kpi"><span>City / region total</span><strong>{analytics.totalAllYears}</strong><small>All available years</small></article>
            <article className="analytics-kpi"><span>Top crime type</span><strong>{analytics.byType[0]?.count || 0}</strong><small>{analytics.byType[0] ? displayName(analytics.byType[0].name, incidentTypeDisplayNames) : 'No data'}</small></article>
          </div>
          <div className="analytics-grid">
            <article className="analytics-panel analytics-panel-wide"><h3>Yearly trend</h3><div className="analytics-trend-list">{analytics.byYear.map((item, index) => { const previous = analytics.byYear[index - 1]?.count; const change = previous ? item.count - previous : 0; return <div className="analytics-trend-row" key={item.year}><strong>{item.year}</strong><span>{item.count}</span><small className={change > 0 ? 'trend-up' : change < 0 ? 'trend-down' : ''}>{index === 0 ? 'Baseline' : `${change > 0 ? '+' : ''}${change} vs prior year`}</small></div> })}</div></article>
            <article className="analytics-panel"><h3>Most reported crime types</h3>{renderBars(analytics.byType, (name) => displayName(name, incidentTypeDisplayNames))}</article>
            <article className="analytics-panel"><h3>Sub-city reports</h3>{renderBars(analytics.bySubcity, subcityDisplayName, (name) => updateFilter('subcity', name))}</article>
            <article className="analytics-panel"><h3>Kebele reports</h3>{renderBars(analytics.byKebele, (name) => displayName(name, kebeleDisplayNames), (name) => updateFilter('kebele', name))}</article>
            <article className="analytics-panel analytics-panel-wide"><h3>Reports for {analytics.year || 'selected year'}</h3>{reportRows.length === 0 ? <p className="analytics-empty">No reports for this selection.</p> : <div className="analytics-report-table-wrap"><table className="analytics-report-table"><thead><tr><th>Tracking</th><th>Crime type</th><th>Sub-city</th><th>Kebele</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{reportRows.map((report) => <tr key={report.id}><td>{report.tracking_number_en || report.tracking_number_am || `#${report.id}`}</td><td>{displayName(report.incident_type || report.report_type, incidentTypeDisplayNames)}</td><td>{subcityDisplayName(report.subcity)}</td><td>{displayName(report.kebele, kebeleDisplayNames)}</td><td>{formatReportDate(report.created_at)}</td><td>{report.status || 'new'}</td></tr>)}</tbody></table></div>}</article>
          </div>
        </>
      )}
    </section>
  )
}

function Dashboard({ subCity, language }) {
  const [stats, setStats] = useState(emptyDashboardStats)
  const [externalReports, setExternalReports] = useState([])
  const [dashboardError, setDashboardError] = useState('')
  const [reportsError, setReportsError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState('all')
  const [selectedIncidentType, setSelectedIncidentType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [progressSaveState, setProgressSaveState] = useState({})
  const [additionalRequestDrafts, setAdditionalRequestDrafts] = useState({})
  const [additionalRequestState, setAdditionalRequestState] = useState({})
  const [selectedAdditionalResponse, setSelectedAdditionalResponse] = useState(null)
  const [additionalResponseActionState, setAdditionalResponseActionState] = useState({ status: 'idle', error: '' })
  const [reportCategory, setReportCategory] = useState('normal')
  const [reportStatusFilter, setReportStatusFilter] = useState('')
  const [reportLocationFilter, setReportLocationFilter] = useState('')
  const [reportDateFilter, setReportDateFilter] = useState('')
  const [reportSort, setReportSort] = useState('newest')
  const [selectedReportDetails, setSelectedReportDetails] = useState(null)
  const [isRefreshingReports, setIsRefreshingReports] = useState(false)

  useEffect(() => {
    if (!selectedReportDetails && !selectedAdditionalResponse) return undefined
    const handleDialogKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedReportDetails(null)
        setSelectedAdditionalResponse(null)
      }
    }
    window.addEventListener('keydown', handleDialogKeyDown)
    return () => window.removeEventListener('keydown', handleDialogKeyDown)
  }, [selectedReportDetails, selectedAdditionalResponse])

  const getNormalizedStatus = (status) => {
    const value = String(status || 'new').trim().toLowerCase()
    if (['under investigation', 'under_investigation', 'in progress', 'in_progress', 'pending', 'investigation'].includes(value)) {
      return 'under investigation'
    }
    if (value === 'resolved') return 'resolved'
    return 'new'
  }

  const sortByNewestFirst = (reports) => [...reports].sort((left, right) => {
    const leftTime = left.externalCreatedAt || left.createdAt || left.created_at || left.date || 0
    const rightTime = right.externalCreatedAt || right.createdAt || right.created_at || right.date || 0
    const leftTimestamp = leftTime ? new Date(leftTime).getTime() : 0
    const rightTimestamp = rightTime ? new Date(rightTime).getTime() : 0
    return rightTimestamp - leftTimestamp
  })

  const findDashboardReport = (reportId) => externalReports.find((report) => report.id === reportId)
    || (stats.reports || []).find((report) => report.id === reportId)

  const updateReportStatusLocally = (reportId, nextStatus) => {
    const normalizedStatus = getNormalizedStatus(nextStatus)
    setExternalReports((currentReports) => currentReports.map((report) => (
      report.id === reportId
        ? {
            ...report,
            status: normalizedStatus,
            generalInformation: normalizedStatus === 'resolved'
              ? report.resolvedInvestigationProgress || ''
              : report.underInvestigationProgress || '',
          }
        : report
    )))
    setStats((currentStats) => ({
      ...currentStats,
      reports: (currentStats.reports || []).map((report) => (
        report.id === reportId
          ? {
              ...report,
              status: normalizedStatus,
              generalInformation: normalizedStatus === 'resolved'
                ? report.resolvedInvestigationProgress || ''
                : report.underInvestigationProgress || '',
            }
          : report
      )),
    }))
  }

  const handleStatusChange = async (reportId, nextStatus) => {
    const normalizedStatus = getNormalizedStatus(nextStatus)
    const report = findDashboardReport(reportId)
    const previousStatus = getNormalizedStatus(report?.status)
    updateReportStatusLocally(reportId, normalizedStatus)

    try {
      let response = await fetch(`/api/reports/${reportId}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: normalizedStatus }),
      })

      if (response.status === 404) {
        response = await fetch(`/api/reports/${reportId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: normalizedStatus }),
        })
      }

      if (!response.ok) {
        throw new Error(response.statusText || 'Unable to update report status')
      }

      const savedReport = await response.json()
      updateReportStatusLocally(reportId, savedReport.status)
    } catch (error) {
      console.error('Report status update failed:', error)
      updateReportStatusLocally(reportId, previousStatus)
    }
  }

  const updateReportGeneralInformationLocally = (reportId, generalInformation) => {
    setExternalReports((currentReports) => currentReports.map((report) => {
      if (report.id !== reportId) return report
      const nextStatus = getNormalizedStatus(report.status)
      const progressField = nextStatus === 'resolved'
        ? 'resolvedInvestigationProgress'
        : 'underInvestigationProgress'
      return {
        ...report,
        generalInformation,
        [progressField]: generalInformation,
      }
    }))
    setStats((currentStats) => ({
      ...currentStats,
      reports: (currentStats.reports || []).map((report) => {
        if (report.id !== reportId) return report
        const nextStatus = getNormalizedStatus(report.status)
        const progressField = nextStatus === 'resolved'
          ? 'resolvedInvestigationProgress'
          : 'underInvestigationProgress'
        return {
          ...report,
          generalInformation,
          [progressField]: generalInformation,
        }
      }),
    }))
  }

  const handleGeneralInformationBlur = async (reportId, generalInformation) => {
    const report = findDashboardReport(reportId)
    const progressStatus = getNormalizedStatus(report?.status)
    if (!['under investigation', 'resolved'].includes(progressStatus)) return
    setProgressSaveState((current) => ({
      ...current,
      [reportId]: { status: 'saving', message: '' },
    }))

    try {
      let response = await fetch(`/api/reports/${reportId}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investigation_progress: generalInformation, status: progressStatus }),
      })

      if (response.status === 404) {
        response = await fetch(`/api/reports/${reportId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ investigation_progress: generalInformation, status: progressStatus }),
        })
      }

      if (!response.ok) throw new Error(response.statusText || 'Unable to save case information')
      const savedReport = await response.json()
      updateReportGeneralInformationLocally(reportId, savedReport.generalInformation ?? generalInformation)
      setProgressSaveState((current) => ({
        ...current,
        [reportId]: { status: 'saved', message: 'Saved' },
      }))
    } catch (error) {
      console.error('Resolved case information save failed:', error)
      setProgressSaveState((current) => ({
        ...current,
        [reportId]: { status: 'error', message: 'Unable to save progress. Try again.' },
      }))
    }
  }

  const handleAdditionalInformationRequest = async (reportId) => {
    const message = String(additionalRequestDrafts[reportId] || '').trim()
    if (!message) {
      setAdditionalRequestState((current) => ({ ...current, [reportId]: { status: 'error', message: language === 'am' ? 'እባክዎ መልዕክት ያስገቡ።' : 'Enter a request message.' } }))
      return
    }
    setAdditionalRequestState((current) => ({ ...current, [reportId]: { status: 'saving', message: '' } }))
    try {
      const response = await fetch(`/api/reports/${reportId}/additional-information/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!response.ok) {
        let errorMessage = response.statusText || 'Unable to send request'
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.error || errorMessage
        } catch (parseError) {
          console.error('Additional information error response could not be parsed:', parseError)
        }
        throw new Error(errorMessage)
      }
      const result = await response.json()
      const nextRequests = result.request ? [result.request] : []
      const updateReport = (report) => report.id === reportId
        ? { ...report, additionalInformationRequests: [...nextRequests, ...(report.additionalInformationRequests || [])] }
        : report
      setExternalReports((current) => current.map(updateReport))
      setStats((current) => ({ ...current, reports: (current.reports || []).map(updateReport) }))
      setAdditionalRequestDrafts((current) => ({ ...current, [reportId]: '' }))
      setAdditionalRequestState((current) => ({ ...current, [reportId]: { status: 'saved', message: language === 'am' ? 'ጥያቄው ተልኳል።' : 'Request sent.' } }))
    } catch (error) {
      console.error('Additional information request failed:', error)
      setAdditionalRequestState((current) => ({
        ...current,
        [reportId]: {
          status: 'error',
          message: language === 'am' ? 'ጥያቄው አልተላከም።' : error.message || 'Unable to send request.',
        },
      }))
    }
  }

  const updateAdditionalRequestLocally = (reportId, updatedRequest, reportStatus) => {
    const updateReport = (report) => report.id === reportId
      ? {
          ...report,
          status: reportStatus || report.status,
          additionalInformationRequests: (report.additionalInformationRequests || []).map((request) => (
            request.id === updatedRequest.id ? updatedRequest : request
          )),
        }
      : report
    setExternalReports((current) => current.map(updateReport))
    setStats((current) => ({ ...current, reports: (current.reports || []).map(updateReport) }))
  }

  const handleAdditionalResponseAction = async (action) => {
    const selected = selectedAdditionalResponse
    if (!selected) return
    setAdditionalResponseActionState({ status: 'saving', error: '' })
    try {
      const response = await fetch(`/api/reports/${selected.report.id}/additional-information/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ request_id: selected.request.id, action }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to update the response')
      updateAdditionalRequestLocally(selected.report.id, result.request, result.reportStatus)
      setSelectedAdditionalResponse((current) => current ? {
        ...current,
        request: result.request,
        report: { ...current.report, status: result.reportStatus || current.report.status },
      } : current)
      setAdditionalResponseActionState({ status: 'saved', error: '' })
    } catch (error) {
      console.error('Additional response action failed:', error)
      setAdditionalResponseActionState({ status: 'error', error: error.message || 'Unable to update the response' })
    }
  }

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setDashboardError('')
        const query = new URLSearchParams({ subcity: subCity })
        const response = await fetch(`/api/dashboard-stats?${query}`)
        if (!response.ok) {
          throw new Error(response.statusText || 'Unable to load dashboard data')
        }

        setStats(await response.json())
      } catch (error) {
        console.error('Dashboard data loading failed:', error)
        setDashboardError('Dashboard statistics could not be loaded from the database.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardStats()
  }, [subCity])

  useEffect(() => {
    let isMounted = true
    const loadExternalReports = async () => {
      try {
        setReportsError('')
        const response = await fetch('/api/reports/')
        if (!response.ok) throw new Error(response.statusText || 'Unable to load report answers')
        const reports = await response.json()
        if (isMounted) setExternalReports(Array.isArray(reports) ? reports : [])
      } catch (error) {
        console.error('Report answers loading failed:', error)
        if (isMounted) setReportsError('Reports could not be loaded from the database.')
      }
    }

    loadExternalReports()
    const refreshTimer = window.setInterval(loadExternalReports, 15000)
    return () => {
      isMounted = false
      window.clearInterval(refreshTimer)
    }
  }, [])

  const refreshReports = async () => {
    setIsRefreshingReports(true)
    try {
      setReportsError('')
      const response = await fetch('/api/reports/', { credentials: 'same-origin' })
      if (!response.ok) throw new Error(response.statusText || 'Unable to refresh reports')
      const reports = await response.json()
      setExternalReports(Array.isArray(reports) ? reports : [])
    } catch (error) {
      console.error('Report refresh failed:', error)
      setReportsError('Reports could not be refreshed from the database.')
    } finally {
      setIsRefreshingReports(false)
    }
  }

  const isDisplayableValue = (value) => {
    if (value === '' || value === null || value === undefined || typeof value !== 'string') return true
    const normalized = value.trim().toLowerCase()
    return normalized !== 'all the questions are answered, selected and checked'
      && normalized !== 'all the questions are answered, selected and checkedall the questions are answered, selected and checked'
      && normalized !== 'the report could not be saved. please start the django backend and try again.'
  }

  const renderInformationValue = (value, fieldName = '') => {
    if (value === null || value === undefined) return '-'
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <span key={index}>
          {index > 0 && ', '}
          {renderInformationValue(item, fieldName)}
        </span>
      ))
    }
    if (typeof value === 'object' && value.url) {
      const isLocalFileLink = typeof value.url === 'string' && value.url.startsWith('file://')
      return (
        <a href={value.url} target={isLocalFileLink ? undefined : '_blank'} rel={isLocalFileLink ? undefined : 'noreferrer'}>
          {value.original_name || value.name || value.url}
        </a>
      )
    }
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'string') {
      const normalizedFieldName = fieldName.toLowerCase().replace(/[_-]/g, '')
      if (normalizedFieldName.includes('date')) return formatDisplayDate(value, language, { dateStyle: 'medium' })
      return value
    }
    return String(value)
  }

  const renderStructuredEntries = (entries, emptyText) => {
    const validEntries = entries.filter(([, value]) => isDisplayableValue(value) || value === null)
    if (validEntries.length === 0) return <p className="empty-report-information">{emptyText}</p>

    return (
      <dl className="report-information-list">
        {validEntries.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{renderInformationValue(value, label)}</dd>
          </div>
        ))}
      </dl>
    )
  }

  const getReporterInfoEntries = (report) => {
    const reporterDetails = report.reporterDetails || {}
    const valueMap = {
      'Full name': reporterDetails.full_name || reporterDetails.fullName || reporterDetails.fullNameAm || reporterDetails.fullNameEn || '-',
      'Email': reporterDetails.email || reporterDetails.emailEn || reporterDetails.emailAm || '-',
      'Phone': reporterDetails.phone || reporterDetails.phoneEn || reporterDetails.phoneAm || '-',
      'Sex': reporterDetails.sex || reporterDetails.sexEn || reporterDetails.sexAm || '-',
      'Age': reporterDetails.age || reporterDetails.ageEn || reporterDetails.ageAm || '-',
      'Anonymous email': reporterDetails.anonymous_email || reporterDetails.anonymousEmail || reporterDetails.anonymousEmailEn || reporterDetails.anonymousEmailAm || '-',
      'Kebele': report.kebele || '-',
      'Subcity': report.subcity || '-',
    }

    return Object.entries(valueMap)
  }

  const getTheftIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Did you see the person who stole it?': incidentInformation.sawSuspect || incidentInformation.saw_suspect || '-',
      'Are there any witnesses?': incidentInformation.hasWitnesses || incidentInformation.has_witnesses || '-',
      'Do you suspect anyone?': incidentInformation.suspectAnyone || incidentInformation.suspect_anyone || '-',
      'What exactly was stolen?': incidentInformation.stolenItem || incidentInformation.stolen_item || '-',
      'Please describe how the theft happened.': incidentInformation.theftDescription || incidentInformation.theft_description || '-',
      'Describe the location where the incident happened.': incidentInformation.theftLocation || incidentInformation.theft_location || '-',
      'Describe the suspect (if you saw them) (eg:- cloth, height, skin type, age range).': incidentInformation.suspectDescription || incidentInformation.suspect_description || '-',
      'Whose item is stolen?': incidentInformation.ownerDescription || incidentInformation.owner_description || '-',
      'Is the item individual or organization property? If it is organization property, state the organization.': incidentInformation.propertyOwnership || incidentInformation.property_ownership || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles && incidentInformation.uploadedFiles.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getTheftAmharicIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'የድርጊቱ ቀን ፡': incidentInformation.incident_date || report.date || '-',
      'የድርጊቱ ግምታዊ ሰዓት ፡': incidentInformation.incident_time || report.time || '-',
      'ክስተቱ የተፈጠረበትን ቀበሌ': incidentInformation.incident_kebele || report.kebele || '-',
      'የክስተቱ የተፈጠረበት አድራሻ (ክፍለ ከተማ)': incidentInformation.incident_subcity || report.subcity || '-',
      'የሰረቀውን ሰው ታቀዋለህ?': getYesNoAnswer(report, incidentInformation, ['sawSuspectAm', 'saw suspect', 'ታቀዋለህ', 'saw suspect am']),
      'ምስክሮች አሉ?': getYesNoAnswer(report, incidentInformation, ['hasWitnessesAm', 'has witnesses', 'ምስክሮች', 'witnesses']),
      'ሚጠረጥሩት ሰው አለ?': getYesNoAnswer(report, incidentInformation, ['suspectAnyoneAm', 'suspect anyone', 'ሚጠረጥሩት', 'suspect']),
      'የተሰረቀው ምንድን ነው?': incidentInformation.stolenItemAm || incidentInformation.stolen_item_am || incidentInformation.stolenItem || incidentInformation.stolen_item || '-',
      'ስርቆቱ እንዴት ተከሰተ ይግለፁ': incidentInformation.theftDescriptionAm || incidentInformation.theft_description_am || incidentInformation.theftDescription || incidentInformation.theft_description || '-',
      'የክስ ቦታውን ይግለጹ': incidentInformation.theftLocationAm || incidentInformation.theft_location_am || incidentInformation.theftLocation || incidentInformation.theft_location || '-',
      'ተጠርጣሪውን ይግለጹ (ልብስ፣ ከፍታ፣ ቆዳ ዓይነት፣ ዕድሜ ወዘተ)': incidentInformation.suspectDescriptionAm || incidentInformation.suspect_description_am || incidentInformation.suspectDescription || incidentInformation.suspect_description || '-',
      'የማን ንብረት ነው የተሰረቀው?': incidentInformation.ownerDescriptionAm || incidentInformation.owner_description_am || incidentInformation.ownerDescription || incidentInformation.owner_description || '-',
      'ንብረቱ የግለሰብ ነው ወይም የድርጅት? ከድርጅት የሆነ ከሆነ ድርጅቱን ይግለጹ።': incidentInformation.propertyOwnershipAm || incidentInformation.property_ownership_am || incidentInformation.propertyOwnership || incidentInformation.property_ownership || '-',
    }

    return Object.entries(normalized)
  }

  const getYesNoAnswer = (report, incidentInformation, aliases) => {
    const answerSources = [
      report.yesNoAnswers,
      report.yes_no_answer,
      report.questionAnswers,
      incidentInformation.yes_no_answer,
      incidentInformation.yes_no_answers,
    ]

    for (const source of answerSources) {
      if (!source) continue
      if (!Array.isArray(source)) {
        const directKey = aliases.find((alias) => source[alias] !== undefined)
        if (directKey) return source[directKey]
        continue
      }

      const answer = source.find((item) => {
        const text = typeof item === 'object'
          ? `${item.key || ''} ${item.name || ''} ${item.question || ''} ${item.field || ''}`.toLowerCase()
          : String(item).toLowerCase()
        return aliases.some((alias) => text.includes(alias.toLowerCase()))
      })
      if (answer !== undefined) {
        return typeof answer === 'object' ? answer.answer ?? answer.value ?? '-' : answer
      }
    }

    return '-'
  }

  const getAssaultIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Do you know the attacker?': incidentInformation.knowAttacker || getYesNoAnswer(report, incidentInformation, ['knowAttacker', 'know attacker']),
      'Did you get injured?': incidentInformation.gotInjured || getYesNoAnswer(report, incidentInformation, ['gotInjured', 'got injured']),
      'Did you go to a hospital/clinic?': getYesNoAnswer(report, incidentInformation, ['visitedHospital', 'hospital', 'clinic']),
      'Are there any witnesses?': getYesNoAnswer(report, incidentInformation, ['hasWitnessesAssault', 'witnesses']),
      'Do you still feel in danger?': getYesNoAnswer(report, incidentInformation, ['feelDanger', 'feel in danger']),
      'Please describe what happened': incidentInformation.assaultDescription || incidentInformation.assault_description || '-',
      'What did the attacker use? (hands, stick, etc.)': incidentInformation.assaultWeapon || incidentInformation.assault_weapon || '-',
      'Describe the attacker': incidentInformation.attackerDescription || incidentInformation.attacker_description || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getAssaultAmharicIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'የድርጊቱ ቀን': incidentInformation.incident_date || report.date || '-',
      'የድርጊቱ ግምታዊ ሰዓት': incidentInformation.incident_time || report.time || '-',
      'ክስተቱ የተፈጠረበትን ቀበሌ': incidentInformation.incident_kebele || report.kebele || '-',
      'የክስተቱ የተፈጠረበት አድራሻ (ክፍለ ከተማ)': incidentInformation.incident_subcity || report.subcity || '-',
      'ጥቃት አድራሹን ታውቀዋለህ?': incidentInformation.knowAttackerAm || getYesNoAnswer(report, incidentInformation, ['knowAttackerAm', 'ጥቃት አድራሹን', 'know attacker']),
      'ተጎድተሃል?': incidentInformation.gotInjuredAm || getYesNoAnswer(report, incidentInformation, ['gotInjuredAm', 'ተጎድተሃል', 'got injured']),
      'ወደ ህክምና ጣቢያ / ሆስፒታል ሄደሃል?': getYesNoAnswer(report, incidentInformation, ['visitedHospitalAm', 'ህክምና ጣቢያ', 'ሆስፒታል', 'hospital']),
      'ምስክሮች አሉ?': getYesNoAnswer(report, incidentInformation, ['hasWitnessesAssaultAm', 'ምስክሮች', 'witnesses']),
      'አሁንም በስጋት ውስጥ ነህ?': getYesNoAnswer(report, incidentInformation, ['feelDangerAm', 'በስጋት', 'feel in danger']),
      'እባክዎን ምን እንደተከሰተ ያስረዱ': incidentInformation.assaultDescriptionAm || '-',
      'ምን አይነት መሳሪያ ተጠቀመ?': incidentInformation.assaultWeaponAm || '-',
      'ጥቃት አድራሹን ግለጽልኝ': incidentInformation.attackerDescriptionAm || '-',
    }

    return Object.entries(normalized)
  }

  const getIllegalTradeIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Did you personally witness the activity?': getYesNoAnswer(report, incidentInformation, ['personally witness', 'witness the activity', 'witnessedActivity']),
      'Is this still happening now?': getYesNoAnswer(report, incidentInformation, ['still happening', 'happening now', 'stillHappening']),
      'Do you know the people involved?': getYesNoAnswer(report, incidentInformation, ['people involved', 'know the people', 'knowPeopleInvolved']),
      'Are there any witnesses?': getYesNoAnswer(report, incidentInformation, ['witnesses']),
      'Do you have any photos, videos, or other evidence?': getYesNoAnswer(report, incidentInformation, ['photos', 'videos', 'other evidence', 'hasEvidence']),
      'Please describe what you observed (what was being traded or moved, location, time, number of people, vehicles, etc.)': incidentInformation.observedDescription || incidentInformation.observed_description || '-',
      'Any additional details that can help the police (names, phone numbers, vehicle plate numbers, habitual places, etc.)': incidentInformation.additionalDetails || incidentInformation.additional_details || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getIllegalTradeAmharicIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'የድርጊቱ ቀን': incidentInformation.incident_date || report.date || '-',
      'የድርጊቱ ግምታዊ ሰዓት': incidentInformation.incident_time || report.time || '-',
      'ክስተቱ የተፈጠረበትን ቀበሌ': incidentInformation.incident_kebele || report.kebele || '-',
      'የክስተቱ የተፈጠረበት አድራሻ (ክፍለ ከተማ)': incidentInformation.incident_subcity || report.subcity || '-',
      'ድርጊቱን በግል ተመልክተውታል?': getYesNoAnswer(report, incidentInformation, ['በግል ተመልክተውታል', 'personally witness', 'witnessedActivity']),
      'ይህ አሁንም እየተካሄደ ያለ ነገር ነው?': getYesNoAnswer(report, incidentInformation, ['እየተካሄደ', 'still happening', 'stillHappening']),
      'በዚህ ውስጥ የተሳተፉትን ሰዎች ያውቋቸዋል?': getYesNoAnswer(report, incidentInformation, ['የተሳተፉትን ሰዎች', 'people involved', 'knowPeopleInvolved']),
      'ምስክሮች አሉ?': getYesNoAnswer(report, incidentInformation, ['ምስክሮች', 'witnesses']),
      'ፎቶዎች፣ ቪዲዮዎች ወይም ሌሎች ማስረጃዎች አሉዎት?': getYesNoAnswer(report, incidentInformation, ['ፎቶዎች', 'ማስረጃዎች', 'photos', 'hasEvidence']),
      'እባክዎ የተመለከቱትን ነገር ያብራሩ (ምን ዓይነት እቃ/ዕፅ ሲሸጥ ወይም ሲዘዋወር እንደነበር፣ ቦታውን፣ ሰዓቱን፣ የሰዎችን ብዛት፣ የተሽከርካሪዎችን መረጃ እና የመሳሰሉትን)': incidentInformation.observedDescriptionAm || '-',
      'ለፖሊስ ሊረዱ የሚችሉ ተጨማሪ መረጃዎች (ስሞች፣ የስልክ ቁጥሮች፣ የተሽከርካሪ የሰሌዳ ቁጥሮች፣ ዘወትር የሚገኙባቸው ቦታዎች እና የመሳሰሉት)': incidentInformation.additionalDetailsAm || '-',
      'ማስረጃ አለዎት? ምስል፣ ድምጽ ወይም ቪዲዮ ማስገባት ይችላሉ።': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getLostPropertyIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Have you already searched the area thoroughly?': getYesNoAnswer(report, incidentInformation, ['searched the area', 'searchedArea']),
      'Does the item contain important documents or high value?': getYesNoAnswer(report, incidentInformation, ['important documents', 'high value', 'importantOrHighValue']),
      'Does the item have a unique mark or identification?': getYesNoAnswer(report, incidentInformation, ['unique mark', 'identification', 'uniqueMark']),
      'Do you suspect it was stolen rather than simply lost?': getYesNoAnswer(report, incidentInformation, ['stolen rather', 'simply lost', 'suspectStolen']),
      'What exactly did you lose? (detailed description)': incidentInformation.lostItemDescription || incidentInformation.lost_item_description || '-',
      'When and where did you last see it?': incidentInformation.lostWhenWhere || incidentInformation.lost_when_where || '-',
      'Please provide any unique features, or other identifying details': incidentInformation.lostUniqueFeatures || incidentInformation.lost_unique_features || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getOtherIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Was anyone injured?': getYesNoAnswer(report, incidentInformation, ['anyone injured', 'was injured', 'anyoneInjured']),
      'Do you have any evidence?': getYesNoAnswer(report, incidentInformation, ['do you have any evidence', 'has evidence', 'hasEvidence']),
      'Please describe what happened in detail': incidentInformation.otherDescription || incidentInformation.other_description || '-',
      'Who was involved?': incidentInformation.otherInvolved || incidentInformation.other_involved || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getSexualViolenceIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Did the incident involve physical contact?': getYesNoAnswer(report, incidentInformation, ['physical contact', 'physicalContact']),
      'Do you know the perpetrator?': getYesNoAnswer(report, incidentInformation, ['perpetrator', 'knowPerpetrator']),
      'Did it happen recently (within the last 72 hours)?': getYesNoAnswer(report, incidentInformation, ['72 hours', 'happen recently', 'recent72']),
      'Have you already sought medical help?': getYesNoAnswer(report, incidentInformation, ['sought medical', 'medical help', 'soughtMedical']),
      'Are there any witnesses?': getYesNoAnswer(report, incidentInformation, ['witnesses']),
      'Do you want the case to remain confidential?': getYesNoAnswer(report, incidentInformation, ['remain confidential', 'confidential']),
      'Do you need immediate medical or psychological support?': getYesNoAnswer(report, incidentInformation, ['psychological support', 'immediate medical', 'needSupport']),
      'Please describe what happened (you can write as much or as little as you feel comfortable)': incidentInformation.sexualDescribe || incidentInformation.sexual_describe || '-',
      'When and where did it occur?': incidentInformation.sexualWhenWhere || incidentInformation.sexual_when_where || '-',
      'Any other information that may help': incidentInformation.sexualOtherInfo || incidentInformation.sexual_other_info || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getFamilyMarriageIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Is this related to domestic violence or physical abuse?': getYesNoAnswer(report, incidentInformation, ['domestic violence', 'physical abuse']),
      'Is this related to forced marriage, underage marriage, or divorce issues?': getYesNoAnswer(report, incidentInformation, ['forced marriage', 'underage marriage', 'divorce issues']),
      'Are there children involved or at risk?': getYesNoAnswer(report, incidentInformation, ['children involved', 'children at risk']),
      'Has this happened before?': getYesNoAnswer(report, incidentInformation, ['happened before']),
      'Do you (or the victim) feel currently unsafe?': getYesNoAnswer(report, incidentInformation, ['currently unsafe', 'feel unsafe']),
      'Do you need immediate protection or support?': getYesNoAnswer(report, incidentInformation, ['immediate protection', 'protection or support']),
      'What exactly happened? (please describe the incident)': incidentInformation.familyWhatHappened || incidentInformation.family_what_happened || '-',
      'Who is involved and what is their relationship to the victim?': incidentInformation.familyWhoInvolved || incidentInformation.family_who_involved || '-',
      'Any additional information you want the police to know': incidentInformation.familyAdditional || incidentInformation.family_additional || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getFraudIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Did you send money?': getYesNoAnswer(report, incidentInformation, ['send money', 'sentMoney']),
      'Do you have screenshots or receipts?': getYesNoAnswer(report, incidentInformation, ['screenshots', 'receipts', 'hasReceipts']),
      'Do you know the scammer’s phone number or account?': getYesNoAnswer(report, incidentInformation, ['scammer', 'phone number', 'account', 'hasScammerContact']),
      'How were you scammed? (explain the full story)': incidentInformation.scamStory || incidentInformation.scam_story || '-',
      'What promise or offer did they give you?': incidentInformation.offerDetails || incidentInformation.offer_details || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getMissingPersonIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'Incident Date': incidentInformation.incident_date || report.date || '-',
      'Incident Time': incidentInformation.incident_time || report.time || '-',
      'Incident Kebele': incidentInformation.incident_kebele || report.kebele || '-',
      'Incident Subcity': incidentInformation.incident_subcity || report.subcity || '-',
      'Is the missing person a child (under 18)?': getYesNoAnswer(report, incidentInformation, ['missing person a child', 'under 18', 'isChild']),
      'Has the person been missing for more than 24 hours?': getYesNoAnswer(report, incidentInformation, ['missing for more than 24 hours', 'missingOver24']),
      'Does the person have any medical condition or disability?': getYesNoAnswer(report, incidentInformation, ['medical condition', 'disability', 'hasMedicalCondition']),
      'Was the disappearance sudden or after an argument/conflict?': getYesNoAnswer(report, incidentInformation, ['disappearance sudden', 'argument', 'disappearanceType']),
      'Have you already checked hospitals, friends, or relatives?': getYesNoAnswer(report, incidentInformation, ['checked hospitals', 'friends', 'relatives', 'checkedPlaces']),
      'Do you suspect foul play?': getYesNoAnswer(report, incidentInformation, ['foul play', 'suspectFoulPlay']),
      'Do you have a picture of the missing person?': getYesNoAnswer(report, incidentInformation, ['picture of the missing person', 'hasPicture']),
      'Full name, age, gender, and physical description of the missing person (height, clothes last seen wearing, distinctive marks, etc.)': incidentInformation.missingPersonInfo || incidentInformation.missing_person_info || '-',
      'When and where was the person last seen?': incidentInformation.lastSeen || incidentInformation.last_seen || '-',
      'Please describe the circumstances of the disappearance and any other important information.': incidentInformation.disappearanceCircumstances || incidentInformation.disappearance_circumstances || '-',
      'Do you have any evidence? Upload image, audio, or video evidence.': incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-',
    }

    return Object.entries(normalized)
  }

  const getMissingPersonAmharicIncidentEntries = (report, incidentInformation) => {
    const normalized = {
      'የድርጊቱ ቀን': incidentInformation.incident_date || report.date || '-',
      'የድርጊቱ ግምታዊ ሰዓት': incidentInformation.incident_time || report.time || '-',
      'ክስተቱ የተፈጠረበትን ቀበሌ': incidentInformation.incident_kebele || report.kebele || '-',
      'የክስተቱ የተፈጠረበት አድራሻ (ክፍለ ከተማ)': incidentInformation.incident_subcity || report.subcity || '-',
      'የጠፋው ሰው ሕፃን ነው (ከ18 ዓመት በታች)?': getYesNoAnswer(report, incidentInformation, ['isChildAm', 'ሕፃን ነው', '18 ዓመት']),
      'ከጠፋ ከ24 ሰዓታት በላይ ሆኖታል?': getYesNoAnswer(report, incidentInformation, ['missingOver24Am', '24 ሰዓታት']),
      'የጠፋው ሰዉ የጤና እክል ወይም አካል ጉዳት አለው?': getYesNoAnswer(report, incidentInformation, ['hasMedicalConditionAm', 'የጤና እክል', 'አካል ጉዳት']),
      'የጠፋው ሰው የጠፋው ድንገት ወይስ ከግጭት በኋላ ነበር?': getYesNoAnswer(report, incidentInformation, ['disappearanceTypeAm', 'ድንገት', 'ግጭት']),
      'ሆስፒታሎች፣ ወዳጆች ወይም ዘመዶች ጋር አለመኖራቸውን አረጋግጠዋል?': getYesNoAnswer(report, incidentInformation, ['checkedPlacesAm', 'ሆስፒታሎች', 'ወዳጆች', 'ዘመዶች']),
      'ጥቃት ደርሶባቸው ሊሆን ይችላል ብለው ይጠረጥራሉ?': getYesNoAnswer(report, incidentInformation, ['suspectFoulPlayAm', 'ጥቃት', 'ይጠረጥራሉ']),
      'የጠፋው ሰው ፎቶ አለዎት?': getYesNoAnswer(report, incidentInformation, ['hasPictureAm', 'ፎቶ አለዎት']),
      'የጠፋውን ሰው ሙሉ ስም፣ ዕድሜ፣ ፆታ እና የሰውነት መግለጫ (ቁመት፣ የታዩበት ልብስ፣ ልዩ ምልክቶች ወዘተ)': incidentInformation.missingPersonInfoAm || '-',
      'ለመጨረሻ ጊዜ የታዩት መቼ እና የት ነበር?': incidentInformation.lastSeenAm || '-',
      'የጠፋው ሰው የጠፋበትን ሁኔታ እና ሌሎች አስፈላጊ መረጃዎች ይግለጹ': incidentInformation.disappearanceCircumstancesAm || '-',
      'የጠፋው ሰው ፎቶ አስገባ': incidentInformation.missingPictureAm || (incidentInformation.uploadedFiles?.length ? incidentInformation.uploadedFiles : '-'),
    }

    return Object.entries(normalized)
  }

  const isMissingPersonIncident = (incidentType) => {
    const normalizedIncidentType = String(incidentType || '').trim().toLowerCase()
    return normalizedIncidentType === 'missing person' || normalizedIncidentType === 'የጠፋ ሰው'
  }

  const isFamilyMarriageIncident = (incidentType) => {
    const normalizedIncidentType = String(incidentType || '').toLowerCase().replace(/[^a-z]/g, '')
    return normalizedIncidentType === 'familymarriagerelatedcrimes'
      || normalizedIncidentType === 'familyandmarriagerelatedcrimes'
  }

  const renderEvidenceList = (evidence, emptyText = 'No evidence uploaded.') => {
    const files = (evidence || []).filter(Boolean)
    if (files.length === 0) return <p className="empty-report-information">{emptyText}</p>

    return (
      <ul className="report-evidence-list">
        {files.map((file, index) => {
          const fileName = file.original_name || file.name || file.file || `Evidence file ${index + 1}`
          const fileUrl = file.url || file.path || file.file
          return (
            <li key={`${fileUrl || fileName}-${index}`} className="report-evidence-item">
              <span className="report-evidence-icon" aria-hidden="true">FILE</span>
              <div className="report-evidence-details">
                {fileUrl
                  ? <a href={fileUrl} target="_blank" rel="noreferrer">{fileName}</a>
                  : <strong>{fileName}</strong>}
                <small>
                  {[file.contentType || file.content_type, file.size ? `${Math.round(file.size / 1024)} KB` : '']
                    .filter(Boolean)
                    .join(' / ') || 'Uploaded evidence'}
                </small>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  const getCanonicalIncidentEntries = (report, incidentInformation) => {
    const incidentType = report.incidentType
    const isTheft = normalizeIncidentType(incidentType) === 'Theft'
    const isAmharicTheft = report.language === 'am' && isTheft
    const isAssault = ['Physical assault', 'Physical Assault', 'አካላዊ ጥቃት'].includes(incidentType)
    const isAmharicAssault = report.language === 'am' && incidentType === 'አካላዊ ጥቃት'
    const isIllegalTrade = ['Illegal trade and drug trafficking', 'ሕጋዊ ያልሆነ ንግድ እና የአደንዛዥ እጽ ሽያጭ'].includes(incidentType)
    const isAmharicIllegalTrade = report.language === 'am' && incidentType === 'ሕጋዊ ያልሆነ ንግድ እና የአደንዛዥ እጽ ሽያጭ'
    const entries = isTheft
      ? (isAmharicTheft ? getTheftAmharicIncidentEntries(report, incidentInformation) : getTheftIncidentEntries(report, incidentInformation))
      : isAssault
        ? (isAmharicAssault ? getAssaultAmharicIncidentEntries(report, incidentInformation) : getAssaultIncidentEntries(report, incidentInformation))
        : isIllegalTrade
          ? (isAmharicIllegalTrade ? getIllegalTradeAmharicIncidentEntries(report, incidentInformation) : getIllegalTradeIncidentEntries(report, incidentInformation))
          : ['Lost property'].includes(incidentType)
            ? getLostPropertyIncidentEntries(report, incidentInformation)
            : ['Other'].includes(incidentType)
              ? getOtherIncidentEntries(report, incidentInformation)
              : ['Sexual violence'].includes(incidentType)
                ? getSexualViolenceIncidentEntries(report, incidentInformation)
                : isFamilyMarriageIncident(incidentType)
                  ? getFamilyMarriageIncidentEntries(report, incidentInformation)
                  : ['Fraud and scam'].includes(incidentType)
                    ? getFraudIncidentEntries(report, incidentInformation)
                    : isMissingPersonIncident(incidentType)
                      ? (report.language === 'am' ? getMissingPersonAmharicIncidentEntries(report, incidentInformation) : getMissingPersonIncidentEntries(report, incidentInformation))
                      : Object.entries(incidentInformation)

    return entries.filter(([label]) => {
      const normalized = String(label).toLowerCase().replace(/[_-]/g, '')
      return !normalized.includes('incident date')
        && !normalized.includes('incident time')
        && !normalized.includes('incident kebele')
        && !normalized.includes('incident subcity')
        && !normalized.includes('evidence')
    })
  }

  const getReportSubcity = (report) => {
    if (!report) return ''
    return String(
      report.incidentSubcity
      || report.subcity
      || report.incident_subcity
      || report.subcityEn
      || report.subcityAm
      || report.reporterDetails?.subcity
      || report.reporter_details?.subcity
      || '',
    ).trim()
  }

  const externalDashboardReports = externalReports
    .map((externalReport) => {
      const details = {
        ...externalReport.incidentFormDetails,
        ...externalReport.incident_details,
        ...externalReport.raw_payload,
        ...externalReport.supporting_information,
        ...externalReport.supporting_details,
        ...externalReport.source?.incident_form,
        ...externalReport.source?.supporting_details,
      }
      const source = externalReport.language === 'am' ? externalReport.source_am : externalReport.source_en
      const answers = externalReport.question_answers || externalReport.questionAnswers
        || source?.question_answers || []
      const reportSubcity = details.incident_subcity || externalReport.subcity || externalReport.incidentSubcity || ''
      return {
        id: externalReport.id,
        language: externalReport.language,
        incidentType: externalReport.incident_type || externalReport.incidentType || externalReport.report_type,
        trackingNumber: externalReport.tracking_number_en || externalReport.tracking_number_am || externalReport.trackingNumber || '',
        incidentSubcity: reportSubcity,
        incidentKebele: details.incident_kebele || externalReport.kebele || '',
        subcity: reportSubcity,
        kebele: details.incident_kebele || externalReport.kebele || '',
        date: details.incident_date || '',
        time: details.incident_time || '',
        status: externalReport.status || 'new',
        generalInformation: externalReport.generalInformation || externalReport.general_information || '',
        resolvedInvestigationProgress: externalReport.resolvedInvestigationProgress || externalReport.resolved_investigation_progress || externalReport.generalInformation || externalReport.general_information || '',
        underInvestigationProgress: externalReport.underInvestigationProgress || externalReport.under_investigation_progress || externalReport.generalInformation || externalReport.general_information || '',
        description: externalReport.description || '',
        reporterDetails: externalReport.reporterDetails || {
          full_name: externalReport.full_name,
          email: externalReport.email,
          phone: externalReport.phone,
          sex: externalReport.sex,
          age: externalReport.age,
          anonymous_email: externalReport.anonymous_email,
          ...source?.personal_information,
          ...externalReport.reporter_details,
        },
        incidentFormDetails: details,
        questionAnswers: answers,
        yesNoAnswers: externalReport.yes_no_answer || externalReport.yes_no_answers || [],
        evidence: externalReport.evidence || source?.evidence || [],
        attachments: externalReport.attachments || [],
        statusHistory: externalReport.statusHistory || [],
        additionalInformationRequests: externalReport.additionalInformationRequests || [],
        externalCreatedAt: externalReport.created_at || externalReport.createdAt,
      }
    })
  const selectedExternalReports = externalDashboardReports.filter(
    (report) => normalizeSubcity(getReportSubcity(report)) === normalizeSubcity(subCity),
  )

  const incidentInformationExcludedFields = new Set([
    'subcity', 'subcityEn', 'subcityAm', 'incident_subcity',
    'kebele', 'kebeleEn', 'kebeleAm', 'incident_kebele',
    'date', 'dateEn', 'dateAm', 'incident_date',
    'time', 'timeEn', 'timeAm', 'incident_time',
    'fullName', 'fullNameEn', 'fullNameAm',
    'email', 'emailEn', 'emailAm',
    'phone', 'phoneEn', 'phoneAm',
    'sex', 'sexEn', 'sexAm',
    'age', 'ageEn', 'ageAm',
    'anonymousEmail', 'anonymousEmailEn', 'anonymousEmailAm',
    'information_confirmation',
  ])

  const excludedIncidentTypeValues = new Set([
    'ሌላ',
    'ሕጋዊ ያልሆነ ንግድ እና የአደንዛዥ እጽ ሽያጭ',
    'አካላዊ ጥቃት',
    'የጠፋ ሰው',
  ])

  const dashboardReports = sortByNewestFirst(
    (externalReports.length ? selectedExternalReports : stats.reports || [])
      .filter((report) => normalizeSubcity(getReportSubcity(report)) === normalizeSubcity(subCity)),
  )
  const respondedReportIds = new Set(
    dashboardReports
      .filter((report) => (report.additionalInformationRequests || []).some((request) => request.status === 'responded'))
      .map((report) => report.id),
  )
  const receivedReports = dashboardReports.filter((report) => respondedReportIds.has(report.id))
  const normalReports = dashboardReports.filter((report) => !respondedReportIds.has(report.id))
  const incidentTypeOptions = [...new Set(
    dashboardReports
      .map((report) => report.incidentType || report.incident_type || report.report_type)
      .filter((incidentType) => incidentType && !excludedIncidentTypeValues.has(incidentType)),
  )].sort()

  const baseReports = reportCategory === 'received' ? receivedReports : normalReports
  const visibleReports = baseReports.filter((report) => {
    if (activeView === 'all' || activeView === 'type' || activeView === 'area') return true
    if (getNormalizedStatus(report.status) !== activeView.replace('-', ' ')) return false
    return true
  })
  const filteredReports = visibleReports.filter((report) => {
    if (selectedIncidentType) {
      const reportType = report.incidentType || report.incident_type || report.report_type
      if (reportType !== selectedIncidentType) return false
    }

    const searchValue = searchTerm.trim().toLowerCase()
    if (searchValue && ![report.id, report.kebele, report.date, report.time, report.trackingNumber, report.incidentType]
      .some((value) => String(value || '').toLowerCase().includes(searchValue))) return false
    if (reportStatusFilter && getNormalizedStatus(report.status) !== reportStatusFilter) return false
    if (reportLocationFilter && ![report.subcity, report.kebele].some((value) => normalizeKey(value).includes(normalizeKey(reportLocationFilter)))) return false
    if (reportDateFilter) {
      const submittedDate = String(report.externalCreatedAt || report.createdAt || report.created_at || '').slice(0, 10)
      if (report.date !== reportDateFilter && submittedDate !== reportDateFilter) return false
    }
    return true
  })
  const sortedReports = [...filteredReports].sort((left, right) => {
    if (reportSort === 'oldest') return new Date(left.externalCreatedAt || left.created_at || 0) - new Date(right.externalCreatedAt || right.created_at || 0)
    if (reportSort === 'crime') return String(left.incidentType || '').localeCompare(String(right.incidentType || ''))
    return new Date(right.externalCreatedAt || right.created_at || 0) - new Date(left.externalCreatedAt || left.created_at || 0)
  })
  const receivedResponseItems = receivedReports.flatMap((report) => (report.additionalInformationRequests || [])
    .filter((request) => request.status === 'responded')
    .map((request) => ({ report, request })))
  const filteredResponseItems = receivedResponseItems.filter(({ report, request }) => sortedReports.some((item) => item.id === report.id) && (!searchTerm.trim() || [report.id, report.trackingNumber, report.incidentType, request.citizenResponse]
    .some((value) => String(value || '').toLowerCase().includes(searchTerm.trim().toLowerCase()))))
  const statCards = (() => {
    if (reportCategory === 'received') {
      return []
    }
    if (activeView === 'under-investigation') {
      return [{ label: 'Under investigation', value: dashboardReports.filter((report) => getNormalizedStatus(report.status) === 'under investigation').length }]
    }
    if (activeView === 'resolved') {
      return [{ label: 'Resolved', value: dashboardReports.filter((report) => getNormalizedStatus(report.status) === 'resolved').length }]
    }
    return [
      { label: 'Total reports', value: dashboardReports.length },
      { label: 'New', value: dashboardReports.filter((report) => getNormalizedStatus(report.status) === 'new').length },
      { label: 'Under investigation', value: dashboardReports.filter((report) => getNormalizedStatus(report.status) === 'under investigation').length },
      { label: 'Resolved', value: dashboardReports.filter((report) => getNormalizedStatus(report.status) === 'resolved').length },
    ]
  })()

  const renderSelectedAdditionalResponseModal = () => {
    if (!selectedAdditionalResponse) return null
    const { report, request } = selectedAdditionalResponse
    const responseCreatedAt = report.externalCreatedAt
      ? formatDisplayDate(report.externalCreatedAt, language)
      : 'Not provided'
    return (
      <div className="response-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedAdditionalResponse(null) }}>
        <section className="response-modal" role="dialog" aria-modal="true" aria-labelledby={`response-modal-title-${report.id}-${request.id}`}>
          <div className="response-modal-header">
            <div><span className="response-modal-eyebrow">Additional information response</span><h2 id={`response-modal-title-${report.id}-${request.id}`}>Citizen response details</h2></div>
            <button type="button" className="response-modal-close" aria-label="Close response details" onClick={() => setSelectedAdditionalResponse(null)}>×</button>
          </div>
          <div className="response-modal-grid">
            <section className="response-modal-section"><h3>Report information</h3><dl className="response-modal-facts"><div><dt>Report ID</dt><dd>#{report.id}</dd></div><div><dt>Tracking number</dt><dd>{report.trackingNumber || 'Not provided'}</dd></div><div><dt>Crime type</dt><dd>{displayName(report.incidentType, incidentTypeDisplayNames)}</dd></div><div><dt>Location</dt><dd>{subcityDisplayName(report.subcity)} / {displayName(report.kebele, kebeleDisplayNames)}</dd></div><div><dt>Original report date</dt><dd>{responseCreatedAt}</dd></div></dl></section>
            <section className="response-modal-section"><h3>Police request</h3><p className="response-modal-message">{request.requestMessage || 'No request message provided.'}</p><dl className="response-modal-facts"><div><dt>Requested date</dt><dd>{formatDisplayDate(request.createdAt, language)}</dd></div><div><dt>Requesting officer</dt><dd>{request.requestedBy || 'Police officer'}</dd></div></dl></section>
            <section className="response-modal-section response-modal-section-wide"><div className="response-modal-section-heading"><h3>Citizen response</h3><time>{formatDisplayDate(request.respondedAt, language)}</time></div><p className="response-modal-message response-modal-citizen-message">{request.citizenResponse || 'No written response provided.'}</p></section>
            <section className="response-modal-section response-modal-section-wide"><h3>Supporting evidence</h3><div className="response-evidence-grid">{(request.responseEvidence || []).map((file, index) => { const fileType = String(file.contentType || file.content_type || '').toLowerCase(); const fileUrl = file.url || file.path; const fileName = file.name || file.original_name || `Evidence file ${index + 1}`; return <article className="response-evidence-card" key={file.path || file.name || index}>{fileUrl && fileType.startsWith('image/') && <img src={fileUrl} alt={fileName} />}{fileUrl && fileType.startsWith('video/') && <video src={fileUrl} controls preload="metadata">Your browser cannot play this video.</video>}{!fileUrl && <div className="response-evidence-missing">File unavailable</div>}<div><strong>{fileName}</strong>{fileUrl ? <a href={fileUrl} target="_blank" rel="noreferrer">Open original file</a> : <span>Original file unavailable</span>}</div></article> })}{(request.responseEvidence || []).length === 0 && <p className="empty-report-information">No supporting evidence was uploaded.</p>}</div></section>
          </div>
          {additionalResponseActionState.error && <p className="response-modal-error" role="alert">{additionalResponseActionState.error}</p>}
          {additionalResponseActionState.status === 'saved' && <p className="response-modal-success" role="status">Response updated successfully.</p>}
          <div className="response-modal-actions"><button type="button" className="response-secondary-button" onClick={() => setSelectedAdditionalResponse(null)}>Close</button><button type="button" className="response-secondary-button" disabled={additionalResponseActionState.status === 'saving' || !request.unread} onClick={() => handleAdditionalResponseAction('reviewed')}>Mark as Reviewed</button><button type="button" className="response-primary-button" disabled={additionalResponseActionState.status === 'saving'} onClick={() => handleAdditionalResponseAction('continue_investigation')}>Continue Investigation</button></div>
        </section>
      </div>
    )
  }

  const renderReportCard = (report) => (
    (() => {
      const trackingNumber = report.trackingNumber
      const createdAt = report.externalCreatedAt
        ? formatDisplayDate(report.externalCreatedAt, language)
        : null
      const incidentInformation = {
        incidentType: report.incidentType,
        language: report.language,
        trackingNumber,
        createdAt,
        ...Object.fromEntries(
          Object.entries(report.incidentFormDetails || {})
            .filter(([fieldName]) => !incidentInformationExcludedFields.has(fieldName)),
        ),
        ...(report.attachments?.length > 0 ? { uploadedFiles: report.attachments } : {}),
        ...(report.evidence?.length > 0 && !report.attachments?.length ? { uploadedFiles: report.evidence } : {}),
      }

      const currentStatus = getNormalizedStatus(report.status)
      const generalInformation = currentStatus === 'resolved'
        ? report.resolvedInvestigationProgress || report.generalInformation || ''
        : report.underInvestigationProgress || report.generalInformation || ''
      const progressState = progressSaveState[report.id] || { status: 'idle', message: '' }
      const requestState = additionalRequestState[report.id] || { status: 'idle', message: '' }
      const additionalRequests = report.additionalInformationRequests || []
      const hasPendingAdditionalRequest = additionalRequests.some((request) => request.status !== 'responded')
      const reportEvidence = report.attachments?.length > 0 ? report.attachments : report.evidence
      const statusHistory = report.statusHistory || []
      const modalReporterEntries = getReporterInfoEntries(report).filter(([label]) => label !== 'Kebele' && label !== 'Subcity')
      const modalIncidentEntries = getCanonicalIncidentEntries(report, incidentInformation)
      const generatedAt = formatDisplayDate(new Date().toISOString(), language)
      const evidenceFiles = (reportEvidence || []).filter(Boolean)

      const printReport = () => {
        document.body.classList.add('printing-report')
        const cleanup = () => document.body.classList.remove('printing-report')
        window.addEventListener('afterprint', cleanup, { once: true })
        window.print()
        window.setTimeout(cleanup, 1000)
      }

      const downloadReportPdf = async () => {
        const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
        const margin = 16
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        let cursor = 20

        const ensureSpace = (height) => {
          if (cursor + height > pageHeight - 18) {
            pdf.addPage()
            cursor = 20
          }
        }
        const addText = (value, options = {}) => {
          const text = String(value || 'Not provided')
          const lines = pdf.splitTextToSize(text, options.width || pageWidth - margin * 2)
          ensureSpace(lines.length * (options.lineHeight || 5) + 2)
          pdf.setFont('helvetica', options.bold ? 'bold' : 'normal')
          pdf.setFontSize(options.size || 9)
          pdf.setTextColor(...(options.color || [35, 55, 75]))
          pdf.text(lines, options.x || margin, cursor)
          cursor += lines.length * (options.lineHeight || 5) + (options.gap || 2)
        }
        const addSection = (title) => {
          ensureSpace(15)
          cursor += 3
          pdf.setFillColor(15, 63, 120)
          pdf.rect(margin, cursor - 4, pageWidth - margin * 2, 8, 'F')
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          pdf.setTextColor(255, 255, 255)
          pdf.text(title, margin + 3, cursor + 1)
          cursor += 10
        }
        const addFacts = (entries) => entries.forEach(([label, value]) => {
          addText(`${label}: ${typeof value === 'object' ? JSON.stringify(value) : value || 'Not provided'}`, { size: 9, gap: 1 })
        })

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(17)
        pdf.setTextColor(15, 63, 120)
        pdf.text('OFFICIAL CRIME REPORT', margin, cursor)
        cursor += 8
        addText(`Tracking number: ${trackingNumber || 'Not provided'}    Report ID: ${report.id}`, { bold: true, size: 10 })
        addText(`Date generated: ${generatedAt}`, { size: 8, color: [90, 105, 120] })

        addSection('1. Report Information')
        addFacts([
          ['Report ID', report.id],
          ['5-digit tracking number', trackingNumber],
          ['Submission date', createdAt],
          ['Current status', currentStatus],
        ])
        addSection('2. Crime / Incident Information')
        addFacts([['Crime type', displayName(report.incidentType, incidentTypeDisplayNames)], ...modalIncidentEntries])
        addText(`Incident description: ${report.description || 'Not provided'}`)
        addSection('3. Reporter Information')
        addFacts(modalReporterEntries)
        addSection('4. Location Information')
        addFacts([
          ['Sub-city', subcityDisplayName(report.subcity)],
          ['Kebele', displayName(report.kebele, kebeleDisplayNames)],
          ['Incident date', report.date],
          ['Incident time', report.time],
        ])
        addSection('5. Supporting Evidence')
        if (evidenceFiles.length === 0) addText('No supporting evidence uploaded.')
        for (const [index, file] of evidenceFiles.entries()) {
          const fileName = file.original_name || file.name || file.file || `Evidence file ${index + 1}`
          const fileType = file.contentType || file.content_type || 'Uploaded evidence'
          addText(`${index + 1}. ${fileName} | ${fileType}${file.size ? ` | ${Math.round(file.size / 1024)} KB` : ''}${file.url ? ` | ${file.url}` : ''}`)
          if (fileType.startsWith('image/') && file.url) {
            try {
              const imageResponse = await fetch(file.url)
              const imageBlob = await imageResponse.blob()
              const imageData = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.onerror = reject
                reader.readAsDataURL(imageBlob)
              })
              ensureSpace(55)
              pdf.addImage(imageData, fileType.includes('png') ? 'PNG' : 'JPEG', margin, cursor, 58, 45, undefined, 'FAST')
              cursor += 49
            } catch {
              addText('Photo preview could not be embedded; the original file link is listed above.', { size: 8, color: [90, 105, 120] })
            }
          }
        }
        addSection('6. Additional Information')
        if (additionalRequests.length === 0) addText('No additional information request is available.')
        additionalRequests.forEach((request, index) => {
          addText(`Request ${index + 1} (${request.status || 'requested'})`, { bold: true })
          addText(`Police request: ${request.requestMessage || 'Not provided'}`)
          addText(`Requesting officer: ${request.requestedBy || 'Not provided'}`)
          addText(`Citizen response: ${request.citizenResponse || 'No response provided'}`)
          addText(`Response date: ${request.respondedAt ? formatDisplayDate(request.respondedAt, language) : 'Not provided'}`)
        })
        addSection('7. Complete Status History / Timeline')
        if (statusHistory.length === 0) addText('No status history is available.')
        statusHistory.forEach((item) => addText(`${item.status}: ${item.message || 'Status updated'} (${formatDisplayDate(item.createdAt, language)})`))
        additionalRequests.forEach((request) => {
          addText(`Additional information requested: ${formatDisplayDate(request.createdAt, language)}`)
          if (request.respondedAt) addText(`Additional information received: ${formatDisplayDate(request.respondedAt, language)}`)
        })

        const pageCount = pdf.getNumberOfPages()
        for (let page = 1; page <= pageCount; page += 1) {
          pdf.setPage(page)
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(8)
          pdf.setTextColor(100, 110, 120)
          pdf.text('Hawassa City Police | Official report', margin, pageHeight - 9)
          pdf.text(`Page ${page} of ${pageCount}`, pageWidth - margin - 25, pageHeight - 9)
        }
        pdf.save(`crime-report-${trackingNumber || report.id}.pdf`)
      }

      return (
    <article className="report-card" key={report.id}>
      <div className="report-card-header">
        <div>
          <h3>{displayName(report.incidentType, incidentTypeDisplayNames)}</h3>
            <p>Report #{report.id} {additionalRequests.some((request) => request.unread) && <span className="report-unread-badge">New response</span>}</p>
        </div>
        <div className="report-card-actions">
          <span className={`report-status status-${currentStatus.replace(/\s+/g, '-')}`}>{currentStatus}</span>
            <label className={`report-status-control status-control-${currentStatus.replace(/\s+/g, '-')}`}>
            <span className="status-control-label">Status</span>
            <select
              aria-label={`Change report status, currently ${currentStatus}`}
              value={currentStatus}
              onChange={(event) => handleStatusChange(report.id, event.target.value)}
            >
              <option value="new">New</option>
              <option value="under investigation">Under investigation</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
        </div>
      </div>
      <div className="report-card-quick-actions">
        <button type="button" className="report-details-button" onClick={() => setSelectedReportDetails(report.id)}>View Details</button>
      </div>
      <dl className="report-summary">
        <div><dt>Tracking number</dt><dd>{trackingNumber || 'Not provided'}</dd></div>
        <div><dt>Sub-city</dt><dd>{subcityDisplayName(report.subcity)}</dd></div>
        <div><dt>Kebele</dt><dd>{displayName(report.kebele, kebeleDisplayNames)}</dd></div>
        <div><dt>Submitted</dt><dd>{createdAt || 'Not provided'}</dd></div>
      </dl>
      <p className="report-description">{report.description || 'No description provided.'}</p>
      <div className="report-card-indicators">
        <span className="report-card-indicator">{reportEvidence?.length || 0} evidence file{reportEvidence?.length === 1 ? '' : 's'}</span>
        {additionalRequests.length > 0 && <span className="report-card-indicator report-card-indicator-additional">Additional information history</span>}
      </div>
      <div className="additional-information-panel additional-information-compose">
        <div className="report-section-heading">
          <h4>{language === 'am' ? 'ተጨማሪ መረጃ ይጠይቁ' : 'Request additional information'}</h4>
          <span>{additionalRequests.length > 0 ? `${additionalRequests.length} in history` : 'No request yet'}</span>
        </div>
        <p className="report-section-description">Full request and response history is available once in View Details.</p>
        <textarea
          rows="3"
          value={additionalRequestDrafts[report.id] || ''}
          onChange={(event) => setAdditionalRequestDrafts((current) => ({ ...current, [report.id]: event.target.value }))}
          placeholder={language === 'am' ? 'የሚፈልጉትን ተጨማሪ መረጃ ይጻፉ...' : 'Describe the additional information needed...'}
        />
        <button type="button" className="save-case-info-button" disabled={requestState.status === 'saving' || hasPendingAdditionalRequest} onClick={() => handleAdditionalInformationRequest(report.id)}>
          {requestState.status === 'saving'
            ? (language === 'am' ? 'በመላክ ላይ...' : 'Sending...')
            : hasPendingAdditionalRequest
              ? (language === 'am' ? 'ምላሽ በመጠባበቅ ላይ' : 'Awaiting citizen response')
              : (language === 'am' ? 'ጥያቄ ላክ' : 'Send request')}
        </button>
        <span className={`progress-save-status progress-save-status-${requestState.status}`} aria-live="polite">{requestState.message}</span>
      </div>
      {['under-investigation', 'resolved'].includes(activeView) && (
        <div className="resolved-case-information">
          <label htmlFor={`general-information-${report.id}`}>
            {activeView === 'resolved' ? 'General information about the resolved case' : 'General progress about the investigation'}
          </label>
          <div className="resolved-case-information-actions">
            <textarea
              id={`general-information-${report.id}`}
              rows="4"
              value={generalInformation || ''}
              onChange={(event) => updateReportGeneralInformationLocally(report.id, event.target.value)}
              placeholder={activeView === 'resolved' ? 'Add notes about how this case was resolved...' : 'Add general progress about the investigation...'}
            />
            <button
              type="button"
              className="save-case-info-button"
              disabled={progressState.status === 'saving'}
              onClick={() => handleGeneralInformationBlur(report.id, generalInformation || '')}
            >
              {progressState.status === 'saving' ? 'Saving...' : 'Save progress'}
            </button>
            <span className={`progress-save-status progress-save-status-${progressState.status}`} aria-live="polite">
              {progressState.message}
            </span>
          </div>
        </div>
      )}
      {selectedReportDetails === report.id && (
        <div className="response-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedReportDetails(null) }}>
          <section className="report-details-modal" role="dialog" aria-modal="true" aria-labelledby={`report-details-title-${report.id}`}>
            <div className="response-modal-header">
              <div><span className="response-modal-eyebrow">Official crime report</span><h2 id={`report-details-title-${report.id}`}>Report #{report.id}</h2><small className="report-generated-date">Generated {generatedAt}</small></div>
              <button type="button" className="response-modal-close" aria-label="Close report details" onClick={() => setSelectedReportDetails(null)}>×</button>
            </div>
            <div className="report-export-actions" aria-label="Report export actions">
              <button type="button" className="response-secondary-button" onClick={printReport}>Print Report</button>
              <button type="button" className="response-primary-button" onClick={downloadReportPdf}>Download PDF</button>
            </div>
            <div className="report-details-modal-grid">
              <section><h3>Report information</h3><dl className="response-modal-facts"><div><dt>Tracking number</dt><dd>{report.trackingNumber || 'Not provided'}</dd></div><div><dt>Crime type</dt><dd>{displayName(report.incidentType, incidentTypeDisplayNames)}</dd></div><div><dt>Submitted</dt><dd>{createdAt || 'Not provided'}</dd></div><div><dt>Status</dt><dd><span className={`report-status status-${currentStatus.replace(/\s+/g, '-')}`}>{currentStatus}</span></dd></div></dl></section>
              <section><h3>Location information</h3><dl className="response-modal-facts"><div><dt>Sub-city</dt><dd>{subcityDisplayName(report.subcity)}</dd></div><div><dt>Kebele</dt><dd>{displayName(report.kebele, kebeleDisplayNames)}</dd></div><div><dt>Incident date</dt><dd>{report.date || 'Not provided'}</dd></div><div><dt>Incident time</dt><dd>{report.time || 'Not provided'}</dd></div></dl></section>
              <section><h3>Reporter information</h3>{renderStructuredEntries(modalReporterEntries, 'No reporter information provided.')}</section>
              <section><h3>Incident information</h3>{renderStructuredEntries(modalIncidentEntries, 'No incident details provided.')}</section>
              <section className="report-details-modal-wide"><h3>Additional information</h3>
                {additionalRequests.length === 0
                  ? null
                  : additionalRequests.map((request) => (
                    <div className="report-details-additional-item" key={request.id}>
                      <div className="report-details-additional-heading"><strong>{request.status === 'responded' ? 'Additional Information Received' : 'Additional Information Requested'}</strong><span>{formatDisplayDate(request.createdAt, language)}</span></div>
                      <p><b>Police request:</b> {request.requestMessage || 'No request message provided.'}</p>
                      {request.requestedBy && <p><b>Requesting officer:</b> {request.requestedBy}</p>}
                      {request.citizenResponse && <p><b>Citizen response:</b> {request.citizenResponse}</p>}
                      {request.respondedAt && <p><b>Response date:</b> {formatDisplayDate(request.respondedAt, language)}</p>}
                      {request.responseEvidence?.length > 0 && <div className="report-details-additional-evidence">{renderEvidenceList(request.responseEvidence)}</div>}
                    </div>
                  ))}
              </section>
              <section className="report-details-modal-wide"><h3>Supporting evidence</h3>{renderEvidenceList(reportEvidence)}</section>
              <section className="report-details-modal-wide"><h3>Status and timeline</h3><div className="report-timeline">
                {statusHistory.length === 0 && <p className="empty-report-information">No status history is available.</p>}
                {statusHistory.map((item) => <div key={item.id}><span className="timeline-dot" /><div><strong>{item.status}{item.message ? `: ${item.message}` : ''}</strong><time>{formatDisplayDate(item.createdAt, language)}</time></div></div>)}
                {additionalRequests.flatMap((request) => [
                  <div key={`requested-${request.id}`}><span className="timeline-dot timeline-dot-additional" /><div><strong>Additional Information Requested</strong><time>{formatDisplayDate(request.createdAt, language)}</time></div></div>,
                  ...(request.respondedAt ? [<div key={`received-${request.id}`}><span className="timeline-dot timeline-dot-received" /><div><strong>Additional Information Received</strong><time>{formatDisplayDate(request.respondedAt, language)}</time></div></div>] : []),
                ])}
              </div></section>
            </div>
            <div className="response-modal-actions report-modal-controls"><button type="button" className="response-secondary-button" onClick={() => setSelectedReportDetails(null)}>Close</button><button type="button" className="response-primary-button" onClick={() => { setSelectedReportDetails(null); handleStatusChange(report.id, 'under investigation') }}>Continue Investigation</button></div>
          </section>
        </div>
      )}
    </article>
      )
    })()
  )

  return (
    <main className="dashboard-page">
      <header
        className="dashboard-header"
        style={{ backgroundImage: `linear-gradient(rgba(11,47,90,0.72), rgba(11,47,90,0.72)), url(${image1})` }}
      >
        <img src={image1} alt="Sidama region flag" className="login-header-image" />
        <div className="login-header-text">
          <p className="police-label">Hawassa City Police</p>
          <h1>Police Dashboard</h1>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <nav>
            <button type="button" className={`dashboard-nav-link${reportCategory === 'normal' && activeView === 'all' ? ' active' : ''}`} onClick={() => { setReportCategory('normal'); setActiveView('all') }}>Reports</button>
            <button type="button" className={`dashboard-nav-link${reportCategory === 'received' ? ' active' : ''}`} onClick={() => { setReportCategory('received'); setActiveView('all') }}>Additional Information Received</button>
            <button type="button" className={`dashboard-nav-link${activeView === 'under-investigation' ? ' active' : ''}`} onClick={() => { setReportCategory('normal'); setActiveView('under-investigation') }}>Under investigation</button>
            <button type="button" className={`dashboard-nav-link${activeView === 'resolved' ? ' active' : ''}`} onClick={() => { setReportCategory('normal'); setActiveView('resolved') }}>Resolved</button>
            <button type="button" className={`dashboard-nav-link${activeView === 'analytics' ? ' active' : ''}`} onClick={() => setActiveView('analytics')}>Crime analytics</button>
            <button
              type="button"
              className="dashboard-nav-link dashboard-sidebar-logout"
              onClick={async () => {
                await fetch('/api/auth/dashboard/', { method: 'DELETE', credentials: 'same-origin' })
                window.location.reload()
              }}
            >
              Logout
            </button>
          </nav>
        </aside>

        <div className="dashboard-content">
          {activeView === 'analytics' ? <CrimeAnalytics subCity={subCity} /> : <>
          {(dashboardError || reportsError) && <p className="analytics-error" role="alert">{dashboardError || reportsError}</p>}
          <div className="reports-workspace-heading">
            <div>
              <h2>Manage citizen reports</h2>
            </div>
            <button type="button" className="report-refresh-button" onClick={refreshReports} disabled={isRefreshingReports}>
              {isRefreshingReports ? 'Refreshing...' : 'Refresh reports'}
            </button>
          </div>
          {statCards.length > 0 && (
            <section className={`stat-grid${statCards.length === 1 ? ' stat-grid-single' : ''}`} aria-label="Report totals">
              {statCards.map((card) => (
                <article className="stat-card" key={card.label}>
                  <p>{card.label}</p>
                  <strong>{isLoading ? '...' : card.value}</strong>
                </article>
              ))}
            </section>
          )}

          <div className="reports-category-tabs" role="tablist" aria-label="Report categories">
            <button type="button" role="tab" aria-selected={reportCategory === 'normal'} className={reportCategory === 'normal' ? 'active' : ''} onClick={() => setReportCategory('normal')}>
              Reports <span>{normalReports.length}</span>
            </button>
            <button type="button" role="tab" aria-selected={reportCategory === 'received'} className={reportCategory === 'received' ? 'active received' : 'received'} onClick={() => setReportCategory('received')}>
              Additional Information Received <span>{receivedResponseItems.length}</span>
            </button>
          </div>

          <div className="reports-filter-panel">
            <input id="police-report-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search report ID, tracking number, crime type..." />
            <select value={selectedIncidentType} onChange={(event) => setSelectedIncidentType(event.target.value)} aria-label="Filter by crime type">
              <option value="">All crime types</option>
              {incidentTypeOptions.map((incidentType) => <option key={incidentType} value={incidentType}>{displayName(incidentType, incidentTypeDisplayNames)}</option>)}
            </select>
            <input type="search" value={reportLocationFilter} onChange={(event) => setReportLocationFilter(event.target.value)} placeholder="Sub-city or kebele" aria-label="Filter by location" />
            <select value={reportStatusFilter} onChange={(event) => setReportStatusFilter(event.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option><option value="new">New</option><option value="under investigation">Under investigation</option><option value="resolved">Resolved</option>
            </select>
            <input type="date" value={reportDateFilter} onChange={(event) => setReportDateFilter(event.target.value)} aria-label="Filter by date" />
            <select value={reportSort} onChange={(event) => setReportSort(event.target.value)} aria-label="Sort reports">
              <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="crime">Crime type</option>
            </select>
          </div>

          <section className="dashboard-reports" aria-labelledby="reports-title">
            <div className="dashboard-section-heading">
              <p className="police-label">Selected sub-city</p>
              <h2 id="reports-title">{reportCategory === 'normal' ? 'Reports' : 'Additional Information Received'} <span className="reports-result-count">{reportCategory === 'normal' ? sortedReports.length : filteredResponseItems.length}</span></h2>
            </div>
            {isLoading ? <p className="empty-dashboard">Loading reports...</p> : reportCategory === 'received' && filteredResponseItems.length === 0 ? (
              <p className="empty-dashboard">No additional information responses match the current filters.</p>
            ) : reportCategory === 'normal' && sortedReports.length === 0 ? (
              <p className="empty-dashboard">No reports match the current filters.</p>
            ) : (
              reportCategory === 'normal'
                ? <div className="report-list">{sortedReports.map(renderReportCard)}</div>
                : <div className="received-response-list">{filteredResponseItems.map(({ report, request }) => (
                  <article className="received-response-card" key={`${report.id}-${request.id}`}>
                    <div><span className="report-unread-badge">{request.unread ? 'UNREAD' : 'REVIEWED'}</span><h3>Report #{report.id}</h3><p>{displayName(report.incidentType, incidentTypeDisplayNames)} · {subcityDisplayName(report.subcity)}</p></div>
                    <dl><div><dt>Original report</dt><dd>{formatDisplayDate(report.externalCreatedAt || report.created_at, language)}</dd></div><div><dt>Citizen response</dt><dd>{formatDisplayDate(request.respondedAt, language)}</dd></div><div><dt>Evidence</dt><dd>{request.responseEvidence?.length || 0} file(s)</dd></div></dl>
                    <p className="received-response-preview">{request.citizenResponse || 'No written response provided.'}</p>
                    <button type="button" className="report-details-button" onClick={() => { setAdditionalResponseActionState({ status: 'idle', error: '' }); setSelectedAdditionalResponse({ report, request }) }}>View Response</button>
                  </article>
                ))}</div>
            )}
          </section>
          {renderSelectedAdditionalResponseModal()}
          </>}
        </div>
      </div>
    </main>
  )
}

function AdminDashboard({ language }) {
  const [reports, setReports] = useState([])
  const [officers, setOfficers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminError, setAdminError] = useState('')
  const [activeView, setActiveView] = useState('home')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubcity, setSelectedSubcity] = useState('')
  const [selectedIncidentType, setSelectedIncidentType] = useState('')
  const [officerDetails, setOfficerDetails] = useState({ name: '', password: '', unique_number: '', subcity: '' })
  const [editingOfficerId, setEditingOfficerId] = useState(null)
  const [assignmentMessage, setAssignmentMessage] = useState('')

  const loadOfficers = async () => {
    try {
      const response = await fetch('/api/officers/')
      if (!response.ok) throw new Error(response.statusText || 'Unable to load officers')
      const loadedOfficers = await response.json()
      setOfficers(Array.isArray(loadedOfficers) ? loadedOfficers : [])
    } catch (error) {
      console.error('Officer loading failed:', error)
      setAdminError('Officer data could not be loaded from the database.')
    }
  }

  useEffect(() => {
    const loadReports = async () => {
      try {
        setAdminError('')
        const response = await fetch('/api/reports/')
        if (!response.ok) throw new Error(response.statusText || 'Unable to load reports')
        const loadedReports = await response.json()
        setReports([...loadedReports].sort((left, right) => (
          new Date(right.created_at || right.createdAt || 0).getTime()
          - new Date(left.created_at || left.createdAt || 0).getTime()
        )))
      } catch (error) {
        console.error('Admin report loading failed:', error)
        setAdminError('Admin data could not be loaded from the database.')
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
    loadOfficers()
  }, [])

  const subcityOptions = [...new Map(
    reports
      .map((report) => report.subcity)
      .filter(Boolean)
      .map((subcity) => [normalizeSubcity(subcity), subcity]),
  ).values()].sort((left, right) => left.localeCompare(right))

  const allSubcityOptions = [...new Map(
    [
      ...subcityOptions,
      ...officers.map((officer) => officer.subcity),
    ].map((subcity) => [normalizeSubcity(subcity), subcity]),
  ).values()].sort((left, right) => left.localeCompare(right))

  const incidentTypeOptions = [...new Set(
    reports
      .map((report) => report.incidentType || report.incident_type || report.report_type)
      .filter(Boolean),
  )].sort()
  const filteredReports = reports.filter((report) => {
    if (activeView === 'area' && selectedSubcity && report.subcity !== selectedSubcity) return false
    if (activeView === 'type' && selectedIncidentType
      && (report.incidentType || report.incident_type || report.report_type) !== selectedIncidentType) return false
    const searchValue = searchTerm.trim().toLowerCase()
    if (!searchValue) return true
    return [report.kebele, report.date, report.time, report.created_at, report.createdAt,
      report.tracking_number, report.trackingNumber, report.incidentType, report.incident_type,
      report.report_type, report.subcity]
      .some((value) => String(value || '').toLowerCase().includes(searchValue))
  })

  const handleOfficerAssignment = async (event) => {
    event.preventDefault()

    try {
      if (editingOfficerId) {
        const response = await fetch(`/api/officers/${editingOfficerId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: officerDetails.name,
            password: officerDetails.password,
            unique_number: officerDetails.unique_number,
            subcity: officerDetails.subcity,
          }),
        })
        if (!response.ok) throw new Error(response.statusText || 'Unable to update officer')
      } else {
        const response = await fetch('/api/officers/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: officerDetails.name,
            password: officerDetails.password,
            unique_number: officerDetails.unique_number,
            subcity: officerDetails.subcity,
          }),
        })
        if (!response.ok) throw new Error(response.statusText || 'Unable to save officer')
      }

      setOfficerDetails({ name: '', password: '', unique_number: '', subcity: '' })
      setEditingOfficerId(null)
      setAssignmentMessage('')
      await loadOfficers()
    } catch (error) {
      console.error('Officer assignment failed:', error)
      setAssignmentMessage(error.message || 'Unable to save officer information.')
    }
  }

  const handleEditOfficer = (officer) => {
    setEditingOfficerId(officer.id)
    setOfficerDetails({
      name: officer.name || '',
      password: '',
      unique_number: officer.unique_number || '',
      subcity: officer.subcity || '',
    })
    setAssignmentMessage('')
    setActiveView('assign')
  }

  const handleDeleteOfficer = async (officerId) => {
    try {
      const response = await fetch(`/api/officers/${officerId}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error(response.statusText || 'Unable to delete officer')
      setAssignmentMessage('')
      await loadOfficers()
    } catch (error) {
      console.error('Officer deletion failed:', error)
      setAssignmentMessage(error.message || 'Unable to delete officer.')
    }
  }

  return (
    <main className="dashboard-page admin-dashboard-page">
      <header
        className="dashboard-header"
        style={{ backgroundImage: `linear-gradient(rgba(11,47,90,0.72), rgba(11,47,90,0.72)), url(${image1})` }}
      >
        <img src={image1} alt="Sidama region flag" className="login-header-image" />
        <div className="login-header-text">
          <p className="police-label">Hawassa City Police</p>
          <h1>Admin Dashboard</h1>
        </div>
      </header>
      <div className="dashboard-layout admin-dashboard-layout">
        <aside className="dashboard-sidebar" aria-label="Admin dashboard navigation">
          <nav>
            <button type="button" className={`dashboard-nav-link${activeView === 'type' ? ' active' : ''}`} onClick={() => setActiveView('type')}>Reports</button>
            <button type="button" className={`dashboard-nav-link${activeView === 'analytics' ? ' active' : ''}`} onClick={() => setActiveView('analytics')}>Yearly analytics</button>
            <button type="button" className={`dashboard-nav-link${activeView === 'assign' ? ' active' : ''}`} onClick={() => { setActiveView('assign'); setAssignmentMessage('') }}>Assign officer</button>
            <button type="button" className={`dashboard-nav-link${activeView === 'officers' ? ' active' : ''}`} onClick={() => { setActiveView('officers'); setAssignmentMessage('') }}>Officers list</button>
            <button
              type="button"
              className="dashboard-nav-link dashboard-sidebar-logout"
              onClick={async () => {
                await fetch('/api/auth/dashboard/', { method: 'DELETE', credentials: 'same-origin' })
                window.location.reload()
              }}
            >
              Logout
            </button>
          </nav>
        </aside>

        <section className="admin-dashboard-content" aria-labelledby="admin-reports-title">
          {adminError && <p className="analytics-error" role="alert">{adminError}</p>}
          {activeView === 'analytics' ? <CrimeAnalytics /> : activeView === 'assign' ? (
            <div className="admin-assignment-panel">
              <div className="dashboard-section-heading">
                <h2 id="admin-reports-title">{editingOfficerId ? 'Edit officer' : 'Assign officer'}</h2>
              </div>
              <form className="admin-assignment-form" onSubmit={handleOfficerAssignment}>
                <label htmlFor="officer-name">Officer name</label>
                <input
                  id="officer-name"
                  type="text"
                  value={officerDetails.name}
                  onChange={(event) => setOfficerDetails({ ...officerDetails, name: event.target.value })}
                  required={!editingOfficerId}
                />
                <label htmlFor="officer-password">Password</label>
                <PasswordInput
                  id="officer-password"
                  value={officerDetails.password}
                  onChange={(event) => setOfficerDetails({ ...officerDetails, password: event.target.value })}
                  required
                />
                <label htmlFor="officer-unique-number">Unique number</label>
                <input
                  id="officer-unique-number"
                  type="text"
                  value={officerDetails.unique_number}
                  onChange={(event) => setOfficerDetails({ ...officerDetails, unique_number: event.target.value })}
                />
                <label htmlFor="officer-subcity">Sub-city</label>
                <select
                  id="officer-subcity"
                  value={officerDetails.subcity}
                  onChange={(event) => setOfficerDetails({ ...officerDetails, subcity: event.target.value })}
                  required
                >
                  <option value="">Select sub-city</option>
                  {allSubcityOptions.map((subcity) => <option key={subcity} value={subcity}>{subcityDisplayName(subcity)}</option>)}
                </select>
                <button type="submit" className="start-reporting">{editingOfficerId ? 'Save changes' : 'Assign officer'}</button>
                {editingOfficerId && (
                  <button
                    type="button"
                    className="dashboard-nav-link"
                    onClick={() => {
                      setEditingOfficerId(null)
                      setOfficerDetails({ name: '', password: '', unique_number: '', subcity: '' })
                      setAssignmentMessage('')
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
              {assignmentMessage && <p className="assignment-success" role="status">{assignmentMessage}</p>}
            </div>
          ) : activeView === 'officers' ? (
            <div className="admin-assignment-panel officers-list-panel">
              <div className="dashboard-section-heading">
                <h2 id="admin-reports-title">Officers list</h2>
              </div>
              {assignmentMessage && <p className="assignment-success" role="status">{assignmentMessage}</p>}
              <div className="admin-report-table-wrap officers-table-wrap">
                <table className="admin-report-table officers-table">
                  <thead>
                    <tr><th>Name</th><th>Sub-city</th><th>Unique number</th><th>Password</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {officers.length === 0 ? (
                      <tr><td colSpan="5">No officers assigned yet.</td></tr>
                    ) : officers.map((officer) => (
                      <tr key={officer.id}>
                        <td>{officer.name}</td>
                        <td>{subcityDisplayName(officer.subcity)}</td>
                        <td>{officer.unique_number || '-'}</td>
                        <td>{officer.password || '-'}</td>
                        <td>
                          <button type="button" className="dashboard-nav-link officer-action-button" onClick={() => handleEditOfficer(officer)}>Edit</button>
                          <button type="button" className="dashboard-nav-link officer-action-button officer-action-delete" onClick={() => handleDeleteOfficer(officer.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <>
          <div className="admin-filter-row">
            <div className="dashboard-search">
              <input
                id="admin-report-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by kebele, date, incident type, or sub-city"
              />
            </div>
            {activeView === 'area' && (
              <div className="admin-subcity-filter">
                <select
                  id="admin-view-subcity"
                  value={selectedSubcity}
                  onChange={(event) => setSelectedSubcity(event.target.value)}
                >
                  <option value="">All sub-cities</option>
                  {subcityOptions.map((subcity) => <option key={subcity} value={subcity}>{subcityDisplayName(subcity)}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="dashboard-section-heading">
            <h2 id="admin-reports-title">
              {activeView === 'type' ? 'Reports across all sub-cities'
                : activeView === 'area' ? `Reports by area in ${selectedSubcity || 'all sub-cities'}`
                  : 'All reports'}
            </h2>
          </div>
          {isLoading ? <p className="empty-dashboard">Loading reports...</p> : filteredReports.length === 0 ? (
            <p className="empty-dashboard">No reports found.</p>
          ) : (
            <div className="admin-report-table-wrap">
              <table className="admin-report-table">
                <thead>
                  <tr><th>Report</th><th>Incident type</th><th>Sub-city</th><th>Kebele</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={`${report.id}-${report.submissionId || 'report'}`}>
                      <td>#{report.id}</td>
                      <td>{displayName(report.incidentType || report.incident_type || report.report_type, incidentTypeDisplayNames)}</td>
                      <td>{subcityDisplayName(report.subcity)}</td>
                      <td>{displayName(report.kebele, kebeleDisplayNames)}</td>
                      <td>{report.created_at ? formatDisplayDate(report.created_at, language) : '-'}</td>
                      <td><span className="report-status">{report.status || 'new'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </>}
        </section>
      </div>
    </main>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [loginRole, setLoginRole] = useState('police')
  const [loginError, setLoginError] = useState('')
  const [loginDetails, setLoginDetails] = useState({
    fullName: '',
    subCity: '',
    uniqueNumber: '',
    password: '',
  })
  const [language, setLanguage] = useState(() => window.localStorage.getItem('crime-report-language') || 'en')
  const t = translations[language]

  useEffect(() => {
    let isMounted = true
    fetch('/api/auth/dashboard/', { credentials: 'same-origin' })
      .then(async (response) => ({ response, result: await response.json().catch(() => ({})) }))
      .then(({ response, result }) => {
        if (!isMounted) return
        if (response.ok && result.authenticated) {
          setLoginRole(result.role || 'police')
          setLoginDetails((current) => ({
            ...current,
            fullName: result.name || current.fullName,
            subCity: result.subcity || current.subCity,
          }))
          setIsLoggedIn(true)
        }
      })
      .catch((error) => console.error('Dashboard session restore failed:', error))
      .finally(() => {
        if (isMounted) setIsSessionLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    const trimmedName = String(loginDetails.fullName || '').trim()
    const trimmedPassword = String(loginDetails.password || '').trim()

    const trimmedSubCity = String(loginDetails.subCity || '').trim()
    const trimmedUniqueNumber = String(loginDetails.uniqueNumber || '').trim()

    if (!trimmedName || !trimmedPassword || (loginRole === 'police' && (!trimmedSubCity || !trimmedUniqueNumber))) {
      setLoginError(loginRole === 'admin'
        ? 'Please enter your full name and password.'
        : 'Please enter your full name, sub-city, unique number, and password.')
      return
    }

    setLoginError('')
    try {
      const response = await fetch('/api/auth/dashboard/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          role: loginRole,
          name: trimmedName,
          password: trimmedPassword,
          subcity: trimmedSubCity,
          unique_number: trimmedUniqueNumber,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.')
      setLoginError('')
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Dashboard login failed:', error)
      setLoginError(error.message || 'Unable to sign in. Please try again.')
    }
  }

  const handleStartReporting = () => {
    window.localStorage.setItem('crime-report-language', language)
    window.location.href = `/report.html?mode=contact&lang=${language}`
  }

  const handleTrackReport = () => {
    window.localStorage.setItem('crime-report-language', language)
    window.location.href = `/report.html?mode=track&lang=${language}`
  }

  if (isSessionLoading) {
    return <main className="login-page"><p className="empty-dashboard">Checking dashboard session...</p></main>
  }

  if (!isLoggedIn) {
    return (
      <main className="login-page">
        <header
          className="login-header"
          style={{ backgroundImage: `linear-gradient(rgba(11,47,90,0.72), rgba(11,47,90,0.72)), url(${image1})` }}
        >
          <img src={image1} alt="Sidama region flag" className="login-header-image" />
          <div className="login-header-text">
            <p className="police-label">Hawassa City Police</p>
            <h1>Police Dashboard</h1>
          </div>
        </header>
        <section className="login-card" aria-labelledby="login-title">
          <p id="login-title" className="login-subtitle">Sign in to access the police dashboard.</p>
          <div className="login-role-options" role="group" aria-label="Choose login type">
            <button
              type="button"
              className={`login-role-button${loginRole === 'police' ? ' active' : ''}`}
              onClick={() => setLoginRole('police')}
            >
              Police
            </button>
            <button
              type="button"
              className={`login-role-button${loginRole === 'admin' ? ' active' : ''}`}
              onClick={() => setLoginRole('admin')}
            >
              Admin
            </button>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            {loginError && <p className="assignment-success login-error-message" role="alert">{loginError}</p>}
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              minLength={4}
              value={loginDetails.fullName}
              onChange={(event) => setLoginDetails({ ...loginDetails, fullName: event.target.value })}
              required
            />

            {loginRole === 'police' && <>
              <label htmlFor="subCity">Sub-city</label>
              <select
                id="subCity"
                value={loginDetails.subCity}
                onChange={(event) => setLoginDetails({ ...loginDetails, subCity: event.target.value })}
                required
              >
                <option value="">Select Sub-city</option>
                <option>Tabor</option>
                <option>Addis ketema</option>
                <option>Hayk Dar</option>
                <option>Mehal</option>
                <option>Bahil adarash</option>
                <option>Misrak</option>
                <option>Menahariya</option>
                <option>Tula</option>
              </select>
            </>}

            {loginRole === 'police' && <>
              <label htmlFor="uniqueNumber">Unique number</label>
              <input
                id="uniqueNumber"
                type="text"
                pattern="[A-Z]{3}-[0-9]{3}"
                title="Enter a unique number in the format TRP-234."
                value={loginDetails.uniqueNumber}
                onChange={(event) => setLoginDetails({ ...loginDetails, uniqueNumber: event.target.value })}
                required
              />
            </>}

            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              minLength={7}
              value={loginDetails.password}
              onChange={(event) => setLoginDetails({ ...loginDetails, password: event.target.value })}
              required
            />

            <button type="submit" className="start-reporting login-button">Login</button>
          </form>
        </section>
      </main>
    )
  }

  if (isLoggedIn) {
    return loginRole === 'admin'
      ? <AdminDashboard language={language} />
      : <Dashboard subCity={loginDetails.subCity} language={language} />
  }

  return (
    <main>
      <header
        className="app-header"
        style={{
          backgroundImage: `linear-gradient(rgba(11,47,90,0.8), rgba(11,47,90,0.8)), url(${image1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flag-card" aria-label="Sidama region flag">
          <img src={image1} alt="Sidama region flag" className="header-icon" />
        </div>
        <div className="header-text">
          <p className="police-label">{t.headerLabel}</p>
          <h1>{t.headerTitle}</h1>
        </div>
      </header>

      <div className="header-row">
        <div className="page-links">
          <a href="#home">{t.navHome}</a>
          <a href="#about">{t.navAbout}</a>
          <a href="#help">{t.navHelp}</a>
        </div>
        <div className="language-select">
          <label htmlFor="language">{t.languageLabel}</label>
          <select
            id="language"
            name="language"
            value={language}
            onChange={(event) => {
              const nextLanguage = event.target.value
              setLanguage(nextLanguage)
              window.localStorage.setItem('crime-report-language', nextLanguage)
            }}
          >
            <option value="am">{t.languageOptionAm}</option>
            <option value="en">{t.languageOptionEn}</option>
          </select>
        </div>
      </div>

      <div className="page-nav home-page-nav" aria-label="Page navigation">
        <button
          type="button"
          className="nav-arrow"
          aria-label="Go back"
          onClick={() => window.history.back()}
          disabled={window.history.length <= 1}
        >
          ←
        </button>
        <button
          type="button"
          className="nav-arrow"
          aria-label="Go forward"
          onClick={() => window.history.forward()}
          disabled={window.history.length <= 1}
        >
          →
        </button>
      </div>

      <div className="content-layout">
        <section className="info-section">
          <h1>{t.pageTitle}</h1>
          <h2>{t.pageSubtitle}</h2>
          <p>{t.victimText}</p>

          <h3>{t.emergencyTitle.replace('', '')}
            <a href="tel:8295"></a>{' '}
            
          </h3>
          <p>{t.emergencyText}</p>

          <h3>{t.suspectTitle}</h3>
          <p>{t.suspectText}</p>

          <p className="alert">
            <strong>{t.continueAlert}</strong>
          </p>

          <p>
            <strong>{t.noteLabel}</strong> {t.falseReportText}
          </p>

          <p>{t.felonyText}</p>

          <h3>{t.falseReportTitle}</h3>
          <p>{t.falseReportExplain}</p>

          <h3>{t.locationTitle}</h3>
          <p>{t.locationText}</p>

          <h3>{t.ageTitle}</h3>
          <p>{t.ageText}</p>

          <h3>{t.emailTitle}</h3>
          <p>{t.emailText}</p>

          <div className="info-actions">
            <button type="button" className="start-reporting" onClick={handleStartReporting}>
              {t.startReporting}
            </button>
            <button type="button" className="start-reporting alt" onClick={handleTrackReport}>
              {t.trackReport}
            </button>
          </div>
        </section>
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <h2>{t.contactTitle}</h2>
          <p>
            {t.contactPhone}
            <a href="tel:8295">8295</a>  
           
          </p>
          <p>
            {t.contactEmail}
            <a href="mailto:sidamapolice@gmail.com">sidamapolice@gmail.com</a>
          </p>
          <p>{t.contactAddress}</p>
        </div>
      </footer>
    </main>
  )
}

export default App
