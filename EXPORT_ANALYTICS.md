# Analytics Export Feature

## Overview

The Analytics Export feature allows restaurant owners to download their analytics data in PDF or Excel format for offline analysis, reporting, and record-keeping.

## Features

### Export Formats

#### PDF Report
- Professional formatted document with charts and tables
- Includes overview metrics, menu performance, peak hours analysis
- Branded with restaurant colors and DishDisplay branding
- Multi-page layout with proper pagination
- Ideal for sharing with stakeholders or printing

#### Excel Spreadsheet
- Raw data across multiple worksheets
- Separate sheets for:
  - Overview metrics
  - Menu performance data
  - Enhanced performance scores
  - Peak hours analysis
  - Recent activity log
- Perfect for custom analysis and data manipulation

### Date Range Options
- Last 7 days
- Last 30 days (default)
- Last 3 months
- Last year

### Data Included

#### Overview Metrics
- Total menu views
- Total QR code scans
- Unique visitors
- Average view time
- Percentage changes from previous period

#### Menu Performance
- Item-by-item performance metrics
- View counts and engagement data
- Performance scores and rankings
- Peak hour analysis per item

#### Additional Data
- Recent activity logs
- Peak hours analysis
- Customer engagement patterns

## Implementation

### Components
- `ExportAnalytics.tsx` - Main export interface component
- `export-analytics.ts` - Core export service with PDF/Excel generation

### Dependencies
- `jspdf` - PDF generation
- `jspdf-autotable` - Table formatting for PDFs
- `xlsx` - Excel file generation
- `file-saver` - File download handling
- `sonner` - Toast notifications

### Usage

The export feature is integrated into the main analytics dashboard at `/profile/insights`. Restaurant owners can:

1. Select export format (PDF or Excel)
2. Choose date range
3. Preview what data will be included
4. Generate and download the report

### File Naming
Files are automatically named with the pattern:
`{restaurant_name}_analytics_{YYYY-MM-DD}.{pdf|xlsx}`

## Technical Details

### PDF Generation
- Uses jsPDF with autoTable plugin
- Responsive table layouts
- Brand colors and styling
- Multi-page support with headers/footers

### Excel Generation
- Multiple worksheets for organized data
- Proper column sizing and formatting
- Numeric data preserved as numbers for formulas
- Headers and metadata included

### Performance
- Async data loading
- Progress indicators during export
- Error handling with user feedback
- Client-side file generation (no server load)

## Future Enhancements

Potential improvements for future versions:
- Scheduled automated reports via email
- Custom date range selection
- Chart/graph inclusion in PDFs
- Template customization options
- Bulk export for multiple restaurants (enterprise feature)
