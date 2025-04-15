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

  // Start monitoring for Google Translate bar
  monitorTranslateBar();
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

// Function to monitor for Google Translate bar visibility
function monitorTranslateBar() {
  // Check periodically for the translate bar
  setInterval(function() {
    const translateBar = document.querySelector('.skiptranslate');
    const isTranslateVisible = translateBar && 
                              !translateBar.classList.contains('hidden') && 
                              translateBar.style.display !== 'none' &&
                              window.getComputedStyle(translateBar).display !== 'none';
    
    const gtBanner = document.querySelector('.goog-te-banner-frame');
    const isBannerVisible = gtBanner && 
                          window.getComputedStyle(gtBanner).height !== '0px' &&
                          window.getComputedStyle(gtBanner).display !== 'none';
    
    // Additional check for top-bar in Google Translate
    const isTopModified = document.body.style.top && document.body.style.top !== '';
    const isTranslateActive = document.documentElement.classList.contains('translated-ltr') || 
                            document.documentElement.classList.contains('translated-rtl');
    
    // Check if translation is actually active
    if ((isTranslateVisible || isBannerVisible || isTopModified || isTranslateActive) && 
         document.cookie.indexOf('googtrans=') !== -1) {
      setTranslateActive(true);
    } else {
      setTranslateActive(false);
    }
  }, 500);
  
  // Listen for language change events
  document.addEventListener('change', function(event) {
    if (event.target && event.target.classList && 
        event.target.classList.contains('goog-te-combo')) {
      setTimeout(function() {
        setTranslateActive(true);
      }, 500);
    }
  }, false);
}

// Helper function to set/unset translate active state
function setTranslateActive(isActive) {
  const header = document.querySelector('header');
  const navbar = document.querySelector('.navbar');
  
  if (isActive) {
    document.body.classList.add('translate-active');
    if (header) header.style.top = '40px';
    if (navbar) navbar.style.top = '40px';
  } else {
    document.body.classList.remove('translate-active');
    if (header) header.style.top = '0';
    if (navbar) navbar.style.top = '0';
  }
}
