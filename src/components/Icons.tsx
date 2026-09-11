type P = { className?: string };
const gold = "#D4AF37";

export function IconAluminum({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="10" width="60" height="80" fill="none" stroke={gold} strokeWidth="3" />
      <line x1="35" y1="10" x2="35" y2="90" stroke={gold} strokeWidth="2" />
      <line x1="65" y1="10" x2="65" y2="90" stroke={gold} strokeWidth="2" />
      <rect x="25" y="20" width="50" height="60" fill="none" stroke="#8a99a6" strokeWidth="1" strokeDasharray="3,3" />
    </svg>
  );
}

export function IconElectricGate({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="20" width="70" height="60" fill="none" stroke={gold} strokeWidth="3" rx="4" />
      <rect x="25" y="30" width="15" height="15" fill="none" stroke={gold} strokeWidth="2" />
      <rect x="45" y="30" width="15" height="15" fill="none" stroke={gold} strokeWidth="2" />
      <rect x="65" y="30" width="15" height="15" fill="none" stroke={gold} strokeWidth="2" />
      <circle cx="50" cy="70" r="6" fill={gold} />
    </svg>
  );
}

export function IconRailing({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="70" x2="90" y2="70" stroke={gold} strokeWidth="3" />
      <line x1="15" y1="70" x2="15" y2="30" stroke={gold} strokeWidth="2" />
      <line x1="35" y1="70" x2="35" y2="20" stroke={gold} strokeWidth="2" />
      <line x1="55" y1="70" x2="55" y2="25" stroke={gold} strokeWidth="2" />
      <line x1="75" y1="70" x2="75" y2="30" stroke={gold} strokeWidth="2" />
      <line x1="15" y1="50" x2="75" y2="50" stroke={gold} strokeWidth="1" strokeDasharray="2,2" />
    </svg>
  );
}

export function IconFence({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="70" x2="90" y2="70" stroke={gold} strokeWidth="3" />
      <rect x="15" y="35" width="12" height="35" fill={gold} opacity="0.7" />
      <rect x="35" y="30" width="12" height="40" fill={gold} opacity="0.7" />
      <rect x="55" y="35" width="12" height="35" fill={gold} opacity="0.7" />
      <rect x="75" y="32" width="12" height="38" fill={gold} opacity="0.7" />
    </svg>
  );
}

export function IconInstallation({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 80 L 40 30 L 50 50 L 65 25 L 85 70" stroke={gold} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="30" r="4" fill={gold} />
      <circle cx="50" cy="50" r="4" fill={gold} />
      <circle cx="65" cy="25" r="4" fill={gold} />
    </svg>
  );
}

export function IconMaintenance({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="none" stroke={gold} strokeWidth="3" />
      <path d="M 50 30 L 65 50 L 50 70 L 35 50 Z" fill={gold} opacity="0.7" />
      <path d="M 50 35 L 60 50 L 50 65 L 40 50 Z" fill="none" stroke="#0e1318" strokeWidth="1.5" />
    </svg>
  );
}

export function IconQuality({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 15 L 60 40 L 87 40 L 67 55 L 77 80 L 50 65 L 23 80 L 33 55 L 13 40 L 40 40 Z" fill={gold} opacity="0.85" stroke={gold} strokeWidth="1.5" />
    </svg>
  );
}

export function IconConsult({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 25a6 6 0 0 1 6-6h48a6 6 0 0 1 6 6v34a6 6 0 0 1-6 6H46l-14 13V65h-6a6 6 0 0 1-6-6Z" fill="none" stroke={gold} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="38" cy="42" r="4" fill={gold} />
      <circle cx="54" cy="42" r="4" fill={gold} />
      <circle cx="70" cy="42" r="4" fill={gold} />
    </svg>
  );
}

export function IconDesign({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="20" width="70" height="50" fill="none" stroke={gold} strokeWidth="2.5" rx="3" />
      <circle cx="50" cy="45" r="15" fill="none" stroke={gold} strokeWidth="2" />
      <line x1="50" y1="30" x2="50" y2="60" stroke={gold} strokeWidth="1.5" />
      <line x1="35" y1="45" x2="65" y2="45" stroke={gold} strokeWidth="1.5" />
    </svg>
  );
}

export function IconDurability({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="20" width="50" height="60" fill="none" stroke={gold} strokeWidth="3" rx="4" />
      <path d="M 40 35 L 50 50 L 60 35" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 40 55 L 50 70 L 60 55" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTechnology({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="15" width="60" height="60" fill="none" stroke={gold} strokeWidth="2.5" rx="3" />
      <circle cx="35" cy="32" r="5" fill={gold} opacity="0.8" />
      <circle cx="50" cy="32" r="5" fill={gold} opacity="0.8" />
      <circle cx="65" cy="32" r="5" fill={gold} opacity="0.8" />
      <line x1="30" y1="50" x2="70" y2="50" stroke={gold} strokeWidth="2" />
    </svg>
  );
}

export function IconStar({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill={gold}>
      <path d="M10 1.5l2.47 5.4 5.93.63-4.42 4.03 1.24 5.84L10 14.5l-5.22 2.9 1.24-5.84L1.6 7.53l5.93-.63L10 1.5Z" />
    </svg>
  );
}

