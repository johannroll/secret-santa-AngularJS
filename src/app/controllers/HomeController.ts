import * as angular from 'angular';
import { setInterval } from 'timers/promises';

function DialogController($scope : any, $mdDialog : any, dataArray: any, title: any, AuthService: any, ToastService: any, $rootScope: any,$timeout: any) {
    $scope.dataArray = dataArray;
    $scope.title = title;
    $scope.listItem = {
        index: null,
        item: {}
    }

    $scope.closeDialog = function() {
        $rootScope.$broadcast('closeDialog');
        $mdDialog.hide();
    };

    $scope.enableUpdatePerson = false;

    $scope.$watch('myForm.$valid', function(newVal: any, oldVal: any) {
        console.log('Form validity changed. New validity:', newVal );
        if (newVal) {
            $scope.enableUpdatePerson = true;
        } else {
            $scope.enableUpdatePerson = false;

        }

    });

    $scope.updatePeopleArray = function() {
        console.log('updated person: ', dataArray);
        var people = JSON.parse(localStorage.getItem('peopleOnList'));
        var remainingPeople = people.filter((item:any, index: number) => index !== dataArray.personToEdit.index);
        console.log('people spliced: ', remainingPeople);
        console.log('Updated values: ,', dataArray.personUpdated);
        for (var i = 0; i < remainingPeople.length; i++) {
            if (remainingPeople[i].name === dataArray.personUpdated.name) {
                ToastService.showToast('Duplicate entry, name already on list');
                return;
            } else if (remainingPeople[i].email === dataArray.personUpdated.email) {
                ToastService.showToast('Duplicate entry, email already on list');
                return;
            }
        }
        console.log(people);
        people[dataArray.personToEdit.index] = dataArray.personUpdated
        localStorage.setItem('peopleOnList', JSON.stringify(people));
        $rootScope.$broadcast('peopleOnListUpdated');
        console.log(people);
        $mdDialog.hide();
    };

    $scope.downloadSecretSantaList = function() {
    
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
  
      // Title
      doc.text('Secret Santa List', 10, 10);
  
      // Add each pair to the PDF
      doc.setFontSize(12);
      console.log('from saved lists downlaod: ', dataArray);
      dataArray.forEach((pair: any, index : any) => {
        doc.text(`${pair.giver.name} gives a gift to ${pair.giftee.name}`, 10, 20 + (10 * index));
      });
  
      // Save the PDF
      doc.save('secret-santa-list.pdf');
    };

    $scope.downloadOldSecretSantaList = function() {
    
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
  
      // Title
      doc.text('Secret Santa List', 10, 10);
  
      // Add each pair to the PDF
      doc.setFontSize(12);
      console.log('from saved lists downlaod: ', dataArray);
      dataArray.forEach((pair: any, index : any) => {
        doc.text(`${pair.name} gives a gift to ${pair.giverGiftee}`, 10, 20 + (10 * index));
      });
  
      // Save the PDF
      doc.save('secret-santa-list.pdf');
    };
  
    $scope.showConfirmAndDownload = function() {
      var confirm = $mdDialog.confirm()
        .theme(localStorage.getItem('theme'))
        .title('Would you like to download your list?')
        .textContent('This will download the file to your device.')
        .ariaLabel('Lucky day')
        .ok('Download')
        .cancel('Cancel');
  
      $mdDialog.show(confirm).then(function () {
        $scope.downloadSecretSantaList();
        $scope.saveList()
        .then((res:any) => {
            console.log('list saved');
        })
        .catch((error:any) => {
            ToastService.showToast('Something went wrong');
        });
      }, function () {
        $scope.status = 'Download canceled.';
      });
    };

    $scope.showConfirmAndDownloadOldList = function() {
      var confirm = $mdDialog.confirm()
        .theme(localStorage.getItem('theme'))
        .title('Would you like to download your list?')
        .textContent('This will download the file to your device.')
        .ariaLabel('Lucky day')
        .ok('Download')
        .cancel('Cancel');
  
      $mdDialog.show(confirm).then(function () {
        $scope.downloadOldSecretSantaList()
      }, function () {
        $scope.status = 'Download canceled.';
      });
    };

    $scope.showConfirmAndDeleteList = function() {
      var confirm = $mdDialog.confirm()
        .theme(localStorage.getItem('theme'))
        .title('Delete list')
        .textContent('Are you sure you want to delete list?')
        .ariaLabel('Lucky day')
        .ok('Delete List')
        .cancel('Cancel');
  
      $mdDialog.show(confirm).then(function () {
        $scope.deleteList()
      }, function () {
        $scope.status = 'Delete canceled.';
      });
    };

    $scope.saveList = function() {
        console.log('list saved:',this.title, this.dataArray);
        AuthService.saveList(this.title, this.dataArray).
        then(function (res: any) {
            localStorage.removeItem('currentList');
            localStorage.removeItem('peopleOnList');
            $rootScope.$broadcast('listSaved');
            $mdDialog.hide();
            setTimeout(function() {
                ToastService.showToast('List Saved');
            },200)

        })
        .catch(function (error:any) {
            console.log(error);
            if (error.status !== 401) {
                ToastService.showToast('List already exists');
            }
        
        });



    };

    $scope.deleteList = function() {
        AuthService.deleteList(title.listId)
        .then(function(res:any) {
            console.log('List Deleted');
            $mdDialog.hide();
            if (res.status === 200) {
                ToastService.showToast('List Deleted')
            }
            $rootScope.$broadcast('listDeleted');
        })
        .catch(function(error:any){
            if (error.status !== 401) {
                ToastService.showToast('Something went wrong: ', error.statusText)
            }
        });
    };

    $scope.shareUnsavedList = function() {
        console.log('dataArray after edi: ' ,this.dataArray);
        AuthService.saveListAndEmail(this.title, this.dataArray).
        then(function (res: any) {
            $mdDialog.hide();
            $rootScope.$broadcast('sharedUnsavedList')
            var confirm = $mdDialog.alert()
            .theme(localStorage.getItem('theme'))
            .title('List Shared')
            .textContent('Your list has been shared!')
            .ariaLabel('Lucky day')
            .ok('Ok')
            
  
            $mdDialog.show(confirm).then(function () {
                $mdDialog.hide();
            })

        })
        .catch(function (error:any) {
            console.log(error);
            if (error.status !== 401 || error.status !== 422) {
                ToastService.showToast('Something went wrong please try again');
            }
            if (error.status == 422) {
                ToastService.showToast('List already exists');
            }

        
        });                    
        
                                    
         
       
       
    };

    $scope.shareList = function() {
        console.log('list to send:', this.title);
        $mdDialog.hide();
        AuthService.sendList(this.title.listId)
        .then(function(res: any) {
            console.log(res);
            var confirm = $mdDialog.alert()
            .theme(localStorage.getItem('theme'))
            .title('List Shared')
            .textContent('Your list has been shared!')
            .ariaLabel('Lucky day')
            .ok('Ok')
            
  
            $mdDialog.show(confirm).then(function () {
                $mdDialog.hide();
            })
        })
    }

    $scope.updatePerson = function(person: any, ev: Event) {
        console.log('person updated: ', person);
    }

    $scope.editListItem = function($event: Event, $index: any, item: any) {
        $scope.listItem = {
            index: $index,
            item: item
        }
        $scope.shouldCloseDialog = false;
        console.log('LISTITEM FROM DIALOG1: ', $scope.listItem);
        $rootScope.$broadcast('editListItem', {message: $scope.listItem});
    };

    $scope.enableEditing = function(index: number) {
        $scope.dataArray[index].editing = true;
        $scope.backup = angular.copy($scope.dataArray[index]);
        $scope.santaEdit = angular.copy($scope.dataArray[index]);
        $scope.fullBackup = angular.copy($scope.dataArray);
        $scope.peopleBackup = angular.copy($rootScope.people); // backup to revert changes if canceled
    };

    $scope.isDuplicate = function(editedItem: any, index: number) {
        return $scope.dataArray.some((item: any, idx: any) => {
            return idx !== index && angular.equals(item, editedItem);
        });
    };
    
    $scope.saveEdit = function(index: number) {
        var editedItem =  $scope.dataArray[index];
        if ($scope.isDuplicate(editedItem, index)) {
            alert("Duplicate item detected. Please make different changes.");
            // Optionally, revert to the backup
            $scope.cancelEdit(index);
            return;
        }

        var peopleOnList = JSON.parse(localStorage.getItem('peopleOnList'));
        console.log('before', peopleOnList);
        var  { giftee } = $scope.backup;
        var  { giver } = $scope.backup;
        var gifteeIndex = peopleOnList.findIndex((x:any) => x.name === giftee.name); 
        var giverIndex = peopleOnList.findIndex((x:any) => x.name === giver.name); 
        peopleOnList[gifteeIndex] = editedItem.giftee;
        peopleOnList[giverIndex] = editedItem.giver;
        localStorage.setItem('peopleOnList', JSON.stringify(peopleOnList));
        
        $rootScope.people = JSON.parse(localStorage.getItem('peopleOnList'));
        for (var i = 0; i < $rootScope.santas.length; i++) {
            if ($rootScope.santas[i].giftee.name === giftee.name) {
                $rootScope.santas[i].giftee.name === editedItem.giftee.name;
                $rootScope.santas[i].giftee.email === editedItem.giftee.email;
            }
            if ($rootScope.santas[i].giver.name === giver.name ) {
                $rootScope.santas[i].giver.name === editedItem.giver.name;
                $rootScope.santas[i].giver.email === editedItem.giver.email;
            }
        }
        $scope.dataArray[index].editing = false;
       
    };
    
    $scope.cancelEdit = function(index: number) {
        $scope.dataArray[index] = $scope.backup;
        $rootScope.people = $scope.peopleBackup;
        $scope.dataArray[index].editing = false;
        $scope.dataArray = $scope.fullBackup;
    };

    $scope.editMatchedListName = false;
    $scope.titleCopy = '';
    
    $scope.editMatchedTitle = function() {
        $scope.titleCopy = $scope.title;
        console.log('Matched listName old: ', $scope.titleCopy);
        $scope.editMatchedListName = true;
    };

    $scope.saveEditListName = function() {
        localStorage.setItem('currentList', JSON.stringify($scope.title));
        $scope.editMatchedListName = false;
    }

    $scope.cancelEditListName = function() {
        $scope.title = $scope.titleCopy;
        $scope.editMatchedListName = false;

    }
    
}

