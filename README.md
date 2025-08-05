📚 StudyHub – YouTube Video Note-Taking App
StudyHub is a minimalist web application that allows students to take structured notes while watching YouTube videos. With an embedded video player and an integrated note panel, it's designed to enhance learning productivity by combining watching + writing in a single focused space.

<!-- Replace with real screenshot if needed -->

🚀 Features
🎥 Watch YouTube Videos: Paste any YouTube link and watch it directly within the app.

📝 Take Sticky Notes: Title and write notes in a dedicated panel beside the video.

💾 Persistent Storage: Notes are saved locally on your device per video.

📂 Export Notes: Download your notes as .txt files for easy reference or sharing.

🕒 Timestamp-Linked Notes (optional): Link notes to specific moments in the video.

🌙 Responsive Design + Dark Mode (optional): Mobile-friendly and theme toggle support.

🛠️ Tech Stack
Layer	Technologies Used
Frontend	HTML5, CSS3 / TailwindCSS, JavaScript (ES6)
Video Embed	YouTube IFrame Player API
Storage	Browser localStorage API
Export	JavaScript Blob API
Hosting	Vercel / GitHub Pages (static site)

📂 Folder Structure (if using React or Modular JS)
pgsql
Copy
Edit
study-hub/
├── public/
│   └── index.html
├── src/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   └── youtube.js
├── README.md
🚧 Setup Instructions (for Local Development)
👉 Option 1: Run Locally
Unzip the project:

bash
Copy
Edit
unzip study-hub.zip
cd study-hub
Open index.html in your browser.

👉 Option 2: Deploy on Vercel
Push the project to a GitHub repository.

Visit https://vercel.com and import the repo.

Click Deploy – it will be live in seconds.

👉 Option 3: Deploy on GitHub Pages
Push the project to GitHub.

Go to Settings > Pages, choose main branch and /root or /docs.

Save and visit your new link!

💡 How It Works
Extracts the YouTube video ID from pasted URLs.

Embeds the video in an <iframe> using the YouTube IFrame API.

Stores notes in localStorage using keys like notes_<videoID>.

Notes persist between sessions as long as you use the same browser and device.

📦 Future Improvements
🔐 User authentication (e.g., Firebase Auth)

☁️ Cloud storage for cross-device sync

📄 Export notes as .pdf or .html

🧠 AI-Powered note suggestions (via Perplexity API)

🗃️ Categorize videos and group notes by subject

🧑‍💻 Contributing
PRs are welcome! To contribute:

Fork the repository

Create a new branch (feature/your-feature)

Commit your changes

Open a pull request

📃 License
This project is licensed under the MIT License.
