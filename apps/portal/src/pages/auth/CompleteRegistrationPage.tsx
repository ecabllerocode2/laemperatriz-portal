import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, User } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import PostalCodeHelpLink from "@/components/auth/PostalCodeHelpLink";
import { linkPortalCustomer } from "@/lib/portal-customer";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  name: z.string().min(2, "Ingresa tu nombre completo"),
  phone: z
    .string()
    .min(10, "Ingresa un teléfono válido")
    .regex(/^[\d+\s()-]+$/, "Teléfono inválido"),
  postalCode: z
    .string()
    .min(5, "Ingresa tu código postal")
    .max(6, "Máximo 6 dígitos")
    .regex(/^\d+$/, "Solo números"),
});

type Form = z.infer<typeof schema>;

export default function CompleteRegistrationPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  const onSubmit = async (data: Form) => {
    setServerError(null);
    try {
      await linkPortalCustomer(data);
      navigate("/", { replace: true });
    } catch {
      setServerError("No pudimos guardar tus datos. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-silk px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <img
            src="/favicon.jpeg"
            alt="La Emperatriz"
            className="mx-auto h-14 w-auto object-contain"
          />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-brand-night">
          Completa tu registro
        </h1>
        <p className="mb-5 text-center text-sm text-neutral-600">
          Tu cuenta existe pero faltan algunos datos. Complétalos para continuar.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <AuthInput
            id="name"
            label="Nombre completo"
            icon={User}
            error={errors.name?.message}
            registration={register("name")}
          />

          <AuthInput
            id="phone"
            label="Teléfono"
            icon={Phone}
            type="tel"
            placeholder="10 dígitos"
            error={errors.phone?.message}
            registration={register("phone")}
          />

          <AuthInput
            id="postalCode"
            label="Código postal"
            icon={MapPin}
            placeholder="5 a 6 dígitos"
            error={errors.postalCode?.message}
            registration={register("postalCode")}
          />
          <div className="-mt-2 flex justify-end">
            <PostalCodeHelpLink />
          </div>

          {serverError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-brand-red">
              {serverError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-red py-3.5 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Guardando…" : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
