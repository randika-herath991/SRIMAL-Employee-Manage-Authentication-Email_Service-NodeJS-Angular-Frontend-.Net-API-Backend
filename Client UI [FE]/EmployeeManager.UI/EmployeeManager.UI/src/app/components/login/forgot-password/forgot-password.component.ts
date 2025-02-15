import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup = new FormGroup({});
  faEnvelope = faEnvelope;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      adminEmail: ['', [Validators.required, Validators.email, Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const adminEmail = this.forgotPasswordForm.value.adminEmail;

      this.authService.forgotPassword(adminEmail).subscribe({
        next: (response) => {
          console.log("Email sent successfully:", response);
          this.toastr.success(response);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.log("Email send failed!");
          this.toastr.error('Error occurred. Please try again.');
        }
      });
    }
  }

}