import { createSVGElement } from "../utils/dom-utils.js";
class Polygon extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.polygon = createSVGElement("polygon", {
      fill: "var(--polygon-color)",
      cursor: "move",
    });
    this.shadowRoot.appendChild(this.polygon);
  }

  connectedCallback() {}
  setPoints(points) {
    this.polygon.setAttribute("points", points);
  }
  setTransform(transform) {
    this.polygon.setAttribute("transform", transform);
  }
  getPolygonElement() {
    return this.polygon;
  }
}
customElements.define("app-polygon", Polygon);
