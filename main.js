// Biji - Main JavaScript
// Simple note management with IndexedDB and Medical Profile

// Database configuration
const DB_NAME = 'BijiDB';
const DB_VERSION = 2; // Increased version for new structure
const NOTES_STORE = 'notes';
const MEDICAL_STORE = 'medical';
const AUTOSAVE_DELAY = 800; // ms after user stops typing

let db = null;
let currentNote = null;
let allNotes = [];
let filteredNotes = [];
let medicalProfile = {};
let isShowingMedical = false;
let autosaveTimer = null;
let isNewNoteExplicit = false;

// Medical profile field IDs
const MEDICAL_FIELDS = [
    'name', 'birthday', 'bloodtype', 'weight', 'height', 'bmi',
    'forbidden', 'bloodpressure', 'diabetes', 'vision', 'hearing',
    'medical', 'allergies', 'father', 'mother', 'siblings', 'children', 'languages'
];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Biji starting...');
    initDB();
    setupEventListeners();
});

// Initialize IndexedDB
function initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
        console.error('Database failed to open');
        showToast('Failed to open database', 'error');
    };
    
    request.onsuccess = () => {
        db = request.result;
        console.log('Database opened successfully');
        loadNotes();
        loadMedicalProfile();
    };
    
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        
        // Create notes store if it doesn't exist
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
            const notesStore = db.createObjectStore(NOTES_STORE, { 
                keyPath: 'id', 
                autoIncrement: true 
            });
            
            notesStore.createIndex('title', 'title', { unique: false });
            notesStore.createIndex('created', 'created', { unique: false });
            notesStore.createIndex('modified', 'modified', { unique: false });
        }
        
        // Create medical store if it doesn't exist
        if (!db.objectStoreNames.contains(MEDICAL_STORE)) {
            const medicalStore = db.createObjectStore(MEDICAL_STORE, { 
                keyPath: 'id' 
            });
        }
        
        console.log('Database setup complete');
    };
}

// Setup all event listeners
function setupEventListeners() {
    // Header buttons
    document.getElementById('newNoteBtn').addEventListener('click', openNewNote);
    document.getElementById('medicalProfileBtn').addEventListener('click', toggleMedicalProfile);
    
    // Medical profile buttons
    document.getElementById('editMedicalBtn')?.addEventListener('click', openMedicalEdit);
    document.getElementById('copyMedicalBtn')?.addEventListener('click', copyMedicalProfile);

    // Autosave on typing stop
    document.getElementById('noteTitleInput').addEventListener('input', scheduleAutosave);
    document.getElementById('noteContentInput').addEventListener('input', scheduleAutosave);
    
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterNotes(searchTerm);
    });
    
    // Note Modal buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('saveBtn').addEventListener('click', saveNote);
    document.getElementById('deleteBtn').addEventListener('click', deleteNote);
    
    // Medical Modal buttons
    document.getElementById('closeMedicalModalBtn').addEventListener('click', closeMedicalModal);
    document.getElementById('cancelMedicalBtn').addEventListener('click', closeMedicalModal);
    document.getElementById('saveMedicalBtn').addEventListener('click', saveMedicalProfile);
    
    // Modal backdrop click
    document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    document.querySelectorAll('.modal-backdrop')[1]?.addEventListener('click', closeMedicalModal);
    
    // Character/word counter for notes
    const contentInput = document.getElementById('noteContentInput');
    contentInput.addEventListener('input', updateCounters);
    
    // BMI calculation
    document.getElementById('medical-weight')?.addEventListener('input', calculateBMI);
    document.getElementById('medical-height')?.addEventListener('input', calculateBMI);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N: New note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openNewNote();
        }
        
        // Ctrl/Cmd + M: Medical profile
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            toggleMedicalProfile();
        }
        
        // Escape: Close modal
        if (e.key === 'Escape') {
            const noteModal = document.getElementById('noteModal');
            const medicalModal = document.getElementById('medicalModal');
            if (noteModal.classList.contains('active')) {
                closeModal();
            }
            if (medicalModal.classList.contains('active')) {
                closeMedicalModal();
            }
        }
    });
}

