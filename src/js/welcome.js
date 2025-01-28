
class WelcomePage {
  constructor() {

    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    console.log(token);
    if (token) {
      console.log("register token");

    } else {
      console.log("no register token");
      if (sessionStorage.getItem("reg_token")) {
        this.register(
          sessionStorage.getItem("reg_token"),
          sessionStorage.getItem("profile_pic")
        );
      }
    }

  }

  register(registrationToken, profile_pic) {
    console.log(registrationToken, profile_pic);

    document.body.querySelector("img").src = profile_pic;
    document.querySelector("main").classList.remove("d-none");
    document.querySelector("#name").focus();

    document.querySelector("form").addEventListener("submit", (event) => {
      event.token = registrationToken;
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
          Authorization: "Bearer " + event.token,
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
          this.reload();
        }).catch(() => {
          console.log("Unable to register contact admin");

        })
    });

  }

  reload() {
    const refPage = sessionStorage.getItem("ref_page");
    sessionStorage.removeItem("ref_page");
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