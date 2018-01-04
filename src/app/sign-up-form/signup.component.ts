import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { Customer } from "./customer";

import 'rxjs/add/operator/debounceTime';


//custom validator with parameter
function ratingRange(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
        if (c.value !== undefined && (isNaN(c.value) || c.value < min || c.value > max)) {
            return { 'range': true };
        };
        return null;
    };
}

@Component({
    selector: 'signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
    //form Model
    customerForm: FormGroup;
    //data model
    customer: Customer = new Customer();

    emailMessage: string;
    private validationMessages = {
        required: 'Please enter your email address',
        pattern: 'Please enter a valid email address'
    };

    get addresses(): FormArray {
        return <FormArray>this.customerForm.get('addresses');
    }


    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.customerForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required, Validators.maxLength(25)]],
            emailGroup: this.fb.group({
                email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                confirmEmail: ['', Validators.required]
            }),
            phone: '',
            notification: 'email',
            rating: ['', ratingRange(2, 5)],
            sendCatalog: true,
            addresses: this.fb.array([this.buildAddress()])

        });

        //set watcher . wach if control value changes alternative to event binding
        this.customerForm.get('notification').valueChanges
            .subscribe(value => this.setNotification(value));

        //generic validations with delay using debounceTime
        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges.debounceTime(1000).subscribe(value => this.setMessage(emailControl));
    }

    populateTestData(): void {
        //use pacth to update specific fields
        this.customerForm.patchValue({
            firstName: 'Jack',
            lastName: 'Harkness',
            email: 'rbcadaing@gmail.com',
            sendCatalog: false
        });
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    setNotification(notifyVia: string): void {
        const phoneControl = this.customerForm.get('phone');
        if (notifyVia === 'text') {
            // set validators
            phoneControl.setValidators(Validators.required);
        }
        else {
            //clear validators
            phoneControl.clearValidators();
        }
        //refresh validators
        phoneControl.updateValueAndValidity();
    }

    setMessage(c: AbstractControl): void {
        this.emailMessage = '';
        if ((c.touched || c.dirty) && c.errors) {
            this.emailMessage = Object.keys(c.errors).map(key => this.validationMessages[key]).join(' ');
        }
    }

    toggleSendCatalog() {
        const sendCatalog = this.customerForm.get('sendCatalog');

        this.customerForm.patchValue({
            firstName: 'Jack',
            lastName: 'Harkness',
            email: 'rbcadaing@gmail.com',
            sendCatalog: !sendCatalog.value
        });
    }

    buildAddress(): FormGroup {

        return this.fb.group({
            addressType: 'home',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: ''
        });
    }

    addAddress(): void {
        this.addresses.push(this.buildAddress());
    }

}
