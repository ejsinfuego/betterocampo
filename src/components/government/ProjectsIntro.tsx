export default function ProjectsIntro({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`max-w-3xl space-y-2 text-sm leading-relaxed text-gray-600 ${className}`}
    >
      <p>
        Map shows where a line names a barangay. Table lists every line. Choose
        a place to open its record. Town-wide lines have no pin.
      </p>
      <p>
        Enacted amounts for 2020–2026 come from the{' '}
        <a
          href="https://budget.bettergov.ph/api/v1/gaa/search?q=Ocampo%2C%20Camarines%20Sur&limit=50"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary-700 underline-offset-2 hover:underline"
        >
          BetterGov GAA search
        </a>
        . FY2027 figures are House bill proposals on{' '}
        <a
          href="https://budget.bettergov.ph"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary-700 underline-offset-2 hover:underline"
        >
          budget.bettergov.ph
        </a>
        , not an enacted budget. An amount is what that year&apos;s national
        budget assigned to the line. It is not a report that the work was
        finished, and it is not the municipality&apos;s own project list. No
        FY2027 health-facility or irrigation line came back for Ocampo in Region
        V.
      </p>
    </div>
  );
}
