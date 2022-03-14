import * as THREE from "three";
import { POINT_COLOR } from "../colors";

export const points = [
  new THREE.Vector3(388, 145, 23),
  new THREE.Vector3(0, 145, 0),
  new THREE.Vector3(100, 335, 23),
  new THREE.Vector3(488, 335, 46),
];

export const minSideDistance = 215.9374909551373;
export const maxSideDistance = 388.6811032195931;
export const parallelogramArea = 78637.01012063428;

export const firstLabelStrings = [
  "Element: Point 1;",
  "X: 388;",
  "Y: 145;",
  "Z: 23;",
];
export const secondLabelStrings = [
  "Element: Point 2;",
  "X: 0;",
  "Y: 145;",
  "Z: 0;",
];

export const createMockPoint = (index: number) => {
  const pointGeometry = new THREE.TorusGeometry(11, 1, 30, 45, 7);
  const material = new THREE.MeshLambertMaterial({
    color: POINT_COLOR,
  });
  const point = new THREE.Mesh(pointGeometry, material);

  point.position.copy(points[index]);
  point.castShadow = true;
  point.receiveShadow = true;

  return point;
};
