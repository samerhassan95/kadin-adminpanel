// Refresh Settings Utility
// Paste this in browser console to force refresh settings

// Method 1: Reload the page (simplest)
console.log('Reloading page to refresh settings...');
window.location.reload();

// Method 2: If you want to try clearing Redux store first
// (uncomment the lines below and comment the reload above)
/*
console.log('Clearing Redux store and refreshing settings...');
if (window.store) {
    // Dispatch action to fetch fresh settings
    window.store.dispatch({type: 'settings/fetchSettings/pending'});
    
    // Clear current settings
    window.store.dispatch({
        type: 'settings/fetchSettings/fulfilled',
        payload: {data: []}
    });
    
    // Fetch fresh settings
    fetch('/api/v1/dashboard/admin/settings', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        window.store.dispatch({
            type: 'settings/fetchSettings/fulfilled',
            payload: data
        });
        console.log('Settings refreshed!');
    })
    .catch(err => {
        console.error('Failed to refresh settings:', err);
        window.location.reload();
    });
} else {
    console.log('Redux store not found, reloading page...');
    window.location.reload();
}
*/