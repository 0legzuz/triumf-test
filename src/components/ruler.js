import { createSVGElement } from "../utils/dom-utils.js";

class Ruler extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
             :host {
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                   display: block;
                 }
                svg {
                    width: 100%;
                    height: 100%;
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
             <svg id="rulerSvg"></svg>
        `;
    this.svg = this.shadowRoot.getElementById("rulerSvg");
  }

  drawRulers(pos = { x: 0, y: 0 }, scale = 1) {
    this.svg.innerHTML = "";
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

    this.drawRulerTicks(horizontalRuler, true, pos.x, scale, w);
    this.svg.appendChild(horizontalRuler);

    const verticalRuler = createSVGElement("g");
    const verticalLine = createSVGElement("line", {
      x1: 20,
      y1: 0,
      x2: 20,
      y2: h,
      class: "ruler-line",
    });
    verticalRuler.appendChild(verticalLine);

    this.drawRulerTicks(verticalRuler, false, pos.y, scale, h);

    this.svg.appendChild(verticalRuler);
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

customElements.define("app-ruler", Ruler);
