// Force refresh settings utility
// Run this in browser console to clear cached settings and force refresh

console.log('Clearing cached settings...');

// Clear localStorage
localStorage.clear();

// Clear sessionStorage  
sessionStorage.clear();

// Clear Redux store by reloading
console.log('Reloading page to refresh settings...');
window.location.reload();