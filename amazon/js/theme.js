// Runs in <head> before first paint so a saved theme or text size never flashes.
try {
  const theme = localStorage.getItem('awsprep:theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  const scale = Number(localStorage.getItem('awsprep:scale'));
  if (scale >= 90 && scale <= 140) document.documentElement.style.fontSize = `${scale}%`;
} catch { /* storage blocked: follow system theme, default size */ }
