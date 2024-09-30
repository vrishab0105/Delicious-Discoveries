// navigation.js
window.navigateTo = function(page) {
    window.location.href = page;
};


// Set the logo source dynamically based on the current location
document.addEventListener('DOMContentLoaded', () => {
    const logoImage = document.getElementById('navbar-logo');
    const baseUrl = window.location.origin; // Get the base URL
    logoImage.src = `${baseUrl}/photos/Logo.jpeg`; // Set the path to your logo
});
