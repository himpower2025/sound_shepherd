import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Layers } from 'lucide-react';

// Import generated realistic product photos
import xlrImage from '../assets/images/xlr_cable_1782837948154.jpg';
import trsImage from '../assets/images/trs_cable_1782837959664.jpg';
import tsImage from '../assets/images/ts_cable_1782837969295.jpg';
import rcaImage from '../assets/images/rca_cable_1782837980291.jpg';
import auxImage from '../assets/images/aux_cable_1782837990334.jpg';
import speakonImage from '../assets/images/speakon_cable_1782838000964.jpg';
import usbABImage from '../assets/images/usb_ab_cable_1782838021881.jpg';
import usbCImage from '../assets/images/usb_c_cable_1782838032558.jpg';
import ethernetImage from '../assets/images/ethernet_cable_1782838044384.jpg';
import midiImage from '../assets/images/midi_cable_1782838057088.jpg';
import coaxialImage from '../assets/images/coaxial_cable_1782838067600.jpg';
import dmxImage from '../assets/images/dmx_cable_1782838077692.jpg';

interface CableConnectorVisualProps {
  name: string;
}

export const CableConnectorVisual: React.FC<CableConnectorVisualProps> = ({ name }) => {
  const [showDiagram, setShowDiagram] = useState<boolean>(false);

  // Map names to photographic images
  const getPhotoImage = (cableName: string) => {
    switch (cableName) {
      case 'XLR': return xlrImage;
      case '1/4" TRS': return trsImage;
      case '1/4" TS': return tsImage;
      case 'RCA': return rcaImage;
      case '3.5mm AUX': return auxImage;
      case 'SPEAKON': return speakonImage;
      case 'USB (Type-A/B)': return usbABImage;
      case 'USB-C': return usbCImage;
      case 'ETHERNET': return ethernetImage;
      case 'MIDI': return midiImage;
      case 'Coaxial Digital': return coaxialImage;
      case 'DMX': return dmxImage;
      default: return xlrImage;
    }
  };

  const renderDiagram = () => {
    switch (name) {
      case 'XLR':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(10, 15)">
              <path d="M5 20 C5 16, 15 16, 15 20 L15 24 C15 28, 5 28, 5 24 Z" fill="#334155" />
              <rect x="15" y="15" width="22" height="14" rx="3" fill="#475569" />
              <path d="M37 12 C37 12, 60 12, 62 14 L62 30 C60 32, 37 32, 37 32 Z" fill="url(#metalGrad)" stroke="#1e293b" strokeWidth="1" />
              <rect x="39" y="14" width="4" height="16" fill="#64748b" opacity="0.3" />
              <rect x="62" y="14" width="5" height="16" fill="#1e293b" />
              <rect x="67" y="16" width="7" height="2.5" rx="1" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
              <rect x="67" y="20.5" width="7" height="2.5" rx="1" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
              <rect x="67" y="25" width="7" height="2.5" rx="1" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
              <rect x="48" y="11" width="6" height="2" fill="#94a3b8" />
            </g>
            <g transform="translate(88, 35)">
              <circle r="14" fill="#334155" stroke="#1e293b" strokeWidth="2" />
              <circle r="12" fill="#1e293b" />
              <path d="M-6 -10 L6 -10 L4 -12 L-4 -12 Z" fill="#94a3b8" />
              <circle cx="-4" cy="-2" r="2" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="4" cy="-2" r="2" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="0" cy="5" r="2" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <rect x="-2" y="-14" width="4" height="2" fill="#ef4444" rx="0.5" />
            </g>
            <defs>
              <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
          </svg>
        );

      case '1/4" TRS':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(10, 20)">
              <path d="M0 12 C0 8, 30 8, 30 12 L30 18 C30 22, 0 22, 0 18 Z" fill="#1e293b" />
              <rect x="30" y="11" width="12" height="8" rx="1" fill="#475569" />
              <rect x="42" y="12" width="40" height="6" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
              <rect x="42" y="12.5" width="18" height="5" fill="url(#goldGrad)" />
              <rect x="60" y="12" width="2" height="6" fill="#1e293b" />
              <rect x="62" y="12.5" width="10" height="5" fill="url(#goldGrad)" />
              <rect x="72" y="12" width="2" height="6" fill="#1e293b" />
              <path d="M74 12.5 L81 12.5 C83 12.5, 85 13.5, 86 15 L86 15 C85 16.5, 83 17.5, 81 17.5 L74 17.5 Z" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
              <line x1="61" y1="12" x2="61" y2="18" stroke="#000" strokeWidth="1" />
              <line x1="73" y1="12" x2="73" y2="18" stroke="#000" strokeWidth="1" />
            </g>
            <g transform="translate(20, 52)">
              <rect x="0" y="0" width="80" height="10" rx="4" fill="#e2e8f0" />
              <text x="40" y="8" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle">STEREO / BALANCED (3-POLE)</text>
            </g>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
          </svg>
        );

      case '1/4" TS':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(10, 20)">
              <path d="M0 12 C0 8, 30 8, 30 12 L30 18 C30 22, 0 22, 0 18 Z" fill="#334155" />
              <rect x="30" y="11" width="12" height="8" rx="1" fill="#475569" />
              <rect x="42" y="12" width="40" height="6" fill="url(#metalGrad)" stroke="#334155" strokeWidth="0.5" />
              <rect x="42" y="12.5" width="28" height="5" fill="url(#metalGrad)" />
              <rect x="70" y="12" width="2.5" height="6" fill="#1e293b" />
              <path d="M72.5 L81 12.5 C83 12.5, 85 13.5, 86 15 L86 15 C85 16.5, 83 17.5, 81 17.5 L72.5 L72.5 Z" fill="url(#metalGrad)" stroke="#334155" strokeWidth="0.5" />
              <line x1="71" y1="12" x2="71" y2="18" stroke="#000" strokeWidth="1.5" />
            </g>
            <g transform="translate(20, 52)">
              <rect x="0" y="0" width="80" height="10" rx="4" fill="#ffedd5" />
              <text x="40" y="8" fill="#c2410c" fontSize="7" fontWeight="bold" textAnchor="middle">MONO / UNBALANCED (2-POLE)</text>
            </g>
            <defs>
              <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'RCA':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(10, 8)">
              <g transform="translate(0, 4)">
                <rect x="0" y="6" width="20" height="8" rx="2" fill="#ef4444" />
                <rect x="20" y="5" width="15" height="10" rx="1" fill="#dc2626" />
                <rect x="35" y="6" width="10" height="8" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
                <line x1="39" y1="6" x2="39" y2="14" stroke="#92400e" strokeWidth="0.5" />
                <line x1="42" y1="6" x2="42" y2="14" stroke="#92400e" strokeWidth="0.5" />
                <rect x="45" y="8.5" width="8" height="3" rx="0.5" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
              </g>
              <g transform="translate(0, 24)">
                <rect x="0" y="6" width="20" height="8" rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
                <rect x="20" y="5" width="15" height="10" rx="1" fill="#cbd5e1" />
                <rect x="35" y="6" width="10" height="8" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
                <line x1="39" y1="6" x2="39" y2="14" stroke="#92400e" strokeWidth="0.5" />
                <line x1="42" y1="6" x2="42" y2="14" stroke="#92400e" strokeWidth="0.5" />
                <rect x="45" y="8.5" width="8" height="3" rx="0.5" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
              </g>
            </g>
            <g transform="translate(75, 20)">
              <rect width="38" height="30" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
              <text x="19" y="12" fill="#dc2626" fontSize="8" fontWeight="black" textAnchor="middle">RED: R</text>
              <text x="19" y="24" fill="#475569" fontSize="8" fontWeight="black" textAnchor="middle">WHT: L</text>
            </g>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
          </svg>
        );

      case '3.5mm AUX':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(10, 20)">
              <path d="M0 14 C0 11, 25 11, 25 14 L25 16 C25 19, 0 19, 0 16 Z" fill="#0f172a" />
              <rect x="25" y="13" width="4" height="4" fill="url(#goldGrad)" />
              <rect x="29" y="13.5" width="30" height="3" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
              <rect x="38" y="13.5" width="1.5" height="3" fill="#1e293b" />
              <rect x="47" y="13.5" width="1.5" height="3" fill="#1e293b" />
              <rect x="55" y="13.5" width="1.5" height="3" fill="#1e293b" />
              <path d="M59 13.5 L63 13.5 C64.5 13.5, 65.5 14.2, 66 15 C65.5 15.8, 64.5 16.5, 63 16.5 L59 16.5 Z" fill="url(#goldGrad)" />
            </g>
            <g transform="translate(15, 48)">
              <rect width="90" height="12" rx="4" fill="#f3e8ff" />
              <text x="45" y="9" fill="#7e22ce" fontSize="7" fontWeight="bold" textAnchor="middle">TRRS (LEFT + RIGHT + MIC)</text>
            </g>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'SPEAKON':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(15, 12)">
              <rect x="0" y="12" width="22" height="20" rx="2" fill="#1e293b" />
              <rect x="22" y="10" width="24" height="24" rx="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
              <rect x="26" y="11" width="3" height="22" fill="#1e40af" opacity="0.6" />
              <rect x="32" y="11" width="3" height="22" fill="#1e40af" opacity="0.6" />
              <rect x="38" y="11" width="3" height="22" fill="#1e40af" opacity="0.6" />
              <rect x="28" y="7" width="12" height="5" fill="#f59e0b" rx="1" />
              <circle cx="34" cy="9.5" r="1.5" fill="#1e293b" />
              <rect x="46" y="13" width="10" height="18" fill="#0f172a" rx="1" />
              <rect x="56" y="15" width="2" height="4" fill="#f59e0b" />
              <rect x="56" y="25" width="2" height="4" fill="#f59e0b" />
            </g>
            <g transform="translate(74, 22)">
              <rect width="36" height="28" rx="6" fill="#fff7ed" stroke="#ffedd5" strokeWidth="1" />
              <text x="18" y="12" fill="#ea580c" fontSize="7" fontWeight="black" textAnchor="middle">TWIST</text>
              <text x="18" y="22" fill="#ea580c" fontSize="7" fontWeight="black" textAnchor="middle">&amp; LOCK</text>
            </g>
          </svg>
        );

      case 'USB (Type-A/B)':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(10, 8)">
              <rect x="0" y="6" width="25" height="12" rx="2" fill="#1e293b" />
              <rect x="25" y="7" width="18" height="10" fill="url(#metalGrad)" stroke="#475569" strokeWidth="0.5" />
              <rect x="34" y="8" width="9" height="3" fill="#0284c7" />
              <rect x="36" y="8" width="1.5" height="1" fill="#fbbf24" />
              <rect x="38" y="8" width="1.5" height="1" fill="#fbbf24" />
              <rect x="40" y="8" width="1.5" height="1" fill="#fbbf24" />
              <rect x="42" y="8" width="1.5" height="1" fill="#fbbf24" />
              <rect x="28" y="9" width="2.5" height="2" fill="#1e293b" />
              <rect x="31" y="9" width="2.5" height="2" fill="#1e293b" />
              <text x="12" y="24" fill="#94a3b8" fontSize="6" fontWeight="bold">TYPE-A</text>
            </g>
            <g transform="translate(68, 8)">
              <rect x="0" y="6" width="20" height="12" rx="2" fill="#1e293b" />
              <path d="M20 7 L32 7 C34 7, 36 9, 36 11 L36 15 C36 16, 35 17, 34 17 L20 17 Z" fill="url(#metalGrad)" stroke="#475569" strokeWidth="0.5" />
              <rect x="28" y="9" width="8" height="6" fill="#1e293b" rx="1" />
              <text x="10" y="24" fill="#94a3b8" fontSize="6" fontWeight="bold">TYPE-B</text>
            </g>
            <defs>
              <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'USB-C':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(15, 18)">
              <rect x="0" y="6" width="35" height="14" rx="3" fill="#1e293b" />
              <rect x="15" y="8" width="10" height="10" fill="#334155" />
              <rect x="35" y="8" width="18" height="10" rx="4" fill="url(#metalGrad)" stroke="#475569" strokeWidth="0.5" />
              <rect x="38" y="11.5" width="15" height="3" fill="#0f172a" rx="1" />
              <rect x="5" y="11" width="6" height="4" fill="#0ea5e9" opacity="0.8" rx="1" />
            </g>
            <g transform="translate(74, 20)">
              <rect width="36" height="30" rx="6" fill="#f0f9ff" stroke="#e0f2fe" strokeWidth="1" />
              <path d="M12 11 L18 15 L24 11" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M24 19 L18 15 L12 19" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
              <text x="18" y="27" fill="#0284c7" fontSize="6" fontWeight="bold" textAnchor="middle">24-PIN</text>
            </g>
            <defs>
              <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'ETHERNET':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(15, 12)">
              <rect x="0" y="14" width="20" height="10" fill="#475569" rx="1" />
              <rect x="20" y="9" width="30" height="20" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" fillOpacity="0.8" />
              <path d="M15 13 L35 4 L40 4 L28 13 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="0.5" />
              <rect x="46" y="11" width="4" height="16" fill="#e2e8f0" />
              <line x1="47" y1="12" x2="50" y2="12" stroke="#d97706" strokeWidth="1" />
              <line x1="47" y1="14" x2="50" y2="14" stroke="#d97706" strokeWidth="1" />
              <line x1="47" y1="16" x2="50" y2="16" stroke="#d97706" strokeWidth="1" />
              <line x1="47" y1="18" x2="50" y2="18" stroke="#d97706" strokeWidth="1" />
              <line x1="47" y1="20" x2="50" y2="20" stroke="#d97706" strokeWidth="1" />
              <line x1="47" y1="22" x2="50" y2="22" stroke="#d97706" strokeWidth="1" />
              <line x1="47" y1="24" x2="50" y2="24" stroke="#d97706" strokeWidth="1" />
              <line x1="47" y1="26" x2="50" y2="26" stroke="#d97706" strokeWidth="1" />
            </g>
            <g transform="translate(75, 22)">
              <rect width="34" height="26" rx="6" fill="#f0fdfa" stroke="#ccfbf1" strokeWidth="1" />
              <text x="17" y="12" fill="#0d9488" fontSize="8" fontWeight="black" textAnchor="middle">RJ45</text>
              <text x="17" y="21" fill="#0d9488" fontSize="6" fontWeight="bold" textAnchor="middle">8-PIN</text>
            </g>
          </svg>
        );

      case 'MIDI':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(12, 16)">
              <rect x="0" y="8" width="22" height="16" rx="2" fill="#1e293b" />
              <rect x="22" y="6" width="24" height="20" rx="3" fill="url(#metalGrad)" stroke="#475569" strokeWidth="0.5" />
              <circle cx="34" cy="16" r="8" fill="#1e293b" />
              <circle cx="29" cy="18" r="1.2" fill="#fbbf24" />
              <circle cx="30.5" cy="13.5" r="1.2" fill="#fbbf24" />
              <circle cx="34" cy="12" r="1.2" fill="#fbbf24" />
              <circle cx="37.5" cy="13.5" r="1.2" fill="#fbbf24" />
              <circle cx="39" cy="18" r="1.2" fill="#fbbf24" />
            </g>
            <g transform="translate(86, 35)">
              <circle r="15" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
              <circle r="12" fill="#0f172a" />
              <rect x="-2.5" y="-13" width="5" height="3" fill="#94a3b8" />
              <circle cx="-7.5" cy="3" r="1.5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="0.5" />
              <circle cx="-5" cy="-3.5" r="1.5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="0.5" />
              <circle cx="0" cy="-6" r="1.5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="0.5" />
              <circle cx="5" cy="-3.5" r="1.5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="0.5" />
              <circle cx="7.5" cy="3" r="1.5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="0.5" />
            </g>
            <defs>
              <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'Coaxial Digital':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(15, 20)">
              <rect x="0" y="5" width="22" height="10" rx="2" fill="#ea580c" />
              <rect x="22" y="3" width="10" height="14" rx="1" fill="#b45309" />
              <rect x="32" y="4" width="12" height="12" fill="url(#goldGrad)" stroke="#d97706" strokeWidth="0.5" rx="1" />
              <rect x="44" y="8" width="8" height="4" rx="0.5" fill="url(#goldGrad)" stroke="#d97706" strokeWidth="0.5" />
            </g>
            <g transform="translate(74, 20)">
              <rect width="36" height="30" rx="6" fill="#fff7ed" stroke="#ffedd5" strokeWidth="1" />
              <text x="18" y="14" fill="#ea580c" fontSize="8" fontWeight="black" textAnchor="middle">75 Ω</text>
              <text x="18" y="24" fill="#ea580c" fontSize="5" fontWeight="bold" textAnchor="middle">S/PDIF</text>
            </g>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'DMX':
        return (
          <svg viewBox="0 0 120 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="70" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <g transform="translate(10, 15)">
              <rect x="0" y="6" width="22" height="16" rx="2" fill="#db2777" />
              <rect x="22" y="5" width="24" height="18" rx="2" fill="url(#metalGrad)" stroke="#475569" strokeWidth="0.5" />
              <rect x="46" y="7" width="5" height="14" fill="#1e293b" />
              <rect x="51" y="8" width="6" height="1.5" fill="#f59e0b" />
              <rect x="51" y="11" width="6" height="1.5" fill="#f59e0b" />
              <rect x="51" y="14" width="6" height="1.5" fill="#f59e0b" />
              <rect x="51" y="17" width="6" height="1.5" fill="#f59e0b" />
              <rect x="51" y="20" width="6" height="1.5" fill="#f59e0b" />
            </g>
            <g transform="translate(88, 35)">
              <circle r="14" fill="#334155" stroke="#1e293b" strokeWidth="2" />
              <circle r="12" fill="#1e293b" />
              <circle cx="-5" cy="-3" r="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
              <circle cx="5" cy="-3" r="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
              <circle cx="-6" cy="4" r="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
              <circle cx="6" cy="4" r="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
            </g>
            <defs>
              <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full group select-none">
      <AnimatePresence mode="wait">
        {!showDiagram ? (
          <motion.div
            key="photo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full relative cursor-pointer"
            onClick={() => setShowDiagram(true)}
          >
            <img
              src={getPhotoImage(name)}
              alt={`${name} Connector Photo`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Elegant overlay to make text visible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-2">
              <span className="text-[10px] text-white font-extrabold tracking-wider bg-black/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Layers size={10} /> TAP FOR DIAGRAM
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="diagram"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full relative cursor-pointer"
            onClick={() => setShowDiagram(false)}
          >
            {renderDiagram()}
            {/* Elegant overlay back to photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-2">
              <span className="text-[10px] text-slate-700 font-extrabold tracking-wider bg-white/90 border border-slate-200 shadow-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                <ImageIcon size={10} /> TAP FOR PHOTO
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Indicator Switch Button in Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDiagram(!showDiagram);
        }}
        className={`absolute top-2 right-2 p-1.5 rounded-lg border shadow-sm transition-all text-xs font-black tracking-tighter uppercase flex items-center gap-1 z-10 ${
          showDiagram 
            ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700' 
            : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-white'
        }`}
        title={showDiagram ? "Show Real Photo" : "Show Pinout Diagram"}
      >
        {showDiagram ? (
          <>
            <ImageIcon size={12} />
            <span className="hidden sm:inline text-[9px] font-extrabold">PHOTO</span>
          </>
        ) : (
          <>
            <Layers size={12} />
            <span className="hidden sm:inline text-[9px] font-extrabold">SCHEMATIC</span>
          </>
        )}
      </button>
    </div>
  );
};
