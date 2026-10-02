'use strict';
// Reading and downloads work without JavaScript. Only enhance the print control.
document.querySelectorAll('[data-print]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => window.print());
});
