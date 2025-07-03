import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MappingMtToMxService, ScMappingMtToMx } from '../../services/mapping-mt-to-mx.service';
import { NgForm } from '@angular/forms';

declare var window: any; // To access Bootstrap modal JS

@Component({
  selector: 'app-mapping-mt-to-mx',
  templateUrl: './mapping-mt-to-mx.component.html',
  styleUrls: ['./mapping-mt-to-mx.component.css']
})
export class MappingMtToMxComponent implements OnInit {

  mappings: ScMappingMtToMx[] = [];
  filteredMappings: ScMappingMtToMx[] = [];
  isLoading = true;
  error: string | null = null;

  filter = {
    mtType: '',
    mtTag: '',
    attribut: '',
    mxType: '',
    mxPath: '',
    convFunc: '',
    niveau: ''
  };

  currentPage = 1;
  pageSize = 20;

  @ViewChild('topOfPage') topOfPage!: ElementRef;

  // For add/edit form
  editingMapping: ScMappingMtToMx | null = null;
  isEditing = false;
  formError: string | null = null;

  // For Add Modal
  newMapping: ScMappingMtToMx = {
    mtType: '',
    mtTag: '',
    attribut: '',
    mxType: '',
    mxPath: '',
    convFunc: '',
    niveau: ''
  };
  modalFormError: string | null = null;
  addModal: any;

  constructor(private mappingService: MappingMtToMxService) {}

  ngOnInit(): void {
    this.loadMappings();

    // Initialize Bootstrap modal (make sure Bootstrap JS loaded)
    this.addModal = new window.bootstrap.Modal(document.getElementById('addMappingModal'));
  }

  loadMappings(): void {
    this.isLoading = true;
    this.mappingService.getAll().subscribe({
      next: data => {
        this.mappings = data;
        this.filteredMappings = [...data];
        this.isLoading = false;
      },
      error: err => {
        this.error = 'Failed to load mappings';
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

    this.filteredMappings = this.mappings.filter(mapping => {
      return Object.entries(cleanFilter).every(([key, filterValue]) => {
        if (!filterValue) return true;

        let fieldValue = mapping[key as keyof ScMappingMtToMx];
        if (fieldValue === null || fieldValue === undefined) return false;

        return String(fieldValue).toLowerCase().includes(filterValue);
      });
    });

    this.currentPage = 1;
    this.scrollToTop();
  }

  resetFilter(): void {
    Object.keys(this.filter).forEach(key => this.filter[key as keyof typeof this.filter] = '');
    this.filteredMappings = [...this.mappings];
    this.currentPage = 1;
    this.scrollToTop();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMappings.length / this.pageSize);
  }

  get paginatedMappings(): ScMappingMtToMx[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMappings.slice(start, start + this.pageSize);
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
    this.editingMapping = {
      mtType: '',
      mtTag: '',
      attribut: '',
      mxType: '',
      mxPath: '',
      convFunc: '',
      niveau: ''
    };
    this.formError = null;
  }

  startEdit(mapping: ScMappingMtToMx): void {
    this.isEditing = true;
    this.editingMapping = { ...mapping };
    this.formError = null;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingMapping = null;
    this.formError = null;
  }

  save(mappingForm: NgForm): void {
    if (!this.editingMapping) return;

    if (mappingForm.invalid) {
      this.formError = 'Please fill all required fields correctly.';
      return;
    }

    this.formError = null;

    if (this.editingMapping.id) {
      this.mappingService.update(this.editingMapping.id, this.editingMapping).subscribe({
        next: updated => {
          const idx = this.mappings.findIndex(m => m.id === updated.id);
          if (idx !== -1) {
            this.mappings[idx] = updated;
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
      this.mappingService.create(this.editingMapping).subscribe({
        next: created => {
          this.mappings.push(created);
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

  delete(mapping: ScMappingMtToMx): void {
    if (!mapping.id) return;
    if (!confirm(`Delete mapping MT Type "${mapping.mtType}"?`)) return;

    this.mappingService.delete(mapping.id).subscribe({
      next: () => {
        this.mappings = this.mappings.filter(m => m.id !== mapping.id);
        this.applyFilter();
      },
      error: err => {
        alert('Delete failed.');
        console.error(err);
      }
    });
  }

  // Modal handling for Add new mapping

  openAddModal(): void {
    this.newMapping = {
      mtType: '',
      mtTag: '',
      attribut: '',
      mxType: '',
      mxPath: '',
      convFunc: '',
      niveau: ''
    };
    this.modalFormError = null;
    this.addModal.show();
  }

  closeAddModal(): void {
    this.addModal.hide();
  }

  saveNewMapping(form: NgForm): void {
    if (form.invalid) {
      this.modalFormError = 'Please fill all required fields.';
      return;
    }
    this.modalFormError = null;

    this.mappingService.create(this.newMapping).subscribe({
      next: (created) => {
        this.mappings.push(created);
        this.applyFilter();
        this.closeAddModal();
      },
      error: (err) => {
        this.modalFormError = 'Failed to create mapping.';
        console.error(err);
      }
    });
  }

}
