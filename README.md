## **🤖 Personal AI Assistant with Smart Reminders**
**🪄 Overview**

Meet your Personal AI Assistant, a web-based AI companion powered by Google’s Gemini 2.5 API.
It’s not just another chatbot — this assistant can chat naturally, detect objects from images, and most importantly, send you real-time desktop reminders to help you stay consistent with your study routine.

Built from scratch using Node.js, Express, and JavaScript, this project blends conversational AI with practical time management features — like your own mini digital coach that actually reminds you to study! 📚

## **🚀 Features**

## **💬 AI Chat Assistant – Chat naturally with Gemini 2.5 for questions, explanations, or motivation.**

## **🧠 Personal Memory – The bot remembers simple context like your name and interacts personally.**

## **🖼️ Image Understanding – Upload an image and let the AI describe or analyze what it sees.**

##**⏰ Smart Study Reminder System –**
Set reminders using simple language like:

remind me at 7:00 to start revision
remind me at 21:30 to take a break


The system saves reminders locally and sends desktop notifications right on time!

## **💻 Runs Fully on Your Local Machine – No cloud dependencies, just your Node server and browser.**

⚡ Gemini 2.5 Integration – Uses the latest Google Generative AI model for text and image generation.

## **🛠️ Tech Stack**
Layer	Technology
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express.js
AI Model	Google Gemini 2.5 API (@google/generative-ai)
Storage	LocalStorage (reminders), JSON file (memory)
File Uploads	Multer
Notifications	Browser Desktop Notification API
##**⚙️ Installation & Setup**
1️⃣ Clone the Project
git clone https://github.com/<your-username>/personal-ai-assistant.git
cd personal-ai-assistant

2️⃣ Install Dependencies
npm install

3️⃣ Create Your .env File
GEMINI_API_KEY=your_google_gemini_api_key


🔑 Get your Gemini API key from Google AI Studio
.

4️⃣ Run the Project
node server.js


Then open your browser and visit:
👉 http://localhost:3000

## **💡 How It Works**

You chat with the assistant through the web interface.

It understands natural commands like:

“remind me at 9 to study OS.”

Reminders are saved using localStorage and checked every 15 seconds.

When the time matches, you get a desktop notification saying it’s time to study!

You can also upload images for AI-powered analysis through Gemini 2.5.

## **🗣️ Example Commands**
my name is Ena
remind me at 18:00 to study for BCS
what is my name?
remind me at 9 to revise data mining

**🔔 Preview**

🖼️ (Add your screenshots or demo GIF here)
Example:


##**💬 My Favorite Line**

**“There are tons of bots out there… but can your bot remind you to study like mine does? 😏”**

## **👩‍💻 Author**

##**Tanjim Hossain Ena**
🎓 CSE Student @ North Western University, Khulna
💡 Passionate about building AI that helps humans — not just answers them.
