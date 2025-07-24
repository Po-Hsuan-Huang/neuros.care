# Project Name: AI Yoga Assistant

## Overview
An AI-powered yoga assistant that provides real-time feedback on users' poses using a custom-trained deep learning model integrated into a full-stack web application. Designed to help users improve posture alignment and form during home workouts.

## Skills Demonstrated
- Proficient in **React**, **JavaScript**, **HTML**, and **CSS** for frontend development.
- Integrated a **pretrained TensorFlow.js model** for real-time pose estimation in the browser.
- Trained and fine-tuned custom **deep neural networks using TensorFlow**.
- Applied **model quantization** to reduce memory footprint and improve inference speed.
- Developed a lightweight **Flask backend** to manage model serving and API routing.
- Set up **CI/CD pipelines** for seamless deployment and updates.
- Deployed a **custom AI model into production** with performance monitoring.
- Managed the **full software development lifecycle** from prototyping to deployment.

## Tech Stack
- **Frontend:** React, Material-UI, Vite
- **Backend:** Flask
- **AI/ML:** TensorFlow, TensorFlow.js

## 🧪 Conda Environment Setup

To replicate the development environment:

1. **Install [Miniconda](https://docs.conda.io/en/latest/miniconda.html) or [Anaconda](https://www.anaconda.com/).**

2. **Clone this repository:**

   ```bash
   git clone git@github.com:Po-Hsuan-Huang/neuros.care.git
   cd neuros.care
   ```

3. **Create the environment from the `.yml` file:**

   ```bash
   conda env create -f environment.yml
   ```

4. **Activate the environment:**

   ```bash
   conda activate ai-yoga-assistant
   ```

5. **Start the development server (if applicable):**

   ```bash
   npm run dev
   ```

> 📌 If you run into issues with conflicting packages, try using `mamba` (a faster conda alternative):
>
> ```bash
> conda install mamba -n base -c conda-forge
> mamba env create -f environment.yml
> ```


6. **Start the fLASK backend server:**
   ```bash
   python server.py
   ```
7. **Turn on the web cam and open the browser to see the app**

## Available Scripts
- `npm run dev` – Launch the development server
- `npm run build` – Compile the project for production
- `npm run preview` – Preview the production build locally