interface ICustomScope extends angular.IScope {
    title: string;
    dateChristmasEve: Date;
    dateCurrent: Date;
    daysToChristmas: number;
    addListName: Function;
    addPeople: Function;
    loadLists: Function;
    listName: string;
    personName: string;
    personEmail: string;
    enableAdd: boolean;
    people: Array<any>;
    listForm: any;
    santas: Array<any>;
    isLoading: boolean;
    lists: Array<any>;
    list: any;
    currentNavItem: string;
    gotoTab: Function;
    isNewList : boolean;
    myForm: any;
    getLists: Function;
    listItem: {};
    
}

export class HomeController {
    static $inject = ['$scope', '$mdDialog', '$mdToast', 'ToastService','AuthService', '$timeout', '$q', '$anchorScroll','$location', '$rootScope'];

    private listName = '';
    private personName = '';
    private personEmail = '';
    private people = <any[]> [];
    public santas: any = [];


    constructor(private $scope: ICustomScope, private $mdDialog: any, private $mdToast: any, private ToastService: any, private AuthService: any, private $timeout: any, private $q: any, $anchorScroll: any, $location: any, private $rootScope: any) {
        $scope.myForm = null;
        $scope.title = '';
        $scope.dateChristmasEve = new Date();
        $scope.dateChristmasEve.setMonth(11);
        $scope.dateChristmasEve.setDate(24);
        $scope.dateCurrent = new Date();
        $scope.dateCurrent.getMonth();
        $scope.daysToChristmas = 
        ($scope.dateChristmasEve.valueOf() - $scope.dateCurrent.valueOf()) / (1000 * 60 * 60 * 24) < 0 
        && $scope.dateChristmasEve.getFullYear() === $scope.dateCurrent.getFullYear() 
        ? Math.round(($scope.dateChristmasEve.setFullYear($scope.dateCurrent.getFullYear() + 1).valueOf() - $scope.dateCurrent.valueOf()) / (1000 * 60 * 60 * 24))
        : Math.round(($scope.dateChristmasEve.valueOf() - $scope.dateCurrent.valueOf()) / (1000 * 60 * 60 * 24));
        
        $scope.currentNavItem = localStorage.getItem('currentNavItem') === null ? 'newList' : localStorage.getItem('currentNavItem');
        $scope.isNewList = JSON.parse(localStorage.getItem('newList')) === null ? null : JSON.parse(localStorage.getItem('newList'));
        
        $scope.$watch('isNewList', function(newVal, oldVal) {
            console.log('isnewlist', newVal);
            if (!newVal) {
                $scope.loadLists();
            }
        })

        $scope.list = null;
        $scope.lists = null;

        $scope.gotoTab = function(tab: string) {
            localStorage.setItem('currentNavItem', tab);
            $scope.currentNavItem = localStorage.getItem('currentNavItem')
           if ($scope.currentNavItem === 'newList') {
                localStorage.setItem('newList', JSON.stringify(true));
                $scope.isNewList = JSON.parse(localStorage.getItem('newList'));
           } else {
            localStorage.setItem('newList', JSON.stringify(false));
            $scope.isNewList = JSON.parse(localStorage.getItem('newList'));
            // $scope.loadLists()
           }
           console.log($scope.currentNavItem);
           console.log($scope.isNewList);
        };
        

        $scope.$watch('list', function(newVal) {
            if (newVal !== null) {
                console.log('get people on list with listId: ', $scope.list.listId);
            }
        })

        $scope.listForm = {
            listName: JSON.parse(localStorage.getItem('currentList')) === null
            ? '' : JSON.parse(localStorage.getItem('currentList')),
            personName: '',
            personEmail: ''
        }
       
        $rootScope.people = JSON.parse(localStorage.getItem('peopleOnList')) == null
            ? [] : JSON.parse(localStorage.getItem('peopleOnList'));

        $scope.enableAdd = false;
        
        $scope.$watch('myForm.$valid', function(newVal, oldVal) {
            console.log('Form validity changed. New validity:', newVal );
            if (newVal) {
                $scope.enableAdd = true;
            } else {
                $scope.enableAdd = false;

            }

        });

        $scope.$watch('myForm.list.$viewValue', function(newVal, oldVal) {
            console.log(newVal);
            setTimeout(() => {
                localStorage.setItem('currentList', JSON.stringify(newVal));
            }, 1500)
        })

        $scope.$on('listDeleted', function() {
            $scope.loadLists();
        });

        $scope.$on('listSaved', function() {
            localStorage.removeItem('currentList');
            localStorage.removeItem('peopleOnList');
            $rootScope.people = null;
            $scope.listForm = {
                listName: '',
                personName: '',
                personEmail: ''
            }
            $scope.myForm.$setPristine();
            $scope.myForm.$setUntouched();
        });

        $scope.$on('peopleOnListUpdated', () => {
            $rootScope.people = JSON.parse(localStorage.getItem('peopleOnList'))
        })

        $scope.$on('sharedUnsavedList', function() {
            localStorage.removeItem('currentList');
            localStorage.removeItem('peopleOnList');
            $scope.listForm = {
                listName: '',
                personName: '',
                personEmail: ''
    
            }
            $rootScope.people = [];
            $scope.myForm.$setPristine();
            $scope.myForm.$setUntouched();
        })
    
        $scope.loadLists = async function() {
            
            var userId = JSON.parse(localStorage.getItem('userId'))
            var response = await AuthService.getLists(userId).then((res:any) =>{
                $scope.lists = res
                
            })
            .catch((error:any) => {
                console.log(error);
                if (error.status === 404) {
                    $scope.lists = null;
                    ToastService.showToast(error.data)
                }
            })
            return response;
        }
    }


