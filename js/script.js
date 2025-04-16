var floatNav = $('.float-nav');

// Only toggle menu when the toggle icon is clicked
floatNav.find('.toggle').on('click', function (e) {
  const nav = $(this).closest('.float-nav');

  nav.toggleClass('closed');

  if (nav.hasClass('closed')) {
    $(this).find('i').removeClass('fa-times').addClass('fa-bars');
  } else {
    $(this).find('i').removeClass('fa-bars').addClass('fa-times');
  }

  e.stopPropagation();
  e.preventDefault(); // only prevent default for the toggle click
});

// Clicking outside closes the menu
$(document).on('click', function(e) {
  if (!$(e.target).closest('.float-nav').length) {
    if (!floatNav.hasClass('closed')) {
      floatNav.find('i').removeClass('fa-times').addClass('fa-bars');
      floatNav.addClass('closed');
    }
  }
});