import {
  getDistanceToNextPoint,
  getParallelogramArea,
  getParallelogramLastPoint,
} from ".";

import { points, maxSideDistance, parallelogramArea } from "../mocks";

describe(`Utils works correctly`, () => {
  it(`${getParallelogramLastPoint} return expected last point`, () => {
    const lastPoint = getParallelogramLastPoint(points.slice(0, 3));

    expect(typeof lastPoint).toBe("object");
    expect(lastPoint).toEqual(points[3]);
  });

  it(`${getDistanceToNextPoint} return expected distance`, () => {
    const distance = getDistanceToNextPoint(points[0], 0, points);

    expect(typeof distance).toBe("number");
    expect(distance).toEqual(maxSideDistance);
  });

  it(`${getParallelogramArea} return expected area`, () => {
    const [minSide, _, maxSide] = points.map(getDistanceToNextPoint).sort();
    const area = getParallelogramArea(minSide, maxSide, points);

    expect(typeof area).toBe("number");
    expect(area).toEqual(parallelogramArea);
  });
});
