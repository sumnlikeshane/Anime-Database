const container = document.getElementById("anime-container");
const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");
const pageNumbersContainer = document.getElementById("page-numbers");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const autocompleteList = document.getElementById("autocomplete-list");

let currentPage = 1;
let totalPages = 100;
let animeList = []; // Store the fetched anime data
const itemsPerPage = 24; // Adjust this value based on the number of items you want per page

// Fetch anime data for a given page
function fetchAnime(page) {
  container.innerHTML = ""; // Clear the container for new data
  currentPage = page; // Update currentPage to reflect the correct page
  fetch(`https://api.jikan.moe/v4/anime?page=${page}&limit=${itemsPerPage}`)
    .then((response) => response.json())
    .then((data) => {
      animeList = data.data; // Store the fetched anime data
      totalPages = data.pagination.last_visible_page || 100;
      displayAnime(animeList); // Display the fetched anime data
      updatePaginationControls(); // Update pagination controls after data is loaded
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// Function to map ratings to "PG", "A", or "R"
function mapRating(rating) {
  if (rating.includes("PG")) {
    return "PG";
  } else if (rating.includes("R")) {
    return "R";
  } else {
    return "A"; // Default to "A" if not "PG" or "R"
  }
}

// Display anime in the container
function displayAnime(animeList) {
  container.innerHTML = ""; // Clear the container for new data
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
      statusColor = "golden";
    } else {
      statusColor = "grey"; // Default color
    }

    // Map the rating to "PG", "A", or "R"
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
          <span class="rating-value">${anime.scored_by > 0 ? anime.scored_by : 'No ratings yet'}  ratings</span>
        </div>
        <div class="tags">
          ${anime.genres ? anime.genres.map(tag => `<span class="tag">${tag.name}</span>`).join('') : ''}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Update pagination controls dynamically
function updatePaginationControls() {
  pageNumbersContainer.innerHTML = ""; // Clear existing buttons

  const maxVisiblePages = 5; // Number of visible pages before the ellipsis
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);

  // Add the first page
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

  // Add the last page
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

// Search anime based on query
function searchAnime(query) {
  container.innerHTML = ""; // Clear the container for new data
  fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=${itemsPerPage}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.data.length === 0) {
        container.innerHTML = "<p>No anime found. Try another search!</p>";
      } else {
        displayAnime(data.data); // Use the same displayAnime function
      }
    })
    .catch((error) => console.error("Error fetching search results:", error));
}

// Event listener for the search button
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    searchAnime(query);
  }
});

// Optional: Trigger search on pressing Enter in the input
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      searchAnime(query);
    }
  }
});

// Fetch suggestions as the user types
function fetchSuggestions(query) {
  if (!query) {
    autocompleteList.style.display = "none"; // Hide the list if the query is empty
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

// Show the autocomplete suggestions
function showSuggestions(suggestions) {
  autocompleteList.innerHTML = ""; // Clear existing suggestions
  autocompleteList.style.display = suggestions.length ? "block" : "none";

  suggestions.forEach((suggestion) => {
    const listItem = document.createElement("li");
    listItem.textContent = suggestion;
    listItem.style.padding = "10px";
    listItem.style.cursor = "pointer";
    listItem.style.borderBottom = "1px solid rgba(62, 169, 199, 0.2)";


    // Populate search bar and trigger search on click
    listItem.addEventListener("click", () => {
      searchInput.value = suggestion; // Set the search input
      autocompleteList.style.display = "none"; // Hide the suggestions
      searchAnime(suggestion); // Perform the search
    });

    autocompleteList.appendChild(listItem);
  });
}

// Listen to input events for autocomplete
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  fetchSuggestions(query);
});

// Hide autocomplete when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest("#search-bar")) {
    autocompleteList.style.display = "none";
  }
});

// Initial fetch
fetchAnime(currentPage);