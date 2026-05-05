import { GuideSection, GlossaryItem } from './types';

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'mixing',
    title: 'Mixing & DSP Basics',
    description: 'Core principles of channel strips, gain staging, EQ, and dynamics compression.',
    icon: 'Sliders',
    content: [
      {
        title: 'Gain Staging',
        text: 'The process of managing signal levels at each stage of a system. It is the most critical first step to minimize noise and prevent distortion.',
        tips: ['Ensure sufficient headroom.', 'In digital consoles, avoid peaking above 0 dBFS at all costs.']
      },
      {
        title: 'Compression Tips',
        text: 'Reduces dynamic range by attenuating loud peaks and bringing up quiet details. Essential for consistent vocal presence and balancing live bands.',
        tips: ['Threshold: The level where compression begins.', 'Ratio: Compression strength. Start at 3:1 for most vocals.']
      }
    ]
  },
  {
    id: 'mics',
    title: 'Input & Mic Placement',
    description: 'Understanding microphone types, polar patterns, and optimal placement for instruments.',
    icon: 'Mic2',
    content: [
      {
        title: 'Polar Patterns',
        text: 'Refers to a microphone\'s sensitivity to sound from different directions. Key to controlling feedback on stage.',
        tips: ['Cardioid: Picks up sound from the front. The standard choice for most church applications.', 'Super Cardioid: Narrower front pickup, but has high sensitivity at the rear. Be mindful of monitor placement.']
      }
    ]
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
    title: 'Cables & Hardware Repair',
    description: 'Pro guide for soldering connectors and basic hardware maintenance.',
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
