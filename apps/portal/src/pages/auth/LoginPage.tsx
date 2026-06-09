import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchSignInMethodsForEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth.store";

const emailSchema = z.object({
  email: z.string().email("Correo inválido"),
});

const passwordSchema = z.object({
  password: z.string().min(1, "La contraseña es requerida"),
});

type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onEmailSubmit = async (data: EmailForm) => {
    setServerError(null);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, data.email);
      if (methods.length === 0) {
        navigate(`/register?email=${encodeURIComponent(data.email)}`);
        return;
      }
      setEmail(data.email);
      setStep("password");
    } catch {
      setServerError("No pudimos verificar el correo. Intenta de nuevo.");
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setServerError(null);
    try {
      await signInWithEmailAndPassword(auth, email, data.password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setServerError("Contraseña incorrecta.");
      } else {
        setServerError("Ocurrió un error. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-silk px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <div className="mb-8 text-center">
          <img
            src="/favicon.jpeg"
            alt="La Emperatriz"
            className="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <p className="text-sm text-neutral-500">Portal de clientas</p>
        </div>

        {step === "email" ? (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} noValidate className="space-y-5">
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
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-brand-red">
                  {emailForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-brand-red">
                {serverError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={emailForm.formState.isSubmitting}
              className="w-full rounded-xl bg-brand-red py-3 font-semibold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {emailForm.formState.isSubmitting ? "Verificando…" : "Continuar"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            noValidate
            className="space-y-5"
          >
            <p className="text-sm text-neutral-600">
              Ingresa la contraseña de{" "}
              <span className="font-medium text-brand-night">{email}</span>
            </p>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-brand-night">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/15"
                placeholder="••••••••"
                {...passwordForm.register("password")}
              />
              {passwordForm.formState.errors.password ? (
                <p className="mt-1 text-xs text-brand-red">
                  {passwordForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-brand-red">
                {serverError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="w-full rounded-xl bg-brand-red py-3 font-semibold text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordForm.formState.isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setServerError(null);
              }}
              className="w-full text-sm text-brand-red"
            >
              Usar otro correo
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
