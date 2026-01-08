import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  onValue,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* =========================
   FIREBASE CONFIG (TIDAK DIUBAH)
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyDOgu8RbtRmROhraUB7Nl1mJ41nAirxVk4",
  authDomain: "diskusi-in.firebaseapp.com",
  databaseURL: "https://diskusi-in-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "diskusi-in",
  storageBucket: "diskusi-in.firebasestorage.app",
  messagingSenderId: "823851958982",
  appId: "1:823851958982:web:5192dccfabdf69e83e8dc7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
   VAR DASAR
========================= */
const username = localStorage.getItem("username");
const chatBox = document.getElementById("chatBox");
const messagesRef = ref(db, "messages");

/* =========================
   ONLINE USER (HEADER SAJA)
========================= */
const usersRef = ref(db, "onlineUsers/" + username);

// tandai user online
set(usersRef, { online: true });

// otomatis offline saat tab ditutup / refresh
onDisconnect(usersRef).remove();

// tampilkan jumlah online (KANAN ATAS)
const header = document.querySelector(".header");
const onlineInfo = document.createElement("div");
onlineInfo.className = "online-info";
header.appendChild(onlineInfo);

onValue(ref(db, "onlineUsers"), (snapshot) => {
  const users = snapshot.val();
  const count = users ? Object.keys(users).length : 0;
  onlineInfo.innerText = `${count} online`;
});

/* =========================
   SYSTEM MESSAGE: BERGABUNG (SAJA)
========================= */
push(messagesRef, {
  system: true,
  type: "join",
  text: `${username} bergabung`,
  time: Date.now()
});

/* =========================
   KIRIM PESAN
========================= */
window.sendMessage = function () {
  const input = document.getElementById("message");
  const text = input.value.trim();
  if (!text) return;

  push(messagesRef, {
    user: username,
    text: text,
    time: Date.now()
  });

  input.value = "";
};

/* =========================
   TERIMA PESAN
========================= */
onChildAdded(messagesRef, (snapshot) => {
  const data = snapshot.val();

  /* ===== SYSTEM MESSAGE ===== */
  if (data.system) {
    // ✅ HANYA tampilkan pesan BERGABUNG
    if (data.type === "join") {
      const sys = document.createElement("div");
      sys.className = "system-message";
      sys.innerText = data.text;
      chatBox.appendChild(sys);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    return; // ❌ online / keluar tidak pernah ditampilkan
  }

  /* ===== CHAT NORMAL ===== */
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.classList.add(
    data.user === username ? "chat-right" : "chat-left"
  );

  const userRow = document.createElement("div");
  userRow.className = "chat-user";
  userRow.innerText = data.user;

  const msg = document.createElement("div");
  msg.innerText = data.text;

  const time = document.createElement("div");
  time.className = "chat-time";
  if (data.time) {
    const d = new Date(data.time);
    time.innerText =
      d.getHours().toString().padStart(2, "0") + ":" +
      d.getMinutes().toString().padStart(2, "0");
  }

  bubble.appendChild(userRow);
  bubble.appendChild(msg);
  bubble.appendChild(time);

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
});

/* =========================
   LOGOUT (TANPA SYSTEM MESSAGE)
========================= */
const logoutBtn = document.createElement("button");
logoutBtn.className = "logout-btn";
logoutBtn.innerText = "Keluar";

logoutBtn.onclick = () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
};

header.appendChild(logoutBtn);
