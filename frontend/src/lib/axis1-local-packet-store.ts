import type { Axis1PacketDocumentSectionVisibility } from "@/components/axis1/packet-document";
import type { Axis1BuilderFormValues } from "@/lib/axis1-packet-builder";
import type {
  Axis1PhotoSlotResolutionState,
  Axis1UploadedFieldPhotoState,
} from "@/lib/axis1-field-photos";

const localPacketStoragePrefix = "hood.axis1.local-packet.";
const localPacketReadCache = new Map<
  string,
  {
    raw: string;
    record: Axis1LocalPacketRecord | null;
  }
>();

export type Axis1LocalPacketRecord = {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  values: Axis1BuilderFormValues;
  uploadedFieldPhotos: Axis1UploadedFieldPhotoState;
  photoSlotResolutions: Axis1PhotoSlotResolutionState;
  presentationMode: "standard" | "short";
  visibleSections: Axis1PacketDocumentSectionVisibility;
};

export type Axis1LocalPacketSaveInput = Omit<
  Axis1LocalPacketRecord,
  "schemaVersion" | "id" | "createdAt"
>;

export type Axis1LocalPacketSaveResult =
  | {
      ok: true;
      record: Axis1LocalPacketRecord;
      href: string;
    }
  | {
      ok: false;
      error: string;
    };

function createLocalPacketId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function storageKey(id: string) {
  return `${localPacketStoragePrefix}${id}`;
}

export function getAxis1LocalPacketHref(id: string) {
  return `/reports/local-axis-1/${encodeURIComponent(id)}`;
}

function localStorageAvailable() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function saveAxis1LocalPacket(
  input: Axis1LocalPacketSaveInput,
): Axis1LocalPacketSaveResult {
  if (!localStorageAvailable()) {
    return {
      ok: false,
      error: "Local browser storage is not available in this session.",
    };
  }

  const record: Axis1LocalPacketRecord = {
    schemaVersion: 1,
    id: createLocalPacketId(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  try {
    const raw = JSON.stringify(record);
    window.localStorage.setItem(storageKey(record.id), raw);
    localPacketReadCache.set(record.id, { raw, record });
  } catch {
    return {
      ok: false,
      error:
        "The packet was too large for local browser storage. Try fewer photos or smaller image files.",
    };
  }

  return {
    ok: true,
    record,
    href: getAxis1LocalPacketHref(record.id),
  };
}

export function readAxis1LocalPacket(id: string) {
  if (!localStorageAvailable()) {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(id));

  if (!raw) {
    localPacketReadCache.delete(id);
    return null;
  }

  const cached = localPacketReadCache.get(id);

  if (cached?.raw === raw) {
    return cached.record;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Axis1LocalPacketRecord>;

    if (
      parsed.schemaVersion !== 1 ||
      typeof parsed.id !== "string" ||
      typeof parsed.createdAt !== "string" ||
      !parsed.values ||
      !parsed.uploadedFieldPhotos ||
      !parsed.photoSlotResolutions ||
      !parsed.presentationMode ||
      !parsed.visibleSections
    ) {
      localPacketReadCache.set(id, { raw, record: null });
      return null;
    }

    const record = parsed as Axis1LocalPacketRecord;
    localPacketReadCache.set(id, { raw, record });
    return record;
  } catch {
    localPacketReadCache.set(id, { raw, record: null });
    return null;
  }
}
