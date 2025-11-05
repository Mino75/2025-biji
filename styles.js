// Biji - Styles Module
// All CSS styles for the note manager

// Define preset background colors and pick one randomly
const backgroundOptions = ['#FF8F00', '#D32F2F', '#388E3C', '#1976D2', '#7B1FA2'];
const selectedBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];

const styles = `
/* Reset and Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #5b21b6;
    --primary-dark: #4c1d95;
    --primary-light: #7c3aed;
    --secondary: #0891b2;
    --danger: #dc2626;
    --success: #16a34a;
    --warning: #d97706;
    
    --bg: #f9fafb;
    --surface: #ffffff;
    --text: #111827;
    --text-secondary: #6b7280;
    --border: #e5e7eb;
    
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    
    --radius: 0.5rem;
    --transition: all 0.2s ease;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
}

.app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Header */
.header {
    background: var(--surface);
    background-color: ${selectedBackground};
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.brand-icon {
    font-size: 2rem;
}

.brand-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
}

.brand-tagline {
    color: white;
    font-size: 0.875rem;
}

/* Search */
.search-container {
    flex: 1;
    min-width: 200px;
    max-width: 500px;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid var(--border);
    border-radius: var(--radius);
    font-size: 1rem;
    transition: var(--transition);
}

.search-input:focus {
    outline: none;
    border-color: var(--primary);
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: var(--radius);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.btn-primary {
    background: var(--primary);
    color: white;
}

.btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow);
}

.btn-secondary {
    background: var(--surface);
    color: var(--text);
    border: 2px solid var(--border);
}

.btn-secondary:hover {
    background: var(--bg);
}

.btn-danger {
    background: var(--danger);
    color: white;
}

.btn-danger:hover {
    background: #b91c1c;
}

.btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

/* Main Content */
.main {
    flex: 1;
    padding: 2rem 1rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

/* Stats Bar */
.stats-bar {
    display: flex;
    gap: 2rem;
    padding: 1rem;
    background: var(--surface);
    border-radius: var(--radius);
    margin-bottom: 2rem;
    box-shadow: var(--shadow-sm);
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stat-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.stat-value {
    font-weight: 600;
    color: var(--primary);
}

/* Notes Grid */
.notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

/* Note Card */
.note-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 250px;
}

.note-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.note-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.note-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    flex: 1;
}

.note-copy {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0.5;
    transition: var(--transition);
}

.note-copy:hover {
    opacity: 1;
    transform: scale(1.1);
}

.note-content {
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    flex: 1;
    line-height: 1.5;
    white-space: pre-wrap;
}

.note-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 1rem;
}

.note-date {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.note-actions {
    display: flex;
    gap: 0.5rem;
}

.note-edit,
.note-delete {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0.5;
    transition: var(--transition);
}

.note-edit:hover,
.note-delete:hover {
    opacity: 1;
    transform: scale(1.1);
}

/* Empty State */
.empty-state,
.no-results {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    text-align: center;
}

.empty-state.active,
.no-results.active {
    display: flex;
}

.empty-icon,
.no-results-icon {
    font-size: 4rem;
    opacity: 0.5;
    margin-bottom: 1rem;
}

.empty-state h2,
.no-results h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.empty-state p,
.no-results p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
}

.modal.active {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    background: var(--surface);
    border-radius: var(--radius);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
}

.modal-header h2 {
    font-size: 1.5rem;
    color: var(--primary);
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    transition: var(--transition);
}

.modal-close:hover {
    color: var(--text);
}

.modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text);
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border);
    border-radius: var(--radius);
    font-size: 1rem;
    font-family: inherit;
    transition: var(--transition);
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--primary);
}

.form-textarea {
    resize: vertical;
    min-height: 200px;
}

.form-footer {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: var(--bg);
    border-radius: var(--radius);
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid var(--border);
}

/* Footer */
.footer {
    background: var(--surface);
    background-color: ${selectedBackground};
    border-top: 1px solid var(--border);
    padding: 1rem;
    margin-top: auto;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.footer-content span {
    color: white;
    font-size: 0.875rem;
}

/* Toast */
.toast-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 2000;
}

.toast {
    background: var(--surface);
    padding: 1rem 1.5rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.toast.success {
    border-left: 4px solid var(--success);
}

.toast.error {
    border-left: 4px solid var(--danger);
}

.toast.info {
    border-left: 4px solid var(--secondary);
}

/* Responsive */
@media (max-width: 768px) {
    .header-container {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }
    
    .search-container {
        max-width: 100%;
    }
    
    .stats-bar {
        flex-direction: column;
        gap: 1rem;
    }
    
    .notes-grid {
        grid-template-columns: 1fr;
    }
    
    .modal-content {
        width: 95%;
        margin: 1rem;
    }
    
    .footer-content {
        flex-direction: column;
        text-align: center;
    }
    
    .toast-container {
        left: 1rem;
        right: 1rem;
        bottom: 1rem;
    }
}

/* Highlight for search results */
.highlight {
    background-color: #fef3c7;
    padding: 0 2px;
    border-radius: 2px;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

console.log('✨ Biji styles loaded');