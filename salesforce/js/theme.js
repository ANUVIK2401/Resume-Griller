// Runs in <head> before first paint so a saved theme never flashes.
try {
  const theme = localStorage.getItem('sfprep:theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch { /* storage blocked: follow the system theme */ }
