import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requestPasswordResetEmail } from "@/lib/password-reset";
import AuthBackToStore from "@/components/auth/AuthBackToStore";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  email: z.string().trim().email("Correo inválido"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailFromQuery },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await requestPasswordResetEmail(data.email);
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-email") {
        setServerError("Correo inválido.");
      } else if (code === "auth/missing-email") {
        setServerError("Ingresa tu correo.");
      } else {
        setServerError("No pudimos enviar el correo. Intenta de nuevo en unos minutos.");
      }
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-neutral-silk px-4 py-8 sm:px-6">
      <AuthBackToStore />
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <img
            src="/favicon.jpeg"
            alt="La Emperatriz"
            className="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <h1 className="text-xl font-bold text-brand-night">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-neutral-500">Portal de clientas</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Si existe una cuenta con ese correo, enviamos un enlace para restablecer tu contraseña.
              Revisa también la carpeta de spam.
            </div>
            <p className="text-sm text-neutral-600">
              El remitente suele ser{" "}
              <strong className="text-brand-night">noreply@la-emperatriz-275a1.firebaseapp.com</strong>.
            </p>
            <Link
              to="/login"
              className="block w-full rounded-xl bg-brand-red py-3 text-center font-semibold text-white transition hover:bg-brand-red-dark"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <p className="text-sm text-neutral-600">
              Te enviaremos un enlace a tu correo para crear una contraseña nueva.
            </p>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-night">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/15"
                placeholder="tu@correo.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-brand-red">{errors.email.message}</p>
              ) : null}
            </div>

            {serverError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-brand-red">
                {serverError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-red py-3 font-semibold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando…" : "Enviar enlace"}
            </button>

            <p className="text-center text-sm text-neutral-600">
              <Link to="/login" className="font-medium text-sky-600 hover:underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
