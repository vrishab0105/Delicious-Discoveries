// about_script.js

document.addEventListener('DOMContentLoaded', () => {

    // Set sources for team members' photos
    const student1Photo = document.getElementById('student1-photo');
    student1Photo.src = 'photos/gan.jpeg'; // Update the path as necessary

    const student2Photo = document.getElementById('student2-photo');
    student2Photo.src = 'photos/vri.jpeg'; // Ensure the file name and path are correct

    const student3Photo = document.getElementById('student3-photo');
    student3Photo.src = 'photos/sus.jpeg'; // Update the path as necessary

    // Set source for special thanks photo
    const specialThanksPhoto = document.getElementById('special-thanks-photo');
    specialThanksPhoto.src = 'photos/arm.jpeg'; // Update the path as necessary

    // Add fade-in effect for cards
    const cards = document.querySelectorAll('.student-card, .special-thanks');
    
    // Simple animation for cards using JavaScript
    setTimeout(() => {
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            }, index * 200); // Staggered animation
        });
    }, 300);
});
