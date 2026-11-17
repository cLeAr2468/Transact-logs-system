// Force cache clear on page load
(function() {
  const CACHE_VERSION = 'v2.1.20261117'; // Updated - fixed sidebar notification count
  const currentVersion = localStorage.getItem('app_cache_version');
  
  console.log('🔍 Checking cache version...');
  console.log('Current:', currentVersion);
  console.log('Required:', CACHE_VERSION);
  
  if (currentVersion !== CACHE_VERSION) {
    console.log('⚠️ Cache version mismatch! Clearing cache...');
    
    // Clear localStorage except for auth tokens
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    
    localStorage.clear();
    
    // Restore auth tokens
    if (adminToken) localStorage.setItem('admin_token', adminToken);
    if (adminUser) localStorage.setItem('admin_user', adminUser);
    
    // Set new version
    localStorage.setItem('app_cache_version', CACHE_VERSION);
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
    
    console.log('✅ Cache cleared! Reloading...');
    
    // Force reload from server
    window.location.reload(true);
  } else {
    console.log('✅ Cache version up to date!');
  }
})();
