
class WelcomePage {
  constructor() {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    console.log(token);
    if (token) {
      console.log("register token");

    } else {
      console.log("no register token");

      const reg_token = sessionStorage.getItem("reg_token");

      if (reg_token) {
        this.register(reg_token, sessionStorage.getItem("ref_page"));
        document.body.querySelector("img").src = sessionStorage.getItem("profile_pic");
      }


      sessionStorage.clear();


    }

  }

  register(registrationToken, refPage) {

    const cancelButton = document.querySelector("#cancel-btn");
    cancelButton.addEventListener("click", () => {
      window.location.replace(refPage);
    });

    document.querySelector("main").classList.remove("d-none");
    document.querySelector("#name").focus();


    document.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      // this.errorPane.classList.add("d-none");
      let regRequest = {
        name: document.querySelector("#name").value,
        dob: document.querySelector("#dob").value,
      };

      fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + registrationToken,
        },
        body: JSON.stringify(regRequest),
      }).then((response) => {
        if (!response.ok) {
          this.showError("Unable to register. Please contact admin");
        } else {
          return response.json();
        }
      })
        .then((auth_response) => {
          auth_response.expiresIn = Date.now() + auth_response.expiresIn;
          sessionStorage.auth = JSON.stringify(auth_response);
          this.reload(refPage);
        }).catch(() => {
          console.log("Unable to register contact admin");

        })
    });

    
    const securedUrls = ["/events"];

    if (securedUrls.includes(window.location.pathname)) {
      document.body.querySelector("main").innerHTML = `
      <div class="d-flex align-items-center justify-content-center vh-100">
          <div class="text-center row">
              <div class=" col-md-6">
                  <img src="https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569__340.jpg" alt=""
                      class="img-fluid">
              </div>
              <div class=" col-md-6 mt-5">
                  <p class="fs-3"> <span class="text-danger">Opps!</span> Page not found.</p>
                  <p class="lead">
                      The page you’re looking for doesn’t exist.
                  </p>
                  <a href="/" class="btn btn-primary">Go Home</a>
              </div>

          </div>
      </div>
      `;
    }
    if (document.querySelector(".secured") !== null) {
      document.querySelector(".secured").classList.add("d-none");
      document.getElementById("login-pane").classList.remove("d-none");

      if (document.querySelector(".fa-google")) {
        document
          .querySelector(".fa-google")
          .parentElement.addEventListener("click", () => {
            sessionStorage.setItem("ref_page", window.location.href);
            window.location.href = `/oauth2/authorize/google?redirect_uri=${
              window.location.protocol + "//" + window.location.host
            }/welcome`;
          });
      }
    }

  }


  reload(refPage) {
    if (refPage) {
      window.location.href = refPage;
      window.location.replace(refPage);
    } else {
      window.location.href = "/";
      window.location.replace("/");
    }
  }
}
new WelcomePage();