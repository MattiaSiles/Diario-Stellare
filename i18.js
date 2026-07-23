const translations = {
    it: {
        // --- GLOBALI & AVVISI ---
        "app_title": "Diario Stellare",
        "maintenance_title": "Lavori in corso",
        "maintenance_text": "Il Diario Stellare è momentaneamente in manutenzione per un aggiornamento dei sistemi.<br><br>Torna tra poco!",
        "offline_badge": "🛰️ Segnale perso (Salvataggio locale)",

        // --- MENU LATERALE ---
        "menu_button": "☰ Ricordi",
        "menu_login": "🔑 Accedi con Google",
        "menu_welcome_back": "BENTORNATO",
        "menu_default_user": "Viaggiatore",
        "menu_sync_status": "● Sincronizzato col Cloud",
        "menu_logout": "Disconnetti",
        "menu_favorites_title": "★ Preferiti",
        "menu_all_memories_title": "Tutti i Ricordi",
        "menu_reminder": "📅 Imposta promemoria giornaliero",
        "menu_data_management": "Gestione Dati",
        "menu_backup_app": "💾 Salva Backup (File App)",
        "menu_backup_text": "📄 Scarica come Testo",
        "menu_import": "📂 Importa Backup",

        "alert_login_success": "Benvenuto {nome}! Carico il tuo universo...",
        "alert_login_error": "Errore login: {errore}",
        "alert_logout": "Disconnesso. Ora stai usando la memoria locale.",

        // --- INTERFACCIA GALASSIA & STRUMENTI ---
        "tooltip_blackhole": "Analizza l'Anima della Galassia",
        "tooltip_rotation": "Blocca/Sblocca Rotazione",
        "tooltip_edit_mode": "Modalità Modifica",
        "search_placeholder": "Cerca un ricordo...",

        // --- PANNELLO COSTELLAZIONI (Matita) ---
        "const_mode_edit": "Modifica: <b>{nome_costellazione}</b>",
        "const_mode_create": "Modo: <b>Creazione Gruppo</b>",
        "const_0_star": "0 stelle selezionate",
        "const_mode_title": "Modo: <b>Sposta/Collega</b><br><small>Clicca 2 stelle per unire.</small>",
        "const_btn_new": "✨ Crea Nuova Costellazione",
        "const_status_select": "Seleziona stelle...",
        "const_btn_save": "💾 Salva Gruppo",
        "const_btn_delete": "🗑 Elimina Gruppo",
        "const_btn_cancel": "Annulla",

        // --- MODALE SCRITTURA (Nuova Stella) ---
        "writer_title": "Come ti senti oggi?",
        "writer_placeholder": "Scrivi qui i tuoi pensieri...",
        "writer_tooltip_photo": "Allega una foto",
        "writer_remove_photo": "✖ Rimuovi foto",
        "writer_capsule_check": "Trasforma in Nebulosa del Tempo (Capsula) ⏳",
        "writer_capsule_date": "Apri il giorno:",
        "writer_btn_cancel": "Annulla",
        "writer_btn_save": "Accendi la Stella",

        // --- MODALE LETTURA (Visualizza Stella) ---
        "viewer_btn_fav": "★ Preferito",
        "viewer_btn_add_fav": "☆ Aggiungi a Preferiti",
        "viewer_btn_edit": "✏️ Modifica",
        "viewer_btn_update": "Aggiorna la stella",
        "viewer_btn_delete": "🗑 Elimina",
        "viewer_btn_close": "Chiudi",

        // --- TIMELINE ---
        "timeline_today": "OGGI",
        "timeline_btn_zoom": "🔍 ZOOM",
        "btn_galaxy_back": "🔙 GALASSIA",

        // --- TUTORIAL ---
        "tutorial_btn_prev": "Indietro",
        "tutorial_btn_next": "Avanti",
        "tut_1_title": "Benvenut*",
        "tut_1_text": "Nello spazio nessuno può sentire i tuoi pensieri, ma potrai vederli brillare. In questo spazio sicuro, ogni tuo pensiero diventa una stella. Il cielo si riempirà col tempo.",
        "tut_2_title": "Navigazione",
        "tut_2_text": "Usa la rotellina (o i tasti + e -) per Zoomare. Clicca e trascina lo sfondo nero per spostarti ed esplorare il cielo.",
        "tut_3_title": "Nuovo Ricordo",
        "tut_3_text": "Usa il tasto ✒️ in basso a destra per scrivere come ti senti. Puoi scegliere il colore della tua stella in base al tuo umore.",
        "tut_4_title": "I tuoi Ricordi",
        "tut_4_text": "Usa il menu Ricordi in alto a sinistra per rivedere tutti i tuoi pensieri ordinati o ritrovare i preferiti.",
        "tut_5_title": "Costellazioni",
        "tut_5_text": "Clicca la matita. Puoi unire due stelle, oppure cliccare 'Crea Nuova Costellazione' per selezionare tante stelle e dare un nome unico.",
        "tut_6_title": "Il Buco Nero",
        "tut_6_text": "Al centro della galassia trovi il buco nero il cui colore cambia adattandosi al colore generale delle stelle. Cliccaci per vedere le statistiche.",
        "tut_7_title": "Telescopio",
        "tut_7_text": "Clicca sulla barra di ricerca e inserisci la o le parole chiave che vuoi cercare nelle note. Rimarranno accese solo le stelle che le contengono.",
        "tut_8_title": "Atmosfera",
        "tut_8_text": "Usa l'icona in alto a destra per attivare la musica di sottofondo.",
        "tut_btn_start": "Inizia",

        // --- STATISTICHE ---
        "stats_title": "Analisi del Cielo",
        "stats_tab_time": "⏳ Tempo",
        "stats_tab_const": "✨ Costellazioni",
        "stats_filter_7days": "7 Giorni",
        "stats_filter_month": "Mese",
        "stats_filter_year": "Anno",
        "stats_filter_always": "Sempre",
        "stats_period_week": "Ultimi 7 Giorni",
        "stats_period_always": "Statistiche: Sempre",
        "stats_period_month": "Questo Mese",
        "stats_period_year": "Anno ",
        "stats_const_subtitle": "Analisi Costellazioni",
        "stats_const_desc": "Dettaglio mood per ogni costellazione creata.",
        "stats_btn_close": "Chiudi",

        // --- ALERT E CONFERME (app.js) ---
        "alert_dev_unlocked": "✨ Accesso Sviluppatore Sbloccato! Riavvio in corso...",
        "alert_dev_off": "🔒 Modalità Sviluppatore DISATTIVATA. Torni al database reale.",
        "alert_dev_on": "✨ Modalità Sviluppatore ATTIVATA! Usi il database di test.",
        "alert_nebula_forming": "✨ Questa stella si sta ancora formando.\n\nLa nebulosa diventerà una stella e svelerà il suo ricordo il giorno:\n{data}",
        "confirm_delete_line": "Cancellare collegamento?",
        "alert_select_star": "Seleziona almeno una stella!",
        "prompt_const_name": "Nome della Costellazione:",
        "confirm_auto_lines": "Vuoi unire automaticamente queste stelle con delle linee bianche?",
        "confirm_delete_group": "Eliminare questo nome? (Le stelle resteranno)",
        "confirm_overwrite": "Sovrascrivere tutto?",
        "alert_invalid_file": "File non valido",
        "confirm_extinguish": "Spegnere questa stella?",
        "alert_login_required": "Devi aver fatto l'accesso per caricare un'immagine.",
        "alert_image_too_large": "L'immagine è troppo grande! Massimo 5MB.",
        "alert_upload_error": "Si è verificato un errore nel caricamento dell'immagine.",

        // --- TESTI DINAMICI E STATI (app.js) ---
        "status_processing_photo": "Elaborazione foto...",
        "status_uploading_cloud": "Caricamento sul Cloud...",
        "status_stars_selected": " stelle selezionate", // Nota: in JS dovrai concatenare il numero prima
        "timeline_no_memories": "Nessun ricordo",
        "timeline_unknown_zone": "🌑 ZONA IGNOTA",
        "timeline_today_prefix": "OGGI", // Nota: in JS dovrai concatenare la data
        "search_no_results": "Nessun risultato",
        "search_stars_found": " stelle trovate", // Nota: in JS dovrai concatenare il numero prima
        "memory_visual_only": "📸 Ricordo visivo...",
        "viewer_color_prefix": "Colore: ",
        "empty_favs": "Nessun preferito",
        "empty_sky": "Nessun ricordo nel cielo",
        "stats_no_constellations": "Nessuna costellazione creata.",
        "stats_no_data": "Nessun dato",
        "stats_stars_count": " stelle)", // Nota: in JS dovrai concatenare la parentesi di apertura e il numero
        "label_white": "Bianco",
        "label_red": "Rosso",
        "label_blue": "Blu",
        "label_yellow": "Giallo",
        "label_orange": "Arancione",
        "export_title": "IL MIO DIARIO STELLARE\n\n",
        "export_date": "DATA: ",
        "export_color": "COLORE: ",
    },

    en: {
        // --- GLOBALI & AVVISI ---
        "app_title": "Star Diary",
        "maintenance_title": "Works in progress",
        "maintenance_text": "The Star Diary is under maintenance at the moment due to a system update.<br><br>Come back at a later moment",
        "offline_badge": "🛰️ Signal lost (Saving in local)",

        // --- MENU LATERALE ---
        "menu_button": "☰ Memories",
        "menu_login": "🔑 Sign in with Google",
        "menu_welcome_back": "WELCOME BACK",
        "menu_default_user": "Traveler",
        "menu_sync_status": "● Synchronized with the Cloud",
        "menu_logout": "Log out",
        "menu_favorites_title": "★ Favorites",
        "menu_all_memories_title": "All the Memories",
        "menu_reminder": "📅 Set a daily reminder",
        "menu_data_management": "Data Menagement",
        "menu_backup_app": "💾 Save backup (App File)",
        "menu_backup_text": "📄 Download as Text",
        "menu_import": "📂 Import Backup",

        "alert_login_success": "Welcome {nome}! Loading your universe...",
        "alert_login_error": "Login error: {errore}",
        "alert_logout": "Logged out. You are now using local storage.",

        // --- INTERFACCIA GALASSIA & STRUMENTI ---
        "tooltip_blackhole": "Analyze Galaxy's Soul",
        "tooltip_rotation": "Able/Disable Rotation",
        "tooltip_edit_mode": "Edit Mode",
        "search_placeholder": "Search for a memory...",

        // --- PANNELLO COSTELLAZIONI (Matita) ---
        "const_mode_edit": "Editing: <b>{nome_costellazione}</b>",
        "const_mode_create": "Mode: <b>Group Creation</b>",
        "const_0_star": "0 star selected",
        "const_mode_title": "Mode: <b>Move/Connect</b><br><small>Click on 2 stars to connect.</small>",
        "const_btn_new": "✨ Create a New Constellation",
        "const_status_select": "Select the stars...",
        "const_btn_save": "💾 save Group",
        "const_btn_delete": "🗑 Delete group",
        "const_btn_cancel": "Cancel",

        // --- MODALE SCRITTURA (Nuova Stella) ---
        "writer_title": "How are you feeling today?",
        "writer_placeholder": "Write here your thoughts...",
        "writer_tooltip_photo": "Add a photo",
        "writer_remove_photo": "✖ Remove photo",
        "writer_capsule_check": "Transform in a Time Nebula⏳",
        "writer_capsule_date": "Opening day:",
        "writer_btn_cancel": "Cancel",
        "writer_btn_save": "Light Up the Star",

        // --- MODALE LETTURA (Visualizza Stella) ---
        "viewer_btn_fav": "★ Favorite",
        "viewer_btn_add_fav": "☆ Add to Favorites",
        "viewer_btn_edit": "✏️ Edit",
        "viewer_btn_update": "Update the star",
        "viewer_btn_delete": "🗑 Delete",
        "viewer_btn_close": "Close",

        // --- TIMELINE ---
        "timeline_today": "TODAY",
        "timeline_btn_zoom": "🔍 ZOOM IN",
        "btn_galaxy_back": "🔙 GALAXY",
        "timeline_unknown_zone": "🌑 UNKNOWN ZONE",
        "timeline_today_prefix": "TODAY",

        // --- TUTORIAL ---
        "tutorial_btn_prev": "Back",
        "tutorial_btn_next": "Next",
        "tut_1_title": "Welcome",
        "tut_1_text": "In space no one can hear your thought, but you can see them shine. In this safe space, every thought of yous becomes a star. The sky will fill up over time.",
        "tut_2_title": "Browsing",
        "tut_2_text": "Use the mouse wheel (or the buttons + and -) to Zoom in and out. Click and drag the background to move around and explore the sky.",
        "tut_3_title": "New Memory",
        "tut_3_text": "Use the button ✒️ at the bottom right to write how you feel. you can choose the color of your star based on your mood.",
        "tut_4_title": "Your Memories",
        "tut_4_text": "Use the Memories menu at the top left to see all your memories or find your favorites",
        "tut_5_title": "Constellations",
        "tut_5_text": "Click the pencil. you can connect 2 stars, or click 'Create a new Constellation' in order to select multiple star and give them a group name.",
        "tut_6_title": "The Black Hole",
        "tut_6_text": "At the center of the Galaxy you can find a black hole whose color change adapting to the general color of the stars. Click on it to see the stats.",
        "tut_7_title": "Telescope",
        "tut_7_text": "Click on the search bar and type one or more key words that you want to find in your notes. Only the stars containg it or them will remain bright.",
        "tut_8_title": "Music",
        "tut_8_text": "Use the icon at the top right to turn on the background music",
        "tut_btn_start": "Start",

        // --- STATISTICHE ---
        "stats_title": "Sky Analysis",
        "stats_tab_time": "⏳ Time",
        "stats_tab_const": "✨ Constellations",
        "stats_filter_7days": "7 Days",
        "stats_filter_month": "Month",
        "stats_filter_year": "Year",
        "stats_filter_always": "Total",
        "stats_period_week": "Last 7 days",
        "stats_period_always": "Stats: Always",
        "stats_period_month": "This Month",
        "stats_period_year": "Year ",
        "stats_const_subtitle": "Constellations Analysis",
        "stats_const_desc": "Mood detail for every constellation.",
        "stats_btn_close": "Close",

        // --- ALERT E CONFERME (app.js) ---
        "alert_dev_unlocked": "✨ Developer Access Unlocked! Restarting...",
        "alert_dev_off": "🔒 Developer Mode DEACTIVATED. Returning to real database.",
        "alert_dev_on": "✨ Developer Mode ACTIVATED! Using testing database",
        "alert_nebula_forming": "✨ This star is yet to be born.\n\nThe nebula will become a star and reveal it's memory on:\n{data}",
        "confirm_delete_line": "Delete connection?",
        "alert_select_star": "Select at least one star!",
        "prompt_const_name": "Constellation name:",
        "confirm_auto_lines": "Do you want to connect this star with white lines?",
        "confirm_delete_group": "Delete this name? (the stars will remain)",
        "confirm_overwrite": "Overwrite everything?",
        "alert_invalid_file": "Invalid file",
        "confirm_extinguish": "Do you want to extinguish this star?",
        "alert_login_required": "You must log in with google to upload an image.",
        "alert_image_too_large": "Image size invalid! 5MB Max.",
        "alert_upload_error": "An error occurred while loading the image.",

        // --- TESTI DINAMICI E STATI (app.js) ---
        "status_processing_photo": "Processing photo...",
        "status_uploading_cloud": "Uploading on the Cloud...",
        "status_stars_selected": " stars selected",
        "timeline_no_memories": "No memories",
        "search_no_results": "No results",
        "search_stars_found": " stars found",
        "memory_visual_only": "📸 Visual Memory...",
        "viewer_color_prefix": "Color: ",
        "empty_favs": "No favorites",
        "empty_sky": "No memories in the sky",
        "stats_no_constellations": "No constellation created",
        "stats_no_data": "No data",
        "stats_stars_count": " stars)",
        "label_white": "White",
        "label_red": "Red",
        "label_blue": "Blue",
        "label_yellow": "Yellow",
        "label_orange": "Orange",
        "export_title": "MY STAR DIARY\n\n",
        "export_date": "DATE: ",
        "export_color": "COLOR: ",
    }
};

