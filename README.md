# References Archive

Página estática para guardar videos embebidos organizada en secciones (Live2D, Arte, 3D).

Soporta embebidos de:

- YouTube: pega la URL (`https://www.youtube.com/watch?v=ID` o `https://youtu.be/ID`) o un `<iframe>`.
- X / Twitter: pega la URL del tweet con el video (`https://twitter.com/.../status/ID` o `https://x.com/.../status/ID`). El script cargará `platform.twitter.com/widgets.js` para renderizar el embed.

Publicar desde `main/docs` (opcional)

Si prefieres publicar desde la carpeta `docs/`, mueve los archivos a `docs/` y en Settings → Pages selecciona `main` y la carpeta `docs`.

Probar localmente

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000` y navegar a la página.

Editar los videos

Abre el archivo `videos.json` y edítalo con la jerarquía y las URLs/iframes. Ejemplo de formato:

```json
{
	"live2d": {
		"Head": { "Eyes": ["https://youtu.be/VIDEO_ID"], "Mouth": [] },
		"Body": { "Angles": [], "Arms": [] },
		"Clothing": { "Skirt/Dress": [] },
		"Animal": { "Ears": [] }
	},
	"arte": { /* ... */ },
	"3d": { /* ... */ }
}
```

Puedes pegar:
- URLs de YouTube (`youtube.com/watch?v=` o `youtu.be/ID`) — se convertirán en embeds.
- URLs de tweets con video (`https://twitter.com/.../status/ID` o `https://x.com/.../status/ID`) — se cargarán vía `platform.twitter.com/widgets.js`.
- Código `<iframe ...></iframe>` directamente.

Después de guardar `videos.json`, recarga la página y los embeds aparecerán automáticamente.

