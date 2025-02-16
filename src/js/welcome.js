
class WelcomePage {
  constructor() {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");

    if (token) {
      document.querySelector("main").classList.add("d-none");
      fetch("/api/auth/welcome", {
        headers: {
          "content-type": "application/json",
          Authorization: params.get("token"),
        },
      })
        .then((response) => response.json())
        .then((auth_response) => {
          if (auth_response.authToken) {
            this.reload(sessionStorage.getItem("ref_page"), auth_response);
          } else {
            document.body.querySelector("img").src = auth_response.profilePicture;
            this.register(
              auth_response.registrationToken,
              sessionStorage.getItem("ref_page")
            );
          }
        });
    } else {
      const reg_token = sessionStorage.getItem("reg_token");
      if (reg_token) {
        document.body.querySelector("img").src = sessionStorage.getItem("profile_pic");
        this.register(reg_token, sessionStorage.getItem("ref_page"));
      }
    }
  }

  register(registrationToken, refPage) {

    sessionStorage.clear();
    
    document.querySelector("main").classList.remove("d-none");
    document.querySelector("#name").focus();

    document.querySelector('a.btn-secondary').href = refPage;

    document.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      // this.errorPane.classList.add("d-none");
      let regRequest = {
        name: document.querySelector("#name").value,
        dob: document.querySelector("#dob").value,
      };
  
      const age = this.getAge(regRequest.dob);

      if (age < 10 || age > 80) {
        this.showError("Please Enter valid Date of Birth");
      } else {
        fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + registrationToken,
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
            console.log(auth_response);
            
            this.reload(refPage, auth_response);
          })
          .catch(() => {
            this.showError("Unable to register. Please contact admin");
          });
      }
    });

  }

  showError(errorMsg) {
    const errorSpan = document.querySelector('label.text-danger');
    errorSpan.classList.remove('invisible');
    errorSpan.innerHTML = errorMsg;
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
  
    if(auth_response) {
      auth_response.expiresIn = Date.now() + auth_response.expiresIn;
      sessionStorage.setItem('auth', JSON.stringify(auth_response));
      document.querySelector('a.btn-secondary').click();
    }
    
    if (refPage) {
      window.location.href = refPage;
    }
  }
}
new WelcomePage();