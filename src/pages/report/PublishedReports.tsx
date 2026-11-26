import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import {
  CivicPage,
  Notice,
  PageHeader,
  SurfaceCard,
} from '../../components/ui/PageFrame';
import ReportCard from '../../components/report/ReportCard';
import ReportsMap from '../../components/report/ReportsMap';
import { ReportSubnav } from '../../components/report/ReportUi';
import {
  getPhotoUrls,
  isFirebaseConfigured,
  listPublishedReports,
  refreshReportingFlags,
} from '../../lib/reports';
import type { PublishedReport } from '../../types/report';

export default function PublishedReports() {
  const [reports, setReports] = useState<PublishedReport[]>([]);
  const [photoMap, setPhotoMap] = useState<Record<string, string[]>>({});
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refreshReportingFlags();
      if (cancelled) return;
      setConfigured(isFirebaseConfigured);
      if (!isFirebaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const items = await listPublishedReports();
        if (cancelled) return;
        setReports(items);
        const entries = await Promise.all(
          items.map(async item => {
            if (item.photoPaths.length === 0) {
              return [item.referenceId, []] as const;
            }
            try {
              const urls = await getPhotoUrls(item.photoPaths);
              return [item.referenceId, urls] as const;
            } catch {
              return [item.referenceId, []] as const;
            }
          })
        );
        if (!cancelled) {
          setPhotoMap(Object.fromEntries(entries));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load published Reports.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pinned = reports.filter(r => r.geo);

  return (
    <CivicPage>
      <SEO
        title="Public reports"
        description="Community-published infrastructure Reports for Ocampo. Contact details are never shown."
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'What I need', href: '/needs' },
          { label: 'Public reports' },
        ]}
      />
      <div className="report-rise space-y-6">
        <PageHeader
          eyebrow="Community board"
          title="Public reports"
          description="Only operator-approved Reports appear here. Contact details stay private."
        >
          <ReportSubnav active="board" />
        </PageHeader>

        {!configured ? (
          <Notice tone="error" title="Board unavailable">
            Reporting API is not configured for this environment yet.
          </Notice>
        ) : loading ? (
          <SurfaceCard className="p-5 text-sm text-gray-600">
            Loading published Reports…
          </SurfaceCard>
        ) : error ? (
          <Notice tone="error" title="Could not load">
            {error}
          </Notice>
        ) : reports.length === 0 ? (
          <SurfaceCard className="p-8 text-center">
            <p className="text-base font-semibold text-gray-950">
              Board is clear for now
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Filed Reports stay private until an operator publishes a redacted
              version for the community.
            </p>
          </SurfaceCard>
        ) : (
          <div className="space-y-6">
            {pinned.length > 0 ? (
              <ReportsMap
                className="report-rise report-rise-delay-1"
                reports={pinned.map(report => ({
                  referenceId: report.referenceId,
                  category: report.category,
                  description: report.description,
                  barangay: report.barangay,
                  landmark: report.landmark,
                  geo: report.geo!,
                  status: report.status,
                }))}
              />
            ) : null}

            <ul className="grid gap-4 sm:grid-cols-2">
              {reports.map((report, index) => (
                <li
                  key={report.referenceId}
                  className={`report-rise report-rise-delay-${Math.min(index + 1, 3)}`}
                >
                  <ReportCard
                    report={{
                      referenceId: report.referenceId,
                      category: report.category,
                      barangay: report.barangay,
                      landmark: report.landmark,
                      description: report.description,
                      status: report.status,
                      staffNote: report.staffNote,
                      photoUrls: photoMap[report.referenceId] || [],
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CivicPage>
  );
}
