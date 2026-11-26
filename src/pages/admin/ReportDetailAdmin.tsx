import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Phone,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
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
  reportFieldClass,
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
import {
  getAdminReport,
  getPhotoUrls,
  publishReport,
  softDeleteReport,
  unpublishReport,
  updateReportStatus,
} from '../../lib/reports';
import {
  REPORT_CATEGORY_LABELS,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  type Report,
  type ReportStatus,
} from '../../types/report';

export default function ReportDetailAdmin() {
  const { referenceId: rawId } = useParams();
  const navigate = useNavigate();
  const referenceId = (rawId || '').trim().toUpperCase();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowlistHint, setAllowlistHint] = useState<{
    uid: string;
    email: string | null;
  } | null>(null);
  const [draftStatus, setDraftStatus] = useState<ReportStatus>('received');
  const [draftNote, setDraftNote] = useState('');

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

  const loadReport = async () => {
    if (!referenceId) {
      setError('Missing Reference ID.');
      setReport(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const found = await getAdminReport(referenceId);
      if (!found) {
        setReport(null);
        setPhotoUrls([]);
        setError(
          'No Report found for that Reference ID (or it is unavailable).'
        );
        return;
      }
      setReport(found);
      setDraftStatus(found.status);
      setDraftNote(found.staffNote);
      if (found.photoPaths.length > 0) {
        try {
          setPhotoUrls(await getPhotoUrls(found.photoPaths));
        } catch {
          setPhotoUrls([]);
        }
      } else {
        setPhotoUrls([]);
      }
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : 'Failed to load Report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || !referenceId) return;
    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin, referenceId]);

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

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await loadReport();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const contactBits = report
    ? [report.contact.name, report.contact.phone, report.contact.email].filter(
        Boolean
      )
    : [];

  return (
    <CivicPage>
      <SEO
        title={
          referenceId
            ? `Admin · Report ${referenceId}`
            : 'Admin · Report detail'
        }
        description="Full Report record for operators."
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Admin Reports', href: '/admin/reports' },
          { label: referenceId || 'Report' },
        ]}
      />
      <div className="report-rise space-y-6">
        <PageHeader
          eyebrow="Operators only"
          title={referenceId || 'Report detail'}
          description="Full Report record, including contact details that stay off the public board."
        >
          <Link
            to="/admin/reports"
            className={cn(reportBtnGhost, 'h-10 px-3.5 text-sm')}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to desk
          </Link>
        </PageHeader>

        {!configured ? (
          <Notice tone="error" title="Reporting API not configured">
            Set server Firebase Admin env vars and seed admins/{'{email}'}{' '}
            documents. Use{' '}
            <code className="rounded bg-gray-100 px-1">vercel dev</code>{' '}
            locally.
          </Notice>
        ) : !authReady ? (
          <SurfaceCard className="p-5 text-sm text-gray-600">
            Checking session…
          </SurfaceCard>
        ) : !isAdmin ? (
          <SurfaceCard className="report-desk space-y-4 p-5 sm:p-7">
            <p className="text-sm text-gray-700">
              Sign in with an allowlisted Google account to open the full
              Report.
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
                  Full record · contact stays private
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOutAdmin()}
                className={cn(reportBtnGhost, 'h-9 px-3')}
              >
                <LogOut className="size-3.5" aria-hidden />
                Sign out
              </button>
            </SurfaceCard>

            {error ? (
              <Notice tone="error" title="Error">
                {error}
              </Notice>
            ) : null}

            {loading ? (
              <SurfaceCard className="p-5 text-sm text-gray-600">
                Loading Report…
              </SurfaceCard>
            ) : !report ? (
              <SurfaceCard className="space-y-3 p-6 text-sm text-gray-700">
                <p>This Report could not be opened.</p>
                <Link
                  to="/admin/reports"
                  className="font-semibold text-primary-700 underline decoration-primary-200 underline-offset-2"
                >
                  Return to Reports desk
                </Link>
              </SurfaceCard>
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
                  <SurfaceCard className="space-y-5 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-800">
                          <ReportCategoryIcon
                            category={report.category}
                            className="size-5"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="text-lg font-semibold tracking-tight text-gray-950">
                            {REPORT_CATEGORY_LABELS[report.category]}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-600">
                            {report.barangay}
                            {report.landmark ? ` · ${report.landmark}` : ''}
                          </p>
                          <p className="mt-1 font-mono text-xs tracking-wide text-gray-500">
                            {report.referenceId}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={report.status} />
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-gray-700 uppercase">
                          {report.visibility}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Full description
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                        {report.description}
                      </p>
                    </div>

                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-3">
                        <dt className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                          Filed
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-gray-950">
                          {report.createdAt.toLocaleString()}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-3">
                        <dt className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                          Updated
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-gray-950">
                          {report.updatedAt.toLocaleString()}
                        </dd>
                      </div>
                    </dl>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        <UserRound className="size-3.5" aria-hidden />
                        Contact
                      </p>
                      {contactBits.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-600">
                          None provided
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-1.5 text-sm text-gray-800">
                          {report.contact.name ? (
                            <li className="font-medium">
                              {report.contact.name}
                            </li>
                          ) : null}
                          {report.contact.phone ? (
                            <li>
                              <a
                                href={`tel:${report.contact.phone.replace(/[^\d+]/g, '')}`}
                                className="inline-flex items-center gap-1.5 text-primary-700 underline decoration-primary-200 underline-offset-2"
                              >
                                <Phone className="size-3.5" aria-hidden />
                                {report.contact.phone}
                              </a>
                            </li>
                          ) : null}
                          {report.contact.email ? (
                            <li>
                              <a
                                href={`mailto:${report.contact.email}`}
                                className="inline-flex items-center gap-1.5 break-all text-primary-700 underline decoration-primary-200 underline-offset-2"
                              >
                                <Mail
                                  className="size-3.5 shrink-0"
                                  aria-hidden
                                />
                                {report.contact.email}
                              </a>
                            </li>
                          ) : null}
                        </ul>
                      )}
                    </div>

                    {photoUrls.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                          Photos
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {photoUrls.map(url => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="overflow-hidden rounded-xl border border-gray-200"
                            >
                              <img
                                src={url}
                                alt=""
                                className="h-32 w-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </SurfaceCard>

                  <SurfaceCard className="h-fit space-y-3 p-5 sm:p-6">
                    <h2 className="text-base font-semibold tracking-tight text-gray-950">
                      Manage
                    </h2>
                    <label className="block text-sm font-medium text-gray-900">
                      Status
                      <select
                        className={reportFieldClass}
                        value={draftStatus}
                        onChange={e =>
                          setDraftStatus(e.target.value as ReportStatus)
                        }
                      >
                        {REPORT_STATUSES.map(status => (
                          <option key={status} value={status}>
                            {REPORT_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-900">
                      Operator note
                      <textarea
                        className={cn(reportFieldClass, 'min-h-24 resize-y')}
                        value={draftNote}
                        onChange={e => setDraftNote(e.target.value)}
                        placeholder="Short update for tracking / board"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(() =>
                            updateReportStatus(
                              report.referenceId,
                              draftStatus,
                              draftNote
                            )
                          )
                        }
                        className={cn(reportBtnPrimary, 'h-10 px-3.5 text-sm')}
                      >
                        <Save className="size-3.5" aria-hidden />
                        Save
                      </button>
                      {report.visibility === 'published' ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void runAction(() =>
                              unpublishReport(report.referenceId)
                            )
                          }
                          className={cn(reportBtnGhost, 'h-10 px-3.5 text-sm')}
                        >
                          <EyeOff className="size-3.5" aria-hidden />
                          Unpublish
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void runAction(() =>
                              publishReport(report.referenceId)
                            )
                          }
                          className={cn(reportBtnGhost, 'h-10 px-3.5 text-sm')}
                        >
                          <Eye className="size-3.5" aria-hidden />
                          Publish
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (
                            !window.confirm(
                              'Soft-delete this Report? It leaves the board and tracking shows unavailable.'
                            )
                          ) {
                            return;
                          }
                          void runAction(async () => {
                            await softDeleteReport(report.referenceId);
                            navigate('/admin/reports');
                          });
                        }}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-error-200 bg-error-50 px-3.5 text-sm font-semibold text-error-800 transition hover:bg-error-100 disabled:opacity-60"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        Soft-delete
                      </button>
                    </div>
                  </SurfaceCard>
                </div>

                {report.geo ? (
                  <ReportsMap
                    reports={[
                      {
                        referenceId: report.referenceId,
                        category: report.category,
                        description: report.description,
                        barangay: report.barangay,
                        landmark: report.landmark,
                        geo: report.geo,
                        status: report.status,
                      },
                    ]}
                    showReferenceId
                    title="Pinned location"
                    description="Map pin from the filed Report."
                  />
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </CivicPage>
  );
}
