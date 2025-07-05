import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScParamGlobalService, ScParamGlobal } from '../../services/sc-param-global.service';

declare var window: any;

@Component({
  selector: 'app-sc-param-global',
  templateUrl: './sc-param-global.component.html',
  styleUrls: ['./sc-param-global.component.css']
})
export class ScParamGlobalComponent implements OnInit {
  params: ScParamGlobal[] = [];
  filteredParams: ScParamGlobal[] = [];
  isLoading = true;
  error: string | null = null;

  filter = {
    element: '',
    valeur: ''
  };

  currentPage = 1;
  pageSize = 20;

  @ViewChild('topOfPage') topOfPage!: ElementRef;

  editForm: FormGroup;
  editingParam: ScParamGlobal | null = null;
  isEditing = false;
  formError: string | null = null;
  editModal: any;

  constructor(
    private paramService: ScParamGlobalService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      element: ['', Validators.required],
      valeur: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadParams();
    this.editModal = new window.bootstrap.Modal(document.getElementById('editParamGlobal'));
  }

  loadParams(): void {
    this.isLoading = true;
    this.paramService.getAll().subscribe({
      next: data => {
        this.params = data;
        this.filteredParams = [...data];
        this.isLoading = false;
      },
      error: err => {
        this.error = 'Failed to load parameters';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  startEdit(param: ScParamGlobal): void {
    this.editingParam = { ...param };
    this.isEditing = true;
    this.editForm.patchValue(this.editingParam);
    this.editModal.show();
  }

  closeEditModal(): void {
    this.editModal.hide();
    this.isEditing = false;
    this.editingParam = null;
    this.formError = null;
  }

  save(): void {
    if (this.editForm.invalid) {
      this.formError = 'Please fill all required fields.';
      return;
    }

    this.formError = null;

    if (this.editingParam?.id) {
      const updatedParam = { ...this.editingParam, ...this.editForm.value };
      this.paramService.update(this.editingParam.id, updatedParam).subscribe({
        next: updated => {
          const idx = this.params.findIndex(p => p.id === updated.id);
          if (idx !== -1) {
            this.params[idx] = updated;
            this.applyFilter();
          }
          this.closeEditModal();
        },
        error: err => {
          this.formError = 'Update failed.';
          console.error(err);
        }
      });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredParams.length / this.pageSize);
  }

  get paginatedParams(): ScParamGlobal[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredParams.slice(start, start + this.pageSize);
  }

  applyFilter(): void {
    const cleanFilter = Object.entries(this.filter).reduce((acc, [key, value]) => {
      acc[key] = value?.toString().trim().toLowerCase() || '';
      return acc;
    }, {} as Record<string, string>);

    this.filteredParams = this.params.filter(param => {
      return Object.entries(cleanFilter).every(([key, filterValue]) => {
        if (!filterValue) return true;
        let fieldValue = param[key as keyof ScParamGlobal];
        if (fieldValue === null || fieldValue === undefined) return false;
        return String(fieldValue).toLowerCase().includes(filterValue);
      });
    });

    this.currentPage = 1;
    this.scrollToTop();
  }

  resetFilter(): void {
    Object.keys(this.filter).forEach(key => this.filter[key as keyof typeof this.filter] = '');
    this.filteredParams = [...this.params];
    this.currentPage = 1;
    this.scrollToTop();
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

  delete(param: ScParamGlobal): void {
    if (!param.id) return;
    if (!confirm(`Delete parameter "${param.element}"?`)) return;

    this.paramService.delete(param.id).subscribe({
      next: () => {
        this.params = this.params.filter(p => p.id !== param.id);
        this.applyFilter();
      },
      error: err => {
        alert('Delete failed.');
        console.error(err);
      }
    });
  }
}
