import * as angular from 'angular';

interface ICustomScope extends angular.IScope {
    title: string;
    verified: boolean;
    email: string;
    password: string;
    confirmPassword: string;
    verifyEmail: any;
    submitPassword: any;
    toLoginPage: any;
    enableVerify: boolean;
}

export class SignupController {
    static $inject = ['$scope', '$location', 'ToastService','AuthService', '$rootScope', '$mdDialog'];
    constructor(private $scope: ICustomScope, private $location: any, private ToastService : any, private AuthService: any, private $rootScope: any, private $mdDialog: any) {
        $scope.title = "Sign Up Page";
        $scope.verified = false;
        $scope.email = '';
        $scope.password = '';
        $scope.confirmPassword = '';
        $scope.enableVerify = false;
        
        $scope.$watch('myForm.$valid', function(newVal, oldVal) {
            if (newVal) {
                $scope.enableVerify = true;
            } else {
                $scope.enableVerify = false;

            }
        });

        $scope.verifyEmail = function () {
            AuthService.registerUser($scope.email)
                .then(function(res:any) {
                    if (res.status === 200) {
                        var confirm = $mdDialog.alert()
                          .theme(localStorage.getItem('theme'))
                          .title('Verify your Email')
                          .textContent('Please check your inbox to verify your email address')
                          .ok('OK');
                          $mdDialog.show(confirm).then(function () {
                            console.log('user acknowledged');
                          });
                    }
                })
                .catch(function(error: any) {
                    ToastService.showToast('Something went wrong')
                })   
        }

        $scope.toLoginPage = function() {
            $location.path('/login');
        }
    }

    disabledVerifyButtonClick() {
        if (!this.$scope.enableVerify) {
          this.ToastService.showToast('Please enter valid email')
        }
    }
};
