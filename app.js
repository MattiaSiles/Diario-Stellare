// ==========================================
// 1. LOGICA PRINCIPALE DEL DIARIO STELLARE
// ==========================================
// --- RICONOSCIMENTO FILE ---
// Capisce se siamo su forGemini o no
const isDev = window.location.pathname.includes('ForGemini');

// --- CHIAVI DI MEMORIA DINAMICHE ---
// Se siamo su forGemini usa le chiavi "_DEV", altrimenti quelle normali
const KEY_MEMORIES = isDev ? 'stardiary_memories_DEV' : 'stardiary_memories';
const KEY_LINES = isDev ? 'stardiary_lines_DEV' : 'stardiary_lines';
const KEY_LABELS = isDev ? 'stardiary_labels_DEV' : 'stardiary_labels';
const KEY_TUTORIAL = isDev ? 'tutorial_seen_DEV' : 'tutorial_seen_v6';

console.log("Modalità Sviluppo:", isDev); // Ti conferma in console se ha capito

// --- DATI ---
var memories = JSON.parse(localStorage.getItem(KEY_MEMORIES)) || [];
var lines = JSON.parse(localStorage.getItem(KEY_LINES)) || [];
var constellations = JSON.parse(localStorage.getItem(KEY_LABELS)) || [];
const colorPalette = ['white', 'red', 'blue', 'yellow', 'orange'];
let selectedSearchColor = null;
let timelineDates = [];
let selectedColor = 'white';
let currentMemoryId = null;
let isEditing = false;
let connectStartId = null;

let currentZoom = 1; let panX = 0; let panY = 0;
let isPanning = false; let startPanX = 0, startPanY = 0;

let tempImageData = null;

let isZoomedMode = false; // False = Galassia (Salti), True = Mese (Giorni)

let isEditingExisting = false; // Ci dice se stiamo modificando

function toggleTimeZoom() {
    const slider = document.getElementById('timeSlider');
    const btn = document.getElementById('btnTimeZoom');

    // Se non ci sono ricordi, inutile zoomare
    if (!memories || memories.length === 0) return;

    if (!isZoomedMode) {
        // --- ENTRIAMO IN ZOOM (Focus Mese) ---
        isZoomedMode = true;

        // 1. Capiamo in che data siamo ORA (dalla modalità step)
        // timelineDates è l'array che abbiamo creato nello step precedente
        const currentIndex = parseInt(slider.value);
        const currentDateTimestamp = timelineDates[currentIndex];
        const dateObj = new Date(currentDateTimestamp);

        // 2. Calcoliamo Inizio e Fine del MESE di quella data
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth(); // 0-11

        const firstDay = new Date(year, month, 1).getTime();
        // Giorno 0 del mese successivo = Ultimo giorno del mese corrente
        const lastDay = new Date(year, month + 1, 0).getTime();

        // 3. Riconfiguriamo lo Slider per lavorare con i TIMESTAMP (Millisecondi)
        slider.min = firstDay;
        slider.max = lastDay;
        // Step di un giorno (86400000 ms)
        slider.step = 86400000;

        // Posizioniamo il pallino sul giorno in cui eravamo
        slider.value = currentDateTimestamp;

        // 4. Effetti Grafici (ORO)
        slider.classList.add('gold-mode');
        btn.classList.add('active');
        btn.innerHTML = "🔙 GALASSIA"; // Tasto per tornare indietro

    } else {
        // --- USCIAMO DALLO ZOOM (Torniamo alla Galassia) ---
        isZoomedMode = false;

        // 1. Dobbiamo ritrovare l'indice "Step" più vicino alla data dove eravamo col pallino
        const currentTimestamp = parseInt(slider.value);

        // Cerchiamo nell'array timelineDates l'indice della data più vicina
        let closestIndex = 0;
        let minDiff = Infinity;

        timelineDates.forEach((date, index) => {
            const diff = Math.abs(date - currentTimestamp);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = index;
            }
        });

        // 2. Riconfiguriamo lo Slider per lavorare con gli STEP (Indici)
        slider.min = 0;
        slider.max = timelineDates.length - 1;
        slider.step = 1;
        slider.value = closestIndex;

        // 3. Rimuovi Effetti Grafici
        slider.classList.remove('gold-mode');
        btn.classList.remove('active');
        btn.innerHTML = "🔍 ZOOM";
    }

    // Aggiorna subito la visualizzazione
    updateTimeTravel();
}

function getRotationAngle(element) {
    const style = window.getComputedStyle(element);
    const matrix = style.transform || style.webkitTransform || style.mozTransform;
    if (!matrix || matrix === 'none') return 0;
    const values = matrix.split('(')[1].split(')')[0].split(',');
    return Math.atan2(parseFloat(values[1]), parseFloat(values[0]));
}

function processImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // Ridimensiona a max 300px per non appesantire il backup
                const maxWidth = 300;
                const scaleFactor = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scaleFactor;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                tempImageData = canvas.toDataURL('image/jpeg', 0.7);

                document.getElementById('previewImg').src = tempImageData;
                document.getElementById('imagePreviewContainer').style.display = 'block';
            };
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    tempImageData = null;
    document.getElementById('fileInput').value = "";
    document.getElementById('imagePreviewContainer').style.display = 'none';
}

function toggleCapsuleDate(checked) {
    const container = document.getElementById('capsuleDateContainer');
    container.style.display = checked ? 'block' : 'none';

    // Se attivato, imposta la data a domani come default
    if (checked && !document.getElementById('capsuleDateInput').value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('capsuleDateInput').value = tomorrow.toISOString().split('T')[0];
    }
}

// VARIABILI PER MODIFICA GRUPPI
let isGroupMode = false;
let editingConstellationId = null; // ID della costellazione che stiamo modificando (se null = nuova)
let selectedForGroup = []; // Array ID stelle

window.onload = function () {
    renderStars(); renderLines(); renderLabels(); renderList();
    checkTutorial(); setupSkyInteraction(); setupColorFilters();
};

function updateGalacticCore() {
    const disk = document.getElementById('accretionDisk');
    const textures = document.querySelectorAll('.ring-texture');

    if (!disk || textures.length === 0) return;

    // Default se vuoto
    if (memories.length === 0) {
        const emptyColor = 'rgba(255, 255, 255, 0.4)';
        disk.style.background = emptyColor;
        textures.forEach(t => {
            t.style.background = emptyColor;
            t.style.boxShadow = 'none';
        });
        return;
    }

    // Valori RGB
    const colorValues = {
        'white': { r: 255, g: 255, b: 255 },
        'red': { r: 255, g: 50, b: 50 },
        'blue': { r: 50, g: 100, b: 255 },
        'yellow': { r: 255, g: 220, b: 60 },
        'orange': { r: 255, g: 130, b: 0 }
    };

    let totalR = 0, totalG = 0, totalB = 0;
    memories.forEach(m => {
        const rgb = colorValues[m.color] || colorValues['white'];
        totalR += rgb.r;
        totalG += rgb.g;
        totalB += rgb.b;
    });

    const count = memories.length;
    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);
    const baseC = `${avgR}, ${avgG}, ${avgB}`;

    // --- QUI STA LA MAGIA DELLA ROTAZIONE VISIBILE ---

    // 1. CONFIGURAZIONE ANELLI (Gargantua - Orizzontali)
    const numStripesRing = 4; // <--- MODIFICA QUI IL NUMERO DI STRISCE! (es. 4, 6, 12...)

    let ringGradient = "conic-gradient(from 0deg, ";
    const stepRing = 360 / numStripesRing;

    for (let i = 0; i < numStripesRing; i++) {
        const start = i * stepRing;
        const end = start + stepRing;
        // Alterniamo Colore Pieno (start) -> Trasparente (mid) -> Colore Pieno (end)
        // Usiamo template literals per costruire la stringa
        ringGradient += `rgba(${baseC}, 1) ${start}deg, rgba(${baseC}, 0.1) ${start + (stepRing / 2)}deg, rgba(${baseC}, 1) ${end}deg, `;
    }
    ringGradient = ringGradient.slice(0, -2) + ")"; // Chiude la stringa

    // 2. CONFIGURAZIONE SFONDO (Alone - Verticale)
    const numStripesDisk = 4; // <--- MODIFICA QUI! (es. 1 per un fascio solo, 2 per due fasci...)

    let diskGradient = "conic-gradient(from 0deg, ";
    const stepDisk = 360 / numStripesDisk;

    for (let i = 0; i < numStripesDisk; i++) {
        const start = i * stepDisk;
        const end = start + stepDisk;
        diskGradient += `rgba(${baseC}, 0.8) ${start}deg, rgba(${baseC}, 0.05) ${start + (stepDisk / 2)}deg, rgba(${baseC}, 0.8) ${end}deg, `;
    }
    diskGradient = diskGradient.slice(0, -2) + ")";

    // --- APPLICAZIONE ---
    disk.style.background = diskGradient;

    textures.forEach(t => {
        t.style.background = ringGradient;
        t.style.boxShadow = `0 0 30px rgba(${baseC}, 0.6)`;
    });
}

