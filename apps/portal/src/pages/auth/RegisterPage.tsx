import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Lock, Mail, MapPin, Phone, User } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import PostalCodeHelpLink from "@/components/auth/PostalCodeHelpLink";
import { auth } from "@/lib/firebase";
import { linkPortalCustomer } from "@/lib/portal-customer";
import { loginPathWithReturn, resolveReturnTo } from "@/lib/auth-redirect";
import {
  portalRegisterAccountSchema,
  type PortalRegisterAccountForm,
} from "@/lib/registration-schema";
import { useAuthStore } from "@/stores/auth.store";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const emailFromQuery = searchParams.get("email") ?? "";
  const returnTo = resolveReturnTo(searchParams);

  useEffect(() => {
    if (user) navigate(returnTo, { replace: true });
  }, [user, navigate, returnTo]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PortalRegisterAccountForm>({
    resolver: zodResolver(portalRegisterAccountSchema),
    defaultValues: {
      email: emailFromQuery,
      confirmEmail: emailFromQuery,
    },
  });

  const onSubmit = async (data: PortalRegisterAccountForm) => {
    setServerError(null);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email.trim().toLowerCase(),
        data.password,
      );
      await updateProfile(credential.user, { displayName: data.name });
      await linkPortalCustomer({
        name: data.name,
        socialAlias: data.socialAlias,
        phone: data.phone,
        confirmPhone: data.confirmPhone,
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
            id="confirmEmail"
            label="Confirmar email"
            icon={Mail}
            type="email"
            highlighted
            readOnly={Boolean(emailFromQuery)}
            error={errors.confirmEmail?.message}
            registration={register("confirmEmail")}
          />

          <AuthInput
            id="name"
            label="Nombre completo"
            icon={User}
            error={errors.name?.message}
            registration={register("name")}
          />

          <AuthInput
            id="socialAlias"
            label="Nombre en redes sociales"
            icon={User}
            placeholder="Como te identifican en Facebook o WhatsApp"
            error={errors.socialAlias?.message}
            registration={register("socialAlias")}
          />

          <AuthInput
            id="phone"
            label="Teléfono"
            icon={Phone}
            type="tel"
            placeholder="10 dígitos, con o sin +52"
            error={errors.phone?.message}
            registration={register("phone")}
          />

          <AuthInput
            id="confirmPhone"
            label="Confirmar teléfono"
            icon={Phone}
            type="tel"
            placeholder="Repite tu teléfono"
            error={errors.confirmPhone?.message}
            registration={register("confirmPhone")}
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
          <Link to={loginPathWithReturn(returnTo)} className="text-sm font-medium text-sky-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
