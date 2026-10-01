# ARCHITECTURE.md — mcp-sendcloud

Servidor MCP de la API de Sendcloud (parcels, devoluciones, etiquetas, envíos, integraciones, marcas). **Deprecado**: el audit del AgentGateway lo marca «DEPRECATED — DO NOT WRAP»; el envío y las etiquetas son de Skirmshop Labels.

## Clientes y versiones
- Un servidor MCP por stdio (`mcp-sendcloud` 1.0.0, Node >=20, TypeScript). Sin web ni iOS.
- **Ruta AgentGateway: ninguna** (no hay ruta `/sendcloud`). Las etiquetas y tarifas se piden por la ruta `/skirmshop-plugins-admin` (herramientas `labels_*`).
- Qué NO hace: no calcula tarifas de Correos/Skirmshop, no crea recogidas del flujo de la tienda y no habla con Picqer.

## Dependencias en ambos sentidos
- **Depende de:** la API de Sendcloud (`SENDCLOUD_PUBLIC_KEY`, `SENDCLOUD_SECRET_KEY`, obligatorias; `src/config.ts` falla sin ellas), `@modelcontextprotocol/sdk ^1.27.1`, `zod ^4.3.6`.
- **Quién depende de él:** nadie. Existe una copia idéntica embebida en `pocharlies/pocharlies-openclaw/mcp-servers/sendcloud`.
- Sin `CONTRACTS.yaml`.

## Stack
- TypeScript ^5.9, `tsc` a `dist/`, SDK MCP, `zod`.

## Componentes compartidos
- `src/sendcloud/client.ts` (cliente HTTP) y `src/sendcloud/types.ts`; herramientas en `src/tools/{brands,returns,user,shipping,integrations,parcels,labels}.ts`.

## Cómo se construye
- Un fichero por grupo de herramientas registrado desde `src/server.ts`; configuración validada al arrancar.

## Tests
- No hay tests.

## CI/CD y despliegue
- `duplicados.yml` y `pr-review.yml`. Sin imagen ni ArgoCD. Tronco: **`master`**.

## Decisiones y trampas
- No reinstalar ni federar (audit del gateway). Propuesta SC-1430: **archivar** (no se archiva en esa épica) y retirar la copia embebida de `pocharlies-openclaw` al archivar ese repo.
- Crear etiquetas por aquí duplicaría el flujo de Skirmshop Labels y rompería su seguimiento.

## Reutilización
- Envíos y etiquetas: `skirmshop-labels` y la ruta `/skirmshop-plugins-admin`. Búsquedas: `diff -rq` contra la copia de `pocharlies-openclaw` (sin diferencias), grep en `~/k8s`, lectura de `docs/mcp-estate-audit.md`.
