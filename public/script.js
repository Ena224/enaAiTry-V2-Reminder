document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window) {
    Notification.requestPermission().then(p => {
      console.log("Notification permission:", p);
    });
  }

  attachEventListeners();
  // run an immediate check (in case a reminder is due now)
  checkReminders();
  // run loop every 15 seconds (more responsive than 60s)
  window.reminderIntervalId = setInterval(checkReminders, 15 * 1000);
});


function sendDesktopNotification(title, body) {
  if (!("Notification" in window)) {
    console.log("Notifications not supported in this browser.");
    return;
  }

  const customIcon = "https://thumbs.dreamstime.com/b/cute-blue-robot-artist-holding-paintbrushes-colorful-art-studio-cute-blue-robot-artist-holding-paintbrushes-colorful-art-373916419.jpg";  //  <-- CHANGE THIS PATH TO YOUR IMAGE

  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: customIcon,
        badge: customIcon  // also used for some mobile/desktop UIs
      });
    } catch (err) {
      console.warn("Notification error:", err);
    }
  } else {
    console.log("Notification permission not granted.");
  }
}


/////////////////////// Chat UI helpers ///////////////////////
function scrollToBottom() {
  const chatContainer = document.getElementById("chatContainer");
  if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
}

function capitalizeFirstLetter(s) {
  return s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function appendMessage(sender, message, id = null) {
  const chat = document.getElementById("chatContainer");
  if (!chat) return;
  const html = `
    <div class="message ${sender}">
      <div class="msg-header">${capitalizeFirstLetter(sender)}</div>
      <div class="msg-body" ${id ? `id="${id}"` : ""}>${message}</div>
    </div>
  `;
  chat.insertAdjacentHTML("beforeend", html);
  scrollToBottom();
}

/////////////////////// Reminders ///////////////////////
const MAX_REMINDERS = 50; // safety cap

function getReminders() {
  try {
    return JSON.parse(localStorage.getItem("reminders") || "[]");
  } catch (e) {
    console.warn("Invalid reminders data, resetting.");
    localStorage.setItem("reminders", "[]");
    return [];
  }
}

function saveReminders(list) {
  localStorage.setItem("reminders", JSON.stringify(list));
}

// normalize time to HH:MM (24-hour)
function normalizeTime(raw) {
  // Accept "H:MM" or "HH:MM" or "H" (hour only) or "HMM" accidentally
  raw = raw.trim();
  const hms = raw.match(/^(\d{1,2}):?(\d{2})?$/);
  if (!hms) return null;
  let hh = parseInt(hms[1], 10);
  let mm = hms[2] ? parseInt(hms[2], 10) : 0;
  if (isNaN(hh) || isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
}

function addReminder(time, title, body) {
  let list = getReminders();
  list.push({ time, title, body, createdAt: Date.now() });
  // keep only last MAX_REMINDERS
  if (list.length > MAX_REMINDERS) list = list.slice(-MAX_REMINDERS);
  saveReminders(list);
}

// check reminders, trigger and remove triggered ones
function checkReminders() {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, "0") + ":" +
                      now.getMinutes().toString().padStart(2, "0");

  let reminders = getReminders();
  if (!reminders.length) {
    // console.debug("No reminders stored.");
    return;
  }

  console.debug("[Reminders] checking at", currentTime, "items:", reminders.length);

  let changed = false;  //flag to save if any triggered
  const remaining = []; //pending 

  for (const r of reminders) {
    if (r.time === currentTime) {
      // trigger
      console.info("[Reminders] triggered:", r);
      sendDesktopNotification(r.title || "Reminder", r.body || "");
      appendMessage("model", ` ${r.title || "Reminder"} — ${r.body || ""}`);
      changed = true;
      // do NOT push to remaining (reminder consumed)
    } else {
      // keep future reminders (or past ones that weren't matched)
      remaining.push(r);
    }
  }

  if (changed) {
    saveReminders(remaining);
  }
}

/////////////////////// Reminder natural-language detection ///////////////////////
// Accepts phrases like:
//  - remind me at 4:30 to take medicine
//  - remind me at 16:05 to call mom
//  - remind me at 9 to wake up (interpreted as 09:00)
function detectReminderCommand(text) {
  if (!text) return false;
  const regex = /remind me at\s+(\d{1,2}(?::\d{2})?)\s+(?:to|that)?\s*(.+)/i;
  const match = text.match(regex);
  if (!match) return false;

  const rawTime = match[1];
  const msg = match[2].trim();
  const time = normalizeTime(rawTime);
  if (!time) {
    appendMessage("model", "I couldn't understand that time. Use HH:MM (24-hour) or H:MM.");
    return true; // handled but invalid
  }

  addReminder(time, "Reminder", msg);
  appendMessage("model", `✅ Reminder set for ${time} — "${msg}"`);
  console.info("[Reminders] added", { time, msg });
  return true;
}

/////////////////////// Chat send & fetch ///////////////////////
let messageCount = 0;
let selectedFile = null;

function sendMessage() {
  const input = document.getElementById("text");
  const raw = (input && input.value) ? input.value.trim() : "";

  if (!raw && !selectedFile) return;

  appendMessage("user", raw || "File Sent");

  // If it's a reminder command, intercept
  if (detectReminderCommand(raw)) {
    if (input) input.value = ""; //clear 
    selectedFile = null;
    return;
  }

  if (input) input.value = "";

  // send to server (/get) as before
  const form = new FormData();
  form.append("msg", raw);
  if (selectedFile) form.append("file", selectedFile);

  fetch("/get", { method: "POST", body: form })
    .then(r => r.text())
    .then(data => displayBotResponse(data))
    .catch(err => {
      console.error("Chat fetch error:", err);
      displayError();
    })
    .finally(() => { selectedFile = null; });
}

function displayBotResponse(data) {
  const id = `bot-${messageCount++}`;
  appendMessage("model", "", id);
  const el = document.getElementById(id);
  if (!el) return;
  let i = 0;
  const iv = setInterval(() => {
    if (i < data.length) {
      el.textContent += data[i++];
      scrollToBottom();
    } else {
      clearInterval(iv);
    }
  }, 25);
}

function displayError() {
  appendMessage("model error", "⚠️ Failed to fetch a response from the server.");
}

/////////////////////// UI events ///////////////////////
function attachEventListeners() {
  const sendBtn = document.getElementById("send");
  const input = document.getElementById("text");
  const attachBtn = document.getElementById("attachment");
  const fileInput = document.getElementById("fileInput");

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);
  if (input) input.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

  if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      selectedFile = e.target.files[0];
      if (selectedFile) appendMessage("user", `📎 Selected: ${selectedFile.name}`);
    });
  }
}
