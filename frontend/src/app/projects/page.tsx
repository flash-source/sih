import { fetchProjects, FULL_PORTFOLIO_LIMIT } from "@/lib/api";
import { Reveal } from "@/components/Reveal";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { IconAlertTriangle } from "@/components/Icons";

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof fetchProjects>> = [];
  let reachable = true;
  try {
    projects = await fetchProjects({ limit: FULL_PORTFOLIO_LIMIT });
  } catch {
    reachable = false;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Registry</span>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">All projects</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Every tracked project, searchable by name, ministry or state, and sortable by cost,
          progress or risk score.
        </p>
      </Reveal>

      <div className="mt-8">
        {reachable ? (
          <Reveal delay={0.05}>
            <ProjectsExplorer projects={projects} />
          </Reveal>
        ) : (
          <div className="rounded-xl border border-line bg-surface px-4 py-16 text-center">
            <IconAlertTriangle className="mx-auto h-8 w-8 text-signal-amber" />
            <h2 className="mt-3 font-display text-lg font-semibold text-ink">Can&apos;t reach the backend</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
              The registry reads from the FastAPI service at{" "}
              <code className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-xs">/api/v1</code>. Confirm
              it&apos;s running, then reload.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}