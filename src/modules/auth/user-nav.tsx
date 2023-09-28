import { Button } from "@/ui/button";
import Dropdown from "@/ui/dropdown";
import { Hover } from "@/ui/hover-transition";
import { dict } from "@/utils/dictionary";
import { JWTPayloadSpec } from "@elysiajs/jwt";

type User =
  | ({
      id: string;
      name: string;
      image: string | null;
      email: string;
      role: "customer" | "owner" | "admin";
    } & JWTPayloadSpec)
  | null;

export const UserNavigation = ({ user }: { user: User }) => {
  if (!user) return <></>;
  return (
    <Dropdown class="mr-4">
      <Dropdown.Trigger
        size="icon"
        class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-accent text-lg font-semibold uppercase text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground hover:ring-ring/50 hover:ring-offset-2 hover:ring-offset-background focus:ring-offset-2 focus:ring-offset-background"
      >
        {user.image ? (
          <img src={user.image} class="h-8 w-8" alt="User image" />
        ) : (
          <span>{user.name.substring(0, 1)}</span>
        )}
      </Dropdown.Trigger>

      <Dropdown.Content class="mt-2">
        <Dropdown.Header>
          <div class="text-sm font-semibold" safe>
            {user.name}
          </div>
          <div class="text-xs font-light leading-5 text-muted-foreground" safe>
            {user.email}
          </div>
        </Dropdown.Header>
        <Dropdown.Separator />
        <Hover>
          <Hover.Item>
            <Dropdown.Item as="a" href="/d/business" hx-boost="true">
              {dict.get("dashboard")}
            </Dropdown.Item>
          </Hover.Item>
          <Hover.Item>
            <Dropdown.Item as="a" href="/d/settings" hx-boost="true">
              {dict.get("settings")}
              <i class="i-lucide-settings" />
            </Dropdown.Item>
          </Hover.Item>

          <Dropdown.Separator />

          <Hover.Item>
            <Dropdown.Item as="a" href="/" hx-boost="true">
              Página de inicio <i class="i-lucide-external-link" />
            </Dropdown.Item>
          </Hover.Item>
          <Hover.Item>
            <Dropdown.Item
              hx-post="/auth/logout"
              hx-push-url="true"
              hx-target="body"
              hx-swap="outerHTML"
              class="font-semibold"
            >
              {dict.get("logout")}
              <i class="i-lucide-log-out" />
            </Dropdown.Item>
          </Hover.Item>
        </Hover>
        <Dropdown.Separator />
        <Button intent="primary" size="sm" class="m-2 w-56">
          Upgrade to Pro
        </Button>
      </Dropdown.Content>
    </Dropdown>
  );
};