const container = document.getElementById("anime-container");
const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");
const pageNumbersContainer = document.getElementById("page-numbers");

let currentPage = 1;
let totalPages = 100; // Default value, updated dynamically from the API

// Fetch anime data for a given page
function fetchAnime(page) {
  container.innerHTML = ""; // Clear the container for new data
  fetch(`https://api.jikan.moe/v4/anime?page=${page}`)
    .then((response) => response.json())
    .then((data) => {
      displayAnime(data.data);

      // Update total pages based on the API response
      totalPages = data.pagination.last_visible_page || 100;
      updatePaginationControls();
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// Display anime in the container
function displayAnime(animeList) {
  animeList.forEach((anime) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <div class="card-content">
        <h3>${anime.title}</h3>
        <p><strong>Release Date:</strong> ${anime.aired.from ? new Date(anime.aired.from).toLocaleDateString() : "N/A"}</p>
        <p><strong>Type:</strong> ${anime.type}</p>
        <p><strong>Episodes:</strong> ${anime.episodes || "N/A"}</p>
        <p><strong>Status:</strong> ${anime.status}</p>
        <p><strong>Rating:</strong> ${anime.score || "N/A"} (${anime.scored_by || 0} people)</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// Update pagination controls dynamically
function updatePaginationControls() {
  pageNumbersContainer.innerHTML = ""; // Clear existing buttons

  const maxVisiblePages = 5; // Number of pages to display around the current page
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Add the first page and "..." if needed
  if (startPage > 1) {
    addPageButton(1);
    if (startPage > 2) addEllipsis();
  }

  // Add buttons for the visible range
  for (let i = startPage; i <= endPage; i++) {
    addPageButton(i);
  }

  // Add the last page and "..." if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) addEllipsis();
    addPageButton(totalPages);
  }

  // Enable/Disable arrow buttons
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

// Add a single page button
function addPageButton(page) {
  const button = document.createElement("button");
  button.textContent = page;
  button.style.margin = "0 5px";
  button.style.padding = "5px 10px";
  button.style.cursor = "pointer";
  button.style.backgroundColor = page === currentPage ? "#ddd" : "#f9f9f9";
  button.style.border = "1px solid #ddd";
  button.style.borderRadius = "5px";

  if (page === currentPage) {
    button.style.fontWeight = "bold";
    button.style.pointerEvents = "none"; // Disable click on the current page
  } else {
    button.addEventListener("click", () => {
      console.log(`Page ${page} clicked`); // Debug log
      currentPage = page; // Update current page
      fetchAnime(currentPage); // Fetch data for the selected page
    });
  }

  pageNumbersContainer.appendChild(button);
}

// Add ellipsis ("...") between page ranges
function addEllipsis() {
  const ellipsis = document.createElement("span");
  ellipsis.textContent = "...";
  ellipsis.style.margin = "0 5px";
  pageNumbersContainer.appendChild(ellipsis);
}

// Arrow button events
prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAnime(currentPage);
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchAnime(currentPage);
  }
});

// Initial fetch for page 1
fetchAnime(currentPage);

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

// Search for anime by title
function searchAnime(query) {
  container.innerHTML = ""; // Clear the container for new data
  fetch(`https://api.jikan.moe/v4/anime?q=${query}`)
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
const autocompleteList = document.getElementById("autocomplete-list");

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
    listItem.style.padding = "5px";
    listItem.style.cursor = "pointer";
    listItem.style.borderBottom = "1px solid #ddd";

    // Highlight on hover
    listItem.addEventListener("mouseenter", () => {
      listItem.style.backgroundColor = "#ddd";
    });
    listItem.addEventListener("mouseleave", () => {
      listItem.style.backgroundColor = "white";
    });

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


