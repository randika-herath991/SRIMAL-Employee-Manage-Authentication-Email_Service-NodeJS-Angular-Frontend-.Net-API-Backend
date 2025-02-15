import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { faEnvelope, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  faEnvelope = faEnvelope;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      adminEmail: ['', [Validators.required, Validators.email, Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')]],
      adminPassword: ['', [Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()]).{8,}$')]],

      rememberMe: [false]
    });

    const rememberedEmail = localStorage.getItem('adminEmail');
    const rememberedPassword = localStorage.getItem('adminPassword');
    if (rememberedEmail && rememberedPassword) {
      this.loginForm.patchValue({
        adminEmail: rememberedEmail,
        adminPassword: rememberedPassword,
        rememberMe: true
      });
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;

      this.authService.login(formData.adminEmail, formData.adminPassword).subscribe(
        (response: any) => {
          localStorage.setItem('authToken', response.token);
          console.log('Authentication Token is: ', response.token);
          console.log("Login Success !");
          if (formData.rememberMe) {
            localStorage.setItem('adminEmail', formData.adminEmail);
            localStorage.setItem('adminPassword', formData.adminPassword);
          } else {
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminPassword');
          }

          this.toastr.success('Login successful!');
          this.router.navigate(['/employees']);
        },
        (error) => {
          this.toastr.error('Login failed, please try again.');
          console.log("Login Failed !");
        }
      );
    }
  }
}