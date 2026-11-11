import NeedsConfirmationStickyNote from "./NeedsConfirmationStickyNote";

export default function IdaUploadConfirmationStickyNote() {
  return (
    <NeedsConfirmationStickyNote
      ariaLabel="IDA imaging uploads confirmation note"
      message="These cards are unique IDA image IDs from James Wang, USC_ADRC_Integrated_Imaging_Availability_v1.5.4.csv, field image_id, files idaSearch_11_05_2026.csv and idaSearch_9_10_2026_SCAN.csv. The two files do not share an image_id. Last date in those rows is November 4, 2026. This is not the old RPPR sentence of 2,489 MR participants, 2,618 MR scans, 1,073 PET participants, and 1,068 PET scans."
    />
  );
}
