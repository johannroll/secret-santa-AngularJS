import * as angular from 'angular';

interface ICustomScope extends angular.IScope {
    title: string;
    isPasswordValid: boolean;
    passwordReset: Function;
    viewPassword: Function;
    password: string;
    passwordVisible: string;
    isPasswordVisible: boolean;
    passwordType: string;
}

export class ResetPasswordController {
    static $inject = ['$scope', 'ToastService', 'AuthService', '$location', '$rootScope'];
    constructor(private $scope: ICustomScope, private ToastService: any, private AuthService: any, private $location: any, private $rootScope: any) {
        $scope.title = "Password Page";
        $scope.isPasswordValid = false;

        $scope.$watch('myForm.$valid', function(newVal, oldVal) {
            if (newVal) {
                $scope.isPasswordValid = true;
            } else {
                $scope.isPasswordValid = false;
            }
        })

        $scope.passwordReset = function() {
            AuthService.passwordReset($scope.password)
                .then(function(res:any) {
                    ToastService.showToast('Password set please login');
                    $location.path('/login');
                    $rootScope.passwordResetToken = '';
                    $rootScope.clearSpecificQueryParam('token');
                })
                .catch(function(error: any){
                    ToastService.showToast(error.data)
                    $location.path('/login');
                    $rootScope.passwordResetToken = '';
                });
        }

        $scope.passwordType = "password";
        $scope.passwordVisible = 'visibility';
        $scope.isPasswordVisible = false;
        
        $scope.viewPassword = function() {
            $scope.isPasswordVisible = !$scope.isPasswordVisible;
        };
        
        $scope.$watch('isPasswordVisible', function(newVal, oldVal) {
            if (newVal) {
                $scope.passwordVisible = 'visibility_off'
                $scope.passwordType = "text";
            } else {
                $scope.passwordVisible = 'visibility'
                $scope.passwordType = "password"
            }
        })
    }

    disabledSubmitButtonClick() {
        if (!this.$scope.isPasswordValid) {
          this.ToastService.showToast('Please enter valid matching password')
        }

    }
};
