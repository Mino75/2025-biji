// Biji - Main JavaScript
// Simple note management with IndexedDB

// Database configuration
const DB_NAME = 'BijiDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

let db = null;
let currentNote = null;
let allNotes = [];
let filteredNotes = [];

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
    };
    
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = db.createObjectStore(STORE_NAME, { 
                keyPath: 'id', 
                autoIncrement: true 
            });
            
            objectStore.createIndex('title', 'title', { unique: false });
            objectStore.createIndex('created', 'created', { unique: false });
            objectStore.createIndex('modified', 'modified', { unique: false });
            
            console.log('Database setup complete');
        }
    };
}

// Setup all event listeners
function setupEventListeners() {
    // Header buttons
    document.getElementById('newNoteBtn').addEventListener('click', openNewNote);
    
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterNotes(searchTerm);
    });
    
    // Modal buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('saveBtn').addEventListener('click', saveNote);
    document.getElementById('deleteBtn').addEventListener('click', deleteNote);
    
    // Modal backdrop click
    document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    
    // Character/word counter
    const contentInput = document.getElementById('noteContentInput');
    contentInput.addEventListener('input', updateCounters);
    
    // Clear all data
    document.getElementById('clearAllBtn').addEventListener('click', clearAllData);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N: New note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openNewNote();
        }
        
        // Escape: Close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('noteModal');
            if (modal.classList.contains('active')) {
                closeModal();
            }
        }
    });
}

// Load all notes from IndexedDB
function loadNotes() {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();
    
    request.onsuccess = () => {
        allNotes = request.result.sort((a, b) => b.modified - a.modified);
        filteredNotes = allNotes;
        renderNotes();
        updateStats();
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
    currentNote = null;
    
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
    currentNote = note;
    
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
        
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
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
        
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
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
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
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
    // Total notes
    document.getElementById('totalNotes').textContent = allNotes.length;
    
    // Filtered notes
    document.getElementById('filteredNotes').textContent = filteredNotes.length;
    
    // Storage used (rough estimate)
    const storageUsed = JSON.stringify(allNotes).length;
    const storageKB = (storageUsed / 1024).toFixed(1);
    document.getElementById('storageUsed').textContent = `${storageKB} KB`;
}

// Clear all data
function clearAllData() {
    if (confirm('This will delete ALL your notes. Are you sure?')) {
        if (confirm('This action cannot be undone. Delete everything?')) {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.clear();
            
            request.onsuccess = () => {
                console.log('All data cleared');
                showToast('All data cleared', 'info');
                allNotes = [];
                filteredNotes = [];
                renderNotes();
                updateStats();
            };
            
            request.onerror = () => {
                console.error('Failed to clear data');
                showToast('Failed to clear data', 'error');
            };
        }
    }
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
