import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // <-- Import Reactive form modules
import { MappingMtToMxService, ScMappingMtToMx } from '../../services/mapping-mt-to-mx.service';

declare var window: any;

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

  // Reactive form initialization
  editForm: FormGroup;
  editingMapping: ScMappingMtToMx | null = null;
  isEditing = false;
  formError: string | null = null;
  editModal: any;

  constructor(
    private mappingService: MappingMtToMxService,
    private fb: FormBuilder // <-- Inject FormBuilder to create the form group
  ) {
    // Initialize the form with default values and validation rules
    this.editForm = this.fb.group({
      mtType: ['', Validators.required],
      mtTag: ['', Validators.required],
      attribut: ['', Validators.required],
      mxType: ['', Validators.required],
      mxPath: ['', Validators.required],
      convFunc: ['', Validators.required],
      niveau: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMappings();
    // Initialize Bootstrap modal
    this.editModal = new window.bootstrap.Modal(document.getElementById('editMappingModal'));
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

  startEdit(mapping: ScMappingMtToMx): void {
    // Clone the mapping to avoid mutation and populate the form
    this.editingMapping = { ...mapping };
    this.isEditing = true;
    // Set form values for editing
    this.editForm.patchValue(this.editingMapping);
    // Show the modal
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

  // Pagination logic
  get totalPages(): number {
    return Math.ceil(this.filteredMappings.length / this.pageSize);
  }

  get paginatedMappings(): ScMappingMtToMx[] {
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
}
