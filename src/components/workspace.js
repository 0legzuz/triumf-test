import { createSVGElement } from "../utils/dom-utils.js";

class Workspace extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
          <style>
              :host {
                flex: 1;
                position: relative;
                overflow: hidden;
                background: var(--bg-color);
                display: block;
              }
            svg {
               position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                cursor: grab;
            }
             .ruler-line {
                    stroke: var(--axis-color);
                    stroke-width: 2;
                 }

                 .ruler-tick {
                    stroke: var(--axis-color);
                    stroke-width: 1;
                 }

                 .ruler-label {
                    fill: var(--axis-color);
                    font-size: 14px;
                    text-anchor: middle;
                    dominant-baseline: text-after-edge;
                 }
                .ruler-label.vertical {
                     text-anchor: end;
                     dominant-baseline: middle;
                }
          </style>
          <svg class="main-svg" id="mainSvg">
            <g id="gridGroup"></g>
            <g id="rulerGroup"></g>
            <g id="contentGroup"></g>
        </svg>
        `;
    this.svg = this.shadowRoot.getElementById("mainSvg");
    this.gridGroup = this.shadowRoot.getElementById("gridGroup");
    this.contentGroup = this.shadowRoot.getElementById("contentGroup");
    this.rulerGroup = this.shadowRoot.getElementById("rulerGroup");

    this.isPanning = false;
    this.startPos = { x: 0, y: 0 };
    this.pos = { x: 0, y: 0 };
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 4;
    this.minX = 0;
    this.minY = 0;
  }

  connectedCallback() {
    this.initEvents();
    this.initGrid();
    this.updateTransform();
    this.drawRulers();
    this.dispatchEvent(
      new CustomEvent("workspace-ready", {
        detail: {
          pos: this.pos,
          scale: this.scale,
        },
      })
    );
  }

  initEvents() {
    this.svg.addEventListener("mousedown", (e) => this.startPan(e));
    document.addEventListener("mouseup", () => this.endPan());
    document.addEventListener("mousemove", (e) => this.handlePan(e));

    this.svg.addEventListener("wheel", (e) => this.handleWheel(e), {
      passive: false,
    });
  }

  startPan(e) {
    if (e.target.tagName === "polygon") {
      return;
    }
    if (e.button === 0) {
      this.isPanning = true;
      this.startPos.x = e.clientX - this.pos.x;
      this.startPos.y = e.clientY - this.pos.y;
      this.svg.style.cursor = "grabbing";
    }
  }

  handlePan(e) {
    if (!this.isPanning) return;
    let dx = e.clientX - this.startPos.x;
    let dy = e.clientY - this.startPos.y;

    const containerRect = this.getBoundingClientRect();
    const scaledWidth = containerRect.width * this.scale;
    const scaledHeight = containerRect.height * this.scale;

    this.pos.x = Math.max(containerRect.width - scaledWidth, Math.min(0, dx));
    this.pos.y = Math.max(containerRect.height - scaledHeight, Math.min(0, dy));

    this.updateTransform();
    this.drawRulers();

    this.dispatchEvent(
      new CustomEvent("workspace-update", {
        detail: {
          pos: this.pos,
          scale: this.scale,
        },
      })
    );
  }

  endPan() {
    this.isPanning = false;
    this.svg.style.cursor = "grab";
  }

  handleWheel(e) {
    e.preventDefault();
    const zoomFactor = 1.1;
    let newScale = this.scale;

    if (e.deltaY < 0) {
      newScale *= zoomFactor;
    } else {
      newScale /= zoomFactor;
    }
    newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));

    const rect = this.svg.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const xRel = (cx - this.pos.x) / this.scale;
    const yRel = (cy - this.pos.y) / this.scale;

    this.scale = newScale;
    this.pos.x = cx - xRel * this.scale;
    this.pos.y = cy - yRel * this.scale;

    this.checkBounds();
    this.updateTransform();
    this.drawRulers();
    this.dispatchEvent(
      new CustomEvent("workspace-update", {
        detail: {
          pos: this.pos,
          scale: this.scale,
        },
      })
    );
  }

  checkBounds() {
    const containerRect = this.getBoundingClientRect();
    const scaledWidth = containerRect.width * this.scale;
    const scaledHeight = containerRect.height * this.scale;

    this.pos.x = Math.max(
      containerRect.width - scaledWidth,
      Math.min(0, this.pos.x)
    );
    this.pos.y = Math.max(
      containerRect.height - scaledHeight,
      Math.min(0, this.pos.y)
    );
  }

  updateTransform() {
    const t = `translate(${this.pos.x},${this.pos.y}) scale(${this.scale})`;
    this.gridGroup.setAttribute("transform", t);
    this.contentGroup.setAttribute("transform", t);
  }

  initGrid() {
    const defs = createSVGElement("defs");
    const pattern = createSVGElement("pattern", {
      id: "gridPattern",
      patternUnits: "userSpaceOnUse",
      width: 50,
      height: 50,
    });

    const lineV = createSVGElement("line", {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 50,
      stroke: "var(--grid-color)",
    });

    const lineH = createSVGElement("line", {
      x1: 0,
      y1: 0,
      x2: 50,
      y2: 0,
      stroke: "var(--grid-color)",
    });

    pattern.appendChild(lineV);
    pattern.appendChild(lineH);
    defs.appendChild(pattern);
    this.gridGroup.appendChild(defs);

    const bigRect = createSVGElement("rect", {
      x: -100000,
      y: -100000,
      width: 200000,
      height: 200000,
      fill: "url(#gridPattern)",
    });
    this.gridGroup.appendChild(bigRect);
  }

  addPolygon(polygon) {
    this.contentGroup.appendChild(polygon);
  }

  clear() {
    this.contentGroup.innerHTML = "";
  }

  getPolygons() {
    return [...this.contentGroup.querySelectorAll("polygon")];
  }

  drawRulers() {
    this.rulerGroup.innerHTML = "";
    const w = this.offsetWidth;
    const h = this.offsetHeight;

    const horizontalRuler = createSVGElement("g");
    const horizontalLine = createSVGElement("line", {
      x1: 0,
      y1: 15,
      x2: w,
      y2: 15,
      class: "ruler-line",
    });
    horizontalRuler.appendChild(horizontalLine);

    this.drawRulerTicks(horizontalRuler, true, this.pos.x, this.scale, w);
    this.rulerGroup.appendChild(horizontalRuler);

    const verticalRuler = createSVGElement("g");
    const verticalLine = createSVGElement("line", {
      x1: 20,
      y1: 0,
      x2: 20,
      y2: h,
      class: "ruler-line",
    });
    verticalRuler.appendChild(verticalLine);

    this.drawRulerTicks(verticalRuler, false, this.pos.y, this.scale, h);

    this.rulerGroup.appendChild(verticalRuler);
  }

  drawRulerTicks(ruler, isHorizontal, offset, scale, size) {
    const step = 50;
    const scaledStep = step * scale;

    const start = isHorizontal ? -offset / scale : -offset / scale;

    const startTick = Math.floor(start / step) * step;
    const endTick = start + size / scale;

    for (let tick = startTick; tick < endTick; tick += step) {
      const pos = tick;
      const coord = pos * scale + offset;
      if (isHorizontal) {
        const line = createSVGElement("line", {
          x1: coord,
          y1: 0,
          x2: coord,
          y2: 15,
          class: "ruler-tick",
        });
        ruler.appendChild(line);

        const label = createSVGElement("text", {
          x: coord,
          y: 35,
          class: "ruler-label",
        });
        label.textContent = pos;
        ruler.appendChild(label);
      } else {
        const line = createSVGElement("line", {
          x1: 20,
          y1: coord,
          x2: 0,
          y2: coord,
          class: "ruler-tick",
        });
        ruler.appendChild(line);

        const label = createSVGElement("text", {
          x: 50,
          y: coord,
          class: "ruler-label vertical",
        });
        label.textContent = pos;
        ruler.appendChild(label);
      }
    }
  }
}

customElements.define("app-workspace", Workspace);
