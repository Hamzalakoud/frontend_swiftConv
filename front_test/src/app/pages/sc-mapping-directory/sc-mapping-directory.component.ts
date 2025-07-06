import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScMappingDirectoryService, ScMappingDirectory } from '../../services/sc-mapping-directory.service';

declare var window: any;

@Component({
  selector: 'app-sc-mapping-directory',
  templateUrl: './sc-mapping-directory.component.html',
  styleUrls: ['./sc-mapping-directory.component.css']
})
export class ScMappingDirectoryComponent implements OnInit {
  mappings: ScMappingDirectory[] = [];
  filteredMappings: ScMappingDirectory[] = [];
  isLoading = true;
  error: string | null = null;

  filter = {
    repIn: '',
    repOut: ''
  };

  currentPage = 1;
  pageSize = 20;

  @ViewChild('topOfPage') topOfPage!: ElementRef;

  editForm: FormGroup;
  editingMapping: ScMappingDirectory | null = null;
  isEditing = false;
  formError: string | null = null;
  editModal: any;

  addForm: FormGroup;
  addModal: any;
  addFormError: string | null = null;

  constructor(
    private mappingService: ScMappingDirectoryService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      repIn: ['', Validators.required],
      repOut: ['', Validators.required]
    });

    this.addForm = this.fb.group({
      repIn: ['', Validators.required],
      repOut: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMappings();
    this.editModal = new window.bootstrap.Modal(document.getElementById('editParamDirectory'));
    this.addModal = new window.bootstrap.Modal(document.getElementById('addParamDirectory'));
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
        let fieldValue = mapping[key as keyof ScMappingDirectory];
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

  get paginatedMappings(): ScMappingDirectory[] {
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

  startEdit(mapping: ScMappingDirectory): void {
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
          const idx = this.mappings.findIndex(p => p.id === updated.id);
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

  delete(mapping: ScMappingDirectory): void {
    if (!mapping.id) return;
    if (!confirm(`Delete mapping REP_IN "${mapping.repIn}"?`)) return;

    this.mappingService.delete(mapping.id).subscribe({
      next: () => {
        this.mappings = this.mappings.filter(p => p.id !== mapping.id);
        this.applyFilter();
      },
      error: err => {
        alert('Delete failed.');
        console.error(err);
      }
    });
  }

  // --- Add new mapping modal methods ---
  openAddModal(): void {
    this.addForm.reset();
    this.addFormError = null;
    this.addModal.show();
  }

  closeAddModal(): void {
    this.addModal.hide();
  }

  saveNewMapping(): void {
    if (this.addForm.invalid) {
      this.addFormError = 'Please fill all required fields.';
      return;
    }
    this.addFormError = null;

    const newMapping: ScMappingDirectory = this.addForm.value;

    this.mappingService.create(newMapping).subscribe({
      next: created => {
        this.mappings.push(created);
        this.applyFilter();
        this.closeAddModal();
      },
      error: err => {
        this.addFormError = 'Failed to create mapping.';
        console.error(err);
      }
    });
  }
}
