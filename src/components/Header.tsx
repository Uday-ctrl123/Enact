import { Link, useLocation, useNavigate } from "react-router-dom";
import { Scale, MessageSquare, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MobileNav } from "@/components/MobileNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: t("auth.signedOut"),
      description: t("auth.signedOutDesc"),
    });
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold text-primary">
              {t("common.appName")}
            </span>
          </Link>
        </div>

        <nav className="hidden items-center space-x-1 md:flex">
          <Button
            asChild
            variant={isActive("/") ? "default" : "ghost"}
            size="sm"
            aria-current={isActive("/") ? "page" : undefined}
          >
            <Link to="/">{t("common.home")}</Link>
          </Button>
          <Button
            asChild
            variant={isActive("/chat") ? "default" : "ghost"}
            size="sm"
            aria-current={isActive("/chat") ? "page" : undefined}
          >
            <Link to="/chat">
              <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("header.chatAssistant")}
            </Link>
          </Button>
          <Button
            asChild
            variant={isActive("/case-tracking") ? "default" : "ghost"}
            size="sm"
            aria-current={isActive("/case-tracking") ? "page" : undefined}
          >
            <Link to="/case-tracking">
              <Scale className="mr-2 h-4 w-4" aria-hidden="true" />
              Case Tracking
            </Link>
          </Button>
        </nav>

        <div className="flex items-center space-x-2">
          <LanguageSelector />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  aria-label={t("auth.userMenu")}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.user_metadata?.full_name || t("auth.fullName")}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("auth.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                {t("auth.signIn")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
