const container = document.getElementById("anime-container");
const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");
const pageNumbersContainer = document.getElementById("page-numbers");
const searchInput = document.getElementById("search-input");
const autocompleteList = document.getElementById("autocomplete-list");
const sortBySelect = document.getElementById("sort-by-select");
const toggleThemeButton = document.getElementById("toggle-theme-button");


let currentPage = 1;
let totalPages = 100;
let animeList = []; // stores the fetched anime data
const itemsPerPage = 24; // max number of pages

//fetching the naime data
function fetchAnime(page) {
  container.innerHTML = ""; // clear the container for the next data
  currentPage = page; //updating
  fetch(`https://api.jikan.moe/v4/anime?page=${page}&limit=${itemsPerPage}`)
    .then((response) => response.json())
    .then((data) => {
      animeList = data.data; //storing the data
      totalPages = data.pagination.last_visible_page || 100;
      displayAnime(animeList); //displaying the data
      updatePaginationControls(); //paginations
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// maping the ratings properly
function mapRating(rating) {
  if (rating.includes("PG")) {
    return "PG";
  } else if (rating.includes("R")) {
    return "R";
  } else {
    return "A"; 
  }
}

//displaying the anime data
function displayAnime(animeList) {
  container.innerHTML = ""; 

  animeList.forEach((anime) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Determine the status color
    let statusColor;
    if (anime.status === "Currently Airing") {
      statusColor = "green";
    } else if (anime.status === "Finished Airing") {
      statusColor = "grey";
    } else if (anime.status === "Not yet aired") {
      statusColor = "gold"; 
    } else {
      statusColor = "grey"; // default
    }

  
    const ageRating = anime.rating ? mapRating(anime.rating) : 'N/A';

    card.innerHTML = `
      <div class="image-container">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" class="center-image">
      </div>
      <div class="card-content">
        <div class="card-header">
          <span class="status-indicator" style="background-color: ${statusColor};"></span>
          <span class="status">${anime.status ? anime.status : 'N/A'}</span>
          <span class="age-rating">${ageRating}</span>
        </div>
        <div class="card-title">${anime.title}</div>
        <div class="card-subtitle">${anime.aired.from ? new Date(anime.aired.from).toLocaleDateString() : 'N/A'} &bull; ${anime.episodes || 'N/A'} episodes</div>
        <div class="card-description">${anime.synopsis || 'No description available'}</div>
        <div class="card-rating">
          <span class="star">&#9733; ${anime.score || 'N/A'}</span>
          <span class="rating-value">${anime.scored_by > 0 ? anime.scored_by : 'No ratings yet'} ratings</span>
        </div>
        <div class="tags">
          ${anime.genres ? anime.genres.map(tag => `<span class="tag">${tag.name}</span>`).join('') : ''}
        </div>
      </div>
    `;

    // click event for the card
    card.addEventListener("click", () => openPopup(anime));

    container.appendChild(card); //appending the card to the container
  });
}

function openPopup(anime) {
  const popup = document.getElementById("popup");
  const popupTitle = document.getElementById("popup-title");
  const popupImage = document.getElementById("popup-image");
  const popupDescription = document.getElementById("popup-description");
  const popupStatus = document.getElementById("popup-status");
  const popupRating = document.getElementById("popup-rating");
  const popupEpisodes = document.getElementById("popup-episodes");
  const popupGenres = document.getElementById("popup-genres");

  //popup content
  popupTitle.textContent = anime.title;
  popupImage.src = anime.images.jpg.image_url;
  popupDescription.textContent = anime.synopsis;
  popupStatus.textContent = `Status: ${anime.status}`;
  popupRating.textContent = `Rating: ${anime.rating}`;
  popupEpisodes.textContent = `Episodes: ${anime.episodes}`;
  popupGenres.innerHTML = `Genres: ${anime.genres ? anime.genres.map(tag => `<span class="tag">${tag.name}</span>`).join('') : 'N/A'}`;

  //diaply 
  popup.style.display = "flex";
}

///close
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none";
});