    addPeople() {
        localStorage.setItem('currentList', JSON.stringify(this.$scope.listForm.listName));
        var person = {
            name: this.$scope.listForm.personName,
            email: this.$scope.listForm.personEmail.trim().toLocaleLowerCase()
        }
        for (let i = 0; i < this.$rootScope.people.length; i++) {
            if (this.$rootScope.people[i].name.toLocaleLowerCase() === this.$scope.listForm.personName.toLocaleLowerCase()) {
              this.ToastService.showToast('Name already exists, enter unique name!')
              console.log("Duplicate entry: ", this.$rootScope.people[i]);
              this.$scope.listForm.personName = '';
              this.$scope.myForm.$setPristine();
              this.$scope.myForm.$setUntouched();
              return;
            }
            if (this.$rootScope.people[i].email.toLocaleLowerCase() === this.$scope.listForm.personEmail.toLocaleLowerCase()) {
              this.ToastService.showToast('Email already exists, enter unique email!')
              console.log("Duplicate entry: ", this.$rootScope.people[i]);
              this.$scope.listForm.personEmail = '';
              this.$scope.myForm.$setPristine();
              this.$scope.myForm.$setUntouched();
              return;
            }
          }
          this.$rootScope.people.push(person);
          localStorage.setItem('peopleOnList', JSON.stringify(this.$rootScope.people));
          this.$scope.listForm.personName = '';
          this.$scope.listForm.personEmail = '';
          this.$scope.myForm.$setPristine();
          this.$scope.myForm.$setUntouched();
          console.log(this.$rootScope.people);
    }

