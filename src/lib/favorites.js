// Utility functions for managing favorites in localStorage
export function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

export function addFavorite(property) {
    const favorites = getFavorites();
    if (!favorites.some(item => item.id === property.id)) {
        favorites.push(property);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

export function removeFavorite(id) {
    const favorites = getFavorites().filter(item => item.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
} 