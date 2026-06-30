import { GuideSection, GlossaryItem } from './types';

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'mixing',
    title: 'Audio EQ Guide',
    description: 'Interactive guide covering EQ pillars, live frequency mapping, and genre-specific vocal presets.',
    icon: 'Sliders',
    content: []
  },
  {
    id: 'mics',
    title: 'PA System Setup Flow',
    description: 'Interactive checklist guide detailing stages from audio sources to console, processing, and speakers.',
    icon: 'Radio',
    content: []
  },
  {
    id: 'troubleshooting',
    title: 'Feedback & Troubleshooting',
    description: 'How to solve feedback loops, eliminate noise, and handle emergency situations.',
    icon: 'Wrench',
    content: [
      {
        title: 'Feedback Suppression',
        text: 'A high-pitched squeal caused by a loop between a microphone and a speaker.',
        type: 'warning',
        tips: ['Offending Frequency: Use a narrow EQ cut to "ring out" the feedback.', 'Placement: Mics should always be located behind the main speakers.', 'Gain: Check if pre-amp gain is set too high for the environment.']
      }
    ]
  },
  {
    id: 'hardware',
    title: 'Cables, Pinouts & Repair',
    description: 'Interactive audio cable cheat sheet, connector pinouts, and professional soldering maintenance guide.',
    icon: 'Zap',
    content: [
      {
        title: 'Soldering Basics',
        text: 'Basic cable repair is a must-have skill for sound techs. Maintain an iron temperature around 350°C (660°F).',
        tips: ['1. Strip wires and "tin" them before connecting.', '2. Also tin the connector terminals.', '3. Heat both parts simultaneously for a clean bond.']
      },
      {
        title: 'XLR vs 1/4" (TS/TRS)',
        text: 'Understanding balanced vs unbalanced signals is the first step in solving line noise.',
        tips: ['Balanced: Uses 3 wires to cancel interference. Mandatory for long cable runs.']
      }
    ]
  },
  {
    id: 'checklist',
    title: 'Sanity Kit (Checklist)',
    description: 'Step-by-step checklists for before, during, and after the service.',
    icon: 'CheckSquare',
    content: [
      {
        title: 'Soundcheck Order',
        text: 'Start with Drums -> Bass -> Guitars -> Keys -> Vocals, then finish with full rehearsal.',
        tips: ['Prioritize monitor mixes to make musicians comfortable.', 'Remember: The preacher\'s voice must always be the most intelligible element.']
      }
    ]
  }
];

export const GLOSSARY: GlossaryItem[] = [
  { term: 'Active vs Passive', definition: 'Active gear requires power and has internal amplification. Passive gear works without power, typically used for signal attenuation or conversion.' },
  { term: 'Analog vs Digital Consoles', definition: 'Analog uses physical knobs to manipulate electrical signals directly. Digital converts signals to data for software processing, offering scenes and recall.' },
  { term: 'Phantom Power (48V)', definition: 'DC power transmitted through mic cables to power condenser microphones and active DI boxes.' },
  { term: 'Acoustic Guitar Feedback', definition: 'Caused by resonances in the guitar body interacting with speakers. Use a notch filter at 80-200Hz to fix.' },
  { term: 'DI Box (Direct Box)', definition: 'Converts high-impedance unbalanced signals to mic-level balanced signals for cleaner transmission.' },
  { term: 'Compressor', definition: 'A dynamic processor that reduces the volume of loud signals exceeding a set threshold.' },
  { term: 'EQ (Equalizer)', definition: 'A tool used to boost or cut specific frequency ranges to shape tone.' },
  { term: 'HPF (High Pass Filter)', definition: 'Allows frequencies above a certain point to pass while cutting out low-end rumble.' },
  { term: 'XLR Connector', definition: 'Standard 3-pin professional audio connector with locking mechanism.' },
  { term: 'TRS (Tip-Ring-Sleeve)', definition: 'A 1/4" connector capable of stereo or balanced mono transmission.' },
  { term: 'Clipping', definition: 'Audio distortion occurring when the signal exceeds the maximum level a device can handle.' },
  { term: 'Aux Send', definition: 'A separate output path used for monitors, recording, or external effects processors.' }
];

