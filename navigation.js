// Simple navigation helper function
function navigateTo(page) {
    window.location.href = page;
}

// Add active state to current page in navbar
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the navbar to be loaded
    setTimeout(() => {
        // Get all navigation links
        const navLinks = document.querySelectorAll('.nav-center a');
        
        // Get current page filename
        const currentPage = window.location.pathname.split('/').pop();
        
        // Add active class to current page link
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }, 100); // Small delay to ensure navbar has loaded
});
