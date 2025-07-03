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
  public isLoading = true;
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
    creationDate: '',
    updateDate: ''
  };

  public currentPage = 1;
  public pageSize = 30;

  public sortColumn: string | null = null;
  public sortDirection: 'asc' | 'desc' = 'asc';

  // Controls dropdown visibility
  public isSortDropdownOpen = false;

  constructor(
    @Inject(ScConversionService) private scConversionService: ScConversionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFiles();
  }

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

  loadFiles(): void {
    this.scConversionService.getFiles().subscribe({
      next: (data) => {
        this.files = data;
        this.filteredFiles = [...data];
        this.applySorting();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load data from server';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  applyFilter(): void {
    const cleanFilter = Object.entries(this.filter).reduce((acc, [key, value]) => {
      acc[key] = value?.toString().trim().toLowerCase() || '';
      return acc;
    }, {} as Record<string, string>);

    this.filteredFiles = this.files.filter(file => {
      return Object.entries(cleanFilter).every(([key, filterValue]) => {
        if (!filterValue) return true;

        let fieldValue = file[key as keyof ScConversion];
        if (fieldValue === null || fieldValue === undefined) return false;

        if (typeof fieldValue === 'string' && /\d{4}-\d{2}-\d{2}/.test(fieldValue)) {
          fieldValue = new Date(fieldValue).toISOString().toLowerCase();
        }

        if (typeof fieldValue === 'number') {
          fieldValue = fieldValue.toString();
        }

        return String(fieldValue).toLowerCase().includes(filterValue);
      });
    });

    this.applySorting();
    this.currentPage = 1;
    this.scrollToTop();
  }

  resetFilter(): void {
    Object.keys(this.filter).forEach(key => this.filter[key as keyof typeof this.filter] = '');
    this.filteredFiles = [...this.files];
    this.applySorting();
    this.currentPage = 1;
    this.scrollToTop();
  }

  toggleSortDropdown(): void {
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  setSort(column: string, direction: 'asc' | 'desc'): void {
    if (this.sortColumn === column && this.sortDirection === direction) {
      // If already sorted this way, toggle direction
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
