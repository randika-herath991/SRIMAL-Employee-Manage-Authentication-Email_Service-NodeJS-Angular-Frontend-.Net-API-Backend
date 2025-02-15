import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faUser, faEyeSlash, faEye, faEnvelope, faPhone, faDollar, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { Employee } from 'src/app/models/employee.model';
import { EmployeesService } from 'src/app/services/employees.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

declare var bootstrap: any;

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {

  faUser = faUser;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faDollar = faDollar;
  faBuilding = faBuilding;

  formSubmitted = false;
  registrationFormGroup = new FormGroup({
    id: new FormControl(''),
    email: new FormControl('', [Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')]),
    password: new FormControl('', [Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]),
    name: new FormControl(''),
    phone: new FormControl('', [
      Validators.required,
    ]),
    salary: new FormControl(0),
    department: new FormControl(''),
  });
  passwordVisible = false;

  addEmployeeRequest: Employee = {
    id: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    salary: 0,
    department: '',
    isActive: true
  };

  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom, CountryISO.India, CountryISO.SriLanka];
  selectedCountryISO: CountryISO = CountryISO.SriLanka;

  emailErrorMessage: string = '';
  passwordErrorMessage: string = '';

  constructor(private employeeService: EmployeesService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const carouselElement = document.querySelector('#carouselExampleControls');
    const carousel = new bootstrap.Carousel(carouselElement, {
      interval: 3000,
      ride: 'carousel',
      pause: false,
    });
    carousel.cycle();
  }

  addEmployee() {
    this.formSubmitted = true;
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    if (this.registrationFormGroup.valid) {
      console.log("Form Submitted");
      const phoneNumber: any = this.registrationFormGroup.get('phone')?.value;
      if (phoneNumber && typeof phoneNumber === 'object') {
        console.log('Phone object:', phoneNumber);
        this.addEmployeeRequest.phone = phoneNumber?.internationalNumber ?? '';
      } else if (typeof phoneNumber === 'string') {
        const nationalNumber = phoneNumber.replace(/^\+[0-9]{1,4}/, '');
        console.log('National Number:', nationalNumber);
        this.addEmployeeRequest.phone = `+94 ${nationalNumber}`;
      } else {
        this.addEmployeeRequest.phone = '';
      }

      this.addEmployeeRequest.name = this.registrationFormGroup.get('name')?.value!;
      this.addEmployeeRequest.email = this.registrationFormGroup.get('email')?.value!;
      this.addEmployeeRequest.password = this.registrationFormGroup.get('password')?.value!;
      this.addEmployeeRequest.salary = this.registrationFormGroup.get('salary')?.value!;
      this.addEmployeeRequest.department = this.registrationFormGroup.get('department')?.value!;

      console.log(this.addEmployeeRequest);
      this.employeeService.addEmployee(this.addEmployeeRequest)
        .subscribe({
          next: (employee) => {
            console.log(employee);
            this.showToaster();
            this.router.navigate(['employees']);
          },
          error: (err) => {
            if (err === 'Email already exists.') {
              this.emailErrorMessage = "Email Already Exists";
            } else if (err === 'Password already exists.') {
              this.passwordErrorMessage = "Password Already Exists";
            } else {
              this.toastr.error('An error occurred while adding the employee.', 'Error', {
                closeButton: true
              });
            }
          },
        });
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  showToaster() {
    this.toastr.info('Data Enter Successfully !', '', {
      closeButton: true
    });
    setTimeout(() => {
      const toastElement = document.querySelector('.ngx-toastr .toast');
      if (toastElement) {
        toastElement.id = 'my-toast-id';
      }
    }, 0);
  }

  onPhoneNumberChange(event: any) {
    console.log(event);
  }
}