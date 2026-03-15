import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Kid } from "../types/auth";

export interface KidModeContextType {
  isKidMode: boolean;
  selectedKid: Kid | null;
  showExitModal: boolean;
  enterKidMode: (kid: Kid) => void;
  exitKidMode: () => void;
  setShowExitModal: (show: boolean) => void;
  updateSelectedKid: (kid: Kid) => void;
}

const KidModeContext = createContext<KidModeContextType | undefined>(undefined);

export const KidModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isKidMode, setIsKidMode] = useState<boolean>(false);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const kidModeActive = await SecureStore.getItemAsync("kidModeActive");
        const kidData = await SecureStore.getItemAsync("selectedKid");
        if (kidModeActive === "true" && kidData) {
          setIsKidMode(true);
          setSelectedKid(JSON.parse(kidData));
        } else {
          setIsKidMode(false);
          setSelectedKid(null);
        }
      } catch (e) {
        console.error("Failed to load kid mode state", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  const enterKidMode = async (kid: Kid) => {
    setIsKidMode(true);
    setSelectedKid(kid);
    await SecureStore.setItemAsync("kidModeActive", "true");
    await SecureStore.setItemAsync("selectedKid", JSON.stringify(kid));
  };

  const exitKidMode = async () => {
    try {
      // 1. Clear storage FIRST and AWAIT it
      // This prevents providers from re-reading "true" during navigation remounts
      await SecureStore.deleteItemAsync("kidModeActive");
      await SecureStore.deleteItemAsync("selectedKid");
    } catch (e) {
      console.error("Failed to clear kid mode storage:", e);
    }

    // 2. Update state ONLY AFTER storage is clean
    setIsKidMode(false);
    setSelectedKid(null);
    setShowExitModal(false);
  };

  const updateSelectedKid = async (kid: Kid) => {
    setSelectedKid(kid);
    await SecureStore.setItemAsync("selectedKid", JSON.stringify(kid));
  };

  if (isLoading) return null; // Or a loading spinner

  return (
    <KidModeContext.Provider
      value={{
        isKidMode,
        selectedKid,
        showExitModal,
        enterKidMode,
        exitKidMode,
        setShowExitModal,
        updateSelectedKid,
      }}
    >
      {children}
    </KidModeContext.Provider>
  );
};

export const useKidMode = () => {
  const context = useContext(KidModeContext);
  if (context === undefined) {
    throw new Error("useKidMode must be used within a KidModeProvider");
  }
  return context;
};