    removeName(index: number) {
        this.$rootScope.people = JSON.parse(localStorage.getItem('peopleOnList'));
        this.$rootScope.people.splice(index, 1);
        localStorage.setItem('peopleOnList', JSON.stringify(this.$rootScope.people));
    }

    editPerson(ev: Event, person: any, index: number) {
        var personToEdit = {
            index: index,
            person: person
        }
        console.log('person to edit: ', personToEdit);
        this.$mdDialog.show({
            
            template: 
                `
                <md-dialog aria-label="Edit Person">
            
                    <md-dialog-content>
                        <div class="md-dialog-content">
                            <h2>Update Person</h2>
                            <br>
                            <form name="myForm"  autocomplete="off">
                                <md-input-container class="md-block md-primary add-names" flex-gt-sm>
                                    <label>Add person name</label>
                                    <input type="text" minlength="3" maxlength="25" required  name="name" ng-model="dataArray.personUpdated.name" ng-enter="updatePeopleArray()">
                                    <div ng-messages="myForm.name.$error">
                                        <div ng-message="required">Name is required.</div>
                                        <div ng-message="minlength">Name too short</div>
                                        <div ng-message="maxlength">Name too long</div>
                                    </div>
                                </md-input-container>
                                <md-input-container class="md-block md-primary" flex-gt-sm>
                                    <label>Email</label>
                                    <input type="email" auto-focus required ng-model="dataArray.personUpdated.email"  name="resetEmail" ng-pattern="/^.+@.+\..+$/" ng-enter="updatePeopleArray()">
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
                        <md-button ng-disabled="!enableUpdatePerson" ng-click="updatePeopleArray()">Update</md-button>
                        <md-button ng-click="closeDialog()">Cancel</md-button>
                    </md-dialog-actions>
            
                </md-dialog>
                `,
            clickOutsideToClose: true,
            targetEvent: ev,
            controller: DialogController,
            locals: {
                dataArray: {
                    personToEdit: personToEdit,
                    personUpdated: {
                        name: personToEdit.person.name,
                        email: personToEdit.person.email
                    } 
                },
                title: this.$scope.listForm.listName
                }
            
            });
        
    }

