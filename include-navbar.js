document.addEventListener('DOMContentLoaded', function() {
  // Get the header element
  const header = document.querySelector('header');
  
  // Fetch the navbar HTML
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      // Insert the navbar HTML into the header
      header.innerHTML = data;
    })
    .catch(error => console.error('Error loading navbar:', error));
});
