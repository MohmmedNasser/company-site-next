import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Plain `twMerge` doesn't know this project's semantic token names —
// `text-14` (font size, src/styles/tokens.css's type scale) and
// `text-text-primary` (text color) both fall outside its built-in
// font-size/color name lists, so its default heuristics lump them into the
// same "font-size" class group and silently drop whichever came first.
// Measured live: `twMerge("text-text-primary text-14")` returns just
// `"text-14"` — confirmed as the root cause of a real contrast failure
// (Input's `text-text-primary` class was being dropped, leaving text at
// the browser's inherited color). Declaring both groups explicitly fixes
// that without losing twMerge's actual job — letting a later class
// correctly override an earlier one of the *same* kind (e.g. a
// `className` prop overriding a component's own default size or color).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "11",
            "12",
            "13",
            "14",
            "16",
            "18",
            "20",
            "24",
            "32",
            "40",
            "48",
            "64",
            "80",
            "90",
            "96",
            "120",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            "primary",
            "secondary",
            "on-primary",
            "success",
            "warning",
            "error",
            "text-primary",
            "text-secondary",
            "text-decorative",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