export function IconCheck({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={gold} strokeWidth="2">
      <circle cx="10" cy="10" r="8.5" />
      <path d="M6.5 10.2l2.4 2.4 4.6-5.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPhone({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={gold} strokeWidth="1.6">
      <path d="M4 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1 1 0 0 1-1 1C9.5 17 3 10.5 3 4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMail({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={gold} strokeWidth="1.6">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path d="M3 5.5l7 5.5 7-5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPin({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={gold} strokeWidth="1.6">
      <path d="M10 18s6-5.6 6-10.2A6 6 0 0 0 4 7.8C4 12.4 10 18 10 18Z" strokeLinejoin="round" />
      <circle cx="10" cy="7.8" r="2.2" />
    </svg>
  );
}

export function IconClock({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke={gold} strokeWidth="1.6">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.5V10l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Admin panel icons (currentColor, size via className) ---------- */

export function IconDashboard({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="11" y="2.5" width="6.5" height="4" rx="1.2" />
      <rect x="11" y="8.5" width="6.5" height="9" rx="1.2" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.2" />
    </svg>
  );
}

export function IconInbox({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2.5 11.5l2.3-6.4A1.5 1.5 0 0 1 6.2 4h7.6a1.5 1.5 0 0 1 1.4 1.1l2.3 6.4" strokeLinejoin="round" />
      <path d="M2.5 11.5h4.2l1 2h4.6l1-2h4.2v3a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 2.5 14.5v-3Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconGridIcon({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  );
}

export function IconWrench({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12.5 3.5a3.5 3.5 0 0 0-4.7 4l-6 6 2.7 2.7 6-6a3.5 3.5 0 0 0 4-4.7l-2.2 2.2-1.9-.5-.5-1.9 2.6-2.6Z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function IconTag({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3h6l8 8-6 6-8-8V3Z" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMessageStar({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 4.5h14v9H8.5L5 16.5v-3H3v-9Z" strokeLinejoin="round" />
      <path d="M10 7l.8 1.7 1.9.2-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.2L10 7Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSliders({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <line x1="4" y1="4" x2="4" y2="16" strokeLinecap="round" />
      <line x1="10" y1="4" x2="10" y2="16" strokeLinecap="round" />
      <line x1="16" y1="4" x2="16" y2="16" strokeLinecap="round" />
      <circle cx="4" cy="8" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="13" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="6" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconLogout({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 6.5l3.5 3.5-3.5 3.5M16 10H8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlus({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}

export function IconEdit({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12.5 3.5l4 4-9 9H3.5v-4l9-9Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTrash({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6M5.5 6l.6 9.5A1.5 1.5 0 0 0 7.6 17h4.8a1.5 1.5 0 0 0 1.5-1.5L14.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconX({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  );
}

export function IconMenu({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconUpload({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 13V4M6.5 7.5 10 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 13.5v2A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M16.5 16.5 13 13" strokeLinecap="round" />
    </svg>
  );
}

export function IconChevronDown({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronUp({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12.5 10 7.5 15 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconEye({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

export function IconPhoto({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.8" />
      <path d="M21.5 16l-5.5-5.5-4 4-2.5-2.5-7 7" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSettingsGear({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.8v2M10 15.2v2M17.2 10h-2M4.8 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9" strokeLinecap="round" />
    </svg>
  );
}

export function IconDownload({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 3v9M6.5 8.5 10 12l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 13.5v2A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPhoneCall({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4.5 4h3l1.2 3.5-1.8 1.4a10.5 10.5 0 0 0 5.2 5.2l1.4-1.8L17 13.5v3c0 .8-.7 1.4-1.5 1.35C8.9 17.4 4.1 12.6 3.65 5.9 3.6 5.1 3.7 4 4.5 4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPalette({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 2.5a7.5 7.5 0 1 0 0 15c.9 0 1.5-.7 1.5-1.5 0-.4-.15-.75-.4-1a1.4 1.4 0 0 1-.4-1c0-.8.65-1.4 1.4-1.4H13.8A3.7 3.7 0 0 0 17.5 9C17.5 5.4 14.1 2.5 10 2.5Z" strokeLinejoin="round" />
      <circle cx="6.3" cy="8.3" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="9.3" cy="5.8" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="13" cy="7" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconUsers({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="6.5" r="2.6" />
      <path d="M2.2 16.5c.6-3 2.4-4.5 4.8-4.5s4.2 1.5 4.8 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14.5" cy="7.2" r="2.1" />
      <path d="M12.8 11.6c1.9-.35 3.55.7 4.9 4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLayers({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 2.5 17.5 7 10 11.5 2.5 7 10 2.5Z" strokeLinejoin="round" />
      <path d="M2.5 11 10 15.5 17.5 11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 14.8 10 19.3l7.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconNewspaper({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3.5h11a1.5 1.5 0 0 1 1.5 1.5v10.5H4.5A1.5 1.5 0 0 1 3 14V3.5Z" strokeLinejoin="round" />
      <path d="M15.5 15.5A1.5 1.5 0 0 0 17 14V6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 6.5h6M5.5 9h6M5.5 11.5h3.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconInboxEmpty({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 13l2.7-7.7A1.8 1.8 0 0 1 7.4 4h9.2a1.8 1.8 0 0 1 1.7 1.3L21 13" strokeLinejoin="round" />
      <path d="M3 13h5l1.2 2.4h5.6L16 13h5v4.5A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5V13Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconWhatsapp({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2Zm5.8 14.11c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.07.18-.28.36-.23.6-.14.24.09 1.55.73 1.81.86.26.14.44.2.5.31.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

export function IconFacebook({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7C16.6 3.65 15.5 3.5 14.2 3.5c-2.7 0-4.5 1.65-4.5 4.65V10H7v3.1h2.7V21h3.8Z" />
    </svg>
  );
}

export function IconInstagram({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
