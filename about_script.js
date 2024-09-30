// about_script.js

document.addEventListener('DOMContentLoaded', () => {

    // Set sources for team members' photos
    const student1Photo = document.getElementById('student1-photo');
    student1Photo.src = 'photos/ganesh.jpeg'; // Update the path as necessary

    const student2Photo = document.getElementById('student2-photo');
    student2Photo.src = 'photos/vrishab.jpeg'; // Ensure the file name and path are correct

    const student3Photo = document.getElementById('student3-photo');
    student3Photo.src = 'photos/sushant.jpeg'; // Update the path as necessary

    // Set source for special thanks photo
    const specialThanksPhoto = document.getElementById('special-thanks-photo');
    specialThanksPhoto.src = 'photos/armaan.jpeg'; // Update the path as necessary
});
