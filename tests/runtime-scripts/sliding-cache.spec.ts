import { SlidingCache } from "../../src/runtime-scripts/sliding-cache";

describe("SlidingCache", () => {
  let cache: SlidingCache;

  beforeEach(() => {
    cache = new SlidingCache(500);
  });

  describe("get", () => {
    describe("when the store hasn't own the property", () => {
      it("should create a new one", () => {
        // Act
        const record = cache["get"]("key");

        // Assert
        expect(record).toStrictEqual({ data: null, timeout: null, valid: false });
      });
    });

    describe("when the store has own the property", () => {
      it("should return it", () => {
        // Arrange
        cache["store"]["key"] = { data: 1, timeout: 2, valid: true };

        // Act
        const record = cache["get"]("key");

        // Assert
        expect(record).toStrictEqual({ data: 1, timeout: 2, valid: true });
      });
    });
  });

  describe("execute", () => {
    describe("when the cache record is invalid", () => {
      it("should fetch data from external", async () => {
        // Arrange
        const fetchData = jest.fn();

        // Act
        await cache.execute("key", fetchData);

        // Assert
        expect(fetchData).toBeCalledWith();
      });

      it("should assign data to the cache record", async () => {
        // Arrange
        const fetchData = jest.fn().mockResolvedValue(2);

        // Act
        const data = await cache.execute("key", fetchData);

        // Assert
        expect(data).toBe(2);
      });
    });

    describe("when called", () => {
      it("should call registerAutoClean", async () => {
        // Arrange
        cache["registerAutoClean"] = jest.fn();
        const fetchData = jest.fn().mockResolvedValue(2);

        // Act
        await cache.execute("key", fetchData);

        /// Assert
        expect(cache["registerAutoClean"]).toBeCalledWith({ data: 2, timeout: null, valid: true });
      });
    });

    describe("when cache record expired", () => {
      it("should set the property valid to false", async () => {
        // Arrange
        const fetchData = jest.fn().mockResolvedValue(2);

        // Act
        await cache.execute("key", fetchData);
        await new Promise((resolve) => setTimeout(() => resolve(1), 1000));

        /// Assert
        expect(cache["store"]["key"]["valid"]).toBe(false);
      });
    });
  });
});
