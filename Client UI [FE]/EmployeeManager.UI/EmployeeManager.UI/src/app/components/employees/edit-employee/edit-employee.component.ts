import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Employee } from 'src/app/models/employee.model';
import { EmployeesService } from 'src/app/services/employees.service';
import { faUser, faEyeSlash, faEye, faEnvelope, faPhone, faDollar, faBuilding, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
// import * as bootstrap from 'bootstrap';

declare var bootstrap: any;

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit {

  faIdCard = faIdCard;
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

  employeeDetails: Employee = {
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

  emailErrorMessage: string = '';
  passwordErrorMessage: string = '';

  constructor(private route: ActivatedRoute, private employeeService: EmployeesService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');

        if (id) {
          this.employeeService.getEmployee(id)
            .subscribe({
              next: (response) => {
                this.employeeDetails = response;
                console.log(this.employeeDetails.id);
                console.log(this.employeeDetails.name);
                console.log(this.employeeDetails.password);
                const phoneNumber = this.employeeDetails.phone;
                if (phoneNumber && phoneNumber.startsWith('0')) {
                  this.employeeDetails.phone = `+94 ${phoneNumber.substring(1)}`;
                }
                this.registrationFormGroup.setValue({
                  id: this.employeeDetails.id,
                  name: this.employeeDetails.name,
                  email: this.employeeDetails.email,
                  password: this.employeeDetails.password,
                  phone: this.employeeDetails.phone,
                  salary: this.employeeDetails.salary,
                  department: this.employeeDetails.department
                });
              }
            })
        }
      }
    })
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

  updateEmployee() {
    this.formSubmitted = true;
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    if (this.registrationFormGroup.valid) {
      console.log("Form Submitted");
      const phoneNumber: any = this.registrationFormGroup.get('phone')?.value;
      if (phoneNumber && typeof phoneNumber === 'object') {
        console.log('Phone object:', phoneNumber);
        this.employeeDetails.phone = phoneNumber?.internationalNumber ?? '';
      } else if (typeof phoneNumber === 'string') {
        const nationalNumber = phoneNumber.replace(/^\+[0-9]{1,4}/, '');
        console.log('National Number:', nationalNumber);
        this.employeeDetails.phone = `+94 ${nationalNumber}`;
      } else {
        this.employeeDetails.phone = '';
      }

      this.employeeDetails.name = this.registrationFormGroup.get('name')?.value!;
      this.employeeDetails.email = this.registrationFormGroup.get('email')?.value!;
      this.employeeDetails.password = this.registrationFormGroup.get('password')?.value!;
      this.employeeDetails.salary = this.registrationFormGroup.get('salary')?.value!;
      this.employeeDetails.department = this.registrationFormGroup.get('department')?.value!;

      console.log('Updated Employee Details:', this.employeeDetails);
      console.log(this.employeeDetails);
      this.employeeService.updateEmployee(this.employeeDetails.id, this.employeeDetails)
        .subscribe({
          next: () => {
            this.updateToaster();
            this.router.navigate(['employees']);
            console.log('Updated Employee Details:', this.employeeDetails);
          },
          error: (err) => {
            if (err === 'Email already exists.') {
              this.emailErrorMessage = "Email Already Exists";
            } else if (err === 'Password already exists.') {
              this.passwordErrorMessage = "Password Already Exists";
            } else {
              this.toastr.error('Failed to update employee data!', 'Error', {
                closeButton: true
              });
            }
          }
        })
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  updateToaster() {
    this.toastr.show('Data Update Successfully !', '', {
      closeButton: true
    });
  }

  deleteEmployee(id: string) {
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal')!);
    modal.show();
  }

  deleteEmployeeConfirmed() {
    this.employeeService.deleteEmployee(this.employeeDetails.id)
      .subscribe({
        next: (response) => {
          this.deleteToaster();
          this.router.navigate(['employees']);
        },
        error: (error) => {
          this.toastr.error('Failed to delete employee data!', 'Error', {
            closeButton: true
          });
        }
      })
  }

  deleteToaster() {
    this.toastr.warning('Data Delete Successfully !', '', {
      closeButton: true
    });
  }

  onPhoneNumberChange(event: any) {
    console.log(event);
  }
}