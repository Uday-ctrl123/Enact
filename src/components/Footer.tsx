import { Link } from "react-router-dom";
import { Scale, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-12 border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-bold text-primary">
                {t("common.appName")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("common.tagline")}. {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("common.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("header.chatAssistant")}
                </Link>
              </li>
              <li>
                <Link
                  to="/documents"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("footer.documentTemplates")}
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("footer.legalResources")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("footer.legalInfo")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("footer.aboutBNS")}</li>
              <li>{t("footer.privacyPolicy")}</li>
              <li>{t("footer.termsOfService")}</li>
              <li>{t("footer.disclaimer")}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("footer.emergencyHelplines")}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-destructive" />
                <span className="font-semibold">{t("footer.women")}: 181</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-destructive" />
                <span className="font-semibold">{t("footer.cyberCrime")}: 1930</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-destructive" />
                <span className="font-semibold">{t("footer.legalAid")}: 15100</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>{t("footer.copyright")}</p>
          <p className="text-xs">{t("footer.legalNotice")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
