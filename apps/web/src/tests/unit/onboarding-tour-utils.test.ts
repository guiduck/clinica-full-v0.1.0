import { describe, expect, it } from "vitest";
import {
  chooseOnboardingPlacement,
  getOnboardingArrowStyle,
  getOnboardingCardStyle,
} from "@/utils/onboarding-tour/geometry";
import { readOnboardingStepFromQuery } from "@/utils/onboarding-tour/query-state";

const target = {
  top: 100,
  left: 100,
  right: 200,
  bottom: 150,
  width: 100,
  height: 50,
};

describe("onboarding tour utilities", () => {
  it("normalizes current and legacy query parameters", () => {
    expect(readOnboardingStepFromQuery("?tourStep=3")).toBe(2);
    expect(readOnboardingStepFromQuery("?onboarding=4")).toBe(3);
    expect(readOnboardingStepFromQuery("?onboarging=5")).toBe(4);
    expect(readOnboardingStepFromQuery("?tourStep=99")).toBeNull();
  });

  it("uses early placement fallbacks without nested conditionals", () => {
    expect(
      chooseOnboardingPlacement("left", target, 230, {
        width: 1440,
        height: 900,
      }),
    ).toBe("bottom");
    expect(
      chooseOnboardingPlacement("left", target, 230, {
        width: 500,
        height: 900,
      }),
    ).toBe("center");
  });

  it("calculates card style in a pure utility", () => {
    expect(
      getOnboardingCardStyle("right", target, 360, 230, {
        width: 1440,
        height: 900,
      }),
    ).toEqual({ left: 216, top: 100 });
  });

  it("points the arrow at the center of the highlighted target", () => {
    const cardStyle = getOnboardingCardStyle("bottom", target, 360, 230, {
      width: 1440,
      height: 900,
    });

    expect(
      getOnboardingArrowStyle("bottom", target, cardStyle, 360, 230),
    ).toEqual({ left: 42 });
  });
});
