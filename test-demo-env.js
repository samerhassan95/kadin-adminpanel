// Test Demo Environment Variable
// Paste this in browser console to check environment variables

console.log('=== Demo Mode Environment Test ===');
console.log('REACT_APP_IS_DEMO:', process.env.REACT_APP_IS_DEMO);
console.log('Type:', typeof process.env.REACT_APP_IS_DEMO);
console.log('Is "true"?:', process.env.REACT_APP_IS_DEMO === 'true');
console.log('Is "false"?:', process.env.REACT_APP_IS_DEMO === 'false');

// Check if Redux store has settings
if (window.store) {
    const state = window.store.getState();
    console.log('Redux settings:', state.globalSettings?.settings);
    console.log('Redux is_demo:', state.globalSettings?.settings?.is_demo);
} else {
    console.log('Redux store not accessible from window.store');
}

console.log('=== End Test ===');