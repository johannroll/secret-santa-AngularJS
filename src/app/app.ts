import * as angular from 'angular';
import 'angular-route';
import 'angular-animate';
import 'angular-aria';
import 'angular-material';
import 'angular-messages';
import 'angular-touch';

import '../assets/css/app.css';

import { HomeController } from './controllers/HomeController';
import { LoginController } from './controllers/LoginController';
import { SignupController } from './controllers/SignupController';
import { PasswordController } from './controllers/PasswordController';
import { ResetPasswordController } from './controllers/ResetPasswordController';


const app = angular.module('myApp', ['ngMaterial','ngRoute','ngAnimate','ngMessages', 'ngTouch']);

app.controller('MainCtrl', function($scope: any, $mdSidenav, $location, $log, $timeout, $mdDialog, $rootScope, $mdMenu, $document, $window, $mdMedia, AuthService, LoadingService, ToastService) {
  $scope.myInitFunction = function() {
    // Initialization code here
  
  $rootScope.VerifiedEmail = ''; 
  $rootScope.isEmailVerified = false;
  $rootScope.passwordResetToken = '';


  $scope.$watch('$location', function() {
      if($location.path() === '/signup-password') {
        var token = $location.search().token;
        if (token) {

          AuthService.verifyEmailToken(token)
            .then(function(res:any) {
              console.log('result from verify token: ', res.data.email);
              $rootScope.VerifiedEmail = res.data.email;
              console.log($rootScope.VerifiedEmail);
              $rootScope.isEmailVerified = true;
              $location.path('/signup-password');
            })
            .catch(function(error:any) {
              ToastService.showToast('Please sign up again!', error.data);
              $location.path('/signup')

            });
          
        }
      }
      if($location.path() === '/reset-password') {
        var token = $location.search().token;
        if (token) {
        var decodedToken = decodeURIComponent(token).replace(/ /g, '+');
        $rootScope.passwordResetToken = decodedToken;
        console.log("decodedToken: ", decodedToken);
    }
      }
    });

    $rootScope.clearSpecificQueryParam = function(param: any) {
      var currentParams = $location.search();
      delete currentParams[param];
      $location.search(currentParams);
    };

    if ($scope.currentTheme === 'light') {
        $document.find('body').addClass('body-light');
        $document.find('body').removeClass('body-dark');
    } else if ($scope.currentTheme === 'dark') {
        $document.find('body').addClass('body-dark');
        $document.find('body').removeClass('body-light');
    } else {
        $document.find('body').addClass('body-light');
    }
    console.log('Controller initialized');

  };
  $scope.$watch(() => $rootScope.isAuthenticated, (newValue: boolean) => {
    $scope.isAuthenticated = newValue
    if ($scope.isAuthenticated) {
      $scope.userName = localStorage.getItem('userName');
      $scope.userId = JSON.parse(localStorage.getItem('userId'));
      console.log('UserId: ', $scope.userId);
    }
  });
  var body = angular.element(document.body);
  $scope.isDialogOpen = false;  
  $scope.currentPath = $location.path();

  $scope.$watch(function() {
     return $location.path();
  }, function(newPath: string) {
    $scope.currentPath = newPath;
  });
    
  $scope.currentTheme = JSON.parse(localStorage.getItem('theme')) === null ? 'light' :JSON.parse(localStorage.getItem('theme')); 
  $scope.toggleTheme = function() {
    console.log('theme switched')
    $scope.currentTheme = $scope.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', JSON.stringify($scope.currentTheme));

    if ($scope.currentTheme === 'light') {
        $document.find('body').addClass('body-light');
        $document.find('body').removeClass('body-dark');
    } else if ($scope.currentTheme === 'dark') {
        $document.find('body').addClass('body-dark');
        $document.find('body').removeClass('body-light');
    } else {
        $document.find('body').addClass('body-light');
    }
    $rootScope.$emit('currentTheme', $scope.currentTheme);
  };

  $scope.isMenuOpen = false;

  $scope.toggleMenu = function($mdMenu: any, ev: any) {
    if ($scope.isMenuOpen) {
      $mdMenu.close();
    } else {
      $mdMenu.open(ev);
    }
    $scope.isMenuOpen = !$scope.isMenuOpen;
  };

  $scope.$on('$mdMenuOpen', function() {
    $scope.isMenuOpen = true;
    console.log($scope.isMenuOpen);
  });

  $scope.$on('$mdMenuClose', function() {
    $scope.isMenuOpen = false;
    console.log($scope.isMenuOpen);
  });

  $scope.DialogController = async function($scope: any, AuthService: any, ToastService: any) {
      $scope.user = {
        userName: localStorage.getItem('userName'),
        userId: localStorage.getItem('userId')
      }

      $scope.closeDialog = function() {
        $mdDialog.hide();
      }
      $scope.currentTheme = localStorage.getItem('theme');

      $scope.removeAccount = function() {
        console.log('user account to delete: ,', localStorage.getItem('userId'));
        var confirm = $mdDialog.confirm()
        .theme(localStorage.getItem('theme'))
        .title('Delete Account?')
        .textContent('This will completely remove your account and any saved data, are you sure?')
        .ariaLabel('Lucky day')
        .ok('Delete')
        .cancel('Cancel');
  
      $mdDialog.show(confirm).then(function () {
        AuthService.deleteUser()
          .then(function(res:any) {
              ToastService.showToast("Account Removed")
          })
          .catch(function(error:any) {
            ToastService.showToast('Account not removed')
          });
      }, function () {
        $scope.status = 'Delete account canceled.';
      });
      }
  };

  $scope.openAccount = function(ev : any) {
    console.log('open account settings');
    $mdDialog.show({
      
      template: 
        `
        <md-dialog aria-label="Account Settings" md-theme="{{currentTheme}}">
          <form ng-cloak>
            <md-dialog-content>
              <div class="md-dialog-content">
                <h2>Account Settings</h2>
                <p> {{ user.userName }} </p> 
              </div>
            </md-dialog-content>
            <md-dialog-actions layout="row">
              <md-button ng-click="removeAccount()">Delete</md-button>
              <md-button ng-click="closeDialog()">
                Ok
              </md-button>
            </md-dialog-actions>
          </form>
        </md-dialog>
        `,
      clickOutsideToClose: true,
      targetEvent: ev,
      controller: this.DialogController,
      locals: {
          user: $scope.user,
      }
      
    });
  }

  $scope.logout = function() {
    console.log('logout clicked');
    AuthService.logout();
  };
});

