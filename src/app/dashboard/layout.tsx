import { dashboardNav } from "@/config/dashboard";
import { Role } from "@/db/schema/user";
import { dict } from "@/utils/dictionary";
import Layout from "../layout";
import { Hover } from "@/ui/hover-transition";
import { button } from "@/ui/button";

export default function DashboardLayout({
  role,
  children,
}: {
  role: Role;
  children?: any;
}) {
  return (
    <Layout>
      <header class="flex flex-col items-end border-b border-border pt-2">
        <div
          hx-get="/auth/navigation"
          hx-swap="outerHTML"
          hx-trigger="load"
          class="h-8"
        />
        <nav class="w-full self-start overflow-x-auto rounded-lg px-1 lg:px-8">
          <Hover class="flex gap-x-1 rounded-lg text-muted-foreground">
            {dashboardNav
              .filter((link) => link.clearance?.includes(role))
              .map((item) => (
                <Hover.Item class="relative mb-1.5 hover:text-foreground">
                  <button
                    class={button({ size: "sm" })}
                    hx-get={item.href}
                    hx-push-url="true"
                    hx-target="#dashboard-content"
                    hx-swap="innerHTML"
                    _="init if window.location.pathname contains @hx-get then add .navigation-indicator end
              on htmx:afterOnLoad tell the target take .navigation-indicator"
                  >
                    <i class={item.icon} aria-hidden="true" />
                    {dict.get(item.name)}
                  </button>
                </Hover.Item>
              ))}
          </Hover>
        </nav>
      </header>

      <main id="dashboard-content" class="min-h-screen pb-8">
        {children}
      </main>
    </Layout>
  );
}
