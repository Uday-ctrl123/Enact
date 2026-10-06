import { useEffect, useState } from "react";
import { AccessibilityContext } from "@/contexts/AccessibilityContext";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create screen reader announcer
    const announcerElement = document.createElement("div");
    announcerElement.setAttribute("aria-live", "polite");
    announcerElement.setAttribute("aria-atomic", "true");
    announcerElement.className = "sr-only";
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (announcerElement.parentNode) {
        announcerElement.parentNode.removeChild(announcerElement);
      }
    };
  }, []);

  const announceToScreenReader = (message: string) => {
    if (announcer) {
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = "";
      }, 1000);
    }
  };

  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener("keydown", handleTabKey);
    };
  };

  const restoreFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  };

  const value = {
    announceToScreenReader,
    focusManagement: {
      trapFocus,
      restoreFocus,
    },
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