// Configure routes
app.config(['$routeProvider', ($routeProvider: angular.route.IRouteProvider) => {
    $routeProvider
        .when('/', {
            template: require('./views/home.html'),
            controller: HomeController,
            controllerAs: 'vm',
            resolve: {
                auth: ['AuthService', '$location', function (AuthService : any, $location: any) {
                        if (!AuthService.isLoggedIn()) {
                            $location.path('/login');
                        }
                }]
            }
        })
        .when('/login', {
            template: require('./views/login.html'),
            controller: LoginController,
            controllerAs: 'vm',
            resolve: {
              auth: ['AuthService', '$location', function (AuthService : any, $location: any) {
                      if (AuthService.isLoggedIn()) {
                          $location.path('/');
                      }
              }]
          }
        })
        .when('/signup', {
            template: require('./views/signup.html'),
            controller: SignupController,
            controllerAs: 'vm'
        })
        .when('/signup-password', {
            template: require('./views/signup-password.html'),
            controller: PasswordController,
            controllerAs: 'vm',
            resolve: {
              auth: ['AuthService', '$location', function (AuthService : any, $location: any) {
                      if (!AuthService.isEmailVerified() && !AuthService.isLoggedIn()) {
                          $location.path('/login');
                      }
                      if (!AuthService.isEmailVerified() && AuthService.isLoggedIn()) {
                        $location.path('/');
                      }
              }]
          }
        })
        .when('/reset-password', {
            template: require('./views/reset-password.html'),
            controller: ResetPasswordController,
            controllerAs: 'vm',
            resolve: {
              auth: ['AuthService', '$location', function (AuthService : any, $location: any) {
                      if (!AuthService.isResetToken()) {
                          $location.path('/login');
                      }
              }]
          }
        })
        .otherwise({ redirectTo: '/' });

}]);

//Configure themes
app.config(['$mdThemingProvider', function($mdThemingProvider: angular.material.IThemingProvider) {
    // Define the light theme
    $mdThemingProvider.theme('light')
        .primaryPalette('pink')
       
        .accentPalette('pink');
        
        

    // Define the dark theme
    $mdThemingProvider.theme('dark')
        .primaryPalette('pink')
       
        .accentPalette('pink')
        .dark();
    
}]);

