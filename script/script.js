// Token di autenticazione per l'API di The Movie Database (TMDb)
// Questo token è necessario per fare richieste autenticate all'API
const TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODBiMTMyYjZjOWIwNzIxNThhMDhhMWI4OTQ1NDdkMiIsIm5iZiI6MTc1NzY4MDEwOS42NzgwMDAyLCJzdWIiOiI2OGM0MTFlZDI4ZDNlOTI4MTJiYWM5ZTAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.eVe5MczfdH1ohy2bKkj314DHLDegtG8kKBDPTUNsbX4";

// URL base per le immagini dei poster dei film
// TMDb fornisce immagini in diverse dimensioni, noi usiamo w200 (larghezza 200px)
const IMG_BASE = "https://image.tmdb.org/t/p/w200";

// ========================================
// VARIABILI GLOBALI DI STATO
// ========================================

// Pagina corrente che stiamo visualizzando (inizia da 1)
let currentPage = 1;

// Numero totale di pagine disponibili (viene aggiornato dall'API)
let totalPages = 1;

// Testo di ricerca inserito dall'utente (vuoto all'inizio)
let currentQuery = "";

// ID del genere selezionato dall'utente (vuoto = tutti i generi)
let currentGenre = "";

// ========================================
// FUNZIONE UTILITARIA PER CHIAMATE API
// ========================================

async function fetchAPI(endpoint) {
  // Costruisce l'URL completo concatenando base URL + endpoint
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}`, {
    method: "GET",
    headers: {
      accept: "application/json", // Diciamo all'API che vogliamo JSON
      Authorization: `Bearer ${TOKEN}`, // Autenticazione con il nostro token
    },
  });

  // Controlla se la richiesta è andata a buon fine
  if (!res.ok) throw new Error("Errore API");

  // Converte la risposta da JSON e la restituisce
  return await res.json();
}