// --- RENDER ---
function renderStars() {
    updateGalacticCore();
    const sky = document.getElementById('galaxy');
    // Rimuoviamo sia le stelle vecchie CHE le nebulose vecchie
    document.querySelectorAll('.star, .nebula-container').forEach(e => e.remove());

    const now = Date.now(); // Che ore sono adesso?

    memories.forEach(mem => {
        // CONTROLLO: Il ricordo è bloccato nel futuro?
        const isLocked = mem.unlockDate && mem.unlockDate > now;

        if (isLocked) {
            // --- DISEGNA UNA NEBULOSA ---
            const nebula = document.createElement('div');
            nebula.classList.add('nebula-container');
            nebula.id = 'star-' + mem.id; // Id utile per il sistema
            nebula.style.left = mem.x + '%';
            nebula.style.top = mem.y + '%';
            // Le nebulose sono un po' più grandi delle stelle finali
            const nebulaSize = mem.size * 4;
            nebula.style.width = nebulaSize + 'px';
            nebula.style.height = nebulaSize + 'px';

            // Mappa dei colori RGB per l'effetto gas
            const colorsRgb = { 'white': '255,255,255', 'red': '255,90,90', 'blue': '90,150,255', 'yellow': '255,230,90', 'orange': '255,160,50' };
            const baseRgb = colorsRgb[mem.color] || '255,255,255';

            // Creiamo 4 particelle di gas interne per dare volume
            for (let i = 0; i < 4; i++) {
                const p = document.createElement('div');
                p.classList.add('nebula-particle');
                p.style.backgroundColor = `rgba(${baseRgb}, 0.6)`;
                // Posizione leggermente casuale dentro il contenitore
                p.style.left = (Math.random() * 40 + 30) + '%';
                p.style.top = (Math.random() * 40 + 30) + '%';
                p.style.width = (mem.size * 2.5) + 'px';
                p.style.height = (mem.size * 2.5) + 'px';
                // Ritardo animazione casuale per non farle pulsare tutte insieme;
                p.style.animationDelay = (Math.random() * 3) + 's';
                nebula.appendChild(p);
            }

            // Click speciale per la nebulosa
            nebula.onclick = (e) => {
                e.stopPropagation();
                const openDate = new Date(mem.unlockDate).toLocaleDateString();
                alert(`✨ Questa stella si sta ancora formando.\n\nLa nebulosa diventerà una stella e svelerà il suo ricordo il giorno:\n${openDate}`);
            }

            sky.appendChild(nebula);

        } else {
            // --- DISEGNA UNA STELLA NORMALE (Codice classico) ---
            const star = document.createElement('div');
            star.classList.add('star', mem.color || 'white');
            if (mem.isFavorite) star.classList.add('favorite');
            star.id = 'star-' + mem.id;
            star.style.left = mem.x + '%'; star.style.top = mem.y + '%';
            star.style.width = mem.size + 'px'; star.style.height = mem.size + 'px';
            star.style.animationDelay = (Math.random() * 2) + 's';
            setupStarInteraction(star, mem);
            if (mem.image) {
                const sat = document.createElement('div');
                sat.className = 'satellite';
                // Se vuoi che il satellite abbia lo stesso colore della stella, scommenta questa riga:
                // sat.style.backgroundColor = getComputedStyle(star).backgroundColor; 
                star.appendChild(sat);
            }
            sky.appendChild(star);
        }
    });
    renderLines(); renderLabels(); updateSelectionVisuals(); updateTimelineRange(); updateTimeTravel();
}

function renderLines() {
    const svg = document.getElementById('constellationLayer');
    svg.innerHTML = '';
    lines.forEach((line, index) => {
        const s = memories.find(m => m.id === line.from);
        const e = memories.find(m => m.id === line.to);
        if (s && e) {
            const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            el.setAttribute('x1', s.x + '%'); el.setAttribute('y1', s.y + '%');
            el.setAttribute('x2', e.x + '%'); el.setAttribute('y2', e.y + '%');
            el.classList.add('constellation-line');
            el.dataset.from = line.from;
            el.dataset.to = line.to;

            el.onclick = () => { if (isEditing && !isGroupMode && confirm("Cancellare collegamento?")) { lines.splice(index, 1); saveData(); renderLines(); } };
            svg.appendChild(el);
        }
    });
}

function renderLabels() {
    const layer = document.getElementById('labelsLayer');

    // Lista degli ID che devono esistere in questo ciclo di disegno
    const activeLabelIds = [];

    constellations.filter(c => c.stars.length > 0).forEach((c) => {
        let totalX = 0, totalY = 0, count = 0;

        // Calcoliamo il centro geometrico della costellazione
        c.stars.forEach(sid => {
            const m = memories.find(x => x.id === sid);
            if (m) { totalX += m.x; totalY += m.y; count++; }
        });

        if (count > 0) {
            const posX = (totalX / count) + '%';
            const posY = (totalY / count) + '%';

            // Creiamo un ID unico per l'etichetta
            const labelId = 'label-' + c.id;
            activeLabelIds.push(labelId);

            // Cerchiamo se l'etichetta esiste già nel DOM (per non distruggerla)
            let label = document.getElementById(labelId);

            if (!label) {
                // SE NON ESISTE: La creiamo da zero
                label = document.createElement('div');
                label.id = labelId;
                label.className = 'constellation-label';
                label.innerText = c.name;

                // --- PUNTO CRUCIALE PER LA TIMELINE ---
                // Scriviamo dentro l'HTML quali stelle compongono questo gruppo.
                // Lo slider leggerà questo dato per sapere se nascondere il nome.
                label.dataset.stars = JSON.stringify(c.stars);
                // --------------------------------------

                // Click per modificare
                label.onclick = (e) => {
                    e.stopPropagation();
                    if (isEditing) {
                        if (isGroupMode) return;
                        startEditingConstellation(c);
                    }
                };
                layer.appendChild(label);
            } else {
                // SE ESISTE: Aggiorniamo solo i dati che possono cambiare
                if (label.innerText !== c.name) label.innerText = c.name;

                // Aggiorniamo sempre la lista stelle (magari ne hai aggiunta una nuova)
                label.dataset.stars = JSON.stringify(c.stars);
            }

            // Aggiorniamo la posizione (senza rompere l'animazione di rotazione)
            label.style.left = posX;
            label.style.top = posY;
        }
    });

    // PULIZIA: Rimuoviamo le etichette di gruppi che sono stati cancellati
    Array.from(layer.children).forEach(child => {
        if (!activeLabelIds.includes(child.id)) {
            child.remove();
        }
    });
}

// --- GESTIONE MODIFICA COSTELLAZIONI ---
function startEditingConstellation(constellation) {
    // Entriamo in modalità gruppo ma caricando i dati esistenti
    toggleGroupMode();
    editingConstellationId = constellation.id;
    selectedForGroup = [...constellation.stars]; // Copia le stelle

    // Aggiorna UI
    document.getElementById('instructionText').innerHTML = "Modifica: <b>" + constellation.name + "</b>";
    document.getElementById('groupStatus').innerHTML = selectedForGroup.length + " stelle selezionate";
    document.getElementById('btnGroupMode').style.display = 'none'; // Nascondi tasto crea
    document.getElementById('btnDeleteGroup').style.display = 'block'; // Mostra tasto elimina

    // Evidenzia visualmente
    updateSelectionVisuals();
}

