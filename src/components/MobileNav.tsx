import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, MessageSquare, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Scale } from "lucide-react";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { path: "/", label: "Home", icon: Home },
    { path: "/chat", label: "Chat Assistant", icon: MessageSquare },
    { path: "/case-tracking", label: "Case Tracking", icon: Scale },
  ];

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span>ENACT</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.path}
                  asChild
                  variant={isActive(link.path) ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setOpen(false)}
                >
                  <Link to={link.path}>
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