app.service('LoadingService', function($rootScope: any) {
  var service = {
      isLoading: false,
      show: function() {
          this.isLoading = true;
          $rootScope.$broadcast('loading:show');
      },
      hide: function() {
          this.isLoading = false;
          $rootScope.$broadcast('loading:hide');
      }
  };
  return service;
});

app.service('ToastService', function($rootScope: any, $mdToast: any) {
  var toastService: any = {}
  toastService.showToast = function(message: string) {
    $mdToast.show(
      $mdToast.simple()
      .textContent(message)
      .toastClass('my-toast')
      .hideDelay(2500))
      
  }
  return toastService;
}); 

app.service('Session', function () {
  this.create = function (sessionId: string, userId: number, userEmail: string) {
    this.id = sessionId;
    this.userId = userId;
    this.userName = userEmail;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
  };
})

app.factory('AuthService', function ($http: angular.IHttpService, Session: any, $q: any, $rootScope: any, $location: any, $window: any, ToastService: any) {
  var authService: any = {};
 
  authService.isLoggedIn = function() {
    if ($window.localStorage.getItem('userToken')) {
      return true
    }
    return false;
  }

  authService.isResetToken = function() {
    if ($rootScope.passwordResetToken !== '') {
      return true
    }
    return false;
  }

  authService.isEmailVerified = function() {
    if ($rootScope.isEmailVerified) {
      return true
    }
    return false;
  }

  authService.registerUser = function(email: string) {
    return $http
      .post('https://secretsantaapi.azurewebsites.net/api/Auth/register', {userEmail: email})
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        return $q.reject(error);
      })
  }

  authService.verifyEmailToken = function (token: string) {
    console.log("Token to verify: ", token);
    return $http.get('https://secretsantaapi.azurewebsites.net/api/Auth/Verify-email?token=' + token)
    .then(function(response) {
        if (response.status === 200) {
            $rootScope.isEmailVerified = true;
            console.log("Email varified");
            return response;
        }
    })
    .catch(function(error) {
      $rootScope.isEmailVerified = false;
      console.error('Error response', error);
      return $q.reject(error);
    });
  }

  authService.setPassword = function(password: string) {
    return $http
      .post('https://secretsantaapi.azurewebsites.net/api/Auth/set-password', { 
        userEmail: $rootScope.VerifiedEmail,
        password: password 
      })
      .then(function(res: any) {
        console.log('user sccount created');
        ToastService.showToast('Account created successfully please login');
        $location.path('/login');
        $rootScope.isEmailVerified = false;
        $rootScope.clearSpecificQueryParam('token');
        if (res.status === 200) {
          console.log(res.status);
          return res;
        }
      })
      .catch(function(error: any) {
        console.log(error);
        $rootScope.isEmailVerified = false;
        ToastService.showToast('This email address is not availalble');
        return $q.reject(error);
      }) 
  }

  authService.requestPasswordReset = function(email: string) {
      return $http
        .post('https://secretsantaapi.azurewebsites.net/api/Auth/request-password-reset', {email: email})
        .then(function(response) {
          return response

        })
        .catch(function(error) {
          return $q.reject(error);
        })
  }

  authService.passwordReset = function(password: string) {
      return $http
        .post('https://secretsantaapi.azurewebsites.net/api/Auth/reset-password', {password: password, token: $rootScope.passwordResetToken})
        .then(function(response) {
          return response
        })
        .catch(function(error) {
          return $q.reject(error);
        })
  }

  authService.login = function (credentials: any) {
    return $http
      .post('https://secretsantaapi.azurewebsites.net/api/Auth/login', credentials)
      .then(function (res: any) {
        if (res.data.token !== '')
        {
          console.log(res.data)
          localStorage.setItem('userToken', res.data.token);
          localStorage.setItem('userId', res.data.userId);
          localStorage.setItem('userName', res.data.userEmail);
          $rootScope.isAuthenticated = true;
          $location.path('/');
         
        }
          Session.create(res.data.token, res.data.userId, res.data.userEmail);
          return res;
        })
      .catch(function (error: any) {
        console.error('Error during login', error);
        return $q.reject(error);
      });
  };
  authService.getLists =  function (userId: number) {
    return $http
      .get('https://secretsantaapi.azurewebsites.net/api/GiftList/get-user-lists/' + userId)
      .then(function (res) {
          console.log(res.data)
        return res.data;
      })
      .catch(function (error) {
        console.error('Error getting request', error);
       
        return $q.reject(error);
      });
  };

  authService.getList =  function (listId: number) {
    return $http
      .get('https://secretsantaapi.azurewebsites.net/api/Person/' + listId + '/people-on-list')
      .then(function (res) {
          console.log(res.data)
        return res.data;
      })
      .catch(function (error) {
        console.error('Error getting request', error);
      
        return $q.reject(error);
      });
  };

  authService.saveList = async function(listName: string, list : any) {
    var sortedList = [];
    for (var j = 0; j < list.length; j++) {
      sortedList.push({name: list[j].giver.name, email: list[j].giver.email, isBuyer: true, giverGiftee: list[j].giftee.name})
    }
    console.log('sortedList', sortedList);
    try {
        var response = await this.createList(listName)
        $rootScope.matchedListId = response;
      }
      catch (error:any) {
        return $q.reject(error);
      }
    var peopleCreated : any = [];
    for (var i = 0; i < sortedList.length; i++) {
      $http
        .post('https://secretsantaapi.azurewebsites.net/api/Person/create/' + response.listId, { 
          name: sortedList[i].name,
          email: sortedList[i].email,
          isBuyer: sortedList[i].isBuyer,
          giverGiftee: sortedList[i].giverGiftee 
        })
        .then(function(res) {
          console.log(res)
          peopleCreated.push(res.data);
        })
        .catch(function (error) {
          return $q.reject(error);
        });
    }
    
    return peopleCreated;
    
  }
  authService.saveListAndEmail = async function(listName: string, list : any) {
    var sortedList = [];
    for (var j = 0; j < list.length; j++) {
      sortedList.push({name: list[j].giver.name, email: list[j].giver.email, isBuyer: true, giverGiftee: list[j].giftee.name})
    }
    console.log('sortedList', sortedList);
    try {
        var response = await this.createList(listName)
        $rootScope.matchedListId = response;
      }
      catch (error:any) {
        return $q.reject(error);
      }
    var peopleCreated : any = [];
    for (var i = 0; i < sortedList.length; i++) {
      $http
        .post('https://secretsantaapi.azurewebsites.net/api/Person/create/' + response.listId, { 
          name: sortedList[i].name,
          email: sortedList[i].email,
          isBuyer: sortedList[i].isBuyer,
          giverGiftee: sortedList[i].giverGiftee 
        })
        .then(function(res) {
          console.log(res)
          peopleCreated.push(res.data);
        })
        .catch(function (error) {
          return $q.reject(error);
        });
    }

    $http
        .post('https://secretsantaapi.azurewebsites.net/api/Person/send-secret-santas/' + response.listId, {})
        .then(function(response) {
          console.log(response);
        })
        .catch(function(error) {
          return $q.reject(error);
        });
    
    return sortedList;
    
  }

  authService.createList = function(listName: string) {
    var userId = JSON.parse(localStorage.getItem('userId'));
    return $http
      .post('https://secretsantaapi.azurewebsites.net/api/GiftList/createlist/' + userId, { title: listName })
      .then(function(res) {
        console.log(res)
        return res.data;
      })
      .catch(function (error) {
        return $q.reject(error);
      });
  }

  authService.updateListName = function(listId: number, updatedListName: string) {
    return $http
      .post('https://secretsantaapi.azurewebsites.net/api/GiftList/updatelist/' + listId, { 
        listId: 0,
        title: updatedListName,
        userId: 0
       })
      .then(function(res) {
        console.log(res)
        return res.data;
      })
      .catch(function (error) {
        return $q.reject(error);
      });
  }

  authService.updatePerson = function(person: any) {
    return $http
      .post('https://secretsantaapi.azurewebsites.net/api/Person/update/' + person.personId, { 
        personId: 0,
        name: person.name,
        email: person.email 
      })
      .then(function(res) {
        console.log(res)
        return res.data;
      })
      .catch(function (error) {
        return $q.reject(error);
      });
  }

  authService.sendList = function(listId: number) {
      return $http
        .post('https://secretsantaapi.azurewebsites.net/api/Person/send-secret-santas/' + listId, {})
        .then(function(response) {
          return response
        })
        .catch(function(error) {
          return $q.reject(error);
        });
  }
 
  authService.isAuthenticated = function () {
    return !!Session.userId;
  };

  authService.deleteList = async function(listId: number) {
    return $http
      .delete('https://secretsantaapi.azurewebsites.net/api/GiftList/deletelist/' + listId)
      .then(function(res) {
        return res;
      })
      .catch( function(error) {
        return $q.reject(error);
      })
  }

  authService.logout = function() {
    // Clear local storage or session storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('currentList');
    localStorage.removeItem('peopleOnList');
    localStorage.removeItem('newList');
    localStorage.removeItem('currentNavItem');
    // Reset any authenticated states
    $rootScope.isAuthenticated = false;
    $location.path('/login');
  };

  authService.deleteUser = function() {
    var userId = JSON.parse(localStorage.getItem('userId'));
    return $http
      .delete('https://secretsantaapi.azurewebsites.net/api/User/delete/' + userId)
      .then(function(res: any){
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('currentList');
        localStorage.removeItem('peopleOnList');
        localStorage.removeItem('newList');
        localStorage.removeItem('currentNavItem');
        $rootScope.isAuthenticated = false;
        $location.path('/login');
        return res.data.status
      })
      .catch(function(error:any) {
        return $q.reject(error);
      })
  }

  return authService;


})

