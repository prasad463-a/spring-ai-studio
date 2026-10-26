# 🌟 Spring AI Studio

A modern, responsive full-stack Spring AI application featuring interactive generative AI capabilities:
- 🍳 **Recipe Generator**: Generates customized gourmet recipes based on available ingredients, cuisine preferences, and dietary restrictions.
- 🎨 **Image Studio**: Creates high-quality AI images on demand from natural language descriptions.
- 💬 **AI Chat Assistant**: Real-time interactive AI chat powered by Groq (GPT-OSS / Llama).

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** or higher
- **Maven 3.8+** (or use the included `./mvnw`)
- A **Groq API Key** (Get one free at [console.groq.com](https://console.groq.com))

---

### Configuration

Set your Groq API key using an environment variable:

#### On Windows (PowerShell):
```powershell
$env:GROQ_API_KEY="your_groq_api_key_here"
```

#### On Linux / macOS:
```bash
export GROQ_API_KEY="your_groq_api_key_here"
```

Alternatively, you can provide it when launching the Spring Boot application:
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.ai.openai.api-key=your_groq_api_key_here"
```

---

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd springAi
   ```

2. Run the application:
   ```powershell
   ./mvnw spring-boot:run
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## 🛠️ Tech Stack
- **Backend**: Spring Boot 3, Spring AI (OpenAI/Groq compatible client)
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Glassmorphism Dark UI)
- **Image Generation**: Pollinations AI Integration
