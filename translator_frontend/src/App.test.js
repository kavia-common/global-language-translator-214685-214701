import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders translator title", () => {
  render(<App />);
  const title = screen.getByText(/Global Language Translator/i);
  expect(title).toBeInTheDocument();
});
