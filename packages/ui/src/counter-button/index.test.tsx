import { test } from "bun:test";
import { createRoot } from "react-dom/client";
import { CounterButton } from ".";

test("CounterButton renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  root.render(<CounterButton />);
  root.unmount();
});
