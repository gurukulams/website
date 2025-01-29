import { Dropdown } from "bootstrap";

class GurukulamsPage {
    constructor() {
        this.handleSecurity();
        this.setThemeSetting();
        this.setScrollIndicator();
    }

    setThemeSetting() {
        document.addEventListener('DOMContentLoaded', function () {
            const themeDropdownButton = document.getElementById('themeDropdown');
            const themeDropdownItems = document.querySelectorAll('.dropdown-item[data-theme]');
            const icons = {
                light: 'sun-fill',
                dark: 'moon-stars-fill',
                auto: 'circle-half'
            };

            function setTheme(theme) {
                let themename;
                if (theme === 'auto') {
                    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    theme, themename = prefersDarkScheme ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-bs-theme', theme);
                themeDropdownButton.innerHTML = `<svg class="bi my-1 theme-icon-active" width="1em" height="1em"><use href="#${icons[theme]}"></use></svg>`;
            }

            setTheme('auto');

            themeDropdownItems.forEach(item => {
                item.addEventListener('click', function (event) {
                    event.preventDefault();
                    const selectedTheme = this.getAttribute('data-theme');
                    setTheme(selectedTheme);
                });
            });
        });
    }

    setScrollIndicator() {
        window.addEventListener('scroll', () => {
            const scrollIndicator = document.getElementById('scrollIndicator');
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = (scrollTop / scrollHeight) * 100;
            scrollIndicator.style.width = scrollPercentage + '%';
        });
    }

    handleSecurity() {

        // If User is Logged in
        if (sessionStorage.auth) {

          document.getElementById("login-pane").remove("d-none");

          document.getElementById("logoutBtn").addEventListener("click", () => {
            delete sessionStorage.auth;
            window.location.reload();
          });

          const userAuth = JSON.parse(sessionStorage.auth);
    
          document.querySelector(".avatar").src = userAuth.profilePicture;

          document.querySelectorAll(".secured").forEach((el) => {
            el.classList.remove('secured');
         });

         const userMenu = document.getElementById('userMenu');

         userMenu.classList.add('dropdown');
         userMenu.classList.add('dropdown-toggle');
          
        } else { // If User is not Logged in
            document.querySelectorAll(".secured").forEach((el) => {
                el.parentElement.removeChild(el);
            });
        }
      }
}

class HomePage extends GurukulamsPage {

}

new HomePage();