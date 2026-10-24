
document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(
            "/register",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        )
        const data = await response.json();

        if (!response.ok) {
            document.getElementById("message").textContent = data.detail;
        } else {
            // document.getElementById("message").style.color = "#4ade80";
            // document.getElementById("message").textContent = "Registration successful!";
            // console.log("redirecting...");
            window.location.href = "login.html?registered=1";

            // setTimeout(function () {
            //     window.location.href = "login.html";
            // }, 1500);
        }
    } catch (error) {
        console.error(error);
        document.getElementById("message").textContent =
            "Cannot connect to server!";
    }
});