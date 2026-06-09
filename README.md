# La Emperatriz — Portal de clientas

Aplicación web para clientas de La Emperatriz (compras, pagos, envíos).

- **Intranet (staff):** [laemperatriz.intranet](https://github.com/ecabllerocode2/laemperatriz.intranet)
- **API compartida:** desplegada con la intranet (`/api/*`)

## Desarrollo local

```bash
pnpm install
pnpm dev
```

El portal corre en http://localhost:5174

## Variables de entorno

Copia `apps/portal/.env.example` a `apps/portal/.env.local` y completa las credenciales de Firebase.