    matchSantas(ev: any) {
        setTimeout(() => {
            this.$rootScope.santas = this.secretSanta(this.$rootScope.people);
           
            var peopleToUpdate = this.$scope.santas;
            console.log(this.$rootScope.santas);
            this.$mdDialog.show({
                template:`
                <md-dialog aria-label="Secret Santas">
                    <form name="myForm" novalidate ng-cloak>

                    <md-dialog-content class="santa-dialog">
                        <div class="md-dialog-content">
                        <h2><span class="cursor-pointer" ng-click="editMatchedTitle()">
                            {{ title }}
                            <md-tooltip md-direction="top">
                                Edit list name
                            </md-tooltip>
                            </span> 
                            Secret Santas
                        </h2>
                        <div ng-show="editMatchedListName">
                            <md-input-container class="md-inline">
                                <input type="text" ng-model="title" name="matchedListName" required placeholder="List Name"  />
                            </md-input-container>
                            <div layout="row">
                                <md-button ng-disabled="!enableUpdatePerson" class="listEdit-btn" ng-click="saveEditListName()">Save</md-button>
                                <md-button class="listEdit-btn" ng-click="cancelEditListName()">Cancel</md-button>
                            </div>
                        </div>
                        <div flex class="santa-dialog">
                            <div md-no-ink class="md-2-line santa-list-item" ng-repeat="santa in dataArray" ng-click="enableEditing($index)">
                        
                                <div ng-hide="santa.editing">
                                    <div layout="row"  class="list-scroll" >
                                        <div flex class="md-list-item-text word-wrap">
                                            {{ santa.giver.name }}
                                            <p>{{ santa.giver.email }}</p>
                                        </div> 
                                        <div class="cart-container">
                                            <md-icon>output</md-icon>
                                        </div>
                                        <div flex class="md-list-item-text word-wrap">
                                            {{ santa.giftee.name }}
                                            <p>{{ santa.giftee.email }}</p>
                                        </div>
                                    </div>
                                </div>
                                
                               
                                <div class="santa-editing" ng-show="santa.editing">
                                                <!-- Edit view -->
                                    <form name="editForm_{{$index}}" layout="column">
                                        <div layout="row">
                                            <md-input-container class="md-inline">
                                                <input type="text" ng-model="santa.giver.name" name="giverName" required placeholder="Giver Name"  />
                                                <div ng-messages="['editForm_' + $index].giverName.$error">
                                                    <div ng-message="required">Name is required.</div>
                                                    <div ng-message="minlength">Name too short</div>
                                                    <div ng-message="maxlength">Name too long</div>
                                                </div>
                                            </md-input-container>
                                            <md-input-container class="md-inline">
                                                <input type="email" ng-model="santa.giver.email" name="giverEmail" required placeholder="Giver Email" ng-pattern="/^.+@.+\..+$/"  />
                                                <div ng-messages="['editForm_' + $index].giverEmail.$error">
                                                    <div ng-message="required">Email is required.</div>
                                                    <div ng-message="email">Valid email required.</div>
                                                </div>
                                            </md-input-container>
                                        </div>
                                        <div layout="row">
                                            <md-input-container class="md-inline">
                                                <input type="text" ng-model="santa.giftee.name" name="gifteeName" required placeholder="Giftee Name" />
                                                <div ng-messages="['editForm_' + $index].gifteeName.$error">
                                                    <div ng-message="required">Name is required.</div>
                                                    <div ng-message="minlength">Name too short</div>
                                                    <div ng-message="maxlength">Name too long</div>
                                                </div>
                                            </md-input-container>
                                            <md-input-container class="md-inline">
                                                <input type="email" ng-model="santa.giftee.email" name="gifteeEmail" required placeholder="Giftee Email" ng-pattern="/^.+@.+\..+$/" />
                                                <div ng-messages="['editForm_' + $index].gifteeEmail.$error">
                                                    <div ng-message="required">Email is required.</div>
                                                    <div ng-message="email">Valid email required.</div>
                                                </div>
                                            </md-input-container>
                                        </div>
                                        <div layout="row">
                                        <md-button ng-disabled="!enableUpdatePerson" class="listEdit-btn" ng-click="saveEdit($index)">Save</md-button>
                                        <md-button class="listEdit-btn" ng-click="cancelEdit($index)">Cancel</md-button>
                                        </div>
                                    </form>
                                </div>
                                       
                            </div>
                        </div>
                    </md-dialog-content>
                
                    <md-dialog-actions layout="row">
                    <md-button flex class="md-icon-button" ng-click="shareUnsavedList()">
                    <md-icon>send</md-icon>
                    <md-tooltip md-direction="top">
                        Send and Save List
                    </md-tooltip>
                    </md-button>
                    <md-button flex class="md-icon-button" ng-click="showConfirmAndDownload()">
                        <md-icon>download_for_offline</md-icon>
                        <md-tooltip md-direction="top">
                            Download
                        </md-tooltip>
                    </md-button>
                
                    <md-button flex ng-click="closeDialog()">
                        Close
                        <md-tooltip md-direction="top" class="matched-close-tooltip">
                            Lists are randomly generated, this list will be lost if closed
                        </md-tooltip>
                    </md-button>
                    </md-dialog-actions>
                </form>
                </md-dialog>`,
                targetEvent: ev,
                clickOutsideToClose: false,
                controller: DialogController,
                locals: {
                dataArray: this.$rootScope.santas,
                title: this.$scope.listForm.listName
                }
            });
        }, 100);
    
    }

