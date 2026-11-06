import CallingAtSelector, { CallingAtPoint } from '@components/CallingAtSelector'
import CustomAnnouncementPane, { ICustomAnnouncementPreset } from '@components/PanelPanes/CustomAnnouncementPane'
import CustomButtonPane from '@components/PanelPanes/CustomButtonPane'
import { AllStationsTitleValueMap } from '@data/StationManipulators'
import crsToStationItemMapper from '@helpers/crsToStationItemMapper'
import type { AnyCustomAnnouncementTab, AudioItem, CustomAnnouncementTab, CustomButtonTab } from '../../AnnouncementSystem'
import TrainAnnouncementSystem from '../../TrainAnnouncementSystem'
import { MerseyrailClass777AvailableStationCodes, MerseyrailClass777MainClips } from './MerseyrailClass777Clips'

type NextStationPhrase =
  | 'messages/the-next-station-is'
  | 'messages/the-next-station-stop-will-be-2'
  | 'messages/the-next-stop-is-2'
  | 'messages/the-next-stop-will-be'
  | 'messages/the-next-stop-is'
  | 'messages/the-next-stop-will-be-2'

interface INextStationAnnouncementOptions {
  stationCode: string
  phrase: NextStationPhrase
  terminatesHere: boolean
}

interface IStationAnnouncementOptions {
  stationCode: string
  terminatesHere: boolean
}

interface IApproachingStationAnnouncementOptions {
  stationCode: string
}

interface IStartOfJourneyAnnouncementOptions {
  terminatesAtCode: string
  callingAtCodes: CallingAtPoint[]
}

const announcementPresets: Readonly<{
  startOfJourney: ICustomAnnouncementPreset<IStartOfJourneyAnnouncementOptions>[]
}> = {
  startOfJourney: [
    {
      name: 'Headbolt Lane to Liverpool Central',
      state: {
        terminatesAtCode: 'LVC',
        callingAtCodes: ['HBL', 'KIR', 'FAZ', 'RIL', 'KKD', 'SDL', 'MRF'].map(crsToStationItemMapper),
      },
    },
  ],
}

type DisruptionType = 'running late' | 'delays may be experienced' | 'apology' | 'waiting for' | 'continuing delay' | 'terminating early'
type DelayDuration = '10' | '15' | '20' | '30' | '40' | '50' | 'over-an-hour'

const DELAY_DURATION_CLIPS: Record<DelayDuration, string> = {
  '10': 'time/10-minutes-late',
  '15': 'time/15-minutes-late',
  '20': 'time/20-minutes-late',
  '30': 'time/30-minutes-late',
  '40': 'time/40-minutes-late',
  '50': 'time/50-minutes-late',
  'over-an-hour': 'time/more-than-an-hour-late',
}

interface IDisruptionAnnouncementOptions {
  disruptionType: DisruptionType
  delayDuration: DelayDuration
  affectedAreaCode: string
  noLongerCallingAt: CallingAtPoint[]
  terminatesAtCode: string
  apologise: boolean
  checkWithStaff: boolean
}

const mainButtons = MerseyrailClass777MainClips.map(({ label, clip }) => ({ label, files: [clip] }))
const announcementButtonSectionNames = [
  'Safety & security',
  'Tickets & station',
  'On Board',
  'Delays',
  'Crew',
  'Emergency',
  'Miscellaneous',
] as const
type AnnouncementButtonSection = (typeof announcementButtonSectionNames)[number]

type AnnouncementButton = (typeof mainButtons)[number]

const numberClipLabels = new Set([
  'One',
  'Second',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
  'Twenty',
  'Twenty First',
  'Twenty Second',
  'Twenty Third',
  'Twenty Four',
  'Twenty Five',
  'Twenty Sixth',
  'Twenty Seventh',
  'Twenty Eight',
  'Twenty Nine',
  'Thirty',
  'Thirty One',
])
const conjoinerLabels = new Set<string>(
  MerseyrailClass777MainClips.filter(({ clip }) => clip.startsWith('conjoiners/')).map(({ label }) => label),
)

