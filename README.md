# Automatizaci-n-PlaywrightbancoPichinchacapasPOM
Repositorio para practicar automatización con página de banco pichincha en Playwright con POM

Automatización E2E del [Simulador de Crédito Hipotecario](https://brave-mud-0605ba20f.3.azurestaticapps.net/)
con **Playwright + TypeScript** usando el patrón **Page Object Model (POM)** por capas.
Cada prueba se graba en **video** y se generan reportes **HTML, JUnit y JSON**.

## Arquitectura por capas

```
tests/                 -> Capa de pruebas (escenarios por sección + E2E)
src/fixtures/          -> Inyección de Page Objects y flujos en cada prueba
src/flows/             -> Capa de negocio: recorre el wizard hasta un paso dado
src/pages/             -> Capa POM: un Page Object por sección (localizadores + acciones)
src/data/              -> Datos de prueba y tipos
src/utils/             -> Utilidades (formato de moneda, mock del API)
playwright.config.ts   -> Video, screenshots, trace y reporteadores
```

| Sección | Page Object | Spec |
|---|---|---|
| 1. Proyecto | `ProjectStepPage` | `tests/01-proyecto.spec.ts` |
| 2. Finanzas | `FinancesStepPage` | `tests/02-finanzas.spec.ts` |
| 3. Personaliza | `PersonalizeStepPage` | `tests/03-personaliza.spec.ts` |
| 4. Resultados | `ResultsStepPage` | `tests/04-resultados.spec.ts` |
| 5. Capacidades | `CapabilitiesStepPage` | `tests/05-capacidades.spec.ts` |
| 6. Contacto | `ContactStepPage` | `tests/06-contacto.spec.ts` |
| 7. Confirmación | `ConfirmationStepPage` | `tests/07-confirmacion.spec.ts` |
| Flujo completo | `SimulationFlow` | `tests/08-e2e.spec.ts` |

`WizardPage` cubre la cabecera, el título y el stepper; `BasePage` centraliza los botones
comunes (Siguiente, Volver, Guardar formulario).

## Requisitos

- Node.js 18+
- Google Chrome instalado (por defecto se usa `channel: 'chrome'`).
  Para usar el Chromium de Playwright: `npx playwright install chromium` y `PW_CHANNEL=bundled`.

## Instalación y ejecución

```powershell
npm install
npm test                 # toda la suite (headless)
npm run test:headed      # con navegador visible
npm run test:e2e         # solo flujo E2E contra el backend real
npm run typecheck        # validación de tipos TypeScript
npm run report           # abre el reporte HTML
```

Variables opcionales: `BASE_URL`, `PW_CHANNEL` (`chrome`, `msedge`, `bundled`) y `SLOW_MO` (ms entre acciones,
útil para videos más legibles, p. ej. `$env:SLOW_MO=300; npm test`).

## Integración continua (GitHub Actions)

El workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) se ejecuta en cada push o
pull request a `main` y manualmente desde **Actions → Pruebas E2E Playwright → Run workflow** (permite
ajustar `SLOW_MO`). Instala dependencias y Chromium, valida tipos, ejecuta la suite y publica como
artefactos el reporte (`reporte-playwright`) y los videos (`videos-y-evidencias`), además de un resumen
de resultados en la ejecución.

## Resultados y evidencias

| Evidencia | Ubicación |
|---|---|
| Reporte HTML (con video, screenshot y pasos) | `reports/html/index.html` |
| Reporte JUnit (CI) | `reports/junit/results.xml` |
| Reporte JSON | `reports/json/results.json` |
| Video `.webm` por prueba | `test-results/<prueba>/video.webm` |
| Trace (solo en fallos) | `test-results/<prueba>/trace.zip` |

## Notas sobre el comportamiento de la aplicación

- El envío final (`POST /api/Simulacion/procesar`) se valida con **mock** (éxito y error 500) en
  `07-confirmacion.spec.ts`, verificando el payload. El E2E de `08-e2e.spec.ts` usa el **backend real**
  y acepta tanto "¡Simulación Enviada!" como "Error en el Envío"; si el backend falla se registra una
  anotación `backend` en el reporte.
- En Finanzas, fecha de nacimiento y estado civil están marcados con `*` pero no bloquean el avance.
- En Personaliza, el monto se valida al perder el foco (blur).
- En Contacto, "Acepto las políticas de privacidad" viene marcado por defecto.
- "Cancelar" y el "Aceptar" del modal reinician el simulador en el paso 1.
