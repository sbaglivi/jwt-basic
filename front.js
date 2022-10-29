let postToRegister = 1;

let spanPostToRegister = document.getElementById("register");
let switchRegister = document.getElementById("switchRegister")
let userForm = document.getElementById("userForm");
let tokenDiv = document.getElementById("token");

switchRegister.addEventListener("click", e => {
    postToRegister = (postToRegister === 1) ? 0 : 1;
    spanPostToRegister.textContent = postToRegister;
})

let token = null;

let baseUrl = "http://localhost:3000";

userForm.addEventListener("submit", async e => {
    e.preventDefault();
    let suffix = (postToRegister === 1) ? "/register" : "/login";
    const formData = new FormData(userForm);
    let username = formData.get('username');
    let password = formData.get('password');
    console.log(baseUrl+suffix)
    let response = await fetch(`http://localhost:3000${suffix}`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
            // 'Content-Type': "text/plain"
        },
        body: JSON.stringify({username, password}),
        // body: {formData},
    });
    if (!response.ok){
        console.log("Response was not ok");
    }
    let result = await response.json();
    if (result?.accessToken){
        token = result;
        tokenDiv.textContent = JSON.stringify(result);
    }
    console.log(result);
})

const validate = document.getElementById("validate");
validate.addEventListener("click", async e => {
    if (token == null) return;
    let response = await fetch(`${baseUrl}/temp`, {
        headers: {
            "authorization": `Bearer: ${token.accessToken}`
        }
    });
    console.log(response);
})