app.factory('AuthInterceptor', function($rootScope: any, $q: any, $window: any, $injector: any, $location: any) {
  var token = localStorage.getItem('userToken');
  return {
    request: function (config: any) {
      config.headers = config.headers || {};
      if ($window.localStorage.getItem('userToken')) {
        config.headers.Authorization = 'Bearer ' + $window.localStorage.getItem('userToken');
      }
      return config;
    },
      responseError: function(response: any) {
          console.log("repsonseError: ", response.data);
          if (response.status === 401 && token !== null) {
              // Token has expired
              // Handle token expiration, e.g., redirect to login
              var $mdDialog = $injector.get('$mdDialog');
              var confirm = $mdDialog.alert()
                .theme(localStorage.getItem('theme'))
                .title('Session Expired')
                .textContent('Your session has expired. Please log in again.')
                .ok('OK');

              $mdDialog.show(confirm).then(function () {
                $rootScope.isAuthenticated = false;
                localStorage.removeItem('userToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('currentList');
                localStorage.removeItem('peopleOnList');
                localStorage.removeItem('newList');
                localStorage.removeItem('currentNavItem');
                $location.path('/login');
              });
              // Redirect to login or other appropriate action
             
              
          }
          return $q.reject(response);
      }
  };
})

app.config(function($httpProvider: any) {
  $httpProvider.interceptors.push('AuthInterceptor');
});



app.factory('httpInterceptor', function($q: any, LoadingService: any) {
  return {
    request: function(config: any) {
          LoadingService.show();
      return config;
    },
    response: function(response: any) {
          LoadingService.hide();
      return response;
    },
    responseError: function(response: any) {
          LoadingService.hide();
      return $q.reject(response);
    }
  };
});

app.config(function($httpProvider: any) {
  $httpProvider.interceptors.push('httpInterceptor');
});


app.run(function($rootScope: any, $location: any, AuthService: any, $http:angular.IHttpService) {
  $rootScope.$on('$routeChangeStart', function(event: any, next: any, current: any) {
    angular.element(document.querySelector('#animate-view')).addClass('slide');
    var token = localStorage.getItem('userToken');
      if (token) {
          // User is logged in
          $rootScope.isAuthenticated = true;
          // Optionally, set token for $http requests
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
      } else {
          $rootScope.isAuthenticated = false;
      }

    if (next.protected && !AuthService.isLoggedIn()) {
          // Prevent navigating to the route
          event.preventDefault();
          $location.path('/login');
      }
    console.log('User logged in: ', AuthService.isLoggedIn());
  });
  $rootScope.$on('$routeChangeSuccess', function() {
    setTimeout(function() {
      angular.element(document.querySelector('#animate-view')).removeClass('slide');
    }, 3000);
  });
  $rootScope.$on('loading:show', function() {
    $rootScope.showLoader = true;
  });

  $rootScope.$on('loading:hide', function() {
    $rootScope.showLoader = false;
  });


});

app.directive('passwordMatch', [function() {
  return {
      require: 'ngModel',
      scope: {
          otherModelValue: '=passwordMatch'
      },
      link: function(scope: any, element, attributes, ngModel) {
          
          ngModel.$validators.passwordMatch = function(modelValue: any) {
              return modelValue === scope.otherModelValue;
          };

          scope.$watch('otherModelValue', function() {
              ngModel.$validate();
          });
      }
  };
}]);

app.directive('ngEnter', [function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) { // 13 is the Enter key's code
        scope.$apply(function (){
            scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
}]);










