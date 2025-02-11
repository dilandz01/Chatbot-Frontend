import React from "react";
import { createRoot } from "react-dom/client";
import ChatbotWidget from "../components/ChatbotWidget";
import "../index.css";

class ChatbotWidgetElement extends HTMLElement {
  connectedCallback() {
   
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }); // Use Shadow DOM for style encapsulation
    }

    // Create a <style> element to add Tailwind CSS inside Shadow DOM
    const style = document.createElement("style");
    style.textContent = `
      @import url("https://ow-ai-chatbot.netlify.app/ow-chatbot.css"); // ✅ Load Tailwind styles manually
    `;

    // Check if already rendered
    if (!this.shadowRoot.innerHTML) {
      const container = document.createElement("div");
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(container);

      const root = createRoot(container);
      root.render(React.createElement(ChatbotWidget));
    }
  }
}

// Ensure Web Component is registered only once
if (!customElements.get("chatbot-widget")) {
  customElements.define("chatbot-widget", ChatbotWidgetElement);
}
