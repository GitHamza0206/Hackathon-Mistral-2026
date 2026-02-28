import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { Circle } from "@phosphor-icons/react/dist/ssr/Circle";
import { Cursor } from "@phosphor-icons/react/dist/ssr/Cursor";
import { Faders } from "@phosphor-icons/react/dist/ssr/Faders";
import { FileText } from "@phosphor-icons/react/dist/ssr/FileText";
import { Palette } from "@phosphor-icons/react/dist/ssr/Palette";
import { Stack } from "@phosphor-icons/react/dist/ssr/Stack";
import { TextT } from "@phosphor-icons/react/dist/ssr/TextT";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const settings = [
  "Preset: Custom",
  "Component library: Radix UI",
  "Style: Nova",
  "Base color: Pearl",
  "Theme: CERNO indigo / violet",
  "Icon library: Phosphor",
  "Display: Schibsted Grotesk",
  "UI font: Onest",
  "Radius: Large",
];

const tokens = [
  { name: "Background", value: "#FCFBFF", css: "--ui-background" },
  { name: "Card", value: "rgba(255, 255, 255, 0.88)", css: "--ui-card" },
  { name: "Primary", value: "#6366F1", css: "--ui-primary" },
  { name: "Accent", value: "#8B5CF6", css: "--accent-mid" },
  { name: "Soft glow", value: "#A78BFA", css: "--ui-ring" },
  { name: "Foreground", value: "#1F2140", css: "--ui-foreground" },
];

const findings = [
  "The current app shell is still a custom CSS system, not shadcn components.",
  "The previous dark pass matched the CERNO colors but ignored your requirement that the app be light mode first.",
  "The palette still needs to come from the mark, but the base surfaces should stay bright.",
  "The right translation is indigo-violet accents on a pale interface, not a near-black shell.",
];

const componentGroups = [
  {
    icon: Cursor,
    title: "Buttons and badges",
    copy: "Primary actions use the exact CERNO indigo-to-lavender range. Secondary controls stay pale and restrained so the gradient remains the focal point.",
  },
  {
    icon: TextT,
    title: "Typography",
    copy: "Schibsted Grotesk gives headlines shape and authority. Onest keeps forms and dense product copy clean without feeling anonymous. IBM Plex Mono still handles the technical layer.",
  },
  {
    icon: Faders,
    title: "Inputs",
    copy: "Inputs sit on bright glass surfaces with indigo-lavender focus treatment, which keeps the product readable and still anchored in the mark.",
  },
  {
    icon: Stack,
    title: "Surfaces",
    copy: "Cards use pale glass surfaces with restrained violet glow lines, so the interface feels premium without losing light-mode clarity.",
  },
];

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[calc(var(--radius)+1rem)] border border-border/70 bg-card/90 p-6 shadow-[0_32px_120px_rgba(99,102,241,0.14)] backdrop-blur-xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(167,139,250,0.16),transparent_22%)]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] [background-size:3.5rem_3.5rem] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_90%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-5">
              <Badge variant="orange">Design review</Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  A light-first system built from the CERNO mark.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  The interface keeps the exact CERNO indigo, violet, and lavender accent range, but
                  uses it over bright surfaces so the app stays light mode first. That keeps the
                  product identity while preserving readability for long operational workflows.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/">
                    Back to admin
                    <ArrowUpRight weight="bold" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <a href="#showcase">Review components</a>
                </Button>
              </div>
            </div>

            <Card className="border-border/60 bg-background/70">
              <CardHeader>
                <CardTitle>Selected preset</CardTitle>
                <CardDescription>The requested shadcn settings now driving this page.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {settings.map((item) => (
                  <div
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
                    key={item}
                  >
                    <span className="text-sm text-muted-foreground">{item.split(":")[0]}</span>
                    <span className="text-sm font-medium text-foreground">{item.split(":")[1]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                  <FileText className="size-5 text-primary" weight="duotone" />
                </div>
                <div>
                  <CardTitle>Review findings</CardTitle>
                  <CardDescription>
                    What was off before switching to the new shadcn direction.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm leading-6 text-muted-foreground">
                {findings.map((finding) => (
                  <li
                    className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
                    key={finding}
                  >
                    {finding}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                  <Palette className="size-5 text-primary" weight="duotone" />
                </div>
                <div>
                  <CardTitle>Theme tokens</CardTitle>
                  <CardDescription>
                    CERNO palette translated into app tokens and light glass surfaces.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tokens.map((token) => (
                <div
                  className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                  key={token.css}
                >
                  <div
                    className="mb-4 h-16 rounded-xl border border-white/10"
                    style={{ background: `var(${token.css})` }}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{token.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{token.css}</p>
                    <p className="font-mono text-xs text-primary">{token.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" id="showcase">
          {componentGroups.map((group) => {
            const Icon = group.icon;

            return (
              <Card key={group.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-border/70 bg-muted/40 p-3">
                      <Icon className="size-5 text-primary" weight="duotone" />
                    </div>
                    <CardTitle className="text-base">{group.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{group.copy}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Component playground</CardTitle>
              <CardDescription>
                These are now real reusable shadcn-style primitives under
                `components/ui`.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex flex-wrap gap-3">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary action</Button>
                <Button variant="outline">Outline action</Button>
                <Button variant="ghost">Ghost action</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="orange">Primary signal</Badge>
                <Badge>Default badge</Badge>
                <Badge variant="subtle">Subtle accent</Badge>
              </div>

              <Tabs defaultValue="interviews" className="gap-4">
                <TabsList>
                  <TabsTrigger value="interviews">Interviews</TabsTrigger>
                  <TabsTrigger value="candidates">Candidates</TabsTrigger>
                </TabsList>
                <TabsContent value="interviews" className="mt-0">
                  <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    Tabs now share the same bright CERNO styling used in the admin console redesign.
                  </div>
                </TabsContent>
                <TabsContent value="candidates" className="mt-0">
                  <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    The same primitive also supports nested candidate table and kanban switches.
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Candidate name</label>
                  <Input defaultValue="Alex Morgan" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">GitHub profile URL</label>
                  <Input defaultValue="https://github.com/alexmorgan" />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Screening note</label>
                <Textarea defaultValue="Candidate claims hands-on experience with agentic retrieval, evals, and production debugging under latency constraints." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography and radius</CardTitle>
              <CardDescription>
                Schibsted Grotesk plus Onest gives the app a designer-grade baseline without needing a dark shell.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="rounded-[calc(var(--radius)+0.2rem)] border border-border/70 bg-muted/20 p-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-primary">
                  Schibsted Grotesk heading
                </p>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Operational UI, not editorial ornament.
                </h2>
              </div>

              <div className="rounded-[calc(var(--radius)+0.2rem)] border border-border/70 bg-muted/20 p-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-primary">
                  Body copy
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  The new system favors dense, legible admin and workflow interfaces. Indigo and
                  violet carry the brand signal, while the pale base keeps the product open,
                  readable, and less oppressive during longer sessions.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {[12, 16, 20].map((size) => (
                  <div
                    className="flex items-center gap-2 rounded-[calc(var(--radius)+0.2rem)] border border-border/70 bg-muted/20 px-4 py-3"
                    key={size}
                  >
                    <Circle className="size-3 fill-primary text-primary" weight="fill" />
                    <span className="text-sm text-muted-foreground">Radius</span>
                    <span className="font-mono text-sm">{size}px</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
