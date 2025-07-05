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
      status: [true], // used for binding
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

        this.updateStatusBasedOnRole(user.role);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load user data.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // Normalize frontend role strings to backend expected format
  normalizeRole(role: string): string {
    const map: { [key: string]: string } = {
      'Admin': 'admin',
      'Éditeur': 'editeur',
      'Editeur': 'editeur',
      'Viewer': 'viewer',
      'Visiteur': 'viewer',
    };
    return map[role] ? map[role] : role.toLowerCase();
  }

  updateStatusBasedOnRole(role: string): void {
    const normalized = this.normalizeRole(role);
    if (['admin', 'viewer', 'editeur'].includes(normalized)) {
      this.userForm.patchValue({ status: true });
    } else {
      this.userForm.patchValue({ status: false });
    }
  }

  // Triggered when one of the status checkboxes is clicked
  setStatus(value: boolean): void {
    this.userForm.patchValue({ status: value });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isLoading = true;

    const password = this.userForm.get('password')?.value;

    const request: RegisterRequest = {
      firstname: this.userForm.get('firstName')?.value,
      lastname: this.userForm.get('lastName')?.value,
      email: this.userForm.get('email')?.value,
      role: this.normalizeRole(this.userForm.get('role')?.value),
      status: this.userForm.get('status')?.value,
    };
    if (password && password.length >= 6) {
      request.password = password;
}

    if (this.userId === 0) {
      // CREATE
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
      // UPDATE
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
