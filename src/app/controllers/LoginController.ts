import * as angular from 'angular';


interface ICustomScope extends angular.IScope {
    title: string;
    login: any;
    email: string;
    password: string;
    rememberUser: boolean;
    data: any;
    toSignupPage: any;
    auth: any;
    isLoginValid: boolean;
    passwordVisible: string;
    isPasswordVisible: boolean;
    passwordType: string;
    viewPassword: Function;
    forgotPassword: Function;
    DialogController: any

        
}


export class LoginController {
    static $inject = ['$scope','$location', 'AuthService', 'ToastService', '$mdDialog'];
    constructor(private $scope: ICustomScope,private $location: any,private AuthService: any, private ToastService: any, $mdDialog: any) {
        $scope.title = "Login Page";
        $scope.email = '';
        $scope.password = '';
        $scope.rememberUser = false;
       
        $scope.isLoginValid = true;
        
        $scope.$watch('myPassForm.$valid', function(newVal, oldVal) {
            console.log('Form validity changed. New validity:', newVal );
            if (newVal) {
                $scope.isLoginValid = true;
            } else {
                $scope.isLoginValid = false;
            }

        });

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

        $scope.login = (() => {
            
           
            var credentials = {
            userEmail: $scope.email.trim().toLocaleLowerCase(),
            password: $scope.password.trim()
            };
            var res: any;
            console.log(credentials);
            this.AuthService.login(credentials).then((user: any) => {
            res = user;
            console.log("user return: ", res.data);
            if (res.status === 200) {
                $scope.email = '';
                $scope.password = '';    
            } 
        
            })
            .catch((error: any) => {
                console.log(error);
                if (error.status === 500) {
                    this.ToastService.showToast("Something went wrong please try again");
                    return;

                }
                this.ToastService.showToast("Invalid username or password")
            // this.isLoading = false;
            // this.showToast()
            });            
        });

        $scope.toSignupPage = function () {
            $location.path('/signup')
        }

        $scope.DialogController = async function($scope: any, AuthService: any, ToastService: any) {
            $scope.email = '';

            $scope.closeDialog = function() {
                $mdDialog.hide();
              }
              $scope.currentTheme = localStorage.getItem('theme');
        

            $scope.$watch('myForm.$valid', function(newVal:any, oldVal: any) {
                console.log('reset password email: ', newVal);
                if (newVal) {
                    $scope.isEmailValid = true;
                } else {
                    $scope.isEmailValid = false;
                }
            })

            $scope.verifyReset = function() {
                console.log('account to reset: ', $scope.email);
                $mdDialog.hide();
                AuthService.requestPasswordReset($scope.email)
                 .then(function(res: any) {
                     var confirm = $mdDialog.alert()
                     .theme(localStorage.getItem('theme'))
                     .title('Password reset')
                     .textContent('Please check your inbox and click the link to reset your password')
                     .ok('OK');
                     $mdDialog.show(confirm).then(function () {
                       console.log('user acknowledged');
                     });
                 })
                 .catch(function(error: any) {
                    console.log(error);
                 });
            }
        }

        $scope.forgotPassword = function (ev: any) {
            console.log('forgot password');
            $mdDialog.show({
            
            template: 
                `
                <md-dialog aria-label="Account Settings" md-theme="{{currentTheme}}">
            
                    <md-dialog-content>
                        <div class="md-dialog-content">
                            <h2>Reset Password</h2>
                            <p>Please enter your account email.</p>
                            <br>
                            <form name="myForm"  autocomplete="off">
                                <md-input-container class="md-block md-primary" flex-gt-sm>
                                    <label>Email</label>
                                    <input type="email" auto-focus required ng-model="email" name="resetEmail" ng-pattern="/^.+@.+\..+$/">
                                    <div ng-messages="myForm.resetEmail.$error">
                                    <div ng-message="required">Email is required.</div>
                                    <div ng-message="email">Valid email required.</div>
                                </md-input-container>
                            </form>
                        </div>
                    </md-dialog-content>
                    <br>
                    <br>
                    <md-dialog-actions layout="row">
                        <md-button ng-disabled="!isEmailValid" ng-click="verifyReset()">Verify</md-button>
                        <md-button ng-click="closeDialog()">Cancel</md-button>
                    </md-dialog-actions>
            
                </md-dialog>
                `,
            clickOutsideToClose: true,
            targetEvent: ev,
            controller: this.DialogController,
            
            });
        }
    }

    disabledLoginButtonClick() {
        if (!this.$scope.isLoginValid) {
            console.log('disabled button clicked');
          this.ToastService.showToast('Please enter valid email and password')
        }

    }
}
