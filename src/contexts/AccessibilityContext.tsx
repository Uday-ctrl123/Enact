import { createContext } from "react";

export interface AccessibilityContextType {
  announceToScreenReader: (message: string) => void;
  focusManagement?: {
    trapFocus: (element: HTMLElement) => () => void;
    restoreFocus: (element: HTMLElement | null) => void;
  };
}

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);
