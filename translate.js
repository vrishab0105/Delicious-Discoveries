function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,hi,mr,gu,ml,te,kn,pa,ta,ne',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    autoDisplay: false,
    // Add callback to detect when translation happens
    gaTrack: true,
    gaId: 'UA-XXXXX-X', // This is just a placeholder, not used for tracking
    customInitFunction: function() {
      // Custom callback when translation initializes
      if (document.readyState === 'complete') {
        checkTranslationStatus();
      } else {
        window.addEventListener('load', checkTranslationStatus);
      }
    }
  }, 'google_translate_element');
}

// Function to check if translation is active
function checkTranslationStatus() {
  setTimeout(function() {
    const isTranslated = document.cookie.indexOf('googtrans=') !== -1 && 
                        document.cookie.indexOf('googtrans=/en/en') === -1;
    
    if (isTranslated) {
      document.body.classList.add('translate-active');
      const header = document.querySelector('header');
      const navbar = document.querySelector('.navbar');
      if (header) header.style.top = '40px';
      if (navbar) navbar.style.top = '40px';
    }
  }, 300);
}
