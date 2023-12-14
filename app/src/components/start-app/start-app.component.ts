import * as angular from 'angular';


/**
 * @ngInject
 */


function DialogController($scope, $mdDialog, dataArray) {
  $scope.dataArray = dataArray
  $scope.closeDialog = function() {
    $mdDialog.hide();
  };
  $scope.downloadSecretSantaList = function() {
  
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.text('Secret Santa List', 10, 10);

    // Add each pair to the PDF
    doc.setFontSize(12);
    dataArray.forEach((pair, index) => {
      doc.text(`${pair.giver} gives a gift to ${pair.giftee}`, 10, 20 + (10 * index));
    });

    // Save the PDF
    doc.save('secret-santa-list.pdf');
  };

  $scope.showConfirmAndDownload = function() {
    var confirm = $mdDialog.confirm()
      .title('Would you like to download your list?')
      .textContent('This will download the file to your device.')
      .ariaLabel('Lucky day')
      .ok('Download')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function () {
      $scope.downloadSecretSantaList()
    }, function () {
      $scope.status = 'Download canceled.';
    });
  };

}

export class AppComponent {
  // Define our AppComponent's name
  static componentName:string = "msApp";

  // Define our AppComponent's config
  static componentConfig:ng.IComponentOptions = {
    bindings: {},
    controller: AppComponent,
    templateUrl: 'src/components/start-app/start-app.component.html'
  };

  // Define our injectables  
  private $mdDialog:angular.material.IDialogService;
  private $mdToast:angular.material.IToastService;



  // Define our own variables
  public santas = [];
  private inputValue: string = '';
  // private names: string[] = JSON.parse(this.$window.localStorage.getItem('names')) === null ? [] : JSON.parse(this.$window.localStorage.getItem('names'));
  private names: string[];
  public isLoading: boolean = false;
  private dateChristmasEve = new Date();
  private dateCurrent = new Date();

  // Define our constructor and inject the necessary services
  constructor(private $window: angular.IWindowService, $mdDialog:angular.material.IDialogService, $mdToast:angular.material.IToastService) {
    // Store all of our injectables
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.names = JSON.parse(this.$window.localStorage.getItem('names')) === null ? [] : JSON.parse(this.$window.localStorage.getItem('names'));
    this.dateChristmasEve.setMonth(11);
    this.dateChristmasEve.setDate(24);
    this.dateCurrent.getMonth();
    console.log(this.dateChristmasEve, this.dateCurrent);
   
  }

  getInputValue() {
    for (let i = 0; i < this.names.length; i++) {
      if (this.names[i].toLocaleLowerCase() === this.inputValue.toLocaleLowerCase()) {
        this.showToast('Name already exists, enter unique name!')
        console.log("Duplicate entry: ", this.names[i]);
        this.inputValue = '';
        return;
      }
    }
    this.names.push(this.inputValue);
    this.$window.localStorage.setItem('names', JSON.stringify(this.names));
    this.inputValue = '';
    console.log(this.inputValue, this.names);
  }

  removeName(index: number) {
    this.names = JSON.parse(this.$window.localStorage.getItem('names'));
    this.names.splice(index, 1);
    this.$window.localStorage.setItem('names', JSON.stringify(this.names));
  }

  matchSantas(ev) {
    this.isLoading = true;
    setTimeout(() => {
      console.log('After delay');
      // Continue your code execution here
      this.santas = this.secretSanta(this.names);
      console.log(this.santas);
      this.isLoading = false;
      this.$mdDialog.show({
          template:`
            <md-dialog aria-label="Secret Santas">
              <form ng-cloak>

                <md-dialog-content>
                  <div class="md-dialog-content">
                    <h2>Your Secret Santas</h2>
                    <md-list flex>
                      <md-list-item class="noright" ng-repeat="santa in dataArray" ng-click="null">
                      
                          <div class=santa-list>
                            <div class="santa-name">{{ santa.giver }}</div> 
                            <div class="cart-container">
                            <md-icon>output</md-icon>
                            </div>
                            <div class="recipient-name">{{santa.giftee }}</div>
                          </div>
                      
                      </md-list-item>
                    </md-list>          
                  </div>
                </md-dialog-content>
          
                <md-dialog-actions layout="row">
                  <md-button md-autofocus ng-click="showConfirmAndDownload()">
                    Download
                  </md-button>
                  <span flex></span>
                  <md-button ng-click="closeDialog()">
                  Got It!
                  </md-button>
                </md-dialog-actions>
              </form>
            </md-dialog>`,
          clickOutsideToClose: true,
          targetEvent: ev,
          controller: DialogController,
          locals: {
            dataArray: this.santas
          }
      });
    }, 1000); 
   
  }

  DialogController($mdDialog) {

    this.closeDialog = function() {
      $mdDialog.hide();
    };
  }

  closeDialog() {
    this.$mdDialog.hide();
  }

  secretSanta(names) {
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
  

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
  }

  disabledButtonClick() {
    if (this.names.length % 2 !== 0) {
      console.log('disabled button clicked');
      this.showToast('You need at least 2 names to match Santas')
    }

  }

  showToast(message: string) {
    this.$mdToast.show(
      this.$mdToast.simple()
      .textContent(message)
      .toastClass('my-toast')
      .hideDelay(3000))
  }

}