const normaliseStationName = (name: string) =>
  name
    .replace(/\s+station$/i, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
const stationNameButtonLabels = new Set(
  AllStationsTitleValueMap.flatMap(({ title }) => {
    const stationName = title.replace(/\s+\([A-Z0-9]{2,4}\)$/, '')
    const normalisedName = normaliseStationName(stationName)

    return [normalisedName, normalisedName.replace(/street$/, 'st')]
  }),
)
const nonStationNameButtonLabels = new Set(['March'])
const isHiddenButton = (label: string) =>
  conjoinerLabels.has(label) ||
  numberClipLabels.has(label) ||
  (!nonStationNameButtonLabels.has(label) && stationNameButtonLabels.has(normaliseStationName(label.replace(/\s+\(\d+\)$/, ''))))

const clipLabelsBySection: Record<AnnouncementButtonSection, string[]> = {
  'Safety & security': [
    'British Transport Police',
    'Security Alert',
    'Security Patrols',
    'Security Patrols (2)',
    'CCTV In Operation',
    'CCTV On Trains',
    'CCTV Camera Access',
    'Suspicious Item Warning',
    'Antisocial Behaviour',
    'See It Say It',
    'Vandalism',
    'Window Hammers',
    'Safety Information',
    'Safety Posters',
    'Safety Posters (2)',
    'Safety Devices',
    'Safer Station Safer Journey',
    'Boarding Safety',
    'Follow Staff Instructions',
    'Child Supervision',
    'Face Covering',
    'Face Covering Exemption',
    'Feet Off Seats',
    'Smoking Prohibited',
    'Smoking Prohibited (2)',
    'Litter Reminder',
    'Baggage Reminder',
    'Unattended Luggage',
    'Unclaimed Belongings',
    'Take Belongings',
    'Take Belongings (2)',
    'Stay Calm',
  ],
  'Tickets & station': [
    'Valid Ticket',
    'Penalty Fares',
    'Ticket Inspection',
    'Ticket Inspection Help',
    'Ticket Checks',
    'Ticket Checks (2)',
    'Station Assistance',
    'Underground Station Assistance',
    'Lift Escalator Access',
    'Lift Out Of Service',
    'Step Free Access',
    'Step Height Warning',
    'Stepping Down',
    'Charging Points',
    'Check Travel Details',
    'All Change',
    'Change Here',
    'Change Here (2)',
    'Change Here (3)',
    'Connecting Lines',
    'Connecting Services',
    'Connecting Services (2)',
    'Other Lines',
    'Other Stations',
    'City Line',
    'City Line Warrington',
    'City Long Distance',
    'Long Distance Services',
    'Northern Line',
    'Northern Line Services',
    'Capenhurst Bache',
    'Northern Line Welcome',
    'Wirral Line',
    'Wirral Line Services',
    'Wirral Line Welcome',
    'Wirral Lime Street',
    'Wirral To Lime Street',
    'Airport Bus',
    'For Buses To Liverpool Airport',
    'Passengers For',
    'Passengers Visiting',
    'For Aintree Racecourse',
    'Aintree Racecourse',
    'Aintree Racecourse (2)',
    'Aintree University Hospital',
    'Anfield',
    'Goodison Park',
    'Prenton Park',
    'Liverpool Airport',
    'Liverpool Airport (2)',
    'Liverpool Attractions',
    'Birmingham',
    'Leeds',
    'Manchester',
    'Manchester (2)',
    'Preston',
    'Preston (2)',
    'Warrington',
    'Chester',
    'Chester U Boat Story',
    'U Boat Story',
    'Cheshire Oaks Aquarium',
    'Chester Zoo',
    'Chester Zoo (2)',
    'Chester Zoo Connection',
    'Countess Chester Hospital',
    'Ellesmere Port',
    'Ellesmere Port Manchester',
    'Helsby',
    'Kirkby',
    'Ormskirk',
    'Ormskirk Kirkby',
    'Hillside Station',
    'Hoylake Station',
    'New Brighton',
    'New Brighton Showground',
    'Open Golf Hoylake',
    'Open Golf Birkdale',
    'Sandhills Soccer Bus',
    'Soccer Bus Connection',
    'Southport',
    'Southport Air Show',
    'Southport Seafront',
    'Southport Show Bus',
    'Flower Show',
    'Spring Flower Show',
    'Wigan',
    'Wigan (2)',
    'West Kirby',
    'West Kirby New Brighton',
    'North Wales Manchester London',
    'North Wales Manchester London (2)',
    'Wrexham',
    'Wrexham North Wales',
    'Wirral Show',
    'Leave For',
    'Luggage Storage',
  ],
  'On Board': [
    'Merseyrail Welcome',
    'Merseyrail Welcome (2)',
    'Merseyrail Welcome (3)',
    'Merseyrail Service',
    'Train For',
    'Train Destination',
    'Our Destination',
    'Calling At',
    'Calling At All Stations',
    'Calling At Stations',
    'Passengers',
    'Passengers Travelling',
    'Next Station (2)',
    'Next Station Stop',
    'Next Station Stop (2)',
    'Next Station',
    'Next Stop',
    'Next Stop (2)',
    'Next Stop (3)',
    'Next Stop (4)',
    'Next Stop (5)',
    'Approaching',
    'Now Approaching',
    'We Are Now Approaching',
    'This Is',
    'This Station',
    'Train Secured',
    'Train Terminates',
    'Train Terminates (2)',
    'Train Terminates Here',
    'Terminating Next Station',
    'Terminating Next Station (2)',
    'Ready To Depart',
    'Doors Closing',
    'Closing Doors',
    'Closing Door Warning',
    'Doors Open Left',
    'Doors Open Left (2)',
    'Doors Open Right',
    'Doors Open Right (2)',
    'Doors Will Not Open',
    'Rear Doors Closed',
    'Keep Clear Doors',
    'Stand Clear Doors',
    'Alight Here',
    'Alight Here For',
    'Leave Train At',
    'Leave The Train Here',
    'Move Down Train',
    'Make Room',
    'Front Of Train',
    'Rear Of Train',
    'Front Cab Exit',
    'Rear Cab Exit',
    'Priority Seating',
    'Merseyrail Thanks',
    'Thank You',
    'Thank You (2)',
    'Merseyrail Farewell',
    'Evening Farewell',
    'And',
    'And Beyond',
    'Here',
    'Further Announcements',
    'Further Information',
  ],
  Delays: [
    'Merseyrail Apology',
    'Delay Apology',
    'Delay Apology (2)',
    'Delay Apology (3)',
    'Delay Apology (4)',
    'Inconvenience Apology',
    'Inconvenience Apology (2)',
    'Late Running Apology',
    'Late Running Apology (2)',
    'Beyond Our Control',
    'Delay Cause',
    'Ten Minutes Late',
    'Fifteen Minutes Late',
    'Twenty Minutes Late',
    'Thirty Minutes Late',
    'Forty Minutes Late',
    'Fifty Minutes Late',
    'Over An Hour Late',
    'Adverse Weather',
    'Adverse Weather Conditions',
    'Severe Weather',
    'Lineside Incident',
    'Points Failure',
    'Power Problems',
    'Power Supply Problems',
    'Signalling Problems',
    'Technical Problems',
    'Train Technical Problems',
    'Operational Difficulties',
    'Operational Difficulties (2)',
    'Does Not Call',
    'Station Skipped',
    'Failed Train Ahead',
    'Train Delayed',
    'Train Diverted',
    'Early Termination',
    'Early Termination (2)',
    'Replacement Bus',
    'New Timetable',
    'Special Timetable',
    'Updated Information',
    'Service Running',
    'Service Standard',
  ],
  Crew: ['Assistance En Route', 'Crew Shrewsbury Wrexham', 'Medical Staff Request', 'Revenue Inspectors', 'Staff Instructions'],
  Emergency: [
    'Emergency Advice',
    'Emergency Communication',
    'Emergency At Station',
    'Emergency PA Message',
    'Passenger Alarm',
    'Passenger Alarm Activated',
    'Train Fire',
    'Fire Extinguishers',
    'Fire Evacuation Guidance',
    'Emergency Exits',
    'Emergency Exits Break Glass',
    'Emergency Exits Break Glass (2)',
    'Evacuate Train',
    'Evacuate Train (2)',
    'Evacuate Passengers Staff',
    'Evacuate To Platform',
    'Move Away From Fire',
  ],
  Miscellaneous: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'One',
    'Second',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
    'Twenty',
    'Twenty First',
    'Twenty Second',
    'Twenty Third',
    'Twenty Four',
    'Twenty Five',
    'Twenty Sixth',
    'Twenty Seventh',
    'Twenty Eight',
    'Twenty Nine',
    'Thirty',
    'Thirty One',
  ],
}

