import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User, RegisterRequest } from '../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-viewer',
  templateUrl: './user-viewer.component.html',
  styleUrls: ['./user-viewer.component.scss']
})
export class UserViewerComponent implements OnInit {
  userId!: number;
  userData: User | null = null;
  userForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    this.userForm = this.fb.group({
      company: [{ value: 'Creative Code Inc.', disabled: true }],
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      status: [true],
      creationDate: [{ value: '', disabled: true }],
      lastUpdateDate: [{ value: '', disabled: true }],
      password: ['', Validators.minLength(6)]
    });

    if (this.userId && this.userId !== 0) {
      this.loadUser();
    } else {
      this.userId = 0; // Creation mode
    }
  }

  loadUser(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userData = user;
        this.userForm.patchValue({
          username: user.firstname,
          email: user.email,
          firstName: user.firstname,
          lastName: user.lastname,
          role: user.role,
          status: user.status ?? true,
          creationDate: user.creationDate ? new Date(user.creationDate).toLocaleString() : '',
          lastUpdateDate: user.lastUpdateDate ? new Date(user.lastUpdateDate).toLocaleString() : ''
        });
        this.isLoading = false;

        // Automatically update status based on role (admin -> active, others -> inactive)
        this.updateStatusBasedOnRole(user.role);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load user data.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // Update status based on the selected role
  updateStatusBasedOnRole(role: string): void {
    if (role === 'Admin' || role === 'Viewer' || role === 'Éditeur') {
      this.userForm.patchValue({ status: true });
    } else {
      this.userForm.patchValue({ status: false });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.isLoading = true;

    const request: RegisterRequest = {
      firstname: this.userForm.get('firstName')?.value,
      lastname: this.userForm.get('lastName')?.value,
      email: this.userForm.get('email')?.value,
      password: this.userForm.get('password')?.value || '', // required for creation
      role: this.userForm.get('role')?.value,
      status: this.userForm.get('status')?.value
    };

    if (this.userId === 0) {
      // CREATE mode
      this.userService.registerUser(request).subscribe({
        next: () => {
          this.isLoading = false;
          alert('User created successfully!');
          this.router.navigate(['/Table-user']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Creation failed. ' + (err.error?.message || err.message);
          console.error(err);
        }
      });
    } else {
      // UPDATE mode
      this.userService.updateUser(this.userId, request).subscribe({
        next: () => {
          this.isLoading = false;
          alert('User updated successfully!');
          this.router.navigate(['/Table-user']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Update failed. ' + (err.error?.message || err.message);
          console.error(err);
        }
      });
    }
  }

  closeViewer(): void {
    this.router.navigate(['/Table-user']);
  }
}
