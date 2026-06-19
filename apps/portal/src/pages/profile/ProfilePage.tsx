import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import SearchableSelect from "@/components/ui/SearchableSelect";
import {
  lookupPostalCode,
  municipalitiesForState,
  MX_STATES,
} from "@/data/mx-locations";
import { updatePortalProfile } from "@/lib/portal-profile";
import { useUiStore } from "@/stores/ui.store";
import type { DepositStatus, PortalProfileDoc, ShippingAddressDetail } from "@/types/portal-profile";

interface PortalContext {
  profile: PortalProfileDoc | null;
  depositStatus: DepositStatus;
}

const statusLabels: Record<DepositStatus, string> = {
  none: "Sin depósito",
  pending: "Comprobante en validación",
  approved: "Carrito activo",
};

const inputClass =
  "w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-brand-night outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/15";

export default function ProfilePage() {
  const { profile, depositStatus } = useOutletContext<PortalContext>();
  const { bumpProfileReload, setToast } = useUiStore();

  const [name, setName] = useState("");
  const [socialAlias, setSocialAlias] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [street, setStreet] = useState("");
  const [exteriorNumber, setExteriorNumber] = useState("");
  const [interiorNumber, setInteriorNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [includeAddress, setIncludeAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const municipalities = useMemo(() => municipalitiesForState(state), [state]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setSocialAlias(profile.socialAlias ?? "");
    setPhone(profile.phone ?? "");
    setPostalCode(profile.postalCode ?? "");
    const detail = profile.shippingAddressDetail;
    setIncludeAddress(Boolean(detail || profile.shippingAddress));
    if (detail) {
      setState(detail.state);
      setMunicipality(detail.municipality);
      setStreet(detail.street);
      setExteriorNumber(detail.exteriorNumber);
      setInteriorNumber(detail.interiorNumber ?? "");
      setNeighborhood(detail.neighborhood);
      if (detail.postalCode) setPostalCode(detail.postalCode);
    }
  }, [profile]);

  const handleVerifyCp = () => {
    const hint = lookupPostalCode(postalCode);
    if (!hint) {
      setError("No encontramos ese C.P. Elige estado y municipio manualmente.");
      return;
    }
    setState(hint.state);
    setMunicipality(hint.municipality);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !socialAlias.trim() || !phone.trim() || !postalCode.trim()) {
      setError("Completa los campos obligatorios.");
      return;
    }

    let shippingAddressDetail: ShippingAddressDetail | null = null;
    if (includeAddress) {
      if (!state || !municipality || !street || !exteriorNumber || !neighborhood) {
        setError("Completa la dirección de envío.");
        return;
      }
      shippingAddressDetail = {
        postalCode,
        state,
        municipality,
        street,
        exteriorNumber,
        neighborhood,
        ...(interiorNumber.trim() ? { interiorNumber: interiorNumber.trim() } : {}),
      };
    }

    setSubmitting(true);
    setError(null);
    try {
      await updatePortalProfile({
        name: name.trim(),
        socialAlias: socialAlias.trim(),
        phone: phone.trim(),
        postalCode: postalCode.trim(),
        shippingAddressDetail,
      });
      bumpProfileReload();
      setToast("Perfil actualizado.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-5 shadow-sm">
      <h2 className="text-lg font-bold text-brand-night">Perfil</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Actualiza tus datos y dirección cuando lo necesites.
      </p>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 space-y-3">
        <Field label="Nombre">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>

        <Field label="Nombre en redes">
          <input
            value={socialAlias}
            onChange={(e) => setSocialAlias(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Correo">
          <input
            value={profile?.email ?? ""}
            readOnly
            className={`${inputClass} bg-neutral-50 text-neutral-500`}
          />
        </Field>

        <Field label="Teléfono">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            inputMode="tel"
          />
        </Field>

        <Field label="Código postal">
          <div className="flex gap-2">
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className={inputClass}
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={handleVerifyCp}
              className="shrink-0 rounded-xl border border-neutral-200 px-3 text-xs font-semibold text-brand-night hover:bg-neutral-50"
            >
              Verificar
            </button>
          </div>
        </Field>

        <div>
          <dt className="text-xs font-semibold uppercase text-neutral-500">Estado del carrito</dt>
          <dd className="mt-1 text-sm font-medium text-brand-night">{statusLabels[depositStatus]}</dd>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-night">
          <input
            type="checkbox"
            checked={includeAddress}
            onChange={(event) => setIncludeAddress(event.target.checked)}
            className="size-4 rounded border-neutral-300 text-brand-red focus:ring-brand-red/30"
          />
          Dirección de envío
        </label>

        {includeAddress ? (
          <div className="space-y-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
            <SearchableSelect
              label="Estado"
              value={state}
              options={[...MX_STATES]}
              onChange={setState}
              placeholder="Selecciona estado"
            />
            <SearchableSelect
              label="Municipio / alcaldía"
              value={municipality}
              options={[...municipalities]}
              onChange={setMunicipality}
              placeholder="Selecciona municipio"
              disabled={!state}
            />
            <Field label="Calle">
              <input value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="No. exterior">
                <input
                  value={exteriorNumber}
                  onChange={(e) => setExteriorNumber(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="No. interior (opc.)">
                <input
                  value={interiorNumber}
                  onChange={(e) => setInteriorNumber(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Colonia">
              <input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-red py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Guardar cambios
        </button>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
