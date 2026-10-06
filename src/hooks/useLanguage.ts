import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/types/language";

interface UseLanguageReturn {
  currentLanguage: string;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isChanging: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

export const useLanguage = (): UseLanguageReturn => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  const changeLanguage = async (language: SupportedLanguage) => {
    setIsChanging(true);
    try {
      // Update i18n
      await i18n.changeLanguage(language);

      // Update database if user is logged in
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ preferred_language: language })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating language preference:", error);
          // Don't show error to user, just log it
        }
      }

      // Update localStorage for non-authenticated users
      localStorage.setItem("preferredLanguage", language);

      // Show success feedback
      const languageName = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName;
      toast({
        title: t("language.changed", { language: languageName }),
      });
    } catch (error) {
      console.error("Error changing language:", error);
      toast({
        title: t("errors.languageChangeFailed"),
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    isChanging,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};
