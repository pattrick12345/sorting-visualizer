document.querySelectorAll(".premiumSORT").forEach(link => {
    link.addEventListener("click", async function(event) {
            event.preventDefault();

    try {
        const response = await fetch("http://127.0.0.1:8000/me", {
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok && data.loggedIn) {
            window.location.href = this.href;
        } else {
            window.location.href = "login/login.html";        }
    } catch (error) {
        console.error(error);
        document.getElementById("message").textContent =
            "Cannot connect to server!";
    }
});
});

document.getElementById("log_out").addEventListener("click", async function(event) {
    event.preventDefault();

    try {
        const response = await fetch("http://127.0.0.1:8000/logout", {
            method: "POST", 
            credentials: "include"
        });

        const data = await response.json();
    } catch (error) {
        console.error(error);
        document.getElementById("message").textContent =
            "Cannot connect to server!";
    }
});

document.getElementById("log_in").addEventListener("click", async function(event) {
    window.location.href = "login/login.html";
});

async function showUsername() {
    try {
        const response = await fetch("http://127.0.0.1:8000/me", {
            credentials: "include"
        });

        const data = await response.json();

        const usernameElement = document.getElementById("username");

        if (data.loggedIn) {
            usernameElement.textContent = data.username;
        } else {
            usernameElement.textContent = "";
        }
    } catch (error) {
        console.error("Error checking login:", error);
    }
}

showUsername();