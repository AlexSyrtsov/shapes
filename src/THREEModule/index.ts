import * as THREE from "three";

import GUI from "lil-gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

import {
  getDistanceToNextPoint,
  getParallelogramArea,
  getParallelogramLastPoint,
} from "../utils";
import { TextLabel } from "../textLabel";
import {
  BACKGROUND_COLOR,
  AMBIENT_LIGHT_COLOR,
  SPOTLIGHT_COLOR,
  PLANE_SHADOW_COLOR,
  POINT_COLOR,
  PARALLELORGAM_COLOR,
  CIRCLE_COLOR,
} from "../colors";

export class THREEModule {
  container: HTMLElement | null;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  onUpPosition: THREE.Vector2;
  onDownPosition: THREE.Vector2;
  geometry: THREE.TorusGeometry;
  transformControl: TransformControls | null;
  controls: OrbitControls | null;
  vectorHelper: THREE.Vector3;
  positionHelper: THREE.Vector3;
  pointsObjects: Array<THREE.Object3D<THREE.Event>>;
  pointsLabels: Array<TextLabel>;
  circleLabel: TextLabel | null;
  positions: Array<THREE.Vector3>;
  circle: THREE.Mesh | null;
  parallelogram: THREE.Line | null;
  isInfoVisible: boolean;
  infoContainer: HTMLElement | null;

  constructor() {
    this.container = document.getElementById("app");
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.onUpPosition = new THREE.Vector2();
    this.onDownPosition = new THREE.Vector2();
    this.geometry = new THREE.TorusGeometry(11, 1, 30, 45, 7);
    this.vectorHelper = new THREE.Vector3();
    this.positionHelper = new THREE.Vector3();

    this.pointsObjects = [];
    this.pointsLabels = [];
    this.positions = [];

    this.circleLabel = null;
    this.transformControl = null;
    this.controls = null;
    this.circle = null;
    this.parallelogram = null;

    this.isInfoVisible = false;
    this.infoContainer = null;
  }

  setUpSceneAndCamera() {
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.camera.position.set(0, 250, 1000);
    this.scene.add(this.camera);
    this.scene.add(new THREE.AmbientLight(AMBIENT_LIGHT_COLOR));

    const light = new THREE.SpotLight(SPOTLIGHT_COLOR, 1.5);
    light.position.set(0, 1500, 200);
    light.angle = Math.PI * 0.2;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = -0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.scene.add(light);
  }

