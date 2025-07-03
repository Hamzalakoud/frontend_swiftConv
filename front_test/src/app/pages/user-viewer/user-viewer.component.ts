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

    // Initialize form with empty/default values and validators
    this.userForm = this.fb.group({
      company: [{ value: 'Creative Code Inc.', disabled: true }], // Static disabled field
      username: ['', Validators.required],                        // Map to firstname for display
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],                           // Editable role field
      status: [true],                                            // Checkbox for status
      creationDate: [{ value: '', disabled: true }],             // Readonly creation date
      lastUpdateDate: [{ value: '', disabled: true }]            // Readonly last update date
    });

    if (this.userId) {
      this.loadUser();
    } else {
      this.errorMessage = 'No user ID provided.';
    }
  }

  loadUser(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userData = user;

        // Patch form with loaded user data
        this.userForm.patchValue({
          username: user.firstname, // username field is mapped to firstname
          email: user.email,
          firstName: user.firstname,
          lastName: user.lastname,
          role: user.role,
          status: user.status ?? false,  // fallback to false if null/undefined,
          creationDate: user.creationDate ? new Date(user.creationDate).toLocaleString() : '',
          lastUpdateDate: user.lastUpdateDate ? new Date(user.lastUpdateDate).toLocaleString() : ''
        });

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load user data.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
    this.isLoading = true;

    // Build updated user request
    const updatedUser: RegisterRequest = {
      firstname: this.userForm.get('firstName')?.value,
      lastname: this.userForm.get('lastName')?.value,
      email: this.userForm.get('email')?.value,
      password: '', // blank or add logic to update password if needed
      role: this.userForm.get('role')?.value,
      status: this.userForm.get('status')?.value
    };

    this.userService.updateUser(this.userId, updatedUser).subscribe({
      next: (res) => {
        this.isLoading = false;
        alert('User updated successfully!');
        this.router.navigate(['/Table-user']); // redirect after successful update
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Update failed. ' + (err.error?.message || err.message);
        console.error(err);
      }
    });
  }


  closeViewer(): void {
    this.router.navigate(['/Table-user']);
  }
}