// Toggle medical profile view
function toggleMedicalProfile() {
    const medicalBtn = document.getElementById('medicalProfileBtn');
    const notesGrid = document.getElementById('notesGrid');
    const medicalView = document.getElementById('medicalProfileView');
    const emptyState = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');
    
    isShowingMedical = !isShowingMedical;
    
    if (isShowingMedical) {
        // Show medical profile
        medicalBtn.classList.add('active');
        notesGrid.style.display = 'none';
        medicalView.style.display = 'block';
        emptyState.classList.remove('active');
        noResults.classList.remove('active');
        
        // Clear search
        document.getElementById('searchInput').value = '';
        
        // Update stats to show medical view
        document.getElementById('totalNotes').textContent = '1';
        document.getElementById('filteredNotes').textContent = '1';
        
        // Display medical profile data
        displayMedicalProfile();
    } else {
        // Show notes
        medicalBtn.classList.remove('active');
        notesGrid.style.display = 'grid';
        medicalView.style.display = 'none';
        
        // Restore normal notes view
        renderNotes();
        updateStats();
    }
}

// Load medical profile from IndexedDB
function loadMedicalProfile() {
    const transaction = db.transaction([MEDICAL_STORE], 'readonly');
    const objectStore = transaction.objectStore(MEDICAL_STORE);
    const request = objectStore.get('profile');
    
    request.onsuccess = () => {
        if (request.result) {
            medicalProfile = request.result.data || {};
        } else {
            medicalProfile = {};
        }
        console.log('Medical profile loaded', medicalProfile);
    };
    
    request.onerror = () => {
        console.error('Failed to load medical profile');
        medicalProfile = {};
    };
}

// Display medical profile
function displayMedicalProfile() {
    MEDICAL_FIELDS.forEach(field => {
        const element = document.getElementById(`field-${field}`);
        if (element) {
            const value = medicalProfile[field] || '';
            element.textContent = value || '(not set)';
            element.style.color = value ? 'var(--text)' : 'var(--text-secondary)';
        }
    });
}

// Open medical edit modal
function openMedicalEdit() {
    const modal = document.getElementById('medicalModal');
    modal.classList.add('active');
    
    // Load current values into form
    MEDICAL_FIELDS.forEach(field => {
        const input = document.getElementById(`medical-${field}`);
        if (input) {
            input.value = medicalProfile[field] || '';
        }
    });
    
    // Calculate BMI if weight and height exist
    calculateBMI();
}

// Close medical modal
function closeMedicalModal() {
    const modal = document.getElementById('medicalModal');
    modal.classList.remove('active');
}

// Save medical profile
function saveMedicalProfile() {
    // Collect all field values
    const newProfile = {};
    MEDICAL_FIELDS.forEach(field => {
        const input = document.getElementById(`medical-${field}`);
        if (input) {
            newProfile[field] = input.value.trim();
        }
    });
    
    // Save to IndexedDB
    const transaction = db.transaction([MEDICAL_STORE], 'readwrite');
    const objectStore = transaction.objectStore(MEDICAL_STORE);
    const request = objectStore.put({
        id: 'profile',
        data: newProfile,
        modified: Date.now()
    });
    
    request.onsuccess = () => {
        medicalProfile = newProfile;
        displayMedicalProfile();
        closeMedicalModal();
        showToast('Medical profile saved', 'success');
    };
    
    request.onerror = () => {
        console.error('Failed to save medical profile');
        showToast('Failed to save medical profile', 'error');
    };
}

// Calculate BMI
function calculateBMI() {
    const weightInput = document.getElementById('medical-weight');
    const heightInput = document.getElementById('medical-height');
    const bmiInput = document.getElementById('medical-bmi');
    
    if (weightInput && heightInput && bmiInput) {
        const weight = parseFloat(weightInput.value);
        const heightCm = parseFloat(heightInput.value);
        
        if (weight > 0 && heightCm > 0) {
            const heightM = heightCm / 100;
            const bmi = (weight / (heightM * heightM)).toFixed(2);
            bmiInput.value = bmi;
        } else {
            bmiInput.value = '';
        }
    }
}

// Copy medical profile to clipboard
function copyMedicalProfile() {
    let text = '筆記 (Medical Profile)\n';
    text += '='.repeat(30) + '\n\n';
    
    MEDICAL_FIELDS.forEach(field => {
        const label = document.querySelector(`#medicalProfileView label[for="field-${field}"]`)?.textContent || field;
        const value = medicalProfile[field] || '(not set)';
        text += `${label} ${value}\n`;
    });
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Medical profile copied to clipboard', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Medical profile copied to clipboard', 'success');
    });
}

// Load all notes from IndexedDB
function loadNotes() {
    const transaction = db.transaction([NOTES_STORE], 'readonly');
    const objectStore = transaction.objectStore(NOTES_STORE);
    const request = objectStore.getAll();
    
    request.onsuccess = () => {
        allNotes = request.result.sort((a, b) => b.modified - a.modified);
        filteredNotes = allNotes;
        
        // Only render if not showing medical profile
        if (!isShowingMedical) {
            renderNotes();
            updateStats();
        }
        
        console.log(`Loaded ${allNotes.length} notes`);
    };
    
    request.onerror = () => {
        console.error('Failed to load notes');
        showToast('Failed to load notes', 'error');
    };
}

