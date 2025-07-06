import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MappingMxToMtService, ScMappingMxToMt } from '../../services/mapping-mx-to-mt.service';

declare var window: any;

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

  editForm: FormGroup;
  editingMapping: ScMappingMxToMt | null = null;
  isEditing = false;
  formError: string | null = null;
  editModal: any;

  constructor(
    private mappingService: MappingMxToMtService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      tag: ['', Validators.required],
      function: ['', Validators.required],
      path: ['', Validators.required],
      attribut: ['', Validators.required],
      msgType: ['', Validators.required],
      sens: ['', Validators.required],
      ordre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMappings();
    this.editModal = new window.bootstrap.Modal(document.getElementById('editMappingModalMxToMt'));
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

  startEdit(mapping: ScMappingMxToMt): void {
    this.editingMapping = { ...mapping };
    this.isEditing = true;
    this.editForm.patchValue(this.editingMapping);
    this.editModal.show();
  }

  closeEditModal(): void {
    this.editModal.hide();
    this.isEditing = false;
    this.editingMapping = null;
    this.formError = null;
  }

  save(): void {
    if (this.editForm.invalid) {
      this.formError = 'Please fill all required fields.';
      return;
    }

    this.formError = null;

    if (this.editingMapping?.id) {
      const updatedMapping = { ...this.editingMapping, ...this.editForm.value };
      this.mappingService.update(this.editingMapping.id, updatedMapping).subscribe({
        next: updated => {
          const idx = this.mappings.findIndex(m => m.id === updated.id);
          if (idx !== -1) {
            this.mappings[idx] = updated;
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

  delete(mapping: ScMappingMxToMt): void {
    if (!mapping.id) {
      console.error('Cannot delete mapping without ID');
      return;
    }

    if (!confirm(`Are you sure you want to delete mapping with tag "${mapping.tag}"?`)) {
      return;
    }

    this.mappingService.delete(mapping.id).subscribe({
      next: () => {
        // Remove from full list
        this.mappings = this.mappings.filter(m => m.id !== mapping.id);
        // Remove from filtered list
        this.filteredMappings = this.filteredMappings.filter(m => m.id !== mapping.id);
        // Adjust pagination if needed
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        this.scrollToTop();
      },
      error: err => {
        console.error('Delete failed:', err);
        alert('Failed to delete the mapping.');
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMappings.length / this.pageSize);
  }

  get paginatedMappings(): ScMappingMxToMt[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMappings.slice(start, start + this.pageSize);
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

  // --- New method to start creating a new mapping ---
  startCreate(): void {
    this.editingMapping = null;
    this.isEditing = false;
    this.editForm.reset();
    this.editModal.show();
  }
}
