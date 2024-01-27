import * as angular from 'angular';
import { ClientRequest } from 'http';

interface ICustomScope extends angular.IScope {
    title: string;
    isPasswordValid: boolean;
    submitPassword: Function;
    viewPassword: Function;
    password: string;
    passwordVisible: string;
    isPasswordVisible: boolean;
    passwordType: string;
}

export class PasswordController {
    static $inject = ['$scope', 'ToastService', 'AuthService'];
    constructor(private $scope: ICustomScope, private ToastService: any, private AuthService: any) {
        $scope.title = "Password Page";

        $scope.isPasswordValid = false;
        $scope.$watch('myForm.$valid', function(newVal, oldVal) {
            if (newVal) {
                console.log('password is valid');
                $scope.isPasswordValid = true;
            } else {
                console.log('password not valid');
                $scope.isPasswordValid = false;
            }
        })

        $scope.submitPassword = function() {
            console.log('Submit password: ', $scope.password);
            AuthService.setPassword($scope.password)
                .then(function(res:any) {
                    console.log(res);
                })
                .catch(function(error: any){
                    console.log(error)
                });
        }

        $scope.passwordType = "password"
        $scope.passwordVisible = 'visibility'
        
        $scope.isPasswordVisible = false;
        
        $scope.viewPassword = function() {
            $scope.isPasswordVisible = !$scope.isPasswordVisible;
        }
        
        $scope.$watch('isPasswordVisible', function(newVal, oldVal) {
            if (newVal) {
                $scope.passwordVisible = 'visibility_off'
                $scope.passwordType = "text";
            } else {
                $scope.passwordVisible = 'visibility'
                $scope.passwordType = "password"
            }
            console.log($scope.isPasswordVisible); 
        })
    }

    disabledSubmitButtonClick() {
        if (!this.$scope.isPasswordValid) {
            console.log('disabled button clicked');
          this.ToastService.showToast('Please enter valid matching password')
        }

    }
}
