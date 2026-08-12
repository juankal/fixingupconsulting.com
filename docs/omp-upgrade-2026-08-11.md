# Actualización de OMP: 3.3.0-22 → 3.5.0-5 LTS

**Fecha:** 11 de agosto de 2026 (18:07–19:12 hora de Perú, UTC-5)
**Sistema:** Open Monograph Press (PKP), en `fixingupconsulting.com/omp` — no vive en este repositorio, es una instalación PHP aparte en el mismo hosting.

## Contexto y restricciones

- Instalación manual de OMP (sin Softaculous), en hosting.com.pe / cPanel, cuenta `mar31fid`.
- **Sin SSH ni Terminal:** el puerto 22 está filtrado a nivel de red en este hosting (ver [`DEPLOYMENT.md`](DEPLOYMENT.md) para el mismo hallazgo aplicado al sitio estático). El único acceso real es FTP + Cron Jobs de cPanel.
- El cron de este servidor corre en **hora local de Perú (UTC-5), no GMT** — cualquier tarea programada debe calcularse contra esa hora.
- OMP 3.5 requiere **PHP 8.2+**; el dominio corría en PHP 8.0 y se subió a **PHP 8.4** vía MultiPHP Manager antes de actualizar.
- El salto directo 3.3 → 3.5 está soportado y probado por PKP (las notas de la 3.5.0-5 incluyen fixes específicos para upgrades "from 3.3"), no hace falta pasar por 3.4 manualmente.

## Método: Cron Job de una sola ejecución

Sin terminal, la única forma confiable de correr el instalador oficial de PKP (`tools/upgrade.php`) fue:

1. Subir por FTP el paquete oficial `omp-3.5.0-5.tar.gz` y un script `omp_upgrade.sh`.
2. Crear en cPanel → Cron Jobs una tarea que corriera **una sola vez** (minuto/hora específicos, `*` en día/mes/semana), con el comando `bash /home/mar31fid/omp_upgrade.sh`.
3. Borrar la tarea cron apenas confirmar el resultado en el log.

El script `omp_upgrade.sh` hacía, en orden:

1. Respaldo (`tar` de archivos + `mysqldump` de la base) a una carpeta con timestamp fuera de `public_html`.
2. Extracción del paquete oficial 3.5.0-5 a una carpeta nueva.
3. Copia de `config.inc.php`, `files/` (envíos privados) y `public/` (portadas, logos) desde la instalación en vivo.
4. Intercambio atómico de carpetas (`omp/` → `omp_old_3.3.0-22/`, la nueva → `omp/`).
5. Ejecución de `php tools/upgrade.php upgrade` (PHP 8.4, detectado automáticamente entre binarios típicos de EasyApache).
6. **Reversión automática** si el paso anterior fallaba (exit code ≠ 0): restaura la carpeta vieja, deja la copia fallida aparte para inspección.

## Obstáculos encontrados, en el orden en que aparecieron

### 1. El actualizador moría sin explicación (exit 255, sin mensaje)

Ni siquiera forzando `display_errors=1` se veía nada — la falla ocurría antes de que la aplicación pudiera mostrar su propio error.

**Causa:** OMP 3.4+ exige un driver de correo explícito en `config.inc.php`, y la instalación no tenía ninguno configurado (todo el bloque `[email]` estaba comentado).

**Arreglo:** se agregó a `config.inc.php`:
```ini
[email]
default = sendmail
sendmail_path = "/usr/sbin/sendmail -bs"
```

### 2. Faltaba un dato de la editorial

```
ERROR: Upgrade failed: DB: A contact name and email must be set on the
context(s) with path(s) [efu]. Please set those before upgrading.
```

**Causa:** el chequeo previo (`PreflightCheckMigration`) exige nombre y correo de contacto principal en cada editorial/revista antes de migrar.

**Arreglo:** se completó desde el panel de administración de OMP, en **Ajustes → Editorial → Contacto**.

### 3. El sitio quedó caído justo después de la migración exitosa

```
Uncaught mysqli_sql_exception: Access denied for user 'mar31fid_omp'@'localhost'
```

**Causa:** una personalización antigua y preexistente de `index.php` (para desactivar `ONLY_FULL_GROUP_BY` en MySQL, no forma parte del código oficial de PKP) abría una conexión mysqli aparte con la contraseña copiada mal — incluía por error las comillas literales del archivo `config.inc.php` como parte del valor. Bajo PHP 8.0 este fallo quedaba en silencio (mysqli no lanzaba excepciones por defecto); PHP 8.4, necesario para OMP 3.5, sí las lanza, y el `@` de supresión de errores no las detiene.

**Arreglo**, en `public_html/omp/index.php`:
- Se corrigió la contraseña hardcodeada (sin las comillas de más).
- Se agregó `mysqli_report(MYSQLI_REPORT_OFF);` antes de la conexión, para restaurar el comportamiento silencioso que ese bloque siempre asumió.

### 4. El panel fallaba al iniciar sesión (error SQL 1055)

```
SQLSTATE[42000]: ... 's.stage_id' isn't in GROUP BY
```

**Causa:** la conexión "aparte" del punto anterior nunca afectaba a la conexión real que usa la aplicación (Eloquent/Laravel) — el hack viejo era, en la práctica, un no-op para las consultas reales, algo que ya venía roto desde antes de este upgrade. Además, OMP 3.5 **eliminó** el soporte del ajuste `[database] strict` de `config.inc.php` sin dar un reemplazo — confirmado ausente tanto del nuevo `config.TEMPLATE.inc.php` como del código que arma la conexión.

**Arreglo**, en `lib/pkp/classes/core/PKPContainer.php` (archivo core de PKP, dentro del array de conexión a la base de datos):
```php
'strict' => false,
```
Esto hace que Laravel emita `SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION'` en cada conexión real, quitando `ONLY_FULL_GROUP_BY` donde de verdad importa.

> **Nota para el próximo upgrade:** este parche vive en un archivo core (`lib/pkp/classes/core/PKPContainer.php`), así que un futuro reemplazo completo del código de OMP lo va a borrar. Hay que volver a aplicarlo (o encontrar si una versión futura de PKP reintroduce una forma oficial de configurar esto).

### Falsa alarma: "Failed to initialize plugin: pkpTags"

Apareció en el editor de texto enriquecido tras el upgrade. Resultó ser caché del navegador con el `plugin.js` viejo de la 3.3 (que usaba una API de TinyMCE ya removida) — el archivo real en el servidor ya usa la API correcta. Confirmado en ventana de incógnito: no hay ningún problema del lado del servidor.

## Estado final

- **Versión en vivo:** OMP 3.5.0-5 LTS, PHP 8.4.
- **Respaldos conservados como red de seguridad** (borrar tras confirmar unas semanas de estabilidad):
  - `/home/mar31fid/omp_backup_20260811_185201` — `mysqldump` + tar de `files/`/`public/`, tomado justo antes de la corrida exitosa.
  - `/home/mar31fid/public_html/omp_old_3.3.0-22` — código completo de la versión anterior.
- Paquete de 113 MB, scripts temporales y logs de diagnóstico ya borrados del servidor.
- Cron Job del upgrade eliminado — no queda nada corriendo automáticamente.
