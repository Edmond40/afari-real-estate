// Utility functions for managing viewing history in localStorage
export function getViewingHistory() {
    return JSON.parse(localStorage.getItem('viewingHistory')) || [];
}

export function addToViewingHistory(property) {
    let history = getViewingHistory();
    // Remove if already exists
    history = history.filter(item => item.id !== property.id);
    // Add to top with viewDate
    history.unshift({ ...property, viewDate: new Date().toLocaleDateString() });
    // Limit to last 20
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem('viewingHistory', JSON.stringify(history));
} 