    closeDialog() {
        this.$mdDialog.hide();
    }

    secretSanta(names: any) {
        // Shuffling the array
        let shuffled = [...names];
        this.shuffleArray(shuffled);
        
        // Creating pairs such that each person gives a gift to the next person in the shuffled array
        let pairs = shuffled.map((name, index, arr) => {
            let giftee = arr[(index + 1) % arr.length];
            return { giver: name, giftee: giftee };
        });
    
        return pairs;
    }
    
    shuffleArray(array: any) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    disabledMatchButtonClick() {
        if (this.$rootScope.people.length % 2 !== 0) {
            console.log('disabled button clicked');
          this.ToastService.showToast('You need at least 2 names to match Santas')
        }

    }

    disabledAddButtonClick() {
        if (!this.$scope.enableAdd) {
            console.log('disabled button clicked');
          this.ToastService.showToast('Fill out all fields to add a person')
        }

    }

    async getList(list: any, ev: Event) {
        console.log('List to get: ', list);
        this.$scope.title = list.title;
        try {
            var people = await this.AuthService.getList(list.listId)
                console.log('people on list: ,', people);

            this.$mdDialog.show({
                template: 
                `
                <md-dialog aria-label="View List">
                    <md-content>
                        <md-dialog-content>
                            <div class="md-dialog-content">
                                <h2>{{ title.title }} Secret Santas</h2>
                                <md-list flex>
                                    <md-list-item class="md-3-line" ng-repeat="person in dataArray" ng-click="null">
                                    
                                    <div layout="row">
                                        <div flex style="width: 150px" class="md-list-item-text word-wrap">
                                            {{ person.name }}
                                            <p>{{person.email}}</p>
                                        </div> 
                                        <div class="cart-container">
                                            <md-icon>output</md-icon>
                                        </div>
                                        <div flex style="width: 150px" class="md-list-item-text word-wrap">
                                            {{ person.giverGiftee }}
                                            <p>{{ ($index + 1) === dataArray.length ? dataArray[0].email : dataArray[$index + 1].email }}</p>
                                        </div>
                                    </div>
                                    
                                    </md-list-item>
                                </md-list>          
                            </div>
                        </md-dialog-content>
                        <md-dialog-actions layout="row">
                            <md-button flex  class="md-icon-button" ng-click="shareList()">
                                <md-icon>send</md-icon>
                                <md-tooltip md-direction="top">
                                    Send
                                </md-tooltip>
                            </md-button>
                            <md-button flex  class="md-icon-button" ng-click="showConfirmAndDownloadOldList()">
                            <md-icon>download_for_offline</md-icon>
                            <md-tooltip md-direction="top">
                                Download
                            </md-tooltip>
                        </md-button>
                            <md-button flex  class="md-icon-button" ng-click="showConfirmAndDeleteList()">
                                <md-icon>delete</md-icon>
                                <md-tooltip md-direction="top">
                                Delete
                                </md-tooltip>
                            </md-button>
                                <md-button flex ng-click="closeDialog()">
                                Ok
                            </md-button>
                        </md-dialog-actions>
                    </md-content>
                </md-dialog>
                `,
                clickOutsideToClose: true,
                targetEvent: ev,
                controller: DialogController,
                locals: {
                    title: list,
                    dataArray: people,
                }
            })
        } catch (error:any) {
            console.log(error);
            if (error.status !== 401) {
                this.ToastService.showToast('Something went wrong: ', error.statusText)
            }
        }
    }

    clearList() {
        var confirm = this.$mdDialog.confirm()
        .theme(localStorage.getItem('theme'))
        .title('Clear list')
        .textContent('Clear current list?')
        .ariaLabel('Lucky day')
        .ok('Clear')
        .cancel('Cancel');
  
      this.$mdDialog.show(confirm).then(() => {
        localStorage.removeItem('currentList');
        localStorage.removeItem('peopleOnList');
        this.$scope.listForm = {
            listName: '',
            personName: '',
            personEmail: ''

        }
        this.$rootScope.people = [];
        this.$scope.myForm.$setPristine();
        this.$scope.myForm.$setUntouched();
      }, function () {
            console.log("list cleared canceled");
      });
    }
    
}
