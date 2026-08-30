"use client";

import {
  Gamepad,
  ChevronRight,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  User,
  BookText,
} from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEmail, useUsername, useUserActions } from "@/stores/userStore";

type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  children?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
};

type UserData = {
  name: string;
  email: string;
  avatar?: string;
};

type Logo = {
  title: string;
  description: string;
};

type SidebarData = {
  logo: Logo;
  navGroups: NavGroup[];
  user?: UserData;
};

const BREADCRUMBS: Record<string, { parent: string; current: string }> = {
  "/": { parent: "Overview", current: "Dashboard" },
  "/about": { parent: "About", current: "Rules" },
  "/login": { parent: "User", current: "Sign in" },
  "/game": { parent: "Play", current: "Build" },
  "/account": { parent: "User", current: "Account" },
};

const sidebarData: Omit<SidebarData, "user"> = {
  logo: {
    title: "CS-ACE",
    description: "Build the best 5-stack",
  },
  navGroups: [
    {
      title: "Overview",
      defaultOpen: true,
      items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/" }],
    },
    {
      title: "About",
      defaultOpen: true,
      items: [{ label: "Rules", icon: BookText, href: "/about" }],
    },
    {
      title: "Play",
      defaultOpen: true,
      items: [{ label: "Build", icon: Gamepad, href: "/game" }],
    },
  ],
};

const SidebarLogo = ({ logo }: { logo: Logo }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" render={<Link to="/" />}>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">{logo.title}</span>
            <span className="text-xs text-muted-foreground">
              {logo.description}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const NavMenuItem = ({ item }: { item: NavItem }) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const location = useLocation();
  const isActive = location.pathname === item.href;

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          render={<NavLink to={item.href} />}
        >
          <Icon className="size-4" />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      defaultOpen
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger render={<SidebarMenuButton isActive={isActive} />}>
        <Icon className="size-4" />
        <span>{item.label}</span>
        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.label}>
              <SidebarMenuSubButton
                isActive={location.pathname === child.href}
                render={<NavLink to={child.href} />}
              >
                {child.label}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
};

const NavUser = ({ user }: { user: UserData }) => {
  const navigate = useNavigate();
  const { logout } = useUserActions();

  const handleLogout = () => {
    logout();
    void navigate("/");
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuGroup>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }
            >
              <Avatar className="size-8 rounded-lg">
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.name} />
                )}
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--anchor-width) min-w-56 rounded-lg"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    {user.avatar && (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link to="/account" />}>
                <User className="mr-2 size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuGroup>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const NoUser = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton render={<Link to="/login" />}>
          <User className="size-4" />
          <span>Sign in</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  logo: Logo;
  navGroups: NavGroup[];
  user: UserData | null;
}

const AppSidebar = ({ logo, navGroups, user, ...props }: AppSidebarProps) => {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarLogo logo={logo} />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <NavMenuItem key={item.label} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {(user && <NavUser user={user} />) || <NoUser />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

interface AppShellProps {
  className?: string;
  children: React.ReactNode;
}

export function AppShell({ className, children }: AppShellProps) {
  const location = useLocation().pathname;
  const breadcrumb = BREADCRUMBS[location] ?? {
    parent: "Overview",
    current: "Dashboard",
  };

  const username = useUsername();
  const email = useEmail();
  let user: UserData | null = null;

  if (username && email) {
    user = { name: username, email: email };
  }

  return (
    <SidebarProvider className={cn(className)}>
      <AppSidebar
        logo={sidebarData.logo}
        user={user}
        navGroups={sidebarData.navGroups}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 hidden data-[orientation=vertical]:h-4 md:block"
          />
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <span className="font-semibold">{sidebarData.logo.title}</span>
          </Link>
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to={location} />}>
                  {breadcrumb.parent}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumb.current}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
