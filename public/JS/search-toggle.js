// Search toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('.search-input');
  const searchToggle = document.querySelector('.search-toggle');
  const searchContainer = document.querySelector('.search-container');

  if (searchToggle && searchInput && searchContainer) {
    searchToggle.addEventListener('click', function(e) {
      e.preventDefault();
      searchContainer.classList.toggle('active');
      if (searchContainer.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // Close search when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchContainer.contains(e.target)) {
        searchContainer.classList.remove('active');
      }
    });

    // Submit form when Enter is pressed in search input
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        if (searchInput.value.trim()) {
          searchInput.closest('form').submit();
        } else {
          e.preventDefault();
          searchInput.focus();
        }
      }
    });
  }
});
