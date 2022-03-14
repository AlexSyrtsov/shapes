import * as THREE from "three";

export const getParallelogramArea = (
  minSideDistance: number,
  maxSideDistance: number,
  positions: Array<THREE.Vector3>
) =>
  minSideDistance *
  maxSideDistance *
  Math.sin(positions[0].angleTo(positions[1]));

export const getDistanceToNextPoint = (
  item: THREE.Vector3,
  index: number,
  arr: Array<THREE.Vector3>
) => item.distanceTo(arr[index + 1 < arr.length ? index + 1 : 0]);

export const getParallelogramLastPoint = (positions: Array<THREE.Vector3>) => {
  const [firstPoint, secondPoint, thirdPoint] = positions;
  return new THREE.Vector3(
    firstPoint.x + thirdPoint.x - secondPoint.x,
    firstPoint.y + thirdPoint.y - secondPoint.y,
    firstPoint.z - secondPoint.z + thirdPoint.z
  );
};
