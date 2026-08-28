import {
  Layers, FileText, GraduationCap, Landmark, Printer, Camera,
  CreditCard, Briefcase, BookOpen, Stamp, Ticket, ScanLine,
  type LucideIcon,
} from 'lucide-react';

// Fixed, safe whitelist — never dynamically import a user-controlled string.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  FileText, GraduationCap, Landmark, Printer, Camera,
  CreditCard, Briefcase, BookOpen, Stamp, Ticket, ScanLine,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(iconKey?: string | null): LucideIcon {
  if (iconKey && CATEGORY_ICONS[iconKey]) return CATEGORY_ICONS[iconKey];
  return Layers;
}