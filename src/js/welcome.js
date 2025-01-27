
class WelcomePage{
    constructor() {
        console.log('Welcoe');
        const params = new URLSearchParams(window.location.search);

        const token = params.get("token");
        console.log(token);
        if (token) {
            console.log("register token");
            
        }else{
            console.log("no register token");
            if (sessionStorage.getItem("reg_token")) {
                this.register(
                  sessionStorage.getItem("reg_token"),
                  sessionStorage.getItem("profile_pic")
                );
              }
        }
        
    }
    register(registrationToken, profile_pic){
        console.log(registrationToken,profile_pic);

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
          }).then((response) =>{
            if(!response.ok){
                console.log("Not register");  
            }
          }).then((response) =>{
            if(response.ok){
                console.log("Register Successfully");
                
            }
          }).catch(() =>{
            console.log("Unable to register contact admin");
            
          })
        });

        }
}
new WelcomePage();