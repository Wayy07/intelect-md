import { useEffect, RefObject } from "react";

/**
 * Hook that alerts when you click outside of the passed ref
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  excludeRefs: RefObject<HTMLElement>[] = []
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      const target = event.target as Node;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(target)) {
        return;
      }

      // Do nothing if clicking excluded elements
      for (const excludeRef of excludeRefs) {
        if (excludeRef.current?.contains(target)) {
          return;
        }
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, excludeRefs]);
}
