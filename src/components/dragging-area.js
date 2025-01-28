import { createSVGElement } from "../utils/dom-utils.js";
class DraggingArea extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
                 :host {
                   position: fixed;
                   top: 0;
                   left: 0;
                   pointer-events: none;
                   width: 200px;
                   height: 200px;
                   overflow: visible;
                   z-index: 9999;
                 }
                svg {
                    width: 100%;
                    height: 100%;
                     overflow: visible;
                }
             </style>
            <svg id="draggingSvg"></svg>
        `;
    this.svg = this.shadowRoot.getElementById("draggingSvg");
  }
  add(element) {
    this.svg.appendChild(element);
  }
  clear() {
    this.svg.innerHTML = "";
  }
  remove(element) {
    this.svg.removeChild(element);
  }
}
customElements.define("dragging-area", DraggingArea);
