function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Username dan Password wajib diisi");
    return;
  }

  localStorage.setItem("username", username);
  window.location.href = "chat.html";
}
