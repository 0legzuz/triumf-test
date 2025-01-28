import { createSVGElement } from "../utils/dom-utils.js";

class BufferZone extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
                :host {
                border: 2px solid var(--border-color);
                    height: var(--zone-height);
                    position: relative;
                    background: var(--bg-color);
                    margin-bottom: 4px;
                     display: block;
                }

                svg {
                   width: 100%;
                   height: 100%;
                   background: var(--bg-color);
                }
             </style>
            <svg id="bufferSvg"></svg>
        `;
    this.svg = this.shadowRoot.getElementById("bufferSvg");
  }

  addPolygon(polygon) {
    this.svg.appendChild(polygon);
  }
  clear() {
    this.svg.innerHTML = "";
  }
  getPolygons() {
    return [...this.svg.querySelectorAll("polygon")];
  }
}

customElements.define("buffer-zone", BufferZone);