const mainButtonByLabel = new Map<string, AnnouncementButton>(mainButtons.map(button => [button.label, button]))
const explicitlyOrderedLabels = new Set(Object.values(clipLabelsBySection).flat())
const announcementButtonSections = Object.fromEntries(
  announcementButtonSectionNames.map(section => [section, [] as AnnouncementButton[]]),
) as Record<AnnouncementButtonSection, AnnouncementButton[]>

for (const section of announcementButtonSectionNames) {
  if (section === 'Miscellaneous') continue

  for (const label of clipLabelsBySection[section]) {
    const button = mainButtonByLabel.get(label)
    if (!button) throw new Error(`Unknown Merseyrail Class 777 button in order: ${label}`)
    if (isHiddenButton(label)) continue
    announcementButtonSections[section].push(button)
  }
}

announcementButtonSections.Miscellaneous.push(
  ...mainButtons
    .filter(button => !explicitlyOrderedLabels.has(button.label) && !isHiddenButton(button.label))
    .sort((a, b) => a.label.localeCompare(b.label)),
)

export default class MerseyrailClass777 extends TrainAnnouncementSystem {
  readonly NAME = 'Merseyrail Class 777'
  readonly ID = 'MERSEYRAIL_CLASS_777_V1'
  readonly FILE_PREFIX = 'Merseyrail/Class 777'
  readonly SYSTEM_TYPE = 'train'
  readonly DESCRIPTION = 'Generate Merseyrail Class 777 on-train announcements using real audio recordings.'

