import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Lock, Mail, MapPin, Phone, User } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import PostalCodeHelpLink from "@/components/auth/PostalCodeHelpLink";
import { auth } from "@/lib/firebase";
import { linkPortalCustomer } from "@/lib/portal-customer";
import { useAuthStore } from "@/stores/auth.store";

const registerSchema = z.object({
  email: z.string().email("Correo inválido"),
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
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const emailFromQuery = searchParams.get("email") ?? "";

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: emailFromQuery,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(credential.user, { displayName: data.name });
      await linkPortalCustomer({
        name: data.name,
        phone: data.phone,
        postalCode: data.postalCode,
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setServerError("Ya existe una cuenta con ese correo. Inicia sesión para completar tu registro.");
      } else if (code === "auth/weak-password") {
        setServerError("La contraseña es muy débil.");
      } else {
        setServerError("No pudimos completar el registro. Intenta de nuevo.");
      }
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

        <h1 className="mb-4 text-center text-2xl font-bold text-brand-night">
          Completa tu registro
        </h1>

        {emailFromQuery ? (
          <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-900">
            No encontramos una cuenta con ese correo. Puedes registrarte a continuación.
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <AuthInput
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            highlighted
            readOnly={Boolean(emailFromQuery)}
            error={errors.email?.message}
            registration={register("email")}
          />

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

          <AuthInput
            id="password"
            label="Contraseña"
            icon={Lock}
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            registration={register("password")}
          />

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
            {isSubmitting ? "Registrando…" : "Registrarme"}
          </button>
        </form>

        <p className="mt-5 text-center">
          <Link to="/login" className="text-sm font-medium text-sky-600 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
