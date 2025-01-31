
class WelcomePage {
  constructor() {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    console.log(token);
    if (token) {
      console.log("register token");
    } else {
      const reg_token = sessionStorage.getItem("reg_token");
      if (reg_token) {
        this.register(reg_token, sessionStorage.getItem("ref_page"));
        document.body.querySelector("img").src = sessionStorage.getItem("profile_pic");
      }
      
    }

  }

  register(registrationToken, refPage) {

    document.querySelector("main").classList.remove("d-none");
    document.querySelector("#name").focus();

    document.querySelector('.btn-secondary')
      .addEventListener("click", () => {
        this.reload(refPage);
    });

    document.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      // this.errorPane.classList.add("d-none");
      let regRequest = {
        name: document.querySelector("#name").value,
        dob: document.querySelector("#dob").value,
      };
    

      const age = this.getAge(regRequest.dob);

      if (age < 10 || age > 80) {
        console.log("Please Enter valid Date of Birth");
      } else {
        fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + event.token,
          },
          body: JSON.stringify(regRequest),
        })
          .then((response) => {
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
          })
          .catch(() => {
            this.showError("Unable to register. Please contact admin");
          });
      }
    });

    

  }

  getAge(value) {
    var selectedDate = new Date(value);
    var now = new Date();

    if (selectedDate > now) {
      return -1;
    }

    //calculate month difference from current date in time
    var month_diff = now - selectedDate.getTime();

    //convert the calculated difference in date format
    var age_dt = new Date(month_diff);

    //extract year from date
    var year = age_dt.getUTCFullYear();

    //now calculate the age of the user
    return Math.abs(year - 1970);
  }

  reload(refPage, auth_response) {
    sessionStorage.clear();

    if(auth_response) {
      auth_response.expiresIn = Date.now() + auth_response.expiresIn;
      sessionStorage.auth = JSON.stringify(auth_response);
    }
    
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