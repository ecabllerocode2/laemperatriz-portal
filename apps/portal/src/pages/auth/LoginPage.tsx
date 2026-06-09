import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth.store";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const email = watch("email");

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setServerError("Correo o contraseña incorrectos.");
      } else {
        setServerError("Ocurrió un error. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-silk px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-8 text-center">
          <img
            src="/favicon.jpeg"
            alt="La Emperatriz"
            className="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <p className="text-sm text-neutral-500">Portal de clientas</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-brand-night">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/15"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-brand-red">{errors.password.message}</p>
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
            {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-600">
          ¿No tienes cuenta?{" "}
          <Link
            to={email ? `/register?email=${encodeURIComponent(email)}` : "/register"}
            className="font-medium text-sky-600 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
