import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ScParamGlobalService, ScParamGlobal } from '../../services/sc-param-global.service';
import { NgForm } from '@angular/forms';

declare var window: any; // To access Bootstrap modal JS

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

  // For add/edit form
  editingParam: ScParamGlobal | null = null;
  isEditing = false;
  formError: string | null = null;

  // For Add Modal
  newParam: ScParamGlobal = {
    element: '',
    valeur: ''
  };
  modalFormError: string | null = null;
  addModal: any;

  constructor(private paramService: ScParamGlobalService) {}

  ngOnInit(): void {
    this.loadParams();

    // Initialize Bootstrap modal (make sure Bootstrap JS loaded)
    this.addModal = new window.bootstrap.Modal(document.getElementById('addParamModal'));
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

  get totalPages(): number {
    return Math.ceil(this.filteredParams.length / this.pageSize);
  }

  get paginatedParams(): ScParamGlobal[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredParams.slice(start, start + this.pageSize);
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

  // CRUD methods

  startCreate(): void {
    this.isEditing = true;
    this.editingParam = {
      element: '',
      valeur: ''
    };
    this.formError = null;
  }

  startEdit(param: ScParamGlobal): void {
    this.isEditing = true;
    this.editingParam = { ...param };
    this.formError = null;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingParam = null;
    this.formError = null;
  }

  save(paramForm: NgForm): void {
    if (!this.editingParam) return;

    if (paramForm.invalid) {
      this.formError = 'Please fill all required fields correctly.';
      return;
    }

    this.formError = null;

    if ((this.editingParam as any).id) {
      this.paramService.update((this.editingParam as any).id, this.editingParam).subscribe({
        next: updated => {
          const idx = this.params.findIndex(p => (p as any).id === (updated as any).id);
          if (idx !== -1) {
            this.params[idx] = updated;
            this.applyFilter();
          }
          this.cancelEdit();
        },
        error: err => {
          this.formError = 'Update failed.';
          console.error(err);
        }
      });
    } else {
      this.paramService.create(this.editingParam).subscribe({
        next: created => {
          this.params.push(created);
          this.applyFilter();
          this.cancelEdit();
        },
        error: err => {
          this.formError = 'Creation failed.';
          console.error(err);
        }
      });
    }
  }

  delete(param: ScParamGlobal): void {
    if (!(param as any).id) return;
    if (!confirm(`Delete parameter "${param.element}"?`)) return;

    this.paramService.delete((param as any).id).subscribe({
      next: () => {
        this.params = this.params.filter(p => (p as any).id !== (param as any).id);
        this.applyFilter();
      },
      error: err => {
        alert('Delete failed.');
        console.error(err);
      }
    });
  }

  // Modal handling for Add new param

  openAddModal(): void {
    this.newParam = {
      element: '',
      valeur: ''
    };
    this.modalFormError = null;
    this.addModal.show();
  }

  closeAddModal(): void {
    this.addModal.hide();
  }

  saveNewParam(form: NgForm): void {
    if (form.invalid) {
      this.modalFormError = 'Please fill all required fields.';
      return;
    }
    this.modalFormError = null;

    this.paramService.create(this.newParam).subscribe({
      next: (created) => {
        this.params.push(created);
        this.applyFilter();
        this.closeAddModal();
      },
      error: (err) => {
        this.modalFormError = 'Failed to create parameter.';
        console.error(err);
      }
    });
  }

}