  readonly AvailableStationNames = {
    high: [...MerseyrailClass777AvailableStationCodes],
    low: [...MerseyrailClass777AvailableStationCodes],
  }

  private readonly AvailableStationCodeSet = new Set<string>(this.AvailableStationNames.high)
  private readonly AvailableStationOptions = AllStationsTitleValueMap.filter(({ value }) => this.AvailableStationCodeSet.has(value))

  private async playNextStationAnnouncement(options: INextStationAnnouncementOptions, download: boolean = false): Promise<void> {
    if (!this.validateStationExists(options.stationCode)) return

    const files: AudioItem[] = [options.phrase, `stations.${options.stationCode}`]

    if (options.terminatesHere) files.push('reasons/where-this-train-terminates')

    await this.playAudioFiles(files, download)
  }

  private async playAtStationAnnouncement(options: IStationAnnouncementOptions, download: boolean = false): Promise<void> {
    if (!this.validateStationExists(options.stationCode)) return

    const files: AudioItem[] = ['conjoiners/this-is', `stations.${options.stationCode}`]

    if (options.terminatesHere) files.push('reasons/where-this-train-terminates')

    await this.playAudioFiles(files, download)
  }

  private async playApproachingStationAnnouncement(options: IApproachingStationAnnouncementOptions, download: boolean = false): Promise<void> {
    if (!this.validateStationExists(options.stationCode)) return

    const files: AudioItem[] = ['messages/we-are-now-approaching-2', `stations.${options.stationCode}`]
    await this.playAudioFiles(files, download)
  }

  private async playStartOfJourneyAnnouncement(options: IStartOfJourneyAnnouncementOptions, download: boolean = false): Promise<void> {
    if (!this.validateStationExists(options.terminatesAtCode)) return
    if (!options.callingAtCodes.every(({ crsCode }) => this.validateStationExists(crsCode))) return

    const stations = [...options.callingAtCodes.map(({ crsCode }) => `stations.${crsCode}`), `stations.${options.terminatesAtCode}`]
    const files: AudioItem[] = [
      'conjoiners/welcome-aboard-this-merseyrail-service-to',
      `stations.${options.terminatesAtCode}`,
      'conjoiners/calling-out',
      ...this.pluraliseAudio(stations, { andId: 'conjoiners/and' }),
      'messages/if-you-see-something-that-doesn-t-look-right-speak-to-staff-or-text-the-british-transport-police-on-6-1-0-1-6-we-ll-sort-it-see-it-say-it-sort-it',
    ]
    await this.playAudioFiles(files, download)
  }

