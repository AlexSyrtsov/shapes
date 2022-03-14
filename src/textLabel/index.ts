import * as THREE from "three";

export class TextLabel {
  element: HTMLDivElement;
  parent: THREE.Object3D;
  parentType: string;
  position: THREE.Vector3;
  camera: THREE.Camera;

  constructor(
    parentType: string,
    parent: THREE.Object3D,
    camera: THREE.Camera
  ) {
    const container = document.createElement("div");
    container.className = "text-label";
    this.element = container;
    this.parentType = parentType;
    this.parent = parent;
    this.camera = camera;
    this.position = new THREE.Vector3(0, 0, 0);
    this.element.innerHTML = this.getHTML();
  }

  update() {
    this.position.copy(this.parent.position);
    this.element.innerHTML = this.getHTML();

    const coords2d = this.get2DCoords(this.position, this.camera);
    this.element.style.left = coords2d.x + "px";
    this.element.style.top = coords2d.y + "px";
  }

  get2DCoords(position: THREE.Vector3, camera: THREE.Camera) {
    const vector = position.project(camera);
    vector.x = ((vector.x + 1) / 2) * window.innerWidth;
    vector.y = (-(vector.y - 1) / 2) * window.innerHeight;
    return vector;
  }

  getHTML() {
    return `
        <p>Element: ${this.parentType};</p>
        <p>X: ${this.parent.position.x.toFixed()};</p>
        <p>Y: ${this.parent.position.y.toFixed()};</p>
        <p>Z: ${this.parent.position.z.toFixed()};</p>
      `;
  }
}