// Render notes to the grid
function renderNotes() {
    const grid = document.getElementById('notesGrid');
    const emptyState = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');
    
    // Clear grid
    grid.innerHTML = '';
    
    // Handle empty states
    if (allNotes.length === 0) {
        emptyState.classList.add('active');
        noResults.classList.remove('active');
        return;
    } else {
        emptyState.classList.remove('active');
    }
    
    if (filteredNotes.length === 0) {
        noResults.classList.add('active');
        return;
    } else {
        noResults.classList.remove('active');
    }
    
    // Get search term for highlighting
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    // Render each note
    filteredNotes.forEach(note => {
        const card = createNoteCard(note, searchTerm);
        grid.appendChild(card);
    });
}

// Create a note card element
function createNoteCard(note, searchTerm = '') {
    const template = document.getElementById('noteCardTemplate');
    const card = template.content.cloneNode(true);
    
    // Set title with highlighting
    const titleElement = card.querySelector('.note-title');
    titleElement.textContent = note.title || 'Untitled';
    
    // Set content preview with highlighting
    const contentElement = card.querySelector('.note-content');
    const contentPreview = note.content.substring(0, 200);
    contentElement.textContent = contentPreview + (note.content.length > 200 ? '...' : '');
    
    // Highlight search term if present
    if (searchTerm) {
        highlightText(titleElement, searchTerm);
        highlightText(contentElement, searchTerm);
    }
    
    // Set date
    const dateElement = card.querySelector('.note-date');
    dateElement.textContent = formatDate(note.modified);
    
    // Setup copy button
    card.querySelector('.note-copy').addEventListener('click', (e) => {
        e.stopPropagation();
        copyNoteToClipboard(note);
    });
    
    // Setup edit button
    card.querySelector('.note-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditNote(note);
    });
    
    // Setup delete button
    card.querySelector('.note-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this note?')) {
            deleteNoteById(note.id);
        }
    });
    
    // Click on card to edit
    card.querySelector('.note-card').addEventListener('click', () => {
        openEditNote(note);
    });
    
    return card;
}

// Highlight search term in text
function highlightText(element, searchTerm) {
    if (!searchTerm) return;
    
    const text = element.textContent;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    
    if (regex.test(text)) {
        element.innerHTML = text.replace(regex, '<span class="highlight">$1</span>');
    }
}

// Filter notes based on search term
function filterNotes(searchTerm) {
    // Exit medical view if searching
    if (isShowingMedical && searchTerm) {
        toggleMedicalProfile();
    }
    
    if (!searchTerm) {
        filteredNotes = allNotes;
    } else {
        filteredNotes = allNotes.filter(note => {
            const title = (note.title || '').toLowerCase();
            const content = (note.content || '').toLowerCase();
            return title.includes(searchTerm) || content.includes(searchTerm);
        });
    }
    
    renderNotes();
    updateStats();
}

// Open new note modal
function openNewNote() {
    // Exit medical view if creating new note
    if (isShowingMedical) {
        toggleMedicalProfile();
    }
    
    currentNote = null;
    isNewNoteExplicit = true;
    
    document.getElementById('modalTitle').textContent = 'New Note';
    document.getElementById('noteTitleInput').value = '';
    document.getElementById('noteContentInput').value = '';
    document.getElementById('deleteBtn').style.display = 'none';
    
    updateCounters();
    
    const modal = document.getElementById('noteModal');
    modal.classList.add('active');
    
    // Focus on title input
    setTimeout(() => {
        document.getElementById('noteTitleInput').focus();
    }, 100);
}

// Open edit note modal
function openEditNote(note) {
    // Set immediately to prevent autosave creating new note
    currentNote = { ...note };
    
    document.getElementById('modalTitle').textContent = 'Edit Note';
    document.getElementById('noteTitleInput').value = note.title || '';
    document.getElementById('noteContentInput').value = note.content || '';
    document.getElementById('deleteBtn').style.display = 'block';
    
    updateCounters();
    
    const modal = document.getElementById('noteModal');
    modal.classList.add('active');
    
    // Focus on content if title exists
    setTimeout(() => {
        if (note.title) {
            document.getElementById('noteContentInput').focus();
        } else {
            document.getElementById('noteTitleInput').focus();
        }
    }, 100);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('noteModal');
    modal.classList.remove('active');
    currentNote = null;
    clearTimeout(autosaveTimer);
    performAutosave();
}

