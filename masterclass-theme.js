    const topNav = document.getElementById('topNav');
    const menuToggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mainMenu');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 24) topNav.classList.add('scrolled');
      else topNav.classList.remove('scrolled');
    });

    menuToggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      menuToggle.textContent = menu.classList.contains('open') ? 'X' : '\u2630';
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        menuToggle.textContent = '\u2630';
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
