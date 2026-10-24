if (new URLSearchParams(window.location.search).get("registered")) {
    const msg = document.getElementById("message");
    msg.style.color = "#4ade80";
    msg.textContent = "Registration successful!\nPlease log in.";
}
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(
            "/login",
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
            document.getElementById("message").textContent = data.message;
            window.location.href = "/index.html";
        }
    } catch (error) {
        console.error(error);
        document.getElementById("message").textContent =
            "Cannot connect to server!";
    }
});