  private async playDisruptionAnnouncement(options: IDisruptionAnnouncementOptions, download: boolean = false): Promise<void> {
    const files: AudioItem[] = []

    switch (options.disruptionType) {
      case 'running late':
        files.push(
          'reasons/this-train-is-being-delayed-due-to',
          DELAY_DURATION_CLIPS[options.delayDuration],
          'reasons/we-are-sorry-for-the-late-running-of-this-service-2',
        )
        break
      case 'delays may be experienced':
        files.push('messages/we-are-sorry-for-any-inconvenience', 'messages/this-is-due-to')
        if (options.affectedAreaCode) {
          if (!this.validateStationExists(options.affectedAreaCode)) return
          files.push(`stations.${options.affectedAreaCode}`)
        }
        break
      case 'apology':
        files.push('messages/we-are-sorry-for-any-inconvenience', 'messages/this-is-due-to')
        break
      case 'waiting for':
        files.push('reasons/this-train-is-being-delayed-due-to')
        break
      case 'continuing delay':
        files.push(
          'reasons/we-are-sorry-for-the-delay-to-the-train-and-would-ask-passengers-to-remain-seated-until-arrival-at-the-next-station',
          'messages/this-is-due-to',
        )
        break
      case 'terminating early':
        if (!this.validateStationExists(options.terminatesAtCode)) return
        files.push('reasons/this-train-is-being-terminated-early-due-to', `stations.${options.terminatesAtCode}`)
        if (options.noLongerCallingAt.length > 0) {
          if (!options.noLongerCallingAt.every(({ crsCode }) => this.validateStationExists(crsCode))) return
          files.push(
            'conjoiners/this-train-does-not-call-at',
            ...this.pluraliseAudio(
              options.noLongerCallingAt.map(({ crsCode }) => `stations.${crsCode}`),
              {
                andId: 'conjoiners/and',
              },
            ),
          )
        }
        if (options.checkWithStaff) files.push('messages/if-you-require-assistance-please-contact-one-of-our-staff-on-the-station')
        break
    }

    if (options.apologise && options.disruptionType !== 'running late')
      files.push('messages/merseyrail-wished-to-apologise-for-any-inconvenience')
    await this.playAudioFiles(files, download)
  }

