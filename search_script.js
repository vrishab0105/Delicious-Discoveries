// Array of dishes
const dishes = [
    "Apple Pie",
    "Banana Bread",
    "Chicken Curry",
    "Chocolate Cake",
    "Beef Stew",
    "Grilled Salmon",
    "Caesar Salad",
    "Fried Rice",
    "Pasta Carbonara",
  ];
  
  // Function to filter dishes by starting letter
  function filterDishesByLetter(letter) {
    const resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = ""; // Clear previous results
  
    const filteredDishes = dishes.filter(dish => dish.startsWith(letter.toUpperCase()));
  
    if (filteredDishes.length === 0) {
      resultsList.innerHTML = `<li>No dishes found starting with '${letter}'</li>`;
    } else {
      filteredDishes.forEach(dish => {
        const listItem = document.createElement("li");
        listItem.textContent = dish;
        resultsList.appendChild(listItem);
      });
    }
  }
  
  // Add event listener to the search button
  document.querySelector(".search-bar button").addEventListener("click", () => {
    const input = document.querySelector(".search-bar input").value.trim();
    if (input.length === 1 && /[a-zA-Z]/.test(input)) {
      filterDishesByLetter(input);
    } else {
      alert("Please enter a single letter!");
    }
  });
  