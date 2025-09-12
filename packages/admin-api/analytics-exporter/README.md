# Analytics Exporter README

This exporter reads the analytics store (`packages/admin-api/data/analytics.json`), applies configured filters, and exports results to Google Sheets or BigQuery.

Requirements:
- A Google Service Account JSON key with access to the target resource.
- For Sheets: a target spreadsheet ID and sheet name.
- For BigQuery: target dataset and table.

Environment variables:
- `GOOGLE_APPLICATION_CREDENTIALS` — path to service account JSON
- `EXPORT_TARGET` — `sheets` or `bigquery`
- `SHEET_ID` — spreadsheet ID (for `sheets`)
- `BIGQUERY_DATASET` — dataset name (for `bigquery`)
- `BIGQUERY_TABLE` — table name (for `bigquery`)

Example run:

```bash
node packages/admin-api/scripts/export-analytics.js --filter "type=click" --target sheets
```
