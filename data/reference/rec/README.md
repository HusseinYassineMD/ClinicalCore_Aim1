# REC roster & training programs (manual source)

**Workflow hub (capture + RPPR preview + navigation):**  
`../../../../../REC_Faculty_Workflow/` — run `python3 server.py` and open http://127.0.0.1:8765/

Edit the CSV files here (or via the hub), then refresh the dashboard:

```bash
npm run sync:rec
```

| File | Dashboard section |
|------|-------------------|
| `scholars-trainees.csv` | Table 1a · REC scholars and trainees |
| `faculty.csv` | Participating REC faculty |
| `training-programs.csv` | USC training programs (ADRD / minority scholars) |
| `meeting-attendance.csv` | Friday REC speaker series · Zoom attendance by session date |
| `meetinglistdetails_2026_10_09_2026_11_08.csv` | Sahar Nikkhah Bahrami Zoom export · source for Oct 9–Nov 6 headcounts |

Add rows at the bottom; keep the header row. Use `yes` / `no` for boolean columns.

For attendance, use ISO dates (`YYYY-MM-DD`) and integer headcounts from the Zoom `Participants` field on the ADRC REC Meeting rows.
