import {
  IconElectricGate,
  IconRailing,
  IconFence,
  IconDesign,
  IconInstallation,
  IconMaintenance,
} from "@/components/Icons";

// Maps the `services.icon` text column (a short slug set from the admin
// panel) to the actual icon component rendered on the public site.
// Falls back to the electric-gate icon for an unrecognized/empty slug so a
// new service never renders with no icon at all.
export const SERVICE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "electric-gate": IconElectricGate,
  railing: IconRailing,
  fence: IconFence,
  design: IconDesign,
  installation: IconInstallation,
  maintenance: IconMaintenance,
};

export function getServiceIcon(slug: string | null | undefined) {
  return SERVICE_ICON_MAP[slug ?? ""] ?? IconElectricGate;
}
