import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Copy, Send } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import {
  CivicPage,
  Notice,
  PageHeader,
  SurfaceCard,
} from '../../components/ui/PageFrame';
import ReportLocationPicker from '../../components/report/ReportLocationPicker';
import {
  CategoryPicker,
  DisclaimerBanner,
  FormSection,
  ReferenceStamp,
  ReportSubnav,
  reportBtnGhost,
  reportBtnPrimary,
  reportFieldClass,
} from '../../components/report/ReportUi';
import { OCAMPO_BARANGAY_NAMES } from '../../data/ocampoBarangayNames';
import {
  createReport,
  isFirebaseConfigured,
  isFirebaseStorageEnabled,
  refreshReportingFlags,
} from '../../lib/reports';
import type { ReportCategory, ReportGeo } from '../../types/report';

export default function FileReport() {
  const [category, setCategory] = useState<ReportCategory>('road');
  const [description, setDescription] = useState('');
  const [barangay, setBarangay] = useState('');
  const [landmark, setLandmark] = useState('');
  const [geo, setGeo] = useState<ReportGeo | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [storageEnabled, setStorageEnabled] = useState(false);

  useEffect(() => {
    void refreshReportingFlags().then(() => {
      setConfigured(isFirebaseConfigured);
      setStorageEnabled(isFirebaseStorageEnabled);
    });
  }, []);

  const onPhotosChange = (files: FileList | null) => {
    setPhotos(files ? Array.from(files).slice(0, 3) : []);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await createReport({
        category,
        description,
        barangay,
        landmark,
        geo,
        contact: { name, phone, email },
        photos,
        website,
      });
      setReferenceId(result.referenceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not file Report.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = async () => {
    if (!referenceId) return;
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (referenceId) {
    return (
      <CivicPage>
        <SEO
          title="Report received"
          description="Your Report was received. Save your Reference ID to check status."
        />
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Report a problem', href: '/report' },
            { label: 'Received' },
          ]}
        />
        <div className="report-rise space-y-6">
          <PageHeader
            eyebrow="Community intake"
            title="Report received"
            description="Keep your Reference ID. We’ll use it while helping raise this with the municipality."
          >
            <ReportSubnav active="file" />
          </PageHeader>
          <ReferenceStamp id={referenceId} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void copyId()}
              className={reportBtnGhost}
            >
              <Copy className="size-4" aria-hidden />
              {copied ? 'Copied' : 'Copy ID'}
            </button>
            <Link
              to={`/report/track?id=${encodeURIComponent(referenceId)}`}
              className={reportBtnPrimary}
            >
              Check status
            </Link>
            <button
              type="button"
              className={reportBtnGhost}
              onClick={() => {
                setReferenceId(null);
                setCopied(false);
                setDescription('');
                setLandmark('');
                setGeo(null);
                setName('');
                setPhone('');
                setEmail('');
                setPhotos([]);
              }}
            >
              Report another
            </button>
          </div>
        </div>
      </CivicPage>
    );
  }

  return (
    <CivicPage>
      <SEO
        title="Report a problem"
        description="Report roads, bridges, drainage, and other public infrastructure problems in Ocampo so we can help raise them with the municipality."
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'What I need', href: '/needs' },
          { label: 'Report a problem' },
        ]}
      />
      <div className="report-rise space-y-6">
        <PageHeader
          eyebrow="Community intake"
          title="Report a problem"
          description="Tell us what’s broken or unsafe in Ocampo — roads, bridges, drainage, lights, waste, and more. We’ll help raise it with the municipality."
        >
          <ReportSubnav active="file" />
        </PageHeader>

        <DisclaimerBanner />

        {!configured ? (
          <Notice tone="error" title="Reporting unavailable">
            Firebase is not configured for this environment yet. Add the server
            Firebase Admin env vars and run with vercel dev.
          </Notice>
        ) : (
          <SurfaceCard className="report-rise report-rise-delay-1 overflow-hidden p-0">
            <form onSubmit={onSubmit}>
              <div className="space-y-8 p-5 sm:p-7">
                <FormSection
                  step="1"
                  title="What is the problem?"
                  hint="Pick the closest category, then describe what someone would see on site."
                >
                  <CategoryPicker value={category} onChange={setCategory} />
                  <label className="mt-4 block text-sm font-medium text-gray-900">
                    Description
                    <textarea
                      className={reportFieldClass}
                      rows={4}
                      maxLength={2000}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Example: Deep pothole on the curve past the barangay hall, hard to see at night."
                      required
                    />
                    <span className="mt-1 block text-right text-xs text-gray-400">
                      {description.length}/2000
                    </span>
                  </label>
                </FormSection>

                <FormSection
                  step="2"
                  title="Where is it?"
                  hint="Barangay is required. Landmark and map pin help operators find it faster."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Barangay
                      <select
                        className={reportFieldClass}
                        value={barangay}
                        onChange={e => setBarangay(e.target.value)}
                        required
                      >
                        <option value="">Select barangay</option>
                        {OCAMPO_BARANGAY_NAMES.map(nameOption => (
                          <option key={nameOption} value={nameOption}>
                            {nameOption}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-900">
                      Landmark or street
                      <input
                        className={reportFieldClass}
                        value={landmark}
                        onChange={e => setLandmark(e.target.value)}
                        maxLength={200}
                        placeholder="Optional — near the chapel…"
                      />
                    </label>
                  </div>
                  <div className="mt-4">
                    <ReportLocationPicker value={geo} onChange={setGeo} />
                  </div>
                </FormSection>

                <FormSection
                  step="3"
                  title="Extras"
                  hint="Photos and contact are optional. Contact is never published."
                >
                  {storageEnabled ? (
                    <>
                      <label className="block text-sm font-medium text-gray-900">
                        Photos (up to 3)
                        <input
                          className="mt-2 block w-full text-sm text-gray-700"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={e => onPhotosChange(e.target.files)}
                        />
                      </label>
                      {photos.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-xs text-gray-500">
                          {photos.map(file => (
                            <li key={file.name}>
                              {file.name} ({Math.round(file.size / 1024)} KB)
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      Photo uploads are temporarily unavailable. You can still
                      file with a clear description and location.
                    </p>
                  )}

                  <div className="mt-4 grid gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 sm:grid-cols-3">
                    <label className="block text-sm font-medium text-gray-900">
                      Name
                      <input
                        className={reportFieldClass}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-900">
                      Phone
                      <input
                        className={reportFieldClass}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-900">
                      Email
                      <input
                        className={reportFieldClass}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </label>
                  </div>
                </FormSection>

                <label className="hidden" aria-hidden="true">
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                  />
                </label>

                {error ? (
                  <p
                    className="text-sm font-medium text-error-700"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="text-xs text-gray-500">
                  You’ll get a Reference ID after you send this — no account
                  needed.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className={reportBtnPrimary}
                >
                  <Send className="size-4" aria-hidden />
                  {submitting ? 'Sending…' : 'Report a problem'}
                </button>
              </div>
            </form>
          </SurfaceCard>
        )}
      </div>
    </CivicPage>
  );
}
