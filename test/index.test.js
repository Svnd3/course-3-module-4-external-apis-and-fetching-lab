/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");
require("@testing-library/jest-dom");

describe("Weather Data App - Input clearing", () => {
  let container;
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        current_condition: [
          {
            temp_C: "20",
            humidity: "65",
            weatherDesc: [{ value: "Partly cloudy" }],
          },
        ],
      }),
    });
    global.fetch = fetchMock;

    const html = fs.readFileSync(
      path.resolve(__dirname, "../index.html"),
      "utf8",
    );
    document.documentElement.innerHTML = html;
    container = document.body;

    jest.resetModules();
    require("../index.js");
    document.dispatchEvent(new Event("DOMContentLoaded"));
  });

  it("calls fetch with the correct city in the URL", async () => {
    const { getByPlaceholderText, getByText } =
      require("@testing-library/dom").within(container);

    const input = getByPlaceholderText("Enter city name");
    const button = getByText("Get Weather Data");

    input.value = "London";
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://wttr.in/London?format=j1");
  });

  it("displays fetched weather data in the DOM after a successful fetch", async () => {
    const { getByPlaceholderText, getByText } =
      require("@testing-library/dom").within(container);

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        current_condition: [
          {
            temp_C: "15",
            humidity: "70",
            weatherDesc: [{ value: "Sunny" }],
          },
        ],
      }),
    });

    const input = getByPlaceholderText("Enter city name");
    const button = getByText("Get Weather Data");

    input.value = "Paris";
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const displayDiv = container.querySelector("#weather-display");
    expect(displayDiv).toHaveTextContent("Temperature: 15°C");
    expect(displayDiv).toHaveTextContent("Humidity: 70%");
    expect(displayDiv).toHaveTextContent("Description: Sunny");

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        current_condition: [
          {
            temp_C: "10",
            humidity: "80",
            weatherDesc: [{ value: "Rainy" }],
          },
        ],
      }),
    });

    input.value = "Berlin";
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(displayDiv).toHaveTextContent("Temperature: 10°C");
    expect(displayDiv).toHaveTextContent("Humidity: 80%");
    expect(displayDiv).toHaveTextContent("Description: Rainy");
  });

  it("clears the input field after clicking fetch", async () => {
    const { getByPlaceholderText, getByText } =
      require("@testing-library/dom").within(container);

    const input = getByPlaceholderText("Enter city name");
    const button = getByText("Get Weather Data");

    input.value = "Tokyo";
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(input.value).toBe("");
  });

  it("displays an error message when fetch fails", async () => {
    const { getByPlaceholderText, getByText } =
      require("@testing-library/dom").within(container);
    fetchMock.mockRejectedValue(new Error("Network failure"));

    const input = getByPlaceholderText("Enter city name");
    const button = getByText("Get Weather Data");

    input.value = "InvalidCity";
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const errorDiv = container.querySelector("#error-message");
    expect(errorDiv).not.toHaveClass("hidden");
    expect(errorDiv).toHaveTextContent(/network failure/i);

    fetchMock.mockRejectedValue(new Error("Other issue"));

    input.value = "AnotherInvalid";
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorDiv).not.toHaveClass("hidden");
    expect(errorDiv).toHaveTextContent(/other issue/i);
  });

  it("clears the error message after a successful fetch", async () => {
    const { getByPlaceholderText, getByText } =
      require("@testing-library/dom").within(container);

    fetchMock.mockRejectedValue(new Error("Network issue"));

    const input = getByPlaceholderText("Enter city name");
    const button = getByText("Get Weather Data");

    input.value = "InvalidCity";
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const errorDiv = container.querySelector("#error-message");
    expect(errorDiv).not.toHaveClass("hidden");
    expect(errorDiv).toHaveTextContent(/network issue/i);

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        current_condition: [
          {
            temp_C: "25",
            humidity: "60",
            weatherDesc: [{ value: "Clear sky" }],
          },
        ],
      }),
    });

    input.value = "Madrid";
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(errorDiv.textContent).toBe("");
    expect(errorDiv).toHaveClass("hidden");
  });
});