function toggleGroupMode() {
    isGroupMode = true;
    editingConstellationId = null; // Di base è nuova
    selectedForGroup = [];

    document.getElementById('instructionText').innerHTML = "Modo: <b>Creazione Gruppo</b>";
    document.getElementById('groupStatus').innerHTML = "0 stelle selezionate";

    document.getElementById('btnGroupMode').style.display = 'none';
    document.getElementById('groupControls').style.display = 'block';
    document.getElementById('btnDeleteGroup').style.display = 'none';

    connectStartId = null;
    document.querySelectorAll('.star').forEach(s => s.classList.remove('selected-connect'));
}

function cancelGroupMode() {
    isGroupMode = false;
    editingConstellationId = null;
    selectedForGroup = [];

    document.getElementById('instructionText').innerHTML = "Modo: <b>Sposta/Collega</b><br><small>Clicca 2 stelle per unire.</small>";
    document.getElementById('btnGroupMode').style.display = 'block';
    document.getElementById('groupControls').style.display = 'none';

    updateSelectionVisuals();
}

function updateSelectionVisuals() {
    document.querySelectorAll('.star').forEach(s => {
        const id = parseInt(s.id.split('-')[1]);
        if (selectedForGroup.includes(id)) s.classList.add('selected-group');
        else s.classList.remove('selected-group');
    });
}

function saveConstellationName() {
    if (selectedForGroup.length < 1) { alert("Seleziona almeno una stella!"); return; }

    // Chiedi nome (precompilato se modifica)
    let defaultName = "";
    if (editingConstellationId) {
        const existing = constellations.find(c => c.id === editingConstellationId);
        if (existing) defaultName = existing.name;
    }

    const name = prompt("Nome della Costellazione:", defaultName);
    if (!name || name.trim() === "") return;

    // NUOVO: Chiedi se tracciare linee automatiche
    const autoLines = confirm("Vuoi unire automaticamente queste stelle con delle linee bianche?");

    if (editingConstellationId) {
        // AGGIORNA ESISTENTE
        const idx = constellations.findIndex(c => c.id === editingConstellationId);
        if (idx !== -1) {
            constellations[idx].name = name.trim();
            constellations[idx].stars = [...selectedForGroup];
        }
    } else {
        // CREA NUOVA
        constellations.push({
            id: Date.now(),
            name: name.trim(),
            stars: [...selectedForGroup]
        });
    }

    // LOGICA LINEE AUTOMATICHE (Collega in sequenza di array)
    if (autoLines && selectedForGroup.length > 1) {
        for (let i = 0; i < selectedForGroup.length - 1; i++) {
            const from = selectedForGroup[i];
            const to = selectedForGroup[i + 1];
            // Evita duplicati
            const exists = lines.some(l => (l.from === from && l.to === to) || (l.from === to && l.to === from));
            if (!exists) lines.push({ from, to });
        }
    }

    saveData();
    renderLabels();
    renderLines(); // Aggiorna linee
    cancelGroupMode();
}

function deleteCurrentGroup() {
    if (editingConstellationId && confirm("Eliminare questo nome? (Le stelle resteranno)")) {
        constellations = constellations.filter(c => c.id !== editingConstellationId);
        saveData();
        renderLabels();
        cancelGroupMode();
    }
}

// --- INTERAZIONE ---
function setupStarInteraction(starElement, memData) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    function startDrag(e) {
        if (!isEditing || isGroupMode) return;
        e.stopPropagation(); isDragging = true;
        const cX = e.clientX || e.touches[0].clientX; const cY = e.clientY || e.touches[0].clientY;
        startX = cX; startY = cY; initialLeft = memData.x; initialTop = memData.y;
        document.addEventListener('mousemove', moveDrag); document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('mouseup', stopDrag); document.addEventListener('touchend', stopDrag);
    }

    function moveDrag(e) {
        if (!isDragging) return;
        e.preventDefault();

        // 1. Coordinate attuali del mouse/dito
        const cX = e.clientX || e.touches[0].clientX;
        const cY = e.clientY || e.touches[0].clientY;

        // 2. Calcoliamo lo spostamento grezzo in pixel (DELTA)
        const rawDX = cX - startX;
        const rawDY = cY - startY;

        // 3. Otteniamo l'angolo attuale della galassia
        const galaxy = document.getElementById('galaxy');
        const angle = getRotationAngle(galaxy);

        // 4. MAGIA MATEMATICA: Contro-ruotiamo il movimento del mouse
        // Ruotiamo il vettore (rawDX, rawDY) dell'angolo opposto (-angle)
        const cos = Math.cos(-angle);
        const sin = Math.sin(-angle);

        const rotatedDX = rawDX * cos - rawDY * sin;
        const rotatedDY = rawDX * sin + rawDY * cos;

        // 5. Applichiamo lo zoom e convertiamo in percentuale
        // Usiamo i valori ruotati (rotatedDX/DY) invece di quelli grezzi
        memData.x = initialLeft + (((rotatedDX / currentZoom) / window.innerWidth) * 100);
        memData.y = initialTop + (((rotatedDY / currentZoom) / window.innerHeight) * 100);

        // 6. Applichiamo al CSS
        starElement.style.left = memData.x + '%';
        starElement.style.top = memData.y + '%';

        renderLines();
        renderLabels();
    }

    function stopDrag() { if (isDragging) { isDragging = false; document.removeEventListener('mousemove', moveDrag); document.removeEventListener('touchmove', moveDrag); document.removeEventListener('mouseup', stopDrag); document.removeEventListener('touchend', stopDrag); saveData(); } }

    starElement.addEventListener('mousedown', startDrag); starElement.addEventListener('touchstart', startDrag, { passive: false });

    starElement.onclick = (e) => {
        if (isEditing) {
            if (isGroupMode) {
                // LOGICA SELEZIONE GRUPPO
                const idx = selectedForGroup.indexOf(memData.id);
                if (idx === -1) {
                    selectedForGroup.push(memData.id); // Aggiunge
                } else {
                    selectedForGroup.splice(idx, 1); // Rimuove
                }
                updateSelectionVisuals();
                document.getElementById('groupStatus').innerHTML = selectedForGroup.length + " stelle selezionate";
            } else {
                // LOGICA CONNESSIONE LINEE (VECCHIA)
                if (connectStartId === null) {
                    connectStartId = memData.id; starElement.classList.add('selected-connect');
                } else {
                    if (connectStartId !== memData.id) {
                        const exists = lines.some(l => (l.from === connectStartId && l.to === memData.id) || (l.from === memData.id && l.to === connectStartId));
                        if (!exists) { lines.push({ from: connectStartId, to: memData.id }); saveData(); renderLines(); }
                    }
                    document.querySelectorAll('.star').forEach(s => s.classList.remove('selected-connect'));
                    connectStartId = null;
                }
            }
        } else {
            viewMemory(memData);
        }
    };
}

// Inizializza i filtri colore nella barra di ricerca
function setupColorFilters() {
    const container = document.getElementById('colorFilterContainer');
    container.innerHTML = ''; // Pulisci

    colorPalette.forEach(color => {
        const lens = document.createElement('div');
        lens.className = 'filter-lens';
        lens.style.backgroundColor = color;
        // Usiamo la variabile CSS currentColor per l'effetto alone
        lens.style.color = color;
        lens.dataset.color = color; // Memorizziamo il colore nel DOM

        lens.onclick = () => { toggleColorFilter(color, lens); };
        container.appendChild(lens);
    });
}

// Gestisce il click su una lente colorata
function toggleColorFilter(color, lensElement) {
    // 1. Gestione Stato
    if (selectedSearchColor === color) {
        // Se clicco sul colore già attivo -> LO DISATTIVO
        selectedSearchColor = null;
        lensElement.classList.remove('active');
    } else {
        // Se clicco su un colore nuovo -> LO ATTIVO
        selectedSearchColor = color;
        // Rimuovi 'active' da tutte le altre lenti
        document.querySelectorAll('.filter-lens').forEach(el => el.classList.remove('active'));
        // Aggiungi 'active' solo a quella cliccata
        lensElement.classList.add('active');
    }

    // 2. Lancia la ricerca immediatamente
    performSearch();
}

