import { isValidMexicanPhone, phonesMatch } from "@emperatriz/types";
import { z } from "zod";

const registrationFieldsObject = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo"),
  socialAlias: z.string().trim().min(2, "Ingresa tu nombre en redes sociales"),
  phone: z
    .string()
    .trim()
    .min(10, "Ingresa un teléfono válido")
    .regex(/^[\d+\s()-]+$/, "Teléfono inválido"),
  confirmPhone: z
    .string()
    .trim()
    .min(10, "Confirma tu teléfono")
    .regex(/^[\d+\s()-]+$/, "Teléfono inválido"),
  postalCode: z
    .string()
    .trim()
    .min(5, "Ingresa tu código postal")
    .max(6, "Máximo 6 dígitos")
    .regex(/^\d+$/, "Solo números"),
});

export const portalRegistrationFieldsSchema = registrationFieldsObject
  .refine((data) => phonesMatch(data.phone, data.confirmPhone), {
    message: "Los teléfonos no coinciden",
    path: ["confirmPhone"],
  })
  .refine((data) => isValidMexicanPhone(data.phone), {
    message: "Ingresa un celular mexicano de 10 dígitos",
    path: ["phone"],
  });

const registerAccountObject = registrationFieldsObject.extend({
  email: z.string().trim().email("Correo inválido"),
  confirmEmail: z.string().trim().email("Confirma tu correo"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const portalRegisterAccountSchema = registerAccountObject
  .refine((data) => phonesMatch(data.phone, data.confirmPhone), {
    message: "Los teléfonos no coinciden",
    path: ["confirmPhone"],
  })
  .refine((data) => isValidMexicanPhone(data.phone), {
    message: "Ingresa un celular mexicano de 10 dígitos",
    path: ["phone"],
  })
  .refine((data) => data.email.toLowerCase() === data.confirmEmail.toLowerCase(), {
    message: "Los correos no coinciden",
    path: ["confirmEmail"],
  });

export type PortalRegistrationFields = z.infer<typeof portalRegistrationFieldsSchema>;
export type PortalRegisterAccountForm = z.infer<typeof portalRegisterAccountSchema>;
