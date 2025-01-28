import { createSVGElement } from "../utils/dom-utils.js";

class Axes extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
             :host {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                     display: block;
                 }
                svg {
                    width: 100%;
                    height: 100%;
                }
             </style>
            <svg id="axesSvg"></svg>
        `;
    this.svg = this.shadowRoot.getElementById("axesSvg");
  }

  connectedCallback() {
    this.drawAxes();
  }

  drawAxes() {
    this.svg.innerHTML = "";
    const w = this.offsetWidth;
    const h = this.offsetHeight;
    const axisColor =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--axis-color"
      ) || "#ccc";

    const xAxis = createSVGElement("line", {
      x1: 0,
      y1: h - 1,
      x2: w,
      y2: h - 1,
      stroke: axisColor,
      "stroke-width": 2,
    });
    this.svg.appendChild(xAxis);

    const yAxis = createSVGElement("line", {
      x1: 1,
      y1: 0,
      x2: 1,
      y2: h,
      stroke: axisColor,
      "stroke-width": 2,
    });
    this.svg.appendChild(yAxis);
  }

  onResize() {
    this.drawAxes();
  }
}

customElements.define("app-axes", Axes);
