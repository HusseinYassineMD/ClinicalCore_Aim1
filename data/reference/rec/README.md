# REC roster & training programs (manual source)

Edit the CSV files here, then refresh the dashboard:

```bash
npm run sync:rec
```

| File | Dashboard section |
|------|-------------------|
| `scholars-trainees.csv` | Table 1a · REC scholars and trainees |
| `faculty.csv` | Participating REC faculty |
| `training-programs.csv` | USC training programs (ADRD / minority scholars) |
| `meeting-attendance.csv` | Friday REC speaker series · Zoom attendance by session date |

Add rows at the bottom; keep the header row. Use `yes` / `no` for boolean columns.

For attendance, use ISO dates (`YYYY-MM-DD`) and integer headcounts from REC admin.
