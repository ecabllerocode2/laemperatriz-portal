import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import {
  lookupPostalCode,
  municipalitiesForState,
  MX_STATES,
} from "@/data/mx-locations";
import type { ShippingAddressDetail } from "@/lib/portal-cycle";
import { saveShippingAddress } from "@/lib/portal-cycle";
import { useUiStore } from "@/stores/ui.store";

interface ShippingAddressModalProps {
  open: boolean;
  defaultPostalCode?: string;
  initial?: Partial<ShippingAddressDetail> | null;
  onClose?: () => void;
  onSaved?: () => void;
}

export default function ShippingAddressModal({
  open,
  defaultPostalCode = "",
  initial,
  onClose,
  onSaved,
}: ShippingAddressModalProps) {
  const { setToast, bumpProfileReload } = useUiStore();
  const [postalCode, setPostalCode] = useState(defaultPostalCode);
  const [state, setState] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [street, setStreet] = useState("");
  const [exteriorNumber, setExteriorNumber] = useState("");
  const [interiorNumber, setInteriorNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const municipalities = useMemo(() => municipalitiesForState(state), [state]);

  useEffect(() => {
    if (!open) return;
    setPostalCode(initial?.postalCode ?? defaultPostalCode);
    setState(initial?.state ?? "");
    setMunicipality(initial?.municipality ?? "");
    setStreet(initial?.street ?? "");
    setExteriorNumber(initial?.exteriorNumber ?? "");
    setInteriorNumber(initial?.interiorNumber ?? "");
    setNeighborhood(initial?.neighborhood ?? "");
    setError(null);
  }, [open, initial, defaultPostalCode]);

  if (!open) return null;

  const handleVerifyCp = () => {
    const hint = lookupPostalCode(postalCode);
    if (!hint) {
      setError("No encontramos ese C.P. Intenta corregirlo o elige estado y municipio manualmente.");
      return;
    }
    setState(hint.state);
    setMunicipality(hint.municipality);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!postalCode || !state || !municipality || !street || !exteriorNumber || !neighborhood) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: ShippingAddressDetail = {
        postalCode,
        state,
        municipality,
        street,
        exteriorNumber,
        neighborhood,
      };
      if (interiorNumber) payload.interiorNumber = interiorNumber;
      await saveShippingAddress(payload);
      bumpProfileReload();
      setToast("Dirección guardada correctamente.");
      onSaved?.();
    } catch {
      setError("No pudimos guardar la dirección. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="modal-sheet animate-sheet-up relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 shadow-2xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-8">
        <button
          type="button"
          onClick={onClose ?? onSaved}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-8 font-display text-xl font-bold text-brand-night sm:text-2xl">
          Dirección de envío
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Ya validamos tu depósito. Indica el domicilio completo donde entregaremos tus compras de
          este ciclo de envío.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Código postal
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="min-h-0 min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-brand-red"
              />
              <button
                type="button"
                onClick={handleVerifyCp}
                className="shrink-0 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold text-brand-night"
              >
                Verificar
              </button>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-brand-night"
                aria-label="Ver mapa"
              >
                <MapPin className="h-3.5 w-3.5" />
                Ver mapa
              </button>
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">
              Mismo que al registrarte; corrígelo solo si cambió.
            </p>
          </div>

          <SearchableSelect
            label="Estado"
            value={state}
            options={[...MX_STATES]}
            placeholder="-- Estado --"
            onChange={(value) => {
              setState(value);
              setMunicipality("");
            }}
          />

          <SearchableSelect
            label="Municipio"
            value={municipality}
            options={municipalities}
            placeholder="-- Municipio --"
            onChange={setMunicipality}
            disabled={!state}
          />

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Calle
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-brand-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                No. ext.
              </label>
              <input
                type="text"
                value={exteriorNumber}
                onChange={(e) => setExteriorNumber(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-brand-red"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                No. int.
              </label>
              <input
                type="text"
                value={interiorNumber}
                onChange={(e) => setInteriorNumber(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-brand-red"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Colonia
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-brand-red"
            />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-brand-red">{error}</p> : null}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-night py-3.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar dirección"
          )}
        </button>
      </div>
    </div>
  );
}