// --- SISTEMA UI E CORE ---
function toggleEditMode() {
    isEditing = !isEditing;
    const b = document.querySelector('.btn-edit');
    const p = document.getElementById('constellationPanel');
    if (isEditing) {
        document.body.classList.add('editing'); b.classList.add('active'); p.style.display = 'flex'; cancelGroupMode();
    } else {
        document.body.classList.remove('editing'); b.classList.remove('active'); p.style.display = 'none'; cancelGroupMode();
    }
}

function saveData() {
    localStorage.setItem(KEY_MEMORIES, JSON.stringify(memories));
    localStorage.setItem(KEY_LINES, JSON.stringify(lines));
    localStorage.setItem(KEY_LABELS, JSON.stringify(constellations));

    // 2. SALVATAGGIO CLOUD (Nuovo!)
    // Se l'utente è loggato, spediamo tutti e 3 i dati a Firebase
    if (window.currentUser) {
        window.saveToCloud(memories, lines, constellations);
    }
}

function exportData() {
    const data = { memories, lines, labels: constellations };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'backup_diario.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function importData(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const d = JSON.parse(e.target.result);
            if (d.memories && confirm("Sovrascrivere tutto?")) {
                memories = d.memories; lines = d.lines || []; constellations = d.labels || [];
                saveData(); location.reload();
            }
        } catch (err) { alert("File non valido"); }
    };
    reader.readAsText(file);
}

function saveEntry() {
    const t = document.getElementById('journalInput').value;
    if (!t.trim() && !tempImageData) return;

    if (isEditingExisting) {
        // --- MODALITÀ MODIFICA (Aggiorna stella esistente) ---
        const idx = memories.findIndex(x => x.id === currentMemoryId);
        if (idx !== -1) {
            memories[idx].text = t;
            memories[idx].color = selectedColor;
            memories[idx].image = tempImageData || null;
            // Non tocchiamo data, posizione (x, y) o lo stato di nebulosa!
        }
    } else {
        // --- MODALITÀ NUOVA STELLA (Il tuo codice originale) ---
        const now = new Date();
        const angle = Math.random() * Math.PI * 2;

        const safeRadiusPx = 150;
        let minPerc = (safeRadiusPx / window.innerWidth) * 100;
        const maxPerc = 45;

        if (minPerc > 40) minPerc = 42;

        const distance = minPerc + (Math.random() * (maxPerc - minPerc));

        let x = 50 + Math.cos(angle) * distance;
        let y = 50 + Math.sin(angle) * distance;

        if (window.innerHeight > window.innerWidth) {
            const ratio = window.innerWidth / window.innerHeight;
            y = 50 + (Math.sin(angle) * distance * ratio);
        }

        // --- LOGICA NEBULOSA ---
        let unlockTimestamp = null;
        const isCapsule = document.getElementById('capsuleCheckbox').checked;
        const dateValue = document.getElementById('capsuleDateInput').value;

        if (isCapsule && dateValue) {
            const unlockDate = new Date(dateValue);
            unlockDate.setHours(23, 59, 59);
            unlockTimestamp = unlockDate.getTime();
        }

        memories.push({
            id: Date.now(),
            text: t,
            date: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(),
            x, y,
            size: Math.random() * 3 + 2,
            color: selectedColor,
            isFavorite: false,
            image: tempImageData || null,
            unlockDate: unlockTimestamp
        });
    }

    // --- SALVATAGGIO E AGGIORNAMENTO GRAFICO (Comune a entrambe le modalità) ---
    saveData();
    closeWriter();
    renderStars();
    renderList();
    currentZoom = 1;
    panX = 0;
    panY = 0;
    updateSkyTransform();

    // --- RESET POST-MODIFICA ---
    isEditingExisting = false;
    document.querySelector('#entryModal .btn-save').innerText = "Accendi Stella";
}

