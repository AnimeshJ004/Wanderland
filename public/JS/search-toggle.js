// Search toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchContainer = document.querySelector('.search-container');
  const searchToggle = document.querySelector('.search-toggle');
  const searchInput = document.querySelector('.search-input');

  if (searchToggle && searchContainer) {
    searchToggle.addEventListener('click', function(e) {
      e.preventDefault();
      searchContainer.classList.toggle('active');

      if (searchContainer.classList.contains('active')) {
        searchInput.focus();
      } else {
        searchInput.blur();
      }
    });

    // Close search when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchContainer.contains(e.target)) {
        searchContainer.classList.remove('active');
      }
    });

    // Close search on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchContainer.classList.remove('active');
      }
    });
  }
});
