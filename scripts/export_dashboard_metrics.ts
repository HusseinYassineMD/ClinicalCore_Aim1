/**
 * Flat metric snapshot from aim1MockData for validate_dashboard.py wiring checks.
 * Run: npx --yes tsx scripts/export_dashboard_metrics.ts
 */
import { aim1MockData as d } from "../src/data/aim1MockData";

const adrc = d.topRegistry.columns.find((c) => c.id === "adrc");
const brs = d.topRegistry.columns.find((c) => c.id === "brs");
const gs = d.topRegistry.columns.find((c) => c.id === "genescreen");

const snapshot = {
  reportingPeriod: d.reportingPeriod,
  topRegistry: {
    genescreen: { total: gs?.total, newThisPeriod: gs?.newThisPeriod },
    adrc: {
      total: adrc?.total,
      inPerson: adrc?.periodActivities?.[0]?.count,
      remote: adrc?.periodActivities?.[1]?.count,
      initial: adrc?.periodActivities?.[2]?.count,
    },
    brs: { total: brs?.total, newThisPeriod: brs?.newThisPeriod },
  },
  clinicalAssessments: d.clinicalAssessments,
  scans: d.scans,
  claritiScans: d.claritiScans,
  biomarkers: d.biomarkers,
  plasmaNcradProvenance: d.plasmaNcradProvenance,
  biofluidPlasma: d.biofluidCollection[0],
  neuropath: {
    brsNewlyConsented: d.neuropath.brsNewlyConsented,
    autopsiesPerformed: d.neuropath.autopsiesPerformed,
    cohortDeaths: d.neuropath.cohortDeaths,
    enrolled: d.neuropath.enrolledInAutopsyProgram,
  },
  specimenBiofluidRequests: d.biofluidSpecimenSharing.requestsReceived,
  specimenNeurobankRequests: d.neurobankSpecimenSharing.requestsReceived,
  specimenPlasmaAliquots: d.biofluidSpecimenSharing.plasma?.aliquotsRequested,
  specimenNeurobankFulfilled: d.neurobankSpecimenSharing.requestsFulfilled,
  oreOutreach: {
    communityEvents: d.oreOutreach.communityEvents,
    eventAttendees: d.oreOutreach.eventAttendees,
  },
  table1OverallN: String(d.overall.n).split("(")[0].trim(),
};

process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
