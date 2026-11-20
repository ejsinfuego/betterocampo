import {
  Book,
  Building2,
  ChartBar,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Landmark,
  MessagesSquare,
  Newspaper,
  Shield,
  Trash2,
  TreePine,
  Users,
  Wheat,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Book,
  Building2,
  ChartBar,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Landmark,
  MessagesSquare,
  Newspaper,
  Shield,
  Trash2,
  TreePine,
  Users,
  Wheat,
  Wrench,
};

/** Icons named in the service and government category YAML. */
export function categoryIcon(name: string | undefined): LucideIcon | undefined {
  if (!name) return undefined;
  return ICONS[name];
}
