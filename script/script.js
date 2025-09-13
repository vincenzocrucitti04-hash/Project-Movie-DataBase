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

// ========================================
// CARICAMENTO GENERI PER IL FILTRO
// ========================================

/**
 * Carica tutti i generi disponibili dall'API e popola il menu a tendina
 */
async function loadGenres() {
  try {
    // Chiama l'API per ottenere la lista dei generi in italiano
    const data = await fetchAPI("/genre/movie/list?language=it");

    // Prende il riferimento al menu select nell'HTML
    const select = document.getElementById("genreSelect");

    // Per ogni genere restituito dall'API...
    data.genres.forEach((g) => {
      // Crea un nuovo elemento <option>
      const opt = document.createElement("option");
      opt.value = g.id; // Il valore è l'ID numerico del genere
      opt.textContent = g.name; // Il testo visualizzato è il nome (es: "Azione")

      // Aggiunge l'opzione al menu select
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("Errore nel caricamento dei generi:", error);
  }
}

// ========================================
// FUNZIONE PRINCIPALE: CARICAMENTO FILM
// ========================================

/**
 * Funzione principale che carica e mostra i film in base allo stato corrente
 * Questa funzione decide quale endpoint chiamare in base a:
 * - Se c'è una ricerca attiva (currentQuery)
 * - Se c'è un genere selezionato (currentGenre)
 * - Oppure mostra semplicemente i film popolari
 */
async function loadMovies() {
  try {
    let endpoint = "";

    // LOGICA DI DECISIONE: Quale endpoint dell'API chiamare?

    if (currentQuery) {
      // L'utente ha inserito una ricerca
      // Cerca film per titolo con il testo inserito
      endpoint = `/search/movie?query=${encodeURIComponent(
        currentQuery
      )}&page=${currentPage}&language=it`;
    } else if (currentGenre) {
      // L'utente ha selezionato un genere specifico
      // Trova film di quel genere
      endpoint = `/discover/movie?with_genres=${currentGenre}&page=${currentPage}&language=it`;
    } else {
      // Caso DEFAULT: nessuna ricerca, nessun genere
      // Mostra i film più popolari (questo è il caso quando si apre la pagina)
      endpoint = `/discover/movie?page=${currentPage}&language=it`;
    }

    // Effettua la chiamata API con l'endpoint scelto
    const data = await fetchAPI(endpoint);

    // AGGIORNAMENTO INFORMAZIONI PAGINAZIONE
    // Salva il numero totale di pagine restituito dall'API
    totalPages = data.total_pages;

    // Aggiorna il testo della paginazione nell'HTML (es: "1 / 500")
    document.getElementById(
      "pageInfo"
    ).textContent = `${currentPage} / ${totalPages}`;

    // PREPARAZIONE DEL CONTENITORE HTML
    // Prende il div dove inserire i film
    const container = document.getElementById("movies");

    // Cancella tutto il contenuto precedente (importante per aggiornamenti)
    container.innerHTML = "";

    // CREAZIONE HTML PER OGNI FILM
    // L'API restituisce un array di film in data.results
    data.results.forEach((movie) => {
      // Crea un nuovo div per questo film
      const div = document.createElement("div");

      // Aggiunge un po' di spaziatura
      div.style.margin = "10px";

      // Costruisce l'HTML interno del div
      // Nota: usa template literals (backticks) per inserire variabili
      div.innerHTML = `
        <h3>${movie.title}</h3>
        <img src="${
          // Se il film ha un poster, costruisce l'URL completo
          // Altrimenti lascia vuoto (l'immagine non si caricherà)
          movie.poster_path ? IMG_BASE + movie.poster_path : ""
        }" alt="${movie.title}">
        <p>Data uscita: ${movie.release_date || "N/A"}</p>
        <p>Voto: ${movie.vote_average}</p>
      `;

      // Aggiunge questo div al contenitore principale
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Errore nel caricamento dei film:", error);
    // In caso di errore, mostra un messaggio all'utente
    document.getElementById("movies").innerHTML =
      "<p>Errore nel caricamento dei film.</p>";
  }
}

// ========================================
// FUNZIONI DI INTERAZIONE UTENTE
// ========================================

/**
 * Funzione chiamata quando l'utente clicca "Cerca"
 * Legge il testo inserito e avvia una nuova ricerca
 */
function searchMovies() {
  // Legge il valore dal campo di input
  currentQuery = document.getElementById("searchInput").value;

  // Reset: torna alla prima pagina per la nuova ricerca
  currentPage = 1;

  // Ricarica i film con i nuovi parametri
  loadMovies();
}

/**
 * Funzione chiamata quando l'utente cambia il genere nel menu a tendina
 */
function filterByGenre() {
  // Legge il genere selezionato (sarà l'ID del genere, o "" se "Tutti i generi")
  currentGenre = document.getElementById("genreSelect").value;

  // Cancella la ricerca testuale (se c'era)
  currentQuery = "";

  // Reset: torna alla prima pagina
  currentPage = 1;

  // Ricarica i film con il nuovo filtro
  loadMovies();
}

// ========================================
// FUNZIONI DI PAGINAZIONE
// ========================================

/**
 * Va alla pagina successiva (se esiste)
 */
function nextPage() {
  // Controlla se possiamo andare avanti
  if (currentPage < totalPages) {
    currentPage++; // Incrementa il numero di pagina
    loadMovies(); // Ricarica i film della nuova pagina
  }
}

/**
 * Va alla pagina precedente (se non siamo già alla prima)
 */
function prevPage() {
  // Controlla se possiamo andare indietro
  if (currentPage > 1) {
    currentPage--; // Decrementa il numero di pagina
    loadMovies(); // Ricarica i film della nuova pagina
  }
}

// ========================================
// INIZIALIZZAZIONE DELL'APPLICAZIONE
// ========================================

/**
 * Questo codice viene eseguito quando la pagina HTML è completamente caricata
 * È il punto di partenza dell'intera applicazione
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Carica i generi per popolare il menu a tendina
  loadGenres();

  // 2. Carica i film popolari iniziali
  //    Dato che currentQuery e currentGenre sono vuoti,
  //    loadMovies() userà l'endpoint /discover/movie che restituisce i film popolari
  loadMovies();
});

// ========================================
// FLUSSO DELL'APPLICAZIONE:
// ========================================
// 1. La pagina HTML si carica
// 2. Il browser esegue questo script
// 3. Definisce tutte le funzioni e variabili
// 4. Quando HTML è pronto, esegue DOMContentLoaded:
//    - Chiama loadGenres() → popola il menu generi
//    - Chiama loadMovies() → mostra i film popolari
// 5. L'utente può interagire:
//    - Cerca → searchMovies() → loadMovies() con ricerca
//    - Filtra → filterByGenre() → loadMovies() con genere
//    - Naviga → nextPage()/prevPage() → loadMovies() con pagina diversa
