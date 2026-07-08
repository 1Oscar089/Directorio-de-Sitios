/* ============================================================
   Configuración del Directorio de Sitios
   ------------------------------------------------------------
   1. Sustituye API_URL por la URL de tu Web App de Google Apps
      Script (la obtienes al desplegar → "Deploy as web app").
   2. Cambia ADD_PASSWORD por la contraseña que quieras usar para
      añadir sitios. DEBE ser idéntica a la del archivo Code.gs.
   3. Si API_URL sigue siendo el placeholder, la app mostrará datos
      de demostración para que puedas ver el diseño.
   ============================================================ */

window.SITE_CONFIG = {
  // URL del despliegue de Google Apps Script (Web App).
  // Ejemplo: "https://script.google.com/macros/s/AKfyc.../exec"
  API_URL: "https://script.google.com/macros/s/AKfycbxT4VRgRVTTf0CUAF3egSyVAV6Yqk4pSHWc1SCywc65uEjqAkcKf4ro1yC1upyArDRULg/exec",

  // Contraseña para añadir sitios (debe coincidir con Code.gs).
  ADD_PASSWORD: "admin123",

  // Categorías disponibles (se muestran en orden alfabético).
  CATEGORIES: [
    "Ciencia",
    "Desarrollo",
    "Diseño",
    "Educación",
    "Entretenimiento",
    "Finanzas",
    "Herramientas",
    "Inteligencia Artificial",
    "Juegos",
    "Marketing",
    "Noticias",
    "Productividad",
    "Redes Sociales",
    "Salud",
    "Viajes"
  ],

  // Tipos disponibles (se muestran en orden alfabético).
  TYPES: [
    "API",
    "Aplicación",
    "Extensión",
    "IA",
    "Página Web",
    "Plugin",
    "Software"
  ],

  // Datos de demostración (solo se usan si API_URL no está configurada).
  DEMO_DATA: [
    { name: "Notion", description: "Espacio de trabajo todo en uno para notas, documentos y bases de datos.", category: "Productividad", type: "Aplicación", price: "Freemium", link: "https://notion.so" },
    { name: "Figma", description: "Diseño de interfaces colaborativo en el navegador.", category: "Diseño", type: "Página Web", price: "Freemium", link: "https://figma.com" },
    { name: "ChatGPT", description: "Asistente de IA conversacional de OpenAI.", category: "Inteligencia Artificial", type: "IA", price: "Freemium", link: "https://chat.openai.com" },
    { name: "MDN Web Docs", description: "Documentación de referencia para tecnologías web.", category: "Desarrollo", type: "Página Web", price: "Gratis", link: "https://developer.mozilla.org" },
    { name: "Duolingo", description: "Aprende idiomas con lecciones gamificadas.", category: "Educación", type: "Aplicación", price: "Freemium", link: "https://duolingo.com" },
    { name: "Canva", description: "Crea diseños gráficos de forma sencilla.", category: "Diseño", type: "Página Web", price: "Freemium", link: "https://canva.com" },
    { name: "GitHub", description: "Plataforma de alojamiento de código y colaboración.", category: "Desarrollo", type: "Página Web", price: "Freemium", link: "https://github.com" },
    { name: "Spotify", description: "Streaming de música y podcasts.", category: "Entretenimiento", type: "Aplicación", price: "Freemium", link: "https://spotify.com" },
    { name: "Trello", description: "Gestión de proyectos con tableros Kanban.", category: "Productividad", type: "Página Web", price: "Freemium", link: "https://trello.com" },
    { name: "Wolfram Alpha", description: "Motor de conocimiento computacional.", category: "Ciencia", type: "Página Web", price: "Freemium", link: "https://wolframalpha.com" },
    { name: "Hugging Face", description: "Plataforma de modelos de IA open source.", category: "Inteligencia Artificial", type: "API", price: "Freemium", link: "https://huggingface.co" },
    { name: "Stack Overflow", description: "Comunidad de preguntas y respuestas para programadores.", category: "Desarrollo", type: "Página Web", price: "Gratis", link: "https://stackoverflow.com" }
  ]
};