export interface CableInfo {
  name: string;
  subtitle: string;
  type: 'analog' | 'data' | 'control';
  signal: 'Balanced' | 'Unbalanced' | 'Digital';
  desc: string;
  color: string;
  iconName: string;
}

export const CABLE_CHEAT_SHEET: CableInfo[] = [
  {
    name: 'XLR',
    subtitle: 'The Festival Standard',
    type: 'analog',
    signal: 'Balanced',
    desc: 'Delivers interference-free master audio straight to the main stage PA. Uses a 3-pin locking design.',
    color: 'emerald',
    iconName: 'Mic'
  },
  {
    name: '1/4" TRS',
    subtitle: 'Pro Audio Routing',
    type: 'analog',
    signal: 'Balanced',
    desc: 'Pure, noise-cancelling audio routing for professional mixers, interfaces, and studio monitors.',
    color: 'blue',
    iconName: 'Music'
  },
  {
    name: '1/4" TS',
    subtitle: 'Instrument & Line Out',
    type: 'analog',
    signal: 'Unbalanced',
    desc: 'Durable unbalanced mono connection for instruments (like guitars), hardware gear, and booth monitors.',
    color: 'amber',
    iconName: 'Zap'
  },
  {
    name: 'RCA',
    subtitle: 'Turntables & Media Players',
    type: 'analog',
    signal: 'Unbalanced',
    desc: 'Indispensable and low-latency. Your go-to connection for turntables, consumer gear, and media players.',
    color: 'rose',
    iconName: 'Disc'
  },
  {
    name: '3.5mm AUX',
    subtitle: 'Universal Playback',
    type: 'analog',
    signal: 'Unbalanced',
    desc: 'Universal playback for quick track previews, mobile devices, headphones, and backup audio sources.',
    color: 'purple',
    iconName: 'Headphones'
  },
  {
    name: 'SPEAKON',
    subtitle: 'Heavy-Duty Speaker Connection',
    type: 'analog',
    signal: 'Balanced',
    desc: 'Heavy-duty, twist-lock security built specifically to drive massive club subwoofers and amplifiers safely.',
    color: 'orange',
    iconName: 'Sliders'
  },
  {
    name: 'USB (Type-A/B)',
    subtitle: 'The Club Standard Link',
    type: 'data',
    signal: 'Digital',
    desc: 'The trusted club standard for rock-solid connection between software (DJ apps, DAWs) and hardware.',
    color: 'cyan',
    iconName: 'Usb'
  },
  {
    name: 'USB-C',
    subtitle: 'Future-Proof Data',
    type: 'data',
    signal: 'Digital',
    desc: 'High-speed, future-proof data connection for modern laptops, controllers, and iOS setups.',
    color: 'sky',
    iconName: 'Smartphone'
  },
  {
    name: 'ETHERNET',
    subtitle: 'The Nervous System',
    type: 'data',
    signal: 'Digital',
    desc: 'Syncs multi-players, shares databases, and locks in lighting rigs. The backbone of modern booths.',
    color: 'indigo',
    iconName: 'Network'
  },
  {
    name: 'MIDI',
    subtitle: 'Synthesizer Sync',
    type: 'control',
    signal: 'Digital',
    desc: '5-pin classic connector that syncs hardware synthesizers, MIDI controllers, and drum machines.',
    color: 'violet',
    iconName: 'Cpu'
  },
  {
    name: 'Coaxial Digital',
    subtitle: 'High-Fidelity Digital',
    type: 'data',
    signal: 'Digital',
    desc: 'Perfect for connecting high-fidelity subwoofer speakers to digital-to-analog audio components.',
    color: 'teal',
    iconName: 'Speaker'
  },
  {
    name: 'DMX',
    subtitle: 'Stage Light & FX Control',
    type: 'control',
    signal: 'Digital',
    desc: 'Controls stage moving heads, par cans, smoke machines, and atmospheric effects over 3-pin or 5-pin cables.',
    color: 'pink',
    iconName: 'Lightbulb'
  }
];
