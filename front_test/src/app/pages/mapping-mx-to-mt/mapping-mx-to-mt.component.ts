import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MappingMxToMtService, ScMappingMxToMt } from '../../services/mapping-mx-to-mt.service';
import { NgForm } from '@angular/forms';

declare var window: any; // To access Bootstrap modal JS

@Component({
  selector: 'app-mapping-mx-to-mt',
  templateUrl: './mapping-mx-to-mt.component.html',
  styleUrls: ['./mapping-mx-to-mt.component.css']
})
export class MappingMxToMtComponent implements OnInit {

  mappings: ScMappingMxToMt[] = [];
  filteredMappings: ScMappingMxToMt[] = [];
  isLoading = true;
  error: string | null = null;

  filter = {
    tag: '',
    function: '',
    path: '',
    attribut: '',
    msgType: '',
    sens: '',
    ordre: ''
  };

  currentPage = 1;
  pageSize = 20;

  @ViewChild('topOfPage') topOfPage!: ElementRef;

  // For add/edit form
  editingMapping: ScMappingMxToMt | null = null;
  isEditing = false;
  formError: string | null = null;

  // For Add Modal
  newMapping: ScMappingMxToMt = {
    tag: '',
    function: '',
    path: '',
    attribut: '',
    msgType: '',
    sens: '',
    ordre: ''
  };
  modalFormError: string | null = null;
  addModal: any;
  editModal: any;

  constructor(private mappingService: MappingMxToMtService) {}

  ngOnInit(): void {
    this.loadMappings();

    // Initialize Bootstrap modal (make sure Bootstrap JS loaded)
    this.addModal = new window.bootstrap.Modal(document.getElementById('addMappingModal'));
    this.editModal = new window.bootstrap.Modal(document.getElementById('editMappingModal')); // For edit modal
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

        let fieldValue = mapping[key as keyof ScMappingMxToMt];
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

  get paginatedMappings(): ScMappingMxToMt[] {
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
      tag: '',
      function: '',
      path: '',
      attribut: '',
      msgType: '',
      sens: '',
      ordre: ''
    };
    this.formError = null;
  }

  startEdit(mapping: ScMappingMxToMt): void {
    this.isEditing = true;
    this.editingMapping = { ...mapping };
    this.formError = null;
    this.editModal.show();  // Show the modal
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingMapping = null;
    this.formError = null;
    this.editModal.hide();  // Hide the modal
  }

  save(mappingForm: NgForm): void {
    if (!this.editingMapping) return;

    if (mappingForm.invalid) {
      this.formError = 'Please fill all required fields correctly.';
      return;
    }

    this.formError = null;

    if ((this.editingMapping as any).id) {
      this.mappingService.update((this.editingMapping as any).id, this.editingMapping).subscribe({
        next: updated => {
          const idx = this.mappings.findIndex(m => (m as any).id === (updated as any).id);
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

  delete(mapping: ScMappingMxToMt): void {
    if (!(mapping as any).id) return;
    if (!confirm(`Delete mapping TAG "${mapping.tag}"?`)) return;

    this.mappingService.delete((mapping as any).id).subscribe({
      next: () => {
        this.mappings = this.mappings.filter(m => (m as any).id !== (mapping as any).id);
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
      tag: '',
      function: '',
      path: '',
      attribut: '',
      msgType: '',
      sens: '',
      ordre: ''
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
