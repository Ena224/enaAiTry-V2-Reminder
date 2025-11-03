require("dotenv").config();
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const uploads = multer({ dest: "uploads/" }); //temporary storage for uploads

// ---  Load memory from file or create empty one ---
const MEMORY_FILE = path.join(__dirname, "memory.json");
let memory = {}; //initialize memory object
try {
  if (fs.existsSync(MEMORY_FILE)) {
    memory = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } else {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({}, null, 2));
  }
} catch (err) {
  console.error("Error reading memory file:", err);
  memory = {};
}

// ---  Save memory back to file whenever updated ---
function saveMemory() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// ---  Check API key ---
if (!process.env.GEMINI_API_KEY) {
  console.error("Yo! Error — env file is missing the API Key, Ena :)");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.urlencoded({ extended: true }));   //allows the parser to use qs library for rich obj and arrays
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---  Main chat endpoint ---
app.post("/get", uploads.single("file"), async (req, res) => {
  const userInput = req.body.msg?.trim();
  const file = req.file;

  //  Handle memory-related commands before sending to AI
  if (userInput) {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.startsWith("my name is")) {
      const name = userInput.split("my name is")[1].trim();
      memory.name = name;
      saveMemory();
      return res.send(`Nice to meet you, ${name}! I’ll remember you.`);
    }

    if (lowerInput.includes("what is my name") || lowerInput.includes("what's my name")) {
      return res.send(
        memory.name ? `Your name is ${memory.name}, of course!` : "I don’t remember your name yet "
      );
    }
  }

  // --- Otherwise, process normally with AI ---
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let prompt = [userInput || ""];             //arr

    if (file) {
      const fileData = fs.readFileSync(file.path);
      const image = {
        inlineData: {
          data: fileData.toString("base64"),
          mimeType: file.mimetype,
        },
      };
      prompt.push(image);
    }

    const response = await model.generateContent(prompt);
    res.send(response.response.text()); //send back txt response 
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(error.status || 500).send("An error occurred while generating your response, dude!");
  } finally {
    if (file) {                                       
      fs.unlinkSync(file.path); 
    }
  }
});

// ---  Server startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