// Save note
function saveNote() {
    const title = document.getElementById('noteTitleInput').value.trim();
    const content = document.getElementById('noteContentInput').value.trim();
    
    if (!title && !content) {
        showToast('Note cannot be empty', 'error');
        return;
    }
    
    const note = {
        title: title || 'Untitled',
        content: content || '',
        modified: Date.now()
    };
    
    if (currentNote) {
        // Update existing note
        note.id = currentNote.id;
        note.created = currentNote.created;
        
        const transaction = db.transaction([NOTES_STORE], 'readwrite');
        const objectStore = transaction.objectStore(NOTES_STORE);
        const request = objectStore.put(note);
        
        request.onsuccess = () => {
            console.log('Note updated');
            showToast('Note updated', 'success');
            loadNotes();
            closeModal();
        };
        
        request.onerror = () => {
            console.error('Failed to update note');
            showToast('Failed to update note', 'error');
        };
    } else {
        // Create new note
        note.created = Date.now();
        
        const transaction = db.transaction([NOTES_STORE], 'readwrite');
        const objectStore = transaction.objectStore(NOTES_STORE);
        const request = objectStore.add(note);
        
        request.onsuccess = () => {
            console.log('Note created');
            showToast('Note created', 'success');
            loadNotes();
            closeModal();
        };
        
        request.onerror = () => {
            console.error('Failed to create note');
            showToast('Failed to create note', 'error');
        };
    }
}

// Delete current note
function deleteNote() {
    if (!currentNote) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        deleteNoteById(currentNote.id);
        closeModal();
    }
}

// Delete note by ID
function deleteNoteById(id) {
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const objectStore = transaction.objectStore(NOTES_STORE);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => {
        console.log('Note deleted');
        showToast('Note deleted', 'success');
        loadNotes();
    };
    
    request.onerror = () => {
        console.error('Failed to delete note');
        showToast('Failed to delete note', 'error');
    };
}

// Copy note to clipboard
function copyNoteToClipboard(note) {
    const text = `${note.title}\n\n${note.content}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard', 'success');
    });
}

// Update character and word counters
function updateCounters() {
    const content = document.getElementById('noteContentInput').value;
    
    // Character count
    document.getElementById('charCount').textContent = content.length;
    
    // Word count
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    document.getElementById('wordCount').textContent = words;
}

// Update statistics
function updateStats() {
    if (isShowingMedical) {
        // Medical view stats
        document.getElementById('totalNotes').textContent = '1';
        document.getElementById('filteredNotes').textContent = '1';
    } else {
        // Normal notes stats
        document.getElementById('totalNotes').textContent = allNotes.length;
        document.getElementById('filteredNotes').textContent = filteredNotes.length;
    }
    
    // Storage used (rough estimate)
    const notesSize = JSON.stringify(allNotes).length;
    const medicalSize = JSON.stringify(medicalProfile).length;
    const totalSize = notesSize + medicalSize;
    const storageKB = (totalSize / 1024).toFixed(1);
    document.getElementById('storageUsed').textContent = `${storageKB} KB`;
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // Today
        return `Today at ${date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        })}`;
    } else if (diffDays === 1) {
        // Yesterday
        return 'Yesterday';
    } else if (diffDays < 7) {
        // This week
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
        // Older
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Autosave Scheduler
function scheduleAutosave() {
    if (!document.getElementById('noteModal').classList.contains('active')) return;

    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
        performAutosave();
    }, AUTOSAVE_DELAY);
}

//Perform autosave

function performAutosave() {
    const title = document.getElementById('noteTitleInput').value.trim();
    const content = document.getElementById('noteContentInput').value.trim();

    // Skip empty drafts
    if (!title && !content) return;

    const note = {
        title: title || 'Untitled',
        content: content || '',
        modified: Date.now()
    };

    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);

    if (!currentNote && !isNewNoteExplicit) {
        return; // block double creation
    }
    
    if (!currentNote && isNewNoteExplicit) {
        // real creation so allow creation
        note.created = Date.now();
        const request = store.add(note);
        request.onsuccess = () => {
            note.id = request.result;
            currentNote = note;
            document.getElementById('deleteBtn').style.display = 'block';
        };
    } else {
        // update
        note.id = currentNote.id;
        note.created = currentNote.created;
        store.put(note);
    }


    // Silent refresh in background
    transaction.oncomplete = () => loadNotes();
}



// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    }[type] || 'ℹ️';
    
    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

console.log('✨ Biji ready!');


