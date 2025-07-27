import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Monitor,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@/hooks/use-debounce";
import { authService } from "@/lib/auth-service";

const oldNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Entries", href: "/entries", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout, user, updateUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const debouncedTheme = useDebounce(theme, 500);

  useEffect(() => {
    const updateThemePreference = async () => {
      if (debouncedTheme && user && user.theme !== debouncedTheme) {
        try {
          await authService.updateUser({ theme: debouncedTheme });
          updateUser({ ...user, theme: debouncedTheme });
        } catch (error) {
          // Silently handle error, or show a toast
        }
      }
    };
    updateThemePreference();
  }, [debouncedTheme, user, updateUser]);

  const handleLogout = () => {
    logout();
    toast({
      title: t('sidebar.logoutSuccessTitle', 'Logout successful'),
      description: t('sidebar.logoutSuccessDescription', 'You have been logged out successfully.'),
    });
    navigate("/login");
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const menuItems = [
    {
      name: t("sidebar.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    { name: t("sidebar.entries"), href: "/entries", icon: Clock },
    { name: t("sidebar.settings"), href: "/settings", icon: Settings },
  ];

  return (
      <div className={`chronos-sidebar h-full flex flex-col transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
          {!collapsed && (
              <div className="flex items-center">
                <img
                    src="/assets/logo_chronos.png"
                    alt="Chronos Logo"
                    className="h-10 w-10"
                />
              </div>
          )}
          <div className="flex items-center space-x-2">
            {onClose && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-sidebar-foreground hover:bg-sidebar-hover md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
            )}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="text-sidebar-foreground hover:bg-sidebar-hover hidden md:block"
            >
              {collapsed ? (
                  <img
                      src="/assets/logo_chronos.png"
                      alt="Chronos Logo"
                      className="h-5 w-5"
                  />
              ) : (
                  <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto md:overflow-y-hidden">
          {/* Navigation */}
          <nav className="p-4 space-y-2 md:flex-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                  <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-hover"
                      }`}
                  >
                    <item.icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
              );
            })}
          </nav>

          {/* User Info */}
          {user && !collapsed && (
              <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-sidebar-muted truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-hover ${
                    collapsed ? "px-2" : ""
                }`}
            >
              {getThemeIcon()}
              {!collapsed && <span className="ml-3">{t('sidebar.theme', 'Theme')}</span>}
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-hover ${
                    collapsed ? "px-2" : ""
                }`}
            >
              <LogOut className={`h-4 w-4 ${collapsed ? "" : "mr-3"}`} />
              {!collapsed && <span>{t('sidebar.logout', 'Log Out')}</span>}
            </Button>
          </div>
        </div>
      </div>
  );
}