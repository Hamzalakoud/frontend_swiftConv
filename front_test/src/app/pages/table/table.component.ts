import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ScConversionService, ScConversion } from '../../services/scconversion.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @ViewChild('topOfPage') topOfPage!: ElementRef;

  public files: ScConversion[] = [];
  public filteredFiles: ScConversion[] = [];
  public isLoading = false;
  public error: string | null = null;

  public filter = {
    filename: '',
    msgCateg: '',
    msgType: '',
    bicEm: '',
    bicDe: '',
    uertr: '',
    amount: '',
    currency: '',
    customerAccount: '',
    tag71A: '',
    status: '',
    sens: '',
    toConvert: '',
    creationDate: ''
  };

  public currentPage = 1;
  public pageSize = 30;

  public sortColumn: string | null = null;
  public sortDirection: 'asc' | 'desc' = 'asc';

  public isSortDropdownOpen = false;

  public showTable = false; // <--- Control table visibility

  constructor(
    @Inject(ScConversionService) private scConversionService: ScConversionService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  get totalPages(): number {
    return Math.ceil(this.filteredFiles.length / this.pageSize);
  }

  get paginatedFiles(): ScConversion[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredFiles.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.scrollToTop();
  }

  scrollToTop(): void {
    if (this.topOfPage) {
      this.topOfPage.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  applyFilter(): void {
    this.isLoading = true;
    this.error = null;

    // Trim all string fields in the filter
    const trimmedFilter: typeof this.filter = {} as any;
    Object.keys(this.filter).forEach(key => {
      const val = this.filter[key as keyof typeof this.filter];
      trimmedFilter[key as keyof typeof this.filter] = typeof val === 'string' ? val.trim() : val;
    });

    this.scConversionService.getFilteredFiles(trimmedFilter).subscribe({
      next: (data) => {
        // If filename filter is set, do flexible filtering ignoring extensions
        if (trimmedFilter.filename) {
          const baseName = trimmedFilter.filename.split('.')[0].toLowerCase();

          this.filteredFiles = data.filter(file => {
            if (!file.filename) return false;
            const fileBaseName = file.filename.split('.')[0].toLowerCase();
            return fileBaseName.includes(baseName);
          });
        } else {
          this.filteredFiles = [...data];  // No filename filter, use all data
        }

        this.files = [...this.filteredFiles];

        this.applySorting();
        this.currentPage = 1;
        this.isLoading = false;
        this.scrollToTop();
        this.showTable = true; // Show table only after applying filter
      },
      error: (err) => {
        this.error = 'Failed to load data from server';
        this.isLoading = false;
        console.error(err);
        this.showTable = false; // Hide table on error
      }
    });
  }


  resetFilter(): void {
    Object.keys(this.filter).forEach(key => this.filter[key as keyof typeof this.filter] = '');
    this.filteredFiles = [];
    this.files = [];
    this.showTable = false; // Hide table on reset
  }

  toggleSortDropdown(): void {
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  setSort(column: string, direction: 'asc' | 'desc'): void {
    if (this.sortColumn === column && this.sortDirection === direction) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = direction;
    }
    this.applySorting();
    this.currentPage = 1;
    this.scrollToTop();
  }

  applySorting(): void {
    if (!this.sortColumn) return;

    this.filteredFiles.sort((a, b) => {
      let valA = a[this.sortColumn as keyof ScConversion];
      let valB = b[this.sortColumn as keyof ScConversion];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (this.sortColumn === 'creationDate') {
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      }

      if (this.sortColumn === 'amount') {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  viewMsg(id: number): void {
    this.router.navigate(['/msg-viewer', id]);
  }
}
