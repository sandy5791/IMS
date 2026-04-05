import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Generates CSV content from headers and row data, then triggers a browser download.
   * @param headers - Array of column header strings
   * @param rows - 2D array of row data (each row is string[])
   * @param filename - Name for the downloaded file (without extension)
   */
  exportToCsv(headers: string[], rows: string[][], filename: string): void {
    const csvContent = this.generateCsvContent(headers, rows);
    this.downloadBlob(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Generates CSV string from headers and rows.
   */
  private generateCsvContent(headers: string[], rows: string[][]): string {
    const allRows = [headers, ...rows];
    return allRows
      .map(row => row.map(field => `"${(field ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  /**
   * Creates a Blob from content and triggers download via a temporary anchor element.
   */
  private downloadBlob(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
