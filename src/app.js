import "./css/styles.css";
import "./components/toolbar.js";
import "./components/buffer-zone.js";
import "./components/workspace.js";
import "./components/axes.js";
import "./components/polygon.js";
import "./components/dragging-area.js";

const bufferZone = document.createElement("buffer-zone");
const workspace = document.createElement("app-workspace");
const axes = document.createElement("app-axes");
const toolbar = document.createElement("app-toolbar");
const draggingArea = document.createElement("dragging-area");

document.body.appendChild(toolbar);
document.body.appendChild(bufferZone);
document.body.appendChild(axes);
document.body.appendChild(workspace);
document.body.appendChild(draggingArea);
let draggedPolygon = null;
let offsetX = 0,
  offsetY = 0;

toolbar.addEventListener("create", () => createRandomPolygonsInBuffer());
toolbar.addEventListener("save", () => saveState());
toolbar.addEventListener("reset", () => resetState());

workspace.addEventListener("workspace-ready", (e) => {});
workspace.addEventListener("workspace-update", (e) => {});
axes.addEventListener("resize", () => {
  axes.onResize();
});

loadState();

function createRandomPolygonsInBuffer() {
  bufferZone.clear();
  const count = Math.floor(Math.random() * 5) + 5;
  for (let i = 0; i < count; i++) {
    const vertices = Math.floor(Math.random() * 5) + 3;
    const shapePoints = [];
    for (let j = 0; j < vertices; j++) {
      const angle = (j * 2 * Math.PI) / vertices;
      const radius = 20 + Math.random() * 15;
      const px = radius * Math.cos(angle);
      const py = radius * Math.sin(angle);
      shapePoints.push(`${px},${py}`);
    }
    const polygon = document.createElement("app-polygon");
    polygon.setPoints(shapePoints.join(" "));

    const bw = bufferZone.offsetWidth;
    const bh = bufferZone.offsetHeight;
    const randX = Math.random() * (bw - 60) + 30;
    const randY = Math.random() * (bh - 60) + 30;

    polygon.setTransform(`translate(${randX},${randY})`);

    const polygonElement = polygon.getPolygonElement();
    polygonElement.addEventListener("mousedown", startDragFromBuffer);
    bufferZone.addPolygon(polygonElement);
  }
}

function startDragFromBuffer(e) {
  e.preventDefault();
  draggedPolygon = e.target;

  const transform =
    draggedPolygon.getAttribute("transform") || "translate(0,0)";

  const pt = draggingArea.shadowRoot.querySelector("svg").createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgP = pt.matrixTransform(
    draggingArea.shadowRoot.querySelector("svg").getScreenCTM().inverse()
  );
  const polygonCTM = draggedPolygon.getScreenCTM();
  const localClick = pt.matrixTransform(polygonCTM.inverse());

  offsetX = localClick.x;
  offsetY = localClick.y;

  draggedPolygon.style.display = "none";

  draggedPolygon.setAttribute(
    "transform",
    `translate(${svgP.x - offsetX},${svgP.y - offsetY})`
  );

  draggingArea.add(draggedPolygon);

  draggedPolygon.style.cursor = "grabbing";
  draggedPolygon.style.display = "";

  document.addEventListener("mousemove", onDragging);
  document.addEventListener("mouseup", onDrop);
}

function onDrop(e) {
  document.removeEventListener("mousemove", onDragging);
  document.removeEventListener("mouseup", onDrop);

  if (!draggedPolygon) return;

  const mainRect = workspace.getBoundingClientRect();
  const x = e.clientX,
    y = e.clientY;

  if (
    x >= mainRect.left &&
    x <= mainRect.right &&
    y >= mainRect.top &&
    y <= mainRect.bottom
  ) {
    const { pos, scale } = workspace;
    const localX = (x - mainRect.left - pos.x) / scale;
    const localY = (y - mainRect.top - pos.y) / scale;

    const step =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--grid-step"
        )
      ) || 50;
    const snappedX = Math.round(localX / step) * step;
    const snappedY = Math.round(localY / step) * step;
    draggedPolygon.setAttribute(
      "transform",
      `translate(${snappedX},${snappedY})`
    );
    draggedPolygon.style.cursor = "move";
    draggedPolygon.removeEventListener("mousedown", startDragFromBuffer);
    draggedPolygon.addEventListener("mousedown", startDragFromWorkspace);

    workspace.addPolygon(draggedPolygon);
  } else {
    const bufferRect = bufferZone.getBoundingClientRect();
    const localX = e.clientX - bufferRect.left;
    const localY = e.clientY - bufferRect.top;

    draggedPolygon.setAttribute("transform", `translate(${localX},${localY})`);
    draggedPolygon.style.cursor = "move";
    draggedPolygon.style.display = "";
    bufferZone.addPolygon(draggedPolygon);
    draggedPolygon.addEventListener("mousedown", startDragFromBuffer);
  }

  if (draggingArea.shadowRoot.querySelector("svg").contains(draggedPolygon)) {
    draggingArea.remove(draggedPolygon);
  }
  draggedPolygon = null;
}
function onDragging(e) {
  if (!draggedPolygon) return;
  e.preventDefault();

  const pt = draggingArea.shadowRoot.querySelector("svg").createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgP = pt.matrixTransform(
    draggingArea.shadowRoot.querySelector("svg").getScreenCTM().inverse()
  );

  const dx = svgP.x;
  const dy = svgP.y;
  draggedPolygon.setAttribute("transform", `translate(${dx},${dy})`);
}

