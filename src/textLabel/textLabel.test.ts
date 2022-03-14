import * as THREE from "three";

import { TextLabel } from ".";
import {
  createMockPoint,
  firstLabelStrings,
  secondLabelStrings,
} from "../mocks";

describe(`Class ${TextLabel} work correctly`, () => {
  const mockPoint = createMockPoint(0);

  const label = new TextLabel(
    "Point 1",
    mockPoint,
    new THREE.PerspectiveCamera(70, 1, 1, 10000)
  );

  it(`${TextLabel} has expected className`, () => {
    expect(label.element.className).toEqual("text-label");
  });

  it(`${TextLabel} has expected DOM elements`, () => {
    expect(label.element.childElementCount).toEqual(4);
    for (let i = 0; i < firstLabelStrings.length; i++) {
      expect(label.element.children[i].innerHTML).toEqual(firstLabelStrings[i]);
    }
  });

  it(`${TextLabel} works correctly after update`, () => {
    label.parentType = "Point 2";
    label.parent = createMockPoint(1);
    label.update();
    expect(label.element.childElementCount).toEqual(4);
    for (let i = 0; i < secondLabelStrings.length; i++) {
      expect(label.element.children[i].innerHTML).toEqual(
        secondLabelStrings[i]
      );
    }
  });
});
