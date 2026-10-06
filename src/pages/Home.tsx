import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Scale,
  MessageSquare,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchQuerySchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = searchQuerySchema.safeParse({ query: query.trim() });

    if (!validation.success) {
      toast({
        title: t("home.invalidSearch"),
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    if (query.trim()) {
      navigate(`/results?q=${encodeURIComponent(query)}`);
    }
  };

  const commonIssues = [
    t("home.issue1"),
    t("home.issue2"),
    t("home.issue3"),
    t("home.issue4"),
    t("home.issue5"),
    t("home.issue6"),
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero px-4 py-20">
        <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
            {t("home.heroBadge")}
          </Badge>
          <h1 className="mb-6 font-heading text-4xl font-bold text-white md:text-6xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mb-8 text-lg text-white/90 md:text-xl">{t("home.heroDescription")}</p>

          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="text"
                placeholder={t("home.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-14 pl-12 pr-32 text-base shadow-lg"
                aria-label={t("home.searchLabel")}
                maxLength={500}
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                aria-label={t("home.searchButton")}
              >
                {t("common.getGuidance")}
              </Button>
            </div>
          </form>

          <p className="mt-4 text-sm text-white/80">
            {t("home.tryExample", { example: commonIssues[0] })}
          </p>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t("home.trustIndicator1Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.trustIndicator1Desc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">{t("home.trustIndicator2Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.trustIndicator2Desc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">{t("home.trustIndicator3Title")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.trustIndicator3Desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold">
            {t("home.commonIssuesTitle")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commonIssues.map((issue, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md"
                onClick={() => navigate(`/results?q=${encodeURIComponent(issue)}`)}
              >
                <CardContent className="flex items-center justify-between p-6">
                  <span className="text-sm font-medium">{issue}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold">
            {t("home.featuresTitle")}
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("home.feature1Title")}</CardTitle>
                <CardDescription>{t("home.feature1Desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/results?q=${t("home.whatAreMyRights")}`}>
                    {t("common.learnMore")} <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>{t("home.feature2Title")}</CardTitle>
                <CardDescription>{t("home.feature2Desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/chat">
                    {t("common.startChat")} <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Gavel className="h-6 w-6 text-success" />
                </div>
                <CardTitle>{t("home.feature3Title")}</CardTitle>
                <CardDescription>{t("home.feature3Desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/case-tracking">
                    {t("common.trackCase")} <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-gradient-hero text-white">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <h2 className="mb-4 font-heading text-3xl font-bold">{t("home.ctaTitle")}</h2>
              <p className="mb-8 max-w-2xl text-lg text-white/90">{t("home.ctaDescription")}</p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => document.querySelector("input")?.focus()}
              >
                {t("home.ctaButton")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