// update pagination controls dynamically
function updatePaginationControls() {
  pageNumbersContainer.innerHTML = ""; // clear existing buttons

  const maxVisiblePages = 5; // setting the number of ellipses
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);

  //fist page
  addPageButton(1);

  if (currentPage > halfVisiblePages + 2) {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    pageNumbersContainer.appendChild(ellipsis);
  }

  const startPage = Math.max(2, currentPage - halfVisiblePages);
  const endPage = Math.min(totalPages - 1, currentPage + halfVisiblePages);

  for (let i = startPage; i <= endPage; i++) {
    addPageButton(i);
  }

  if (currentPage < totalPages - halfVisiblePages - 1) {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    pageNumbersContainer.appendChild(ellipsis);
  }

  // last page
  if (totalPages > 1) {
    addPageButton(totalPages);
  }

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      fetchAnime(currentPage - 1);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      fetchAnime(currentPage + 1);
    }
  });
}



function addPageButton(pageNumber) {
  const pageButton = document.createElement("button");
  pageButton.textContent = pageNumber;
  pageButton.classList.add("page-number");
  if (pageNumber === currentPage) {
    pageButton.classList.add("active");
  }
  pageButton.addEventListener("click", () => fetchAnime(pageNumber));
  pageNumbersContainer.appendChild(pageButton);
}

// search anime function
function searchAnime(query) {
  container.innerHTML = ""; //clear
  fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=${itemsPerPage}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.data.length === 0) {
        container.innerHTML = "<p>No anime found. Try another search!</p>";
      } else {
        displayAnime(data.data); //diaply
      }
    })
    .catch((error) => console.error("Error fetching search results:", error));
}

searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      searchAnime(query);
    }
  }
});


function fetchSuggestions(query) {
  if (!query) {
      autocompleteList.style.display = "none"; 
      return;
  }

  fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`)
      .then((response) => response.json())
      .then((data) => {
          const suggestions = data.data.map((anime) => anime.title);
          showSuggestions(suggestions);
      })
      .catch((error) => console.error("Error fetching suggestions:", error));
}

// autocomplete suggestions
function showSuggestions(suggestions) {
  autocompleteList.innerHTML = ""; // Clear 
  autocompleteList.style.display = suggestions.length ? "block" : "none"; 

  suggestions.forEach((suggestion) => {
      const listItem = document.createElement("li");
      listItem.textContent = suggestion;

      listItem.addEventListener("click", () => {
          searchInput.value = suggestion; 
          autocompleteList.style.display = "none"; 
          searchAnime(suggestion); 
      });

      autocompleteList.appendChild(listItem);
  });
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  fetchSuggestions(query);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#search-bar")) {
      autocompleteList.style.display = "none";
  }
});

sortBySelect.addEventListener("change", () => {
  const sortBy = sortBySelect.value;
  if (sortBy === "popularity") {
    animeList.sort((a, b) => a.popularity - b.popularity);
  } else if (sortBy === "rating") {
    animeList.sort((a, b) => b.score - a.score);
  } else if (sortBy === "new") {
    animeList.sort((a, b) => {
      const dateA = new Date(a.aired.from);
      const dateB = new Date(b.aired.from);
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1; // handles invalid dates
      return dateB - dateA;
    });
  }
  displayAnime(animeList.slice(0, itemsPerPage));
  updatePaginationControls();
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.classList.add(savedTheme);
  updateButtonText(savedTheme);
}

// light and dark mode
function toggleTheme() {
  if (document.body.classList.contains("light-mode")) {
    document.body.classList.remove("light-mode");
    localStorage.setItem("theme", ""); 
    updateButtonText("");
  } else {
    document.body.classList.add("light-mode");
    localStorage.setItem("theme", "light-mode"); 
    updateButtonText("light-mode");
  }
}

function updateButtonText(theme) {
  toggleThemeButton.textContent = theme === "light-mode" ? "Switch to Dark Mode" : "Switch to Light Mode";
}
const themeToggleBtn = document.getElementById('theme-toggle');

// Set initial mode and icon
let isDarkMode = true;
document.documentElement.classList.add('dark-mode');
themeToggleBtn.textContent = '☀️'; 

themeToggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;

  if (isDarkMode) {
    document.documentElement.classList.add('dark-mode');
    document.documentElement.classList.remove('light-mode');
    themeToggleBtn.textContent = '☀️'; 
  } else {
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark-mode');
    themeToggleBtn.textContent = '🌙'; 
  }
});

searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      searchAnime(query); 
    } else {
      fetchAnime(1); // redirect back to the home view (page 1) if the input is empty
    }
  }
});

fetchAnime(currentPage);