function updateSkyTransform() { document.getElementById('sky').style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`; }
function zoomIn() { if (currentZoom < 3) { currentZoom += 0.2; updateSkyTransform(); } }
function zoomOut() { if (currentZoom > 0.5) { currentZoom -= 0.2; updateSkyTransform(); } }
window.addEventListener('wheel', function (e) {
    // 1. ELENCO ZONE SCORREVOLI
    // Inserisci qui gli ID o le classi dei pannelli dove vuoi lo scroll normale
    const scrollableSelectors = [
        '#sideMenu',    // Il Menu Laterale dei Ricordi
        '#memoryList',  // La lista specifica dentro il menu (per sicurezza)
        '#statsModal',  // Il Pannello Statistiche
        '.modal-content' // Classi generiche interne ai modali
    ];

    // 2. CONTROLLO "ZONA SICURA"
    // Verifica se il mouse è sopra uno di questi elementi (o un loro figlio)
    const isOverScrollable = scrollableSelectors.some(selector => e.target.closest(selector));

    // 3. DECISIONE
    if (isOverScrollable) {
        // Se siamo sopra un pannello, NON fare nulla.
        // Lascia che il browser gestisca lo scroll (NON chiamare preventDefault)
        return;
    }

    // 4. COMPORTAMENTO STANDARD (ZOOM UNIVERSO)
    // Se non siamo sopra un pannello, blocca lo scroll e zoomma
    e.preventDefault();

    if (e.deltaY < 0) zoomIn();
    else zoomOut();

}, { passive: false });
function setupSkyInteraction() {
    const c = document.getElementById('skyContainer');

    // Variabili per il Pinch-to-Zoom
    let initialPinchDistance = null;
    let initialZoom = null;

    // --- MOUSE (Rimane uguale) ---
    c.addEventListener('mousedown', e => {
        if (e.target.closest('.star') || e.target.tagName === 'BUTTON') return;
        isPanning = true;
        startPanX = e.clientX - panX;
        startPanY = e.clientY - panY;
        c.classList.add('grabbing');
    });

    window.addEventListener('mousemove', e => {
        if (!isPanning) return;
        e.preventDefault();
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        updateSkyTransform();
    });

    window.addEventListener('mouseup', () => {
        isPanning = false;
        c.classList.remove('grabbing');
    });

    // --- TOUCH (Modificato per gestire 1 o 2 dita) ---

    c.addEventListener('touchstart', e => {
        if (e.target.closest('.star') || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

        if (e.touches.length === 1) {
            // CASO 1: Un dito -> PAN (Spostamento)
            isPanning = true;
            startPanX = e.touches[0].clientX - panX;
            startPanY = e.touches[0].clientY - panY;
        }
        else if (e.touches.length === 2) {
            // CASO 2: Due dita -> ZOOM (Pinch)
            isPanning = false; // Fermiamo lo spostamento per evitare conflitti
            // Calcoliamo la distanza tra le due dita (Ipotenusa)
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            initialPinchDistance = dist;
            initialZoom = currentZoom; // Memorizziamo lo zoom di partenza
        }
    }, { passive: false });

    window.addEventListener('touchmove', e => {
        // --- 🚀 FIX TOUCH SCROLLING MENU ---
        // Se il dito si sta muovendo sopra un menu o un popup, LASCIA SCORRERE normalmente!
        const scrollableSelectors = ['#sideMenu', '#statsModal', '#viewModal', '#entryModal', '#constellationPanel'];
        if (scrollableSelectors.some(selector => e.target.closest(selector))) {
            return; // Esce e non blocca nulla
        }

        if (e.target.tagName === 'INPUT') return;

        // Se siamo nel cielo, blocca lo scroll della pagina
        e.preventDefault();

        if (e.touches.length === 1 && isPanning) {
            // LOGICA PAN (1 dito)
            panX = e.touches[0].clientX - startPanX;
            panY = e.touches[0].clientY - startPanY;
            updateSkyTransform();
        }
        else if (e.touches.length === 2 && initialPinchDistance) {
            // LOGICA ZOOM (2 dita)
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const pixelDiff = dist - initialPinchDistance;
            const zoomSpeed = 0.005;
            let newZoom = initialZoom + (pixelDiff * zoomSpeed);

            if (newZoom < 0.5) newZoom = 0.5;
            if (newZoom > 3.0) newZoom = 3.0;

            currentZoom = newZoom;
            updateSkyTransform();
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        // Se alziamo le dita, resettiamo tutto
        isPanning = false;
        initialPinchDistance = null;

        // Se rimane un dito sullo schermo, ricalcoliamo il pan per evitare scatti
        if (e.touches.length === 1) {
            isPanning = true;
            startPanX = e.touches[0].clientX - panX;
            startPanY = e.touches[0].clientY - panY;
        }
    });
}

function toggleMenu() { document.getElementById('sideMenu').classList.toggle('open'); }
function toggleMusic() { const m = document.getElementById('bgMusic'); const b = document.querySelector('.btn-music'); if (m.paused) { m.play(); b.innerHTML = '🎵'; b.style.borderColor = '#00ff00'; } else { m.pause(); b.innerHTML = '🔇'; b.style.borderColor = 'rgba(255,255,255,0.3)'; } }
// --- GESTIONE TASTO PAUSA ---
let isRotationLocked = false;

function toggleRotation() {
    isRotationLocked = !isRotationLocked;
    const btn = document.getElementById('btnRotation');

    if (isRotationLocked) {
        // BLOCCA TUTTO
        document.body.classList.add('manual-pause');
        btn.innerHTML = '▶️'; // Mostra icona Play per riprendere
        btn.classList.add('active-lock'); // Lo illumina di rosso
    } else {
        // SBLOCCA (Riprende la logica smart)
        document.body.classList.remove('manual-pause');
        btn.innerHTML = '⏸️'; // Mostra icona Pausa
        btn.classList.remove('active-lock');

        // Opzionale: simula un movimento mouse per riattivare il timer smart
        handleUserActivity();
    }
}
function openWriter() { document.getElementById('entryModal').style.display = 'flex'; }
function closeWriter() {
    document.getElementById('entryModal').style.display = 'none';
    document.getElementById('journalInput').value = '';
    removeImage();
    document.getElementById('capsuleCheckbox').checked = false;
    toggleCapsuleDate(false);
    document.getElementById('capsuleDateInput').value = '';

    // AGGIUNGI QUESTE DUE RIGHE ALLA FINE DI CLOSEWRITER:
    isEditingExisting = false;
    document.querySelector('#entryModal .btn-save').innerText = "Accendi Stella";
}

function openEditMode() {
    const m = memories.find(x => x.id === currentMemoryId);
    if (!m) return;

    isEditingExisting = true; // Attiviamo la modalità modifica

    // 1. Popoliamo il testo e il colore
    document.getElementById('journalInput').value = m.text;
    selectedColor = m.color;

    // 2. Selezioniamo visivamente il cerchietto del colore giusto
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
        // Usiamo il background come riferimento per trovare quello giusto
        if (opt.style.background.includes(m.color) || (m.color === 'white' && opt.style.background.includes('white'))) {
            opt.classList.add('selected');
        }
    });

    // 3. Gestiamo l'immagine (se presente, la mostriamo in preview)
    if (m.image) {
        tempImageData = m.image;
        document.getElementById('previewImg').src = m.image;
        document.getElementById('imagePreviewContainer').style.display = 'block';
    }

    // 4. Cambiamo il testo del bottone nel modale di scrittura
    document.querySelector('#entryModal .btn-save').innerText = "Aggiorna Stella";

    // 5. Chiudiamo il visualizzatore e apriamo lo scrittore
    closeViewer();
    openWriter();
}

function closeViewer() { document.getElementById('viewModal').style.display = 'none'; }
function selectColor(c, el) {
    selectedColor = c;

    // Rimuove la classe .selected e i vecchi bordi manuali da tutti
    document.querySelectorAll('.color-option').forEach(e => {
        e.classList.remove('selected');
        e.style.border = ''; // Importante: pulisce vecchi stili manuali
    });

    // Aggiunge la classe .selected a quello cliccato
    el.classList.add('selected');
}
function viewMemory(m) {
    currentMemoryId = m.id;
    document.getElementById('viewDate').innerText = m.date;
    document.getElementById('viewColorInfo').innerText = "Colore: " + m.color;

    // COSTRUZIONE CONTENUTO (Testo + Foto)
    const textBox = document.getElementById('viewText');
    let content = `<p style="white-space: pre-wrap;">${m.text}</p>`;

    if (m.image) {
        content += `
                    <div style="margin-top:15px; text-align:center;">
                        <img src="${m.image}" style="max-width:100%; max-height:300px; border:4px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.5); transform: rotate(-1deg); border-radius:2px;">
                    </div>`;
    }

    textBox.innerHTML = content; // Usa innerHTML per mostrare l'immagine

    const b = document.getElementById('btnFav');
    if (m.isFavorite) { b.innerText = '★ Preferito (Sì)'; } else { b.innerText = '☆ Aggiungi a Preferiti'; }

    document.getElementById('viewModal').style.display = 'flex';
}
function toggleFavorite() { const m = memories.find(x => x.id === currentMemoryId); if (m) { m.isFavorite = !m.isFavorite; saveData(); viewMemory(m); renderStars(); renderList(); } }
function deleteMemory() { if (confirm("Spegnere questa stella?")) { memories = memories.filter(x => x.id !== currentMemoryId); lines = lines.filter(l => l.from !== currentMemoryId && l.to !== currentMemoryId); constellations.forEach(c => { c.stars = c.stars.filter(id => id !== currentMemoryId) }); saveData(); closeViewer(); renderStars(); renderLines(); renderLabels(); renderList(); } }
function exportText() { let c = "IL MIO DIARIO STELLARE\n\n";[...memories].sort((a, b) => a.id - b.id).forEach(m => { c += `DATA: ${m.date}\nCOLORE: ${m.color}\n${m.text}\n------------------\n`; }); const b = new Blob([c], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'diario.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
function renderList() {
    const l = document.getElementById('memoryList');
    const f = document.getElementById('favList');
    if (!l || !f) return;

    l.innerHTML = '';
    f.innerHTML = '';

    [...memories].reverse().forEach(m => {
        const i = document.createElement('div');
        i.className = 'memory-item';

        // GESTIONE TESTO SICURA: Se non c'è testo, scrive "Ricordo visivo"
        const safeText = m.text ? m.text : "📸 Ricordo visivo...";
        const shortText = safeText.substring(0, 20) + (safeText.length > 20 ? "..." : "");

        i.innerHTML = `<span style="background:${m.color === 'red' ? '#ff5e5e' : m.color === 'blue' ? '#5eaaff' : m.color === 'yellow' ? '#ffea5e' : m.color === 'orange' ? '#ffaa33' : 'white'}; width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:8px; box-shadow: 0 0 5px currentColor;"></span> ${m.date.split(' ')[0]} - ${shortText}`;

        i.onclick = () => {
            currentZoom = 1; panX = 0; panY = 0; updateSkyTransform();
            viewMemory(m);
            setTimeout(() => {
                document.getElementById('star-' + m.id).classList.add('highlight');
                setTimeout(() => document.getElementById('star-' + m.id).classList.remove('highlight'), 2000);
            }, 300);
        };

        if (m.isFavorite) f.appendChild(i);
        else l.appendChild(i);
    });

    if (f.innerHTML === '') f.innerHTML = '<div style="font-size:12px; color:#666; padding:5px;">Nessun preferito</div>';
    if (l.innerHTML === '') l.innerHTML = '<div style="font-size:12px; color:#666; padding:5px;">Nessun ricordo nel cielo</div>';
}
// Crea i bottoni colorati (lenti) nel telescopio
function setupColorFilters() {
    const container = document.getElementById('colorFilterContainer');
    if (!container) return; // Sicurezza

    container.innerHTML = '';

    colorPalette.forEach(color => {
        const lens = document.createElement('div');
        lens.className = 'filter-lens';
        lens.style.backgroundColor = color === 'white' ? '#ddd' : color; // Il bianco lo facciamo grigetto per vederlo
        lens.style.color = color; // Serve per l'effetto alone

        // Gestione click
        lens.onclick = () => { toggleColorFilter(color, lens); };

        container.appendChild(lens);
    });
}

// Gestisce il click su una lente (Accende/Spegne il filtro)
function toggleColorFilter(color, lensElement) {
    if (selectedSearchColor === color) {
        // Disattiva
        selectedSearchColor = null;
        lensElement.classList.remove('active');
    } else {
        // Attiva
        selectedSearchColor = color;
        document.querySelectorAll('.filter-lens').forEach(el => el.classList.remove('active'));
        lensElement.classList.add('active');
    }
    // Avvia la ricerca subito
    performSearch();
}

// TUTORIAL NUOVO
const tutorialSteps = [
    { icon: "👋", title: "Benvenut*", text: "Nello spazio nessuno può sentire i tuoi pensieri, ma potrai vederli brillare. In questo spazio sicuro, ogni tuo pensiero diventa una stella. Il cielo si riempirà col tempo." },
    { icon: "🔍", title: "Navigazione", text: "Usa la rotellina (o i tasti + e -) per Zoomare. Clicca e trascina lo sfondo nero per spostarti ed esplorare il cielo." },
    { icon: "✒️", title: "Nuovo Ricordo", text: "Usa il tasto ✒️ in basso a destra per scrivere come ti senti. Puoi scegliere il colore della tua stella in base al tuo umore." },
    { icon: "☰", title: "I tuoi Ricordi", text: "Usa il menu Ricordi in alto a sinistra per rivedere tutti i tuoi pensieri ordinati o ritrovare i preferiti." },
    { icon: "✏️", title: "Costellazioni", text: "Clicca la matita. Puoi unire due stelle, oppure cliccare 'Crea Nuova Costellazione' per selezionare tante stelle e dare un nome unico." },
    { icon: "<span class='tutorial-bh-icon' style='transform: scale(2);'></span>", title: "Il Buco Nero", text: "Al centro della galassia trovi il buco nero il cui colore cambia adattandosi al colore generale delle stelle. Cliccaci per vedere le statistiche" },
    { icon: "🔭", title: "Telescopio", text: "Clicca sulla barra di ricerca e inserisci la o le parole chiave che vuoi cercare nelle note. Rimarranno accese solo le stelle che le contengono." },
    { icon: "🎵", title: "Atmosfera", text: "Usa l'icona in alto a destra per attivare la musica di sottofondo." }

];
let currentStep = 0;
function checkTutorial() {
    if (!localStorage.getItem(KEY_TUTORIAL)) { // Qui usa la variabile
        document.getElementById('tutorialModal').style.display = 'flex';
        showStep(0);
    }
}
function showStep(i) {
    currentStep = i;
    const s = tutorialSteps[i];

    // Uusa innerHTML per interpretare lo <span> e le emoji
    document.getElementById('tutIcon').innerHTML = s.icon;

    // Usa innerHTML per permettere formattazione nel titolo (opzionale, ma comodo)
    document.getElementById('tutTitle').innerHTML = s.title;

    // Usa innerHTML per interpretare <strong>, <br> e le icone nel testo
    document.getElementById('tutText').innerHTML = s.text;

    // Gestione bottoni (rimane uguale)
    document.getElementById('btnPrev').style.visibility = i === 0 ? 'hidden' : 'visible';
    document.getElementById('btnNext').innerText = i === tutorialSteps.length - 1 ? 'Inizia' : 'Avanti';
}
function nextStep() { if (currentStep < tutorialSteps.length - 1) showStep(currentStep + 1); else { document.getElementById('tutorialModal').style.display = 'none'; localStorage.setItem('tutorial_seen_v6', 'true'); } }
function prevStep() { if (currentStep > 0) showStep(currentStep - 1); }

// --- FUNZIONI STATISTICHE ---

function openStats() {
    document.getElementById('statsModal').style.display = 'flex';
    switchStatTab('time'); // Apre di default sul tempo
    renderTimeStats('all'); // Mostra "Sempre" di default
}

function switchStatTab(tab) {
    const tTime = document.getElementById('statTabTime');
    const tConst = document.getElementById('statTabConst');
    const bTime = document.getElementById('btnTabTime');
    const bConst = document.getElementById('btnTabConst');

    if (tab === 'time') {
        tTime.style.display = 'block'; tConst.style.display = 'none';
        bTime.classList.add('tab-active'); bConst.classList.remove('tab-active');
    } else {
        tTime.style.display = 'none'; tConst.style.display = 'block';
        bTime.classList.remove('tab-active'); bConst.classList.add('tab-active');
        renderConstStats();
    }
}

// CALCOLO STATISTICHE TEMPORALI
function renderTimeStats(period) {
    const now = new Date();
    let filtered = [];
    let title = "";

    if (period === 'all') {
        filtered = memories;
        title = "Statistiche: Sempre";
    } else if (period === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = memories.filter(m => {
            // Convertiamo la data italiana dd/mm/yyyy in oggetto Date
            const parts = m.date.split(' ')[0].split('/');
            const memDate = new Date(parts[2], parts[1] - 1, parts[0]);
            return memDate >= oneWeekAgo;
        });
        title = "Ultimi 7 Giorni";
    } else if (period === 'month') {
        filtered = memories.filter(m => {
            const parts = m.date.split(' ')[0].split('/');
            return parseInt(parts[1]) === (now.getMonth() + 1) && parseInt(parts[2]) === now.getFullYear();
        });
        title = "Questo Mese";
    } else if (period === 'year') {
        filtered = memories.filter(m => {
            const parts = m.date.split(' ')[0].split('/');
            return parseInt(parts[2]) === now.getFullYear();
        });
        title = "Anno " + now.getFullYear();
    }

    document.getElementById('statTimeTitle').innerText = title;
    drawPieChart(filtered, 'timePieChart', 'timeLegend');
}

// NUOVA FUNZIONE STATISTICHE COSTELLAZIONI (Dettagliata)
function renderConstStats() {
    const listDiv = document.getElementById('constListStats');
    listDiv.innerHTML = ''; // Pulisci lista

    if (constellations.length === 0) {
        listDiv.innerHTML = '<p style="text-align:center; color:#666;">Nessuna costellazione creata.</p>';
        return;
    }

    // Per ogni costellazione creiamo una scheda
    constellations.forEach((c, index) => {
        // Recupera le memorie di questa costellazione
        const cMemories = memories.filter(m => c.stars.includes(m.id));

        // Crea il contenitore della scheda
        const card = document.createElement('div');
        card.style.cssText = "background:rgba(255,255,255,0.05); padding:15px; border-radius:10px; border:1px solid #444;";

        // Genera ID unici per grafico e legenda
        const chartId = 'chart-const-' + index;
        const legendId = 'legend-const-' + index;

        // HTML interno della scheda
        card.innerHTML = `
                    <div style="font-size:16px; font-weight:bold; color:#00e5ff; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:5px;">
                        ${c.name} <span style="font-size:12px; color:#aaa; font-weight:normal;">(${c.stars.length} stelle)</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div id="${chartId}" style="width:80px; height:80px; border-radius:50%; flex-shrink:0; background:#333;"></div>
                        <div id="${legendId}" style="flex-grow:1; font-size:11px; display:flex; flex-direction:column; gap:3px;"></div>
                    </div>
                `;

        listDiv.appendChild(card);

        // Disegna il grafico specifico per questa costellazione
        drawPieChart(cMemories, chartId, legendId, true); // true = versione compatta
    });
}

// MOTORE GRAFICO (Generico)
function drawPieChart(dataArray, chartId, legendId, isCompact = false) {
    const chart = document.getElementById(chartId);
    const legend = document.getElementById(legendId);
    legend.innerHTML = '';

    if (!dataArray || dataArray.length === 0) {
        chart.style.background = '#333';
        legend.innerHTML = '<span style="color:#666">Nessun dato</span>';
        return;
    }

    // Conta i colori
    const counts = {};
    dataArray.forEach(m => {
        const c = m.color || 'white';
        counts[c] = (counts[c] || 0) + 1;
    });

    // MAPPA COLORI "PREFERITI" (Tonalità accese/centrali)
    const colorMap = {
        'white': '#ffffff',  // Bianco puro
        'red': '#ff0000',    // Rosso Supernova
        'blue': '#0055ff',   // Blu Elettrico
        'yellow': '#ffcc00', // Giallo Oro
        'orange': '#ff6600'  // Arancione Vivido
    };

    // Etichette (solo per versione grande)
    const labelMap = { 'white': 'Bianco', 'red': 'Rosso', 'blue': 'Blu', 'yellow': 'Giallo', 'orange': 'Arancione' };

    let gradientStr = "";
    let currentDeg = 0;
    const total = dataArray.length;

    for (const [color, count] of Object.entries(counts)) {
        const deg = (count / total) * 360;
        const cssColor = colorMap[color] || '#ccc';
        gradientStr += `${cssColor} ${currentDeg}deg ${currentDeg + deg}deg, `;

        const perc = Math.round((count / total) * 100);

        // Legenda Diversa se è Compatta (Costellazioni) o Full (Tempo)
        if (isCompact) {
            // Solo pallino e percentuale per risparmiare spazio
            legend.innerHTML += `
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${cssColor}; margin-right:5px;"></span>${perc}%</span>
                        </div>`;
        } else {
            // Legenda completa per tab Tempo
            legend.innerHTML += `
                        <div class="legend-item">
                            <div style="display:flex; align-items:center;">
                                <span class="legend-color" style="background:${cssColor}"></span>
                                <span>${labelMap[color] || color}</span>
                            </div>
                            <div><b>${count}</b> (${perc}%)</div>
                        </div>`;
        }
        currentDeg += deg;
    }

    chart.style.background = `conic-gradient(${gradientStr.slice(0, -2)})`;
}

// --- FUNZIONI TELESCOPIO (RICERCA) ---

function performSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.toLowerCase();
    const clearBtn = document.getElementById('clearSearch');

    // Mostra il tasto X se c'è testo O se c'è un colore selezionato
    if (query.length > 0 || selectedSearchColor !== null) {
        clearBtn.style.display = 'block';
        document.body.classList.add('searching');
    } else {
        resetSearch();
        return;
    }

    let foundCount = 0;
    const visibleStarIds = new Set();

    memories.forEach(mem => {
        const starEl = document.getElementById('star-' + mem.id);
        if (!starEl) return;

        // --- FILTRO TESTO ---
        const matchesText = query === '' || mem.text.toLowerCase().includes(query) || mem.date.includes(query);

        // --- FILTRO COLORE ---
        // Usiamo un confronto sicuro (gestisce anche il caso null)
        const matchesColor = selectedSearchColor === null || mem.color === selectedSearchColor;

        // --- RISULTATO ---
        if (matchesText && matchesColor) {
            // MOSTRA LA STELLA
            starEl.classList.remove('dimmed'); // Rimuove la classe che la nascondeva
            starEl.style.opacity = '1';        // Forza l'opacità al massimo
            starEl.style.pointerEvents = 'auto'; // La rende cliccabile

            // Effetto bagliore colorato
            starEl.style.boxShadow = `0 0 15px ${mem.color === 'white' ? 'white' : mem.color}`;

            visibleStarIds.add(mem.id);
            foundCount++;
        } else {
            // NASCONDI LA STELLA
            starEl.classList.add('dimmed');
            starEl.style.opacity = '0.05';
            starEl.style.pointerEvents = 'none';
            starEl.style.boxShadow = 'none';
        }
    });

    // Aggiorna contatore
    const counter = document.getElementById('searchCounter');
    counter.style.display = 'block';
    counter.innerText = foundCount === 0 ? "Nessun risultato" : `${foundCount} stelle trovate`;

    // Nascondi le linee che collegano stelle invisibili
    document.querySelectorAll('.constellation-line').forEach(line => {
        const from = parseInt(line.dataset.from);
        const to = parseInt(line.dataset.to);
        if (visibleStarIds.has(from) && visibleStarIds.has(to)) {
            line.style.opacity = '1';
        } else {
            line.style.opacity = '0';
        }
    });
}

function resetSearch() {
    const input = document.getElementById('searchInput');
    const counter = document.getElementById('searchCounter');
    const clearBtn = document.getElementById('clearSearch');

    // 1. Resetta le variabili
    input.value = '';
    selectedSearchColor = null;

    // 2. Nascondi UI di ricerca
    clearBtn.style.display = 'none';
    counter.style.display = 'none';
    document.body.classList.remove('searching');

    // 3. Spegni le lenti colorate
    document.querySelectorAll('.filter-lens').forEach(el => {
        el.classList.remove('active');
    });

    // 4. RESET BRUTALE DI TUTTE LE STELLE (Risolve il problema delle blu bloccate)
    // Usiamo querySelectorAll per prenderle tutte, anche quelle con ID duplicati
    const allStars = document.querySelectorAll('.star');
    allStars.forEach(el => {
        el.classList.remove('dimmed');
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.style.boxShadow = ''; // Rimuovi alone ricerca
        el.style.transform = ''; // Rimuovi ridimensionamento dimmed
        el.style.filter = '';    // Rimuovi bianco e nero
    });

    // 5. Resetta le linee
    document.querySelectorAll('.constellation-line').forEach(line => {
        line.style.opacity = '1';
        line.style.display = 'block';
    });

    // 6. IMPORTANTE: Rilancia il controllo Timeline
    // (Altrimenti il reset mostra anche le stelle future che dovrebbero essere nascoste!)
    if (typeof updateTimeTravel === 'function') {
        updateTimeTravel();
    }
}

// --- TIMELINE SLIDER (CODICE NUOVO) ---

let isTimelineOpen = false;

// Apre e chiude il cassetto su Mobile
function toggleTimelineMobile() {
    const wrapper = document.getElementById('timelineWrapper');
    isTimelineOpen = !isTimelineOpen;

    if (isTimelineOpen) {
        wrapper.classList.add('open');
    } else {
        wrapper.classList.remove('open');
    }
}

function updateTimelineRange() {
    const slider = document.getElementById('timeSlider');
    if (!memories || memories.length === 0) {
        slider.disabled = true;
        return;
    }

    // 1. Raccogliamo tutte le date uniche (ignorando l'ora)
    const uniqueDays = new Set();

    memories.forEach(m => {
        const d = new Date(m.id);
        d.setHours(0, 0, 0, 0); // Resetta l'orario a mezzanotte
        uniqueDays.add(d.getTime());
    });

    // 2. Aggiungiamo sempre la data di OGGI (per poter tornare al presente)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    uniqueDays.add(today.getTime());

    // 3. Convertiamo in array e ordiniamo dal più vecchio al più recente
    timelineDates = Array.from(uniqueDays).sort((a, b) => a - b);

    // 4. Configuriamo lo slider per avere tanti "scatti" quanti sono i giorni
    slider.disabled = false;
    slider.min = 0; // Primo indice (Giorno più vecchio)
    slider.max = timelineDates.length - 1; // Ultimo indice (Oggi)
    slider.step = 1; // Uno scatto alla volta
    slider.value = timelineDates.length - 1; // Parte sempre alla fine (Oggi)

    // Aggiorniamo la visualizzazione iniziale
    updateTimeTravel();
}

// Funzione chiamata quando muovi lo slider
function updateTimeTravel(val) {
    const slider = document.getElementById('timeSlider');
    const display = document.getElementById('timelineDateDisplay');

    if (val === undefined) val = slider.value;
    val = parseInt(val); // Assicuriamoci sia numero

    // Se non ci sono dati
    if (!timelineDates || timelineDates.length === 0) {
        display.innerText = "Nessun ricordo";
        return;
    }

    // --- CALCOLO DELLA DATA LIMITE ---
    let limitTimestamp;

    if (isZoomedMode) {
        // MODALITÀ ZOOM: Il valore dello slider È GIÀ un timestamp (ms)
        // Aggiungiamo 23:59:59 per vedere tutto quel giorno
        const d = new Date(val);
        d.setHours(23, 59, 59, 999);
        limitTimestamp = d.getTime();
    } else {
        // MODALITÀ GALASSIA: Il valore è un INDICE dell'array timelineDates
        const dateFromStep = timelineDates[val];
        const d = new Date(dateFromStep);
        d.setHours(23, 59, 59, 999);
        limitTimestamp = d.getTime();
    }

    // --- GESTIONE TESTO (CORRETTA) ---
    const checkDate = new Date(limitTimestamp);

    // 1. Creiamo due date "pure" (senza orario) per il confronto
    const todayPure = new Date();
    todayPure.setHours(0, 0, 0, 0); // Oggi a mezzanotte (00:00:00)

    const checkPure = new Date(checkDate);
    checkPure.setHours(0, 0, 0, 0); // La data selezionata a mezzanotte

    const dateString = checkDate.toLocaleDateString();
    let labelText = dateString; // Default: mostra solo la data

    // 2. Confrontiamo i giorni
    if (checkPure.getTime() > todayPure.getTime()) {
        // È STRETTAMENTE DOMANI O DOPO (Futuro)
        labelText = "🌑 ZONA IGNOTA";
        // Opzionale: fai tremare leggermente il testo o cambia colore
        display.style.color = "#666";
    }
    else if (checkPure.getTime() === todayPure.getTime()) {
        // È ESATTAMENTE OGGI
        labelText = `OGGI (${dateString})`;
        display.style.opacity = "1";
        // Ripristina i colori corretti in base alla modalità
        display.style.color = isZoomedMode ? '#ffd700' : '#00e5ff';
    }
    else {
        // È IL PASSATO
        labelText = dateString;
        display.style.opacity = "1";
        display.style.color = isZoomedMode ? '#ffd700' : '#00e5ff';
    }

    // Colore del testo: Ciano in Galaxy, Oro in Zoom
    display.style.color = isZoomedMode ? '#ffd700' : '#00e5ff';
    display.style.textShadow = isZoomedMode ? '0 0 10px #ffd700' : '0 0 5px #00e5ff';

    // --- FILTRO VISIBILITÀ (uguale a prima) ---
    let visibleCount = 0;
    const visibleStarIds = new Set();

    memories.forEach(mem => {
        const starEl = document.getElementById('star-' + mem.id);
        if (!starEl) return;

        starEl.style.transition = 'none';

        if (mem.id > limitTimestamp) {
            starEl.style.display = 'none';
            starEl.style.pointerEvents = 'none';
        } else {
            starEl.style.display = 'block';
            if (!starEl.classList.contains('dimmed')) {
                starEl.style.opacity = '1';
                starEl.style.pointerEvents = 'auto';
            }
            visibleStarIds.add(mem.id);
            visibleCount++;
        }
        setTimeout(() => { starEl.style.transition = ''; }, 0);
    });

    display.innerText = `${labelText} (${visibleCount})`;

    // Aggiorna Linee e Etichette (Uguale a prima)
    updateLinesVisibility(visibleStarIds); // Ho creato una funzione helper prima, o usa il codice esteso
    updateLabelsVisibility(visibleStarIds);
}

// Helper per pulizia codice (se non li hai già separati)
function updateLinesVisibility(visibleSet) {
    document.querySelectorAll('.constellation-line').forEach(line => {
        const from = parseInt(line.dataset.from);
        const to = parseInt(line.dataset.to);
        if (visibleSet.has(from) && visibleSet.has(to)) {
            line.style.display = 'block';
            if (line.style.opacity !== '0') line.style.opacity = '1';
        } else {
            line.style.display = 'none';
        }
    });
}

function updateLabelsVisibility(visibleSet) {
    document.querySelectorAll('.constellation-label').forEach(lbl => {
        const stars = JSON.parse(lbl.dataset.stars || "[]");
        if (stars.length > 0 && stars.every(id => visibleSet.has(id))) {
            lbl.style.display = 'block';
        } else {
            lbl.style.display = 'none';
        }
    });
}
// Funzione speciale per le linee durante il time travel
function renderLinesFiltered() {
    const svg = document.getElementById('constellationLayer');
    svg.innerHTML = '';

    lines.forEach((line) => {
        const sEl = document.getElementById('star-' + line.from);
        const eEl = document.getElementById('star-' + line.to);

        // Disegna la linea SOLO se entrambe le stelle NON sono nascoste
        if (sEl && eEl && !sEl.classList.contains('future-hidden') && !eEl.classList.contains('future-hidden')) {
            const s = memories.find(m => m.id === line.from);
            const e = memories.find(m => m.id === line.to);
            if (s && e) {
                const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                el.setAttribute('x1', s.x + '%'); el.setAttribute('y1', s.y + '%');
                el.setAttribute('x2', e.x + '%'); el.setAttribute('y2', e.y + '%');
                el.classList.add('constellation-line');
                // Mantieni il click per cancellare (opzionale in questa modalità)
                el.onclick = () => { if (isEditing && !isGroupMode && confirm("Cancellare collegamento?")) { lines = lines.filter(l => l !== line); saveData(); renderLines(); } };
                svg.appendChild(el);
            }
        }
    });
}

// --- GESTIONE ROTAZIONE SMART ---
let rotationTimer = null;
const interactionClass = 'user-interacting';

// Funzione per capire se c'è una finestra aperta (Modals)
function isAnyModalOpen() {
    const modals = [
        'entryModal',
        'viewModal',
        'statsModal',
        'tutorialModal',
        'constellationPanel' // Consideriamo anche il pannello modifica come "finestra"
    ];

    // Se anche solo uno di questi è visibile (display != none), ritorna VERO
    return modals.some(id => {
        const el = document.getElementById(id);
        return el && window.getComputedStyle(el).display !== 'none';
    });
}

function handleUserActivity() {
    // 1. L'utente si sta muovendo: PAUSA SUBITO
    document.body.classList.add(interactionClass);

    // 2. Resettiamo il timer precedente (se c'era)
    if (rotationTimer) clearTimeout(rotationTimer);

    // 3. Impostiamo il nuovo timer: se stai fermo per 2000ms (2 secondi)...
    rotationTimer = setTimeout(() => {
        // ...e SE non ci sono finestre aperte...
        if (!isAnyModalOpen()) {
            // ...ALLORA riprendi a girare (togli la classe)
            document.body.classList.remove(interactionClass);
        }
    }, 2000);
}

// Ascoltiamo il movimento del mouse su tutto lo schermo
window.addEventListener('mousemove', handleUserActivity);
window.addEventListener('touchstart', handleUserActivity, { passive: true });
window.addEventListener('click', handleUserActivity);
// Controllo extra: Se chiudo una finestra, voglio ripartire dopo 2 sec o subito?
// Per sicurezza, quando chiudi una finestra, il movimento del mouse riattiverà il ciclo.

// --- GESTIONE AUDIO BACKGROUND (VISIBILITY API) ---
document.addEventListener("visibilitychange", () => {
    const music = document.getElementById('bgMusic');
    const btn = document.querySelector('.btn-music');

    // Controlliamo se l'utente aveva ATTIVATO la musica
    // (Nel tuo codice, quando è attiva, il bottone ha il bordo verde o l'icona nota)
    const isMusicEnabledByUser = btn.innerHTML.includes('🎵');

    if (document.hidden) {
        // Se l'utente esce dall'app o cambia tab -> PAUSA FORZATA
        music.pause();
    } else {
        // Se l'utente torna nell'app -> RIPRENDI SOLO SE ERA ATTIVA
        if (isMusicEnabledByUser) {
            music.play().catch(e => console.log("Riproduzione automatica bloccata dal browser", e));
        }
    }
});

// --- GESTIONE STATO CONNESSIONE (ONLINE/OFFLINE) ---
function updateConnectionStatus() {
    const badge = document.getElementById('offlineBadge');
    if (navigator.onLine) {
        // È tornata la connessione
        badge.style.display = 'none';
    } else {
        // Connessione persa
        badge.style.display = 'block';
    }
}

// Ascolta i cambiamenti di rete in tempo reale
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// Controlla lo stato appena si apre l'app
window.addEventListener('load', updateConnectionStatus);

// ==========================================
// 2. ATTIVAZIONE SERVICE WORKER (OFFLINE)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('🌌 Maggiordomo Offline (SW) attivato!', reg.scope))
            .catch(err => console.log('❌ Errore Service Worker:', err));
    });
}