  setUpPlane() {
    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const planeMaterial = new THREE.ShadowMaterial({
      color: PLANE_SHADOW_COLOR,
      opacity: 0.2,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y = -200;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  setUpGrid() {
    const helper = new THREE.GridHelper(2000, 10);
    helper.position.y = -199;
    this.scene.add(helper);
  }

  setUpGui() {
    const gui = new GUI();
    console.log(gui);
    gui.add(
      {
        Reset: this.removePoints.bind(this),
      },
      "Reset"
    );

    gui.add(
      {
        About: this.toggleInfo.bind(this),
      },
      "About"
    );

    gui.open();
  }

  setUpControls() {
    this.transformControl = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener("change", this.render.bind(this));

    this.transformControl.addEventListener("change", this.render.bind(this));
    this.transformControl.addEventListener(
      "dragging-changed",
      this.onDragChange.bind(this)
    );
    this.scene.add(this.transformControl);

    this.transformControl.addEventListener(
      "objectChange",
      this.onObjectChange.bind(this)
    );
  }

  onDragChange(event: THREE.Event) {
    if (this.controls) {
      this.controls.enabled = !event.value;
    }
  }

  init() {
    this.setUpSceneAndCamera();
    this.setUpPlane();
    this.setUpGrid();
    this.setUpGui();
    this.setUpControls();

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.container?.appendChild(this.renderer.domElement);

    document.addEventListener("pointerdown", this.onPointerDown.bind(this));
    document.addEventListener("pointerup", this.onPointerUp.bind(this));
    document.addEventListener("pointermove", this.onPointerMove.bind(this));
    window.addEventListener("resize", this.onWindowResize.bind(this));

    this.render();
  }

  onObjectChange(event: THREE.Event) {
    if (this.pointsObjects.length === 4) {
      let index = this.pointsObjects.findIndex(
        (item) => item.uuid === event.target.object.uuid
      );
      let newIndexes: Array<number> = [];
      let newIndex = index;
      if (index === 3) {
        newIndex = 0;
        newIndexes = [1, 2, 3];
      } else if (index === 2) {
        newIndex = 3;
        newIndexes = [0, 1, 2];
      } else if (index === 1) {
        newIndex = 2;
        newIndexes = [3, 0, 1];
      } else if (index === 0) {
        newIndex = 1;
        newIndexes = [2, 3, 0];
      }
      const a = this.pointsObjects[newIndexes[0]].position;
      const b = this.pointsObjects[newIndexes[1]].position;
      const c = this.pointsObjects[newIndexes[2]].position;
      const lastPoint = getParallelogramLastPoint([a, b, c]);

      this.pointsObjects[newIndex].position.set(
        lastPoint.x,
        lastPoint.y,
        lastPoint.z
      );
    }

    this.updateHelpers();
  }

  addPointObject(position: THREE.Vector3, index: number) {
    const material = new THREE.MeshLambertMaterial({
      color: POINT_COLOR,
    });
    const point = new THREE.Mesh(this.geometry, material);

    point.position.copy(position);

    point.castShadow = true;
    point.receiveShadow = true;
    this.scene.add(point);
    this.pointsObjects.push(point);

    const text = new TextLabel(`Point ${index}`, point, this.camera);

    this.pointsLabels.push(text);
    this.container?.appendChild(text.element);

    return point;
  }

  addPoint(position: THREE.Vector3, index: number) {
    this.positions.push(this.addPointObject(position, index).position);

    this.updateHelpers();

    this.render();
  }

  removePoints() {
    for (let i = 0; i < this.pointsObjects.length; i++) {
      this.container?.removeChild(this.pointsLabels[i].element);
      const point = this.pointsObjects[i];

      if (this.transformControl?.object === point)
        this.transformControl.detach();
      this.scene.remove(point);
    }
    if (this.circleLabel) this.container?.removeChild(this.circleLabel.element);

    this.pointsObjects = [];
    this.pointsLabels = [];
    this.circleLabel = null;
    this.positions = [];

    this.updateHelpers();

    this.render();
  }

  updateHelpers() {
    if (this.circle) this.scene.remove(this.circle);
    if (this.parallelogram) this.scene.remove(this.parallelogram);

    if (this.pointsObjects.length === 4) {
      this.drawParalleloramAndCircle();
    }
  }

  drawParalleloramAndCircle() {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      ...this.positions,
      this.positions[0],
    ]);
    const materialNew = new THREE.LineBasicMaterial({
      color: PARALLELORGAM_COLOR,
    });
    this.parallelogram = new THREE.Line(geometry, materialNew);

    const [minSide, _, maxSide] = this.positions
      .map(getDistanceToNextPoint)
      .sort();

    const parallelogramArea = getParallelogramArea(
      minSide,
      maxSide,
      this.positions
    );

    this.scene.add(this.parallelogram);

    const box = new THREE.Box3();
    box.setFromPoints(this.positions);

    const boxCenter = box.getCenter(new THREE.Vector3());

    const circleRadius = Math.sqrt(parallelogramArea / Math.PI);
    const circleGeometry = new THREE.TorusGeometry(circleRadius, 1, 16, 100);

    const material = new THREE.MeshBasicMaterial({
      color: CIRCLE_COLOR,
    });
    this.circle = new THREE.Mesh(circleGeometry, material);
    this.circle.position.copy(boxCenter);
    this.scene.add(this.circle);

    if (this.circleLabel) {
      this.container?.removeChild(this.circleLabel.element);
      this.circleLabel = null;
    }
    const text = new TextLabel("Circle", this.circle, this.camera);

    this.circleLabel = text;
    this.container?.appendChild(text.element);
  }

  render() {
    for (let i = 0; i < this.pointsLabels.length; i++) {
      this.pointsLabels[i].update();
    }
    this.circleLabel?.update();
    this.renderer.render(this.scene, this.camera);
  }

  onPointerDown(event: MouseEvent) {
    this.onDownPosition.x = event.clientX;
    this.onDownPosition.y = event.clientY;
  }

  onPointerUp(event: MouseEvent) {
    if ((event.target as HTMLElement).closest(".lil-gui")) {
      return;
    }
    this.onUpPosition.x = event.clientX;
    this.onUpPosition.y = event.clientY;
    if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) {
      if (this.pointsObjects.length <= 2) {
        this.vectorHelper.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1,
          0.5
        );

        this.vectorHelper.unproject(this.camera);

        this.vectorHelper.sub(this.camera.position).normalize();

        const distance = -this.camera.position.z / this.vectorHelper.z;

        this.positionHelper
          .copy(this.camera.position)
          .add(this.vectorHelper.multiplyScalar(distance));

        this.addPoint(this.positionHelper, this.pointsObjects.length + 1);
        if (this.pointsObjects.length === 3) {
          this.addPoint(getParallelogramLastPoint(this.positions), 4);
        }
      }

      if (this.transformControl) this.transformControl.detach();
    }
  }

  onPointerMove(event: MouseEvent) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.pointsObjects,
      false
    );

    if (intersects.length > 0) {
      const object = intersects[0].object;

      if (this.transformControl && object !== this.transformControl.object) {
        this.transformControl.attach(object);
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.render();
  }

  toggleInfo() {
    this.isInfoVisible = !this.isInfoVisible;

    if (this.isInfoVisible) {
      this.infoContainer = document.createElement("div");
      this.infoContainer.className = "info-container";
      this.infoContainer.innerHTML = `
        <p>The program allows you to create a parallelogram at three points and get a circle whose area and center correspond to the area and center of the parallelogram. This program can be used in WebAR and VR, for marking up various data (for example, manual marking of a lidar map for subsequent training of a neural network).</p>
        </br>
        <p>Author - Alexander Syrtsov</p>
        <p>e-mail - <a href="mailto:alexander.publicity@gmail.com">alexander.publicity@gmail.com</a></p>

      `;

      this.container?.appendChild(this.infoContainer);
    } else {
      this.container?.removeChild(this.infoContainer!);
      this.infoContainer = null;
    }

    console.log(this.isInfoVisible);
  }
}