  readonly customAnnouncementTabs: Record<string, AnyCustomAnnouncementTab> = {
    callingAt: {
      name: 'Start of journey',
      component: CustomAnnouncementPane,
      defaultState: {
        terminatesAtCode: this.AvailableStationOptions[0].value,
        callingAtCodes: [],
      },
      props: {
        playHandler: this.playStartOfJourneyAnnouncement.bind(this),
        presets: announcementPresets.startOfJourney,
        options: {
          terminatesAtCode: {
            name: 'Terminates at',
            type: 'select',
            default: this.AvailableStationOptions[0].value,
            options: this.AvailableStationOptions,
          },
          callingAtCodes: {
            name: '',
            type: 'custom',
            component: CallingAtSelector,
            props: {
              selectLabel: 'Calling points before the terminus',
              placeholder: 'Add a station…',
              heading: 'Calling at…',
              availableStations: this.AvailableStationNames.high,
            },
            default: [],
          },
        },
      },
    } satisfies CustomAnnouncementTab<IStartOfJourneyAnnouncementOptions>,
    atStation: {
      name: 'At station',
      component: CustomAnnouncementPane,
      defaultState: {
        stationCode: this.AvailableStationOptions[0].value,
        terminatesHere: false,
      },
      props: {
        playHandler: this.playAtStationAnnouncement.bind(this),
        options: {
          stationCode: {
            name: 'This station',
            type: 'select',
            default: this.AvailableStationOptions[0].value,
            options: this.AvailableStationOptions,
          },
          terminatesHere: {
            name: 'Train terminates here?',
            type: 'boolean',
            default: false,
          },
        },
      },
    } satisfies CustomAnnouncementTab<IStationAnnouncementOptions>,
    nextStation: {
      name: 'Departing stop',
      component: CustomAnnouncementPane,
      defaultState: {
        stationCode: this.AvailableStationOptions[0].value,
        phrase: 'messages/the-next-station-is',
        terminatesHere: false,
      },
      props: {
        playHandler: this.playNextStationAnnouncement.bind(this),
        options: {
          stationCode: {
            name: 'Next station',
            type: 'select',
            default: this.AvailableStationOptions[0].value,
            options: this.AvailableStationOptions,
          },
          phrase: {
            name: 'Wording',
            type: 'select',
            default: 'messages/the-next-station-is',
            options: [
              { title: 'Next station', value: 'messages/the-next-station-is' },
              { title: 'Next station stop', value: 'messages/the-next-station-stop-will-be-2' },
              { title: 'Next stop', value: 'messages/the-next-stop-is-2' },
              { title: 'Next stop (variant 2)', value: 'messages/the-next-stop-will-be' },
              { title: 'Next stop (variant 3)', value: 'messages/the-next-stop-is' },
              { title: 'Next stop (variant 4)', value: 'messages/the-next-stop-will-be-2' },
            ],
          },
          terminatesHere: {
            name: 'Train terminates here?',
            type: 'boolean',
            default: false,
          },
        },
      },
    } satisfies CustomAnnouncementTab<INextStationAnnouncementOptions>,
    approachingStation: {
      name: 'Approaching stop',
      component: CustomAnnouncementPane,
      defaultState: {
        stationCode: this.AvailableStationOptions[0].value,
      },
      props: {
        playHandler: this.playApproachingStationAnnouncement.bind(this),
        options: {
          stationCode: {
            name: 'Next station',
            type: 'select',
            default: this.AvailableStationOptions[0].value,
            options: this.AvailableStationOptions,
          },
        },
      },
    } satisfies CustomAnnouncementTab<IApproachingStationAnnouncementOptions>,
    disruption: {
      name: 'Delays & disruption',
      component: CustomAnnouncementPane,
      defaultState: {
        disruptionType: 'running late',
        delayDuration: '10',
        affectedAreaCode: '',
        noLongerCallingAt: [],
        terminatesAtCode: this.AvailableStationOptions[0].value,
        apologise: true,
        checkWithStaff: true,
      },
      props: {
        playHandler: this.playDisruptionAnnouncement.bind(this),
        options: {
          disruptionType: {
            name: 'Announcement',
            type: 'select',
            default: 'running late',
            options: [
              { title: 'Service running late', value: 'running late' },
              { title: 'Delays may be experienced', value: 'delays may be experienced' },
              { title: 'Apology with reason', value: 'apology' },
              { title: 'Waiting for', value: 'waiting for' },
              { title: 'Continuing delay', value: 'continuing delay' },
              { title: 'Terminating early', value: 'terminating early' },
            ],
          },
          delayDuration: {
            name: 'Delay',
            type: 'select',
            default: '10',
            options: [
              { title: '10 minutes', value: '10' },
              { title: '15 minutes', value: '15' },
              { title: '20 minutes', value: '20' },
              { title: '30 minutes', value: '30' },
              { title: '40 minutes', value: '40' },
              { title: '50 minutes', value: '50' },
              { title: 'Over an hour', value: 'over-an-hour' },
            ],
            onlyShowWhen: state => state.disruptionType === 'running late',
          },
          affectedAreaCode: {
            name: 'Affected area',
            type: 'select',
            default: '',
            options: [{ title: 'No station specified', value: '' }, ...this.AvailableStationOptions],
            onlyShowWhen: state => state.disruptionType === 'delays may be experienced',
          },
          terminatesAtCode: {
            name: 'Now terminates at',
            type: 'select',
            default: this.AvailableStationOptions[0].value,
            options: this.AvailableStationOptions,
            onlyShowWhen: state => state.disruptionType === 'terminating early',
          },
          noLongerCallingAt: {
            name: '',
            type: 'custom',
            component: CallingAtSelector,
            props: {
              availableStations: this.AvailableStationNames.high,
              selectLabel: 'Cancelled calling points',
              placeholder: 'Add a cancelled calling point…',
              heading: 'Will no longer call at…',
            },
            default: [],
            onlyShowWhen: state => state.disruptionType === 'terminating early',
          },
          checkWithStaff: {
            name: 'Advise passengers to ask staff for help',
            type: 'boolean',
            default: true,
            onlyShowWhen: state => state.disruptionType === 'terminating early',
          },
          apologise: {
            name: 'Apologise for the inconvenience',
            type: 'boolean',
            default: true,
          },
        },
      },
    } satisfies CustomAnnouncementTab<IDisruptionAnnouncementOptions>,
    clips: {
      name: 'Announcement buttons',
      component: CustomButtonPane,
      props: {
        buttonSections: announcementButtonSections,
      },
    } satisfies CustomButtonTab,
  }
}
