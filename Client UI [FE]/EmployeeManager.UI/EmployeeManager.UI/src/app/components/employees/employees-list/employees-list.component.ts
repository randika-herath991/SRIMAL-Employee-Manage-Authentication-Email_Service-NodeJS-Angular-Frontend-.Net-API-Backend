import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/models/employee.model';
import { EmployeesService } from 'src/app/services/employees.service';
import { ToastrService } from 'ngx-toastr';
import { faExclamationCircle, faFilter, faPrint, faUserSlash, faUserCheck, faFilePdf, faFileWord, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { SeriesLabelsContentArgs } from "@progress/kendo-angular-charts";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import * as docx from 'docx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss']
})
export class EmployeesListComponent implements OnInit {

  faExclamationCircle = faExclamationCircle;
  faFilter = faFilter;
  faPrint = faPrint;
  faUserSlash = faUserSlash;
  faUserCheck = faUserCheck;
  faFilePdf = faFilePdf;
  faFileWord = faFileWord;
  faFileExcel = faFileExcel;

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  loading = false;
  filters: Record<string, string | undefined> = {};
  departmentCategories: string[] = [];
  salaryChartData: any[] = [];
  departmentChartData: any[] = [];

  public data: { kind: string; share: number }[] = []
  public salaryData: { kind: string; share: number }[] = [];

  phonePattern = /^(?:\+94|0)[7][0-9]{8}$/;
  emailPattern = /^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\.[a-z]{2,3}$/;
  salaryPattern = /^[0-9]*([.][0-9]+)?$/;
  phoneError = false;
  emailError = false;
  salaryError = false;

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  pages: number[] = [];

