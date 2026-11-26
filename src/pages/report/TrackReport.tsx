import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import {
  CivicPage,
  Notice,
  PageHeader,
  SurfaceCard,
} from '../../components/ui/PageFrame';
import ReportCard from '../../components/report/ReportCard';
import {
  ReportSubnav,
  StatusRail,
  reportBtnPrimary,
  reportFieldClass,
} from '../../components/report/ReportUi';
import {
  getPhotoUrls,
  getReportByReferenceId,
  isFirebaseConfigured,
  refreshReportingFlags,
} from '../../lib/reports';
import type { Report } from '../../types/report';

export default function TrackReport() {
  const [params, setParams] = useSearchParams();
  const [inputId, setInputId] = useState(params.get('id') || '');
  const [report, setReport] = useState<Report | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (referenceId: string) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setPhotoUrls([]);
    try {
      const found = await getReportByReferenceId(referenceId);
      if (!found) {
        setError(
          'No Report found for that Reference ID (or it is unavailable).'
        );
        return;
      }
      setReport(found);
      if (found.photoPaths.length > 0) {
        try {
          setPhotoUrls(await getPhotoUrls(found.photoPaths));
        } catch {
          setPhotoUrls([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refreshReportingFlags();
      if (cancelled) return;
      setConfigured(isFirebaseConfigured);
      const id = params.get('id');
      if (id && isFirebaseConfigured) {
        void lookup(id);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial URL id only
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const id = inputId.trim().toUpperCase();
    setParams(id ? { id } : {});
    void lookup(id);
  };

  return (
    <CivicPage>
      <SEO
        title="Check Report status"
        description="Look up a community Report by Reference ID."
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'What I need', href: '/needs' },
          { label: 'Report a problem', href: '/report' },
          { label: 'Check status' },
        ]}
      />
      <div className="report-rise space-y-6">
        <PageHeader
          eyebrow="Community intake"
          title="Check Report status"
          description="Enter the Reference ID from when you reported the problem. Status updates come from site operators."
        >
          <ReportSubnav active="track" />
        </PageHeader>

        {!configured ? (
          <Notice tone="error" title="Tracking unavailable">
            Reporting API is not configured for this environment yet. Use vercel
            dev with server Firebase Admin env vars.
          </Notice>
        ) : (
          <>
            <SurfaceCard className="report-rise report-rise-delay-1 p-5 sm:p-6">
              <form
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
                onSubmit={onSubmit}
              >
                <label className="block flex-1 text-sm font-medium text-gray-900">
                  Reference ID
                  <input
                    className={`${reportFieldClass} font-mono tracking-wide uppercase`}
                    value={inputId}
                    onChange={e => setInputId(e.target.value)}
                    placeholder="OCP-XXXXXXXX"
                    autoCapitalize="characters"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className={reportBtnPrimary}
                >
                  <Search className="size-4" aria-hidden />
                  {loading ? 'Looking up…' : 'Track'}
                </button>
              </form>
            </SurfaceCard>

            {error ? (
              <Notice tone="error" title="Not found">
                {error}
              </Notice>
            ) : null}

            {report ? (
              <div className="report-rise report-rise-delay-2 space-y-4">
                <SurfaceCard className="space-y-4 p-5 sm:p-6">
                  <StatusRail status={report.status} />
                </SurfaceCard>
                <ReportCard
                  showReferenceId
                  report={{
                    referenceId: report.referenceId,
                    category: report.category,
                    barangay: report.barangay,
                    landmark: report.landmark,
                    description: report.description,
                    status: report.status,
                    staffNote: report.staffNote,
                    photoUrls,
                  }}
                />
                {(report.contact.name ||
                  report.contact.phone ||
                  report.contact.email) && (
                  <SurfaceCard className="p-5 text-sm text-gray-600 sm:p-6">
                    <p className="font-semibold text-gray-900">
                      Contact on file
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        (not public)
                      </span>
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {report.contact.name ? (
                        <li>Name: {report.contact.name}</li>
                      ) : null}
                      {report.contact.phone ? (
                        <li>Phone: {report.contact.phone}</li>
                      ) : null}
                      {report.contact.email ? (
                        <li>Email: {report.contact.email}</li>
                      ) : null}
                    </ul>
                  </SurfaceCard>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    </CivicPage>
  );
}
