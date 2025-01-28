import { createSVGElement } from "../utils/dom-utils.js";
class Toolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
        <style>
            :host {
              padding: 12px;
              background: var(--toolbar-bg);
              border-bottom: 1px solid var(--border-color);
              display: flex;
              gap: 1rem;
            }
            
            button {
                padding: 8px 16px;
                background: var(--primary-color);
                color: #fff;
                border: none;
                border-radius: 20px;
                font-weight: 500;
                cursor: pointer;
            }
        </style>
          <button id="createBtn">Создать</button>
          <button id="saveBtn">Сохранить</button>
          <button id="resetBtn">Сбросить</button>
        `;
    this.createBtn = this.shadowRoot.getElementById("createBtn");
    this.saveBtn = this.shadowRoot.getElementById("saveBtn");
    this.resetBtn = this.shadowRoot.getElementById("resetBtn");
  }

  connectedCallback() {
    this.createBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("create"))
    );
    this.saveBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("save"))
    );
    this.resetBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("reset"))
    );
  }
}

customElements.define("app-toolbar", Toolbar);