  constructor(private employeeService: EmployeesService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loading = true;
    this.employeeService.getAllEmployees()
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.filteredEmployees = [...employees];
          this.sortEmployeesByName();
          this.loading = false;
          this.prepareChartData();
          this.updatePagination();
        },
        error: (response) => {
          this.toastr.error('Failed to load employee data', 'Error');
          this.loading = false;
        }
      })
  }

  sortEmployeesByName(): void {
    this.filteredEmployees.sort((a, b) => a.name.localeCompare(b.name));
    this.updatePagination();
  }

  toggleEmployeeStatus(employee: Employee): void {
    employee.isActive = !employee.isActive;
    this.employeeService.toggleEmployeeStatus(employee.id).subscribe({
      next: () => {
        this.toastr.success(employee.isActive ? 'Employee activated successfully' : 'Employee deactivated successfully');
        this.prepareChartData();
      },
      error: () => {
        this.toastr.error('Failed to update employee status', 'Error');
      }
    });
  }

  printEmployeeData(): void {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow === null) {
      this.toastr.error('Unable to open print window. Please check if popups are blocked.');
      return;
    }
    printWindow.document.write('<html><head><title>Employee Details</title><style>');
    printWindow.document.write(`
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
        padding: 20px;
        background-color: #f8f9fa;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      table, th, td {
        border: 1px solid #ddd;
      }
      th, td {
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #007bff;
        color: white;
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h2>Employee Details</h2>');
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Salary</th><th>Department</th><th>Status</th></tr></thead>');
    printWindow.document.write('<tbody>');
    this.filteredEmployees.forEach(employee => {
      const status = employee.isActive ? 'Active' : 'Inactive';
      printWindow.document.write(`
        <tr>
          <td>${employee.id}</td>
          <td>${employee.name}</td>
          <td>${employee.email}</td>
          <td>${this.formatPhoneNumber(employee.phone)}</td>
          <td>${employee.salary}</td>
          <td>${employee.department}</td>
          <td>${status}</td> 
        </tr>
      `);
    });
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
    printWindow.print();
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFont('Arial', 'normal');
    doc.text('SRIMAL Employee Details', 14, 10);
    const tableColumns = ['ID', 'Name', 'Email', 'Phone', 'Salary', 'Department', 'Status'];
    const tableRows = this.filteredEmployees.map(employee => {
      return [
        employee.id,
        employee.name,
        employee.email,
        this.formatPhoneNumber(employee.phone),
        employee.salary,
        employee.department,
        employee.isActive ? 'Active' : 'Inactive',
      ];
    });
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 20,
      theme: 'striped',
    });
    doc.save('SRIMAL_Employee_Details.pdf');
  }

  exportToWord() {
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              text: "SRIMAL Employee Details",
              heading: docx.HeadingLevel.HEADING_1,
            }),
            new docx.Paragraph({
              text: "",
            }),
            new docx.Table({
              rows: [
                new docx.TableRow({
                  children: [
                    new docx.TableCell({
                      children: [new docx.Paragraph("ID")],
                      shading: { fill: "D9EAD3" },
                    }),
                    new docx.TableCell({
                      children: [new docx.Paragraph("Name")],
                      shading: { fill: "D9EAD3" },
                    }),
                    new docx.TableCell({
                      children: [new docx.Paragraph("Email")],
                      shading: { fill: "D9EAD3" },
                    }),
                    new docx.TableCell({
                      children: [new docx.Paragraph("Phone")],
                      shading: { fill: "D9EAD3" },
                    }),
                    new docx.TableCell({
                      children: [new docx.Paragraph("Salary")],
                      shading: { fill: "D9EAD3" },
                    }),
                    new docx.TableCell({
                      children: [new docx.Paragraph("Department")],
                      shading: { fill: "D9EAD3" },
                    }),
                    new docx.TableCell({
                      children: [new docx.Paragraph("Status")],
                      shading: { fill: "D9EAD3" },
                    }),
                  ],
                }),
                ...this.employees.map((employee) => {
                  return new docx.TableRow({
                    children: [
                      new docx.TableCell({
                        children: [new docx.Paragraph(employee.id.toString())],
                      }),
                      new docx.TableCell({
                        children: [new docx.Paragraph(employee.name)],
                      }),
                      new docx.TableCell({
                        children: [new docx.Paragraph(employee.email)],
                      }),
                      new docx.TableCell({
                        children: [new docx.Paragraph(this.formatPhoneNumber(employee.phone))],
                      }),
                      new docx.TableCell({
                        children: [new docx.Paragraph(employee.salary.toString())],
                      }),
                      new docx.TableCell({
                        children: [new docx.Paragraph(employee.department)],
                      }),
                      new docx.TableCell({
                        children: [new docx.Paragraph(employee.isActive ? 'Active' : 'Inactive')],
                      }),
                    ],
                  });
                }),
              ],
            }),
          ],
        },
      ],
    });
    docx.Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'SRIMAL_Employee_Details.docx');
    });
  }

  exportToExcel() {
    const headerRange: string | undefined = "A1:G1";
    if (!headerRange) {
      console.error('Header range is undefined or invalid.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees Details');
    worksheet.addRow(['ID', 'Name', 'Email', 'Phone', 'Salary', 'Department', 'Status']);
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };
    worksheet.getRow(1).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } }
    };
    this.filteredEmployees.forEach((employee, index) => {
      const row = [
        employee.id,
        employee.name,
        employee.email,
        this.formatPhoneNumber(employee.phone),
        employee.salary,
        employee.department,
        employee.isActive ? 'Active' : 'Inactive',
      ];
      const newRow = worksheet.addRow(row);
      if (index % 2 === 0) {
        newRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
      }
      newRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        };
      });
    });
    worksheet.columns = [
      { width: 10 },
      { width: 20 },
      { width: 30 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 10 },
    ];
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'SRIMAL_Employee_Details.xlsx';
      link.click();
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.paginateEmployees();
  }

  paginateEmployees(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedEmployees = this.filteredEmployees.slice(start, end);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginateEmployees();
  }

  prepareChartData(): void {
    const salaryByDepartment: { [key: string]: number } = this.filteredEmployees.reduce((acc: { [key: string]: number }, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = 0;
      }
      acc[emp.department] += emp.salary;
      return acc;
    }, {});

    this.departmentCategories = Object.keys(salaryByDepartment);

    this.salaryChartData = [{
      name: 'Total Salary',
      data: Object.values(salaryByDepartment)
    }];

    const departmentDistribution: { [key: string]: number } = this.filteredEmployees.reduce((acc: { [key: string]: number }, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});

    this.departmentChartData = Object.keys(departmentDistribution).map(department => ({
      name: department,
      data: [departmentDistribution[department]]
    }));

    this.data = Object.keys(departmentDistribution).map(department => ({
      kind: department,
      share: departmentDistribution[department] / this.filteredEmployees.length
    }));

    const totalSalary = Object.values(salaryByDepartment).reduce((sum, salary) => sum + salary, 0);

    this.salaryData = Object.keys(salaryByDepartment).map(department => ({
      kind: department,
      share: (salaryByDepartment[department] / totalSalary) * 100
    }));
  }

  public labelContent(e: SeriesLabelsContentArgs): string {
    return e.category;
  }

  public labelContentWithPercentage(e: SeriesLabelsContentArgs): string {
    return `${e.value.toFixed(2)}%`;
  }

  toggleFilter(column: string): void {
    if (this.filters[column] === undefined) {
      this.filters[column] = '';
    } else {
      this.filters[column] = undefined;
      if (column === 'phone') {
        this.phoneError = false;
      }
      if (column === 'email') {
        this.emailError = false;
      }
      if (column === 'salary') {
        this.salaryError = false;
      }
    }
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredEmployees = this.employees.filter(employee => {
      return Object.keys(this.filters).every(column => {
        const filterValue = this.filters[column];
        if (!filterValue) return true;
        if (this.filters['phone'] && !this.phonePattern.test(this.filters['phone'])) {
          this.phoneError = true;
        } else {
          this.phoneError = false;
        }
        if (this.filters['email'] && !this.emailPattern.test(this.filters['email'])) {
          this.emailError = true;
        } else {
          this.emailError = false;
        }
        if (this.filters['salary'] && !this.salaryPattern.test(this.filters['salary'])) {
          this.salaryError = true;
        } else {
          this.salaryError = false;
        }
        if (column === 'status') {
          if (filterValue === 'Active') {
            return employee.isActive === true;
          } else if (filterValue === 'Inactive') {
            return employee.isActive === false;
          }
          return true;
        }

        return employee[column as keyof Employee]?.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
    this.sortEmployeesByName();
    this.updatePagination();
    this.prepareChartData();
  }

  formatPhoneNumber(phone: string): string {
    let sanitizedPhone = phone.replace(/[^\d\+]/g, '');
    if (sanitizedPhone.startsWith('+')) {
      return this.formatPhone(sanitizedPhone);
    }
    if (sanitizedPhone.startsWith('0')) {
      sanitizedPhone = '+94 ' + sanitizedPhone.substring(1);
    } else {
      sanitizedPhone = '+94 ' + sanitizedPhone;
    }
    return this.formatPhone(sanitizedPhone);
  }

  private formatPhone(phone: string): string {
    const phoneWithoutPlus = phone.slice(1);
    const formattedPhone = phoneWithoutPlus.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
    return `+${formattedPhone}`;
  }
}