// --- LOGICA DI TRADUZIONE ---

// Controlla se l'utente ha già scelto una lingua, altrimenti usa l'italiano di default
let currentLang = localStorage.getItem('stardiary_lang') || 'it';

// Funzione base per recuperare la traduzione (la useremo in app.js)
function t(key) {
    if (translations[currentLang] && translations[currentLang][key]) {
        return translations[currentLang][key];
    }
    return key; // Fallback se la chiave non esiste
}

// Funzione per tradurre tutto l'HTML al caricamento
function translateHTML() {
    document.title = t('app_title');
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');

        // Se l'elemento è un input con placeholder, traduci il placeholder
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = t(key);
        } else {
            // Altrimenti traduci il testo interno (mantenendo l'HTML se presente, come <b> o <br>)
            element.innerHTML = t(key);
        }
    });

    // Gestione speciale per i tooltip (attributo title)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
}

// Cambia lingua in tempo reale
function switchLanguage(langCode) {
    if (translations[langCode]) {
        currentLang = langCode;
        localStorage.setItem('stardiary_lang', langCode);
        translateHTML();
        // Eventuali aggiornamenti da ricaricare in app.js (es. aggiornare liste) andranno chiamati qui
    }
}

// Avvia la traduzione appena la pagina è pronta
window.addEventListener('DOMContentLoaded', translateHTML);