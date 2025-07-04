// table-user.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './table-user.component.html',
  styleUrls: ['./table-user.component.css']
})
export class TableUserComponent implements OnInit {
userData: any;
onSubmit() {
throw new Error('Method not implemented.');
}
  @ViewChild('topOfPage') topOfPage!: ElementRef;

  public users: User[] = [];
  public filteredUsers: User[] = [];
  public isLoading = true;
  public error: string | null = null;

  public filter = {
    firstname: '',
    lastname: '',
    email: '',
    role: '',
    status: '',
    creationDate: '',
    lastUpdateDate: ''
  };

  public currentPage = 1;
  public pageSize = 30;
userForm: any;
errorMessage: any;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.scrollToTop();
  }

  addUser(): void {
    this.router.navigate(['/user-viewer', 0]); // Navigate to viewer in create mode
  }


  scrollToTop(): void {
    if (this.topOfPage) {
      this.topOfPage.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users from server';
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

    this.filteredUsers = this.users.filter(user => {
      return Object.entries(cleanFilter).every(([key, filterValue]) => {
        if (!filterValue) return true;

        let fieldValue = user[key as keyof User];
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

    this.currentPage = 1;
    this.scrollToTop();
  }

  resetFilter(): void {
    Object.keys(this.filter).forEach(key => this.filter[key as keyof typeof this.filter] = '');
    this.filteredUsers = [...this.users];
    this.currentPage = 1;
    this.scrollToTop();
  }

  delete(user: User): void {
    if (!user.id) {
      alert('User ID not found!');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${user.firstname} ${user.lastname}"?`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        // Remove the user from the users list
        this.users = this.users.filter(u => u.id !== user.id);
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
        this.applyFilter(); // re-apply filter to update filteredUsers if needed
      },
      error: (err) => {
        alert('Failed to delete user.');
        console.error(err);
      }
    });
  }


  viewUser(id: number): void {
    this.router.navigate(['/user-viewer', id]);
  }


}
