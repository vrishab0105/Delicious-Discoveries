document.addEventListener('DOMContentLoaded', function() {
  // Get the header element
  const header = document.querySelector('header');
  
  // Fetch the navbar HTML
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      // Insert the navbar HTML into the header
      header.innerHTML = data;
      
      // Load Google Translate script after navbar is loaded
      loadGoogleTranslateScript();
    })
    .catch(error => console.error('Error loading navbar:', error));
});

// Function to load Google Translate script
function loadGoogleTranslateScript() {
  const script = document.createElement('script');
  script.src = 'translate.js';
  document.body.appendChild(script);
  
  const googleScript = document.createElement('script');
  googleScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(googleScript);
}