function startDragFromWorkspace(e) {
  e.preventDefault();
  draggedPolygon = e.target;

  const transform =
    draggedPolygon.getAttribute("transform") || "translate(0,0)";

  const pt = draggingArea.shadowRoot.querySelector("svg").createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgP = pt.matrixTransform(
    draggingArea.shadowRoot.querySelector("svg").getScreenCTM().inverse()
  );
  const polygonCTM = draggedPolygon.getScreenCTM();
  const localClick = pt.matrixTransform(polygonCTM.inverse());

  offsetX = localClick.x;
  offsetY = localClick.y;

  draggedPolygon.style.display = "none";

  draggedPolygon.setAttribute(
    "transform",
    `translate(${svgP.x - offsetX},${svgP.y - offsetY})`
  );

  draggingArea.add(draggedPolygon);
  draggedPolygon.style.cursor = "grabbing";
  draggedPolygon.style.display = "";

  document.addEventListener("mousemove", onDragging);
  document.addEventListener("mouseup", onDropFromWorkspace);
}

function onDropFromWorkspace(e) {
  document.removeEventListener("mousemove", onDragging);
  document.removeEventListener("mouseup", onDropFromWorkspace);

  if (!draggedPolygon) return;

  const bufferRect = bufferZone.getBoundingClientRect();
  const x = e.clientX,
    y = e.clientY;

  if (
    x >= bufferRect.left &&
    x <= bufferRect.right &&
    y >= bufferRect.top &&
    y <= bufferRect.bottom
  ) {
    const localX = e.clientX - bufferRect.left;
    const localY = e.clientY - bufferRect.top;

    draggedPolygon.setAttribute("transform", `translate(${localX},${localY})`);
    draggedPolygon.style.cursor = "move";
    draggedPolygon.style.display = "";
    bufferZone.addPolygon(draggedPolygon);
    draggedPolygon.addEventListener("mousedown", startDragFromBuffer);
    draggedPolygon.removeEventListener("mousedown", startDragFromWorkspace);
  } else {
    draggedPolygon.style.display = "";
    workspace.addPolygon(draggedPolygon);
    draggedPolygon.addEventListener("mousedown", startDragFromWorkspace);
  }

  if (draggingArea.shadowRoot.querySelector("svg").contains(draggedPolygon)) {
    draggingArea.remove(draggedPolygon);
  }
  draggedPolygon = null;
}

function saveState() {
  const bufferPolygons = bufferZone
    .getPolygons()
    .map((p) => p.outerHTML)
    .join("");
  const contentPolygons = workspace
    .getPolygons()
    .map((p) => p.outerHTML)
    .join("");

  const state = {
    buffer: bufferPolygons,
    content: contentPolygons,
    pos: workspace.pos,
    scale: workspace.scale,
  };
  localStorage.setItem("polygonsSvgApp", JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem("polygonsSvgApp");
  if (!raw) return;

  const st = JSON.parse(raw);

  bufferZone.clear();
  workspace.clear();

  const tempBufferDiv = document.createElement("div");
  tempBufferDiv.innerHTML = st.buffer;

  tempBufferDiv.querySelectorAll("polygon").forEach((polygonElement) => {
    const polygon = document.createElement("app-polygon");
    polygon
      .getPolygonElement()
      .setAttribute("points", polygonElement.getAttribute("points"));
    polygon.setTransform(polygonElement.getAttribute("transform"));
    const newElement = polygon.getPolygonElement();
    newElement.addEventListener("mousedown", startDragFromBuffer);
    bufferZone.addPolygon(newElement);
  });

  const tempWorkspaceDiv = document.createElement("div");
  tempWorkspaceDiv.innerHTML = st.content;
  tempWorkspaceDiv.querySelectorAll("polygon").forEach((polygonElement) => {
    const polygon = document.createElement("app-polygon");
    polygon
      .getPolygonElement()
      .setAttribute("points", polygonElement.getAttribute("points"));
    polygon.setTransform(polygonElement.getAttribute("transform"));
    const newElement = polygon.getPolygonElement();
    newElement.addEventListener("mousedown", startDragFromWorkspace);
    workspace.addPolygon(newElement);
  });

  workspace.pos = st.pos || { x: 0, y: 0 };
  workspace.scale = st.scale || 1;

  workspace.updateTransform();
}

function resetState() {
  localStorage.removeItem("polygonsSvgApp");
  bufferZone.clear();
  workspace.clear();
  workspace.pos = { x: 0, y: 0 };
  workspace.scale = 1;
  workspace.updateTransform();
}
