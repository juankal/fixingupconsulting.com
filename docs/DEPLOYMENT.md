# Despliegue automático (Autodeploy)

Cada `push` a `main` publica el sitio solo en el hosting, sin pasos manuales.

## Cómo funciona

- **Workflow:** [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- **Se dispara:** en cada `push` a `main`, o manualmente desde la pestaña Actions (`workflow_dispatch`)
- **Acción:** [`SamKirkland/FTP-Deploy-Action@v4.3.5`](https://github.com/SamKirkland/FTP-Deploy-Action)
- **Protocolo:** FTP plano, puerto 21
- **Destino:** `public_html/` en `fixingupconsulting.com` (hosting.com.pe, cuenta cPanel `mar31fid`)
- No borra en el hosting los archivos que ya no estén en el repo — solo sube y actualiza.

### Por qué FTP plano y no SFTP/FTPS

- **SFTP (SSH, puerto 22):** filtrado a nivel de red en este hosting. Confirmado con pruebas de conexión TCP directas al puerto (timeout, no rechazo de credenciales) — no es un problema de configuración de llaves, el puerto simplemente no responde desde fuera. `sshd` sí corre en el servidor (visible en "Información del Servidor" de cPanel), pero no está expuesto externamente.
- **FTPS (FTP + TLS explícito):** el servidor rechaza el handshake con `500 This security scheme is not implemented`.
- **FTP plano (puerto 21):** es lo único que este plan de hosting expone de verdad hacia afuera.

Si en algún momento el hosting habilita SSH externo, se puede migrar el workflow a `rsync`/SFTP con llave para tener las credenciales cifradas en tránsito.

## Secrets de GitHub

En **Settings → Secrets and variables → Actions** del repositorio:

| Secret | Valor |
|---|---|
| `FTP_SERVER` | `fixingupconsulting.com` |
| `FTP_USERNAME` | `mar31fid` |
| `FTP_PASSWORD` | (contraseña de cPanel/FTP — la misma cuenta) |
| `FTP_REMOTE_PATH` | `public_html/` |

## Qué se excluye del despliegue

- `.git*`, `.git*/**`
- `.github/**`
- `docs/**` — esta carpeta, documentación interna, nunca debe llegar a producción

## Rotar la contraseña FTP

1. cPanel → **Contraseña y Seguridad** → cambiar contraseña (en esta cuenta, cPanel y FTP comparten la misma contraseña).
2. Actualizar el secret `FTP_PASSWORD` en GitHub con el nuevo valor.
