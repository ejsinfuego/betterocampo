import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogOut, RefreshCw } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import {
  CivicPage,
  Notice,
  PageHeader,
  SurfaceCard,
} from '../../components/ui/PageFrame';
import ReportsMap from '../../components/report/ReportsMap';
import {
  ReportCategoryIcon,
  StatusBadge,
  reportBtnGhost,
  reportBtnPrimary,
} from '../../components/report/ReportUi';
import '../../components/report/report.css';
import {
  AdminNotAllowlistedError,
  type AdminUser,
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeAdminAuth,
} from '../../lib/adminAuth';
import {
  isFirebaseConfigured,
  refreshReportingFlags,
} from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { listAdminReports } from '../../lib/reports';
import {
  REPORT_CATEGORY_LABELS,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  type Report,
  type ReportStatus,
} from '../../types/report';

type StatusFilter = 'all' | ReportStatus;

export default function ReportsAdmin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowlistHint, setAllowlistHint] = useState<{
    uid: string;
    email: string | null;
  } | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    void refreshReportingFlags().then(() => {
      setConfigured(isFirebaseConfigured);
    });
    return subscribeAdminAuth((nextUser, allowed) => {
      setConfigured(isFirebaseConfigured);
      setUser(nextUser);
      setIsAdmin(allowed);
      setAuthReady(true);
    });
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listAdminReports();
      setReports(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setTimeout(() => {
      void loadReports();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin]);

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      all: reports.length,
      received: 0,
      in_review: 0,
      resolved: 0,
      closed: 0,
    };
    for (const report of reports) {
      base[report.status] += 1;
    }
    return base;
  }, [reports]);

  const visible = useMemo(
    () =>
      filter === 'all'
        ? reports
        : reports.filter(report => report.status === filter),
    [filter, reports]
  );

  const pinned = useMemo(
    () =>
      visible.flatMap(report =>
        report.geo
          ? [
              {
                referenceId: report.referenceId,
                category: report.category,
                description: report.description,
                barangay: report.barangay,
                landmark: report.landmark,
                geo: report.geo,
                status: report.status,
              },
            ]
          : []
      ),
    [visible]
  );

  const onSignIn = async () => {
    setError(null);
    setAllowlistHint(null);
    try {
      await signInAdminWithGoogle();
    } catch (err) {
      if (err instanceof AdminNotAllowlistedError) {
        setAllowlistHint({ uid: err.uid, email: err.email });
      }
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    }
  };

  return (
    <CivicPage>
      <SEO title="Admin · Reports" description="Triage community Reports." />
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Admin Reports' }]}
      />
      <div className="report-rise space-y-6">
        <PageHeader
          eyebrow="Operators only"
          title="Reports desk"
          description="Open a Report for the full record, leave a short note, then publish a redacted copy to the public board."
        />

        {!configured ? (
          <Notice tone="error" title="Reporting API not configured">
            Set server Firebase Admin env vars (FIREBASE_PROJECT_ID,
            FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY), SESSION_SECRET, and
            GOOGLE_CLIENT_ID. Seed{' '}
            <code className="rounded bg-gray-100 px-1">admins/{'{email}'}</code>{' '}
            documents. Run with{' '}
            <code className="rounded bg-gray-100 px-1">vercel dev</code>.
          </Notice>
        ) : !authReady ? (
          <SurfaceCard className="p-5 text-sm text-gray-600">
            Checking session…
          </SurfaceCard>
        ) : !isAdmin ? (
          <SurfaceCard className="report-desk space-y-4 p-5 sm:p-7">
            <p className="text-sm text-gray-700">
              Sign in with Google, then allowlist your account with a Firestore
              document in the{' '}
              <code className="rounded bg-gray-100 px-1">admins</code>{' '}
              collection whose{' '}
              <span className="font-semibold">document ID</span> is your Google
              email (preferred) or Google subject id.
            </p>
            {user && !isAdmin ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <p>
                  Signed in as {user.email}, but not allowlisted. Create this
                  document ID:
                </p>
                <p className="mt-2 break-all font-mono text-xs">
                  admins/{user.email}
                </p>
              </div>
            ) : null}
            {allowlistHint ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <p className="font-semibold">
                  Create one of these document IDs
                </p>
                {allowlistHint.email ? (
                  <p className="mt-2 break-all font-mono text-xs">
                    admins/{allowlistHint.email}
                  </p>
                ) : null}
                <p className="mt-1 break-all font-mono text-xs">
                  admins/{allowlistHint.uid}
                </p>
              </div>
            ) : null}
            {error ? (
              <p className="text-sm font-medium text-error-700" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void onSignIn()}
              className={reportBtnPrimary}
            >
              Sign in with Google
            </button>
          </SurfaceCard>
        ) : (
          <div className="space-y-4">
            <SurfaceCard className="report-desk flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-sm text-gray-700">
                  Signed in as{' '}
                  <span className="font-semibold text-gray-950">
                    {user?.email}
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {counts.received} waiting · {counts.all} active
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void loadReports()}
                  className={cn(reportBtnGhost, 'h-9 px-3')}
                >
                  <RefreshCw className="size-3.5" aria-hidden />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => void signOutAdmin()}
                  className={cn(reportBtnGhost, 'h-9 px-3')}
                >
                  <LogOut className="size-3.5" aria-hidden />
                  Sign out
                </button>
              </div>
            </SurfaceCard>

            <div className="flex flex-wrap gap-2">
              {(['all', ...REPORT_STATUSES] as StatusFilter[]).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition',
                    filter === key
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                  )}
                >
                  {key === 'all' ? 'All' : REPORT_STATUS_LABELS[key]}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                      filter === key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {counts[key]}
                  </span>
                </button>
              ))}
            </div>

            {error ? (
              <Notice tone="error" title="Error">
                {error}
              </Notice>
            ) : null}

            {!loading && pinned.length > 0 ? (
              <ReportsMap
                reports={pinned}
                showReferenceId
                title="Map of pinned Reports"
                description="Category by color/icon, status by ring. Click a pin to open the full Report."
                onSelect={id => navigate(`/admin/reports/${id}`)}
              />
            ) : null}

            {loading ? (
              <SurfaceCard className="p-5 text-sm text-gray-600">
                Loading Reports…
              </SurfaceCard>
            ) : visible.length === 0 ? (
              <SurfaceCard className="p-8 text-center text-sm text-gray-600">
                No Reports in this filter.
              </SurfaceCard>
            ) : (
              <SurfaceCard className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 whitespace-nowrap">ID</th>
                        <th className="px-4 py-3 whitespace-nowrap">
                          Category
                        </th>
                        <th className="px-4 py-3 whitespace-nowrap">
                          Barangay
                        </th>
                        <th className="px-4 py-3 min-w-[14rem]">Summary</th>
                        <th className="px-4 py-3 whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 whitespace-nowrap">
                          Visibility
                        </th>
                        <th className="px-4 py-3 whitespace-nowrap">Filed</th>
                        <th className="px-4 py-3 whitespace-nowrap">
                          <span className="sr-only">Open</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map(report => (
                        <tr
                          key={report.referenceId}
                          className="border-t border-gray-200 bg-white align-top transition hover:bg-gray-50/80"
                        >
                          <td className="px-4 py-3 font-mono text-xs font-semibold tracking-wide whitespace-nowrap text-gray-950">
                            {report.referenceId}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-gray-800">
                              <ReportCategoryIcon
                                category={report.category}
                                className="size-3.5 text-primary-700"
                              />
                              {REPORT_CATEGORY_LABELS[report.category]}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                            {report.barangay}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <p className="line-clamp-2 max-w-md">
                              {report.description}
                            </p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={report.status} />
                          </td>
                          <td className="px-4 py-3 capitalize whitespace-nowrap text-gray-700">
                            {report.visibility}
                          </td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">
                            {report.createdAt.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Link
                              to={`/admin/reports/${report.referenceId}`}
                              className="text-xs font-semibold text-primary-700 underline decoration-primary-200 underline-offset-2"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SurfaceCard>
            )}
          </div>
        )}
      </div>
    </CivicPage>
  );
}
