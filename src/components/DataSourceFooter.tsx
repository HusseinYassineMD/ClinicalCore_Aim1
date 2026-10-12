interface DataSourceFooterProps {
  dataOwner: string;
  dataSources: string[];
}

export default function DataSourceFooter({
  dataOwner,
  dataSources,
}: DataSourceFooterProps) {
  return (
    <footer className="border-t border-cpbh-mist bg-white mt-8">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-cpbh-navy/60">
          <div>
            <span className="font-medium text-cpbh-navy/80">Data Owner:</span>{" "}
            {dataOwner}
          </div>
          <div>
            <span className="font-medium text-cpbh-navy/80">Sources:</span>{" "}
            {dataSources.join(" · ")}
          </div>
        </div>
        <p className="text-xs text-cpbh-navy/40 mt-3">
          Black figures follow the reporting window above from harmonized Data Core
          files; green = last RPPR period (rpprMetrics); red = no data available;
          zero or not yet wired.
        </p>
      </div>
    </footer>
  );
}
