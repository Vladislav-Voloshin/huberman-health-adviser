import { getRequestId } from "./request-id";
import { NextRequest } from "next/server";

describe("getRequestId", () => {
  it("returns x-request-id header when present", () => {
    const request = new NextRequest("http://localhost/api/test", {
      headers: { "x-request-id": "custom-id-123" },
    });
    expect(getRequestId(request)).toBe("custom-id-123");
  });

  it("generates a UUID when no x-request-id header", () => {
    const request = new NextRequest("http://localhost/api/test");
    const id = getRequestId(request);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("returns different IDs for different requests without header", () => {
    const req1 = new NextRequest("http://localhost/api/test");
    const req2 = new NextRequest("http://localhost/api/test");
    const id1 = getRequestId(req1);
    const id2 = getRequestId(req2);
    expect(id1).not.toBe(id2);
  });
});
