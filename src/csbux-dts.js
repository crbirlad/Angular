'use strict'
var module = angular.module('csbux.directives.dts', []);

module.directive('dtsDraggable', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		link: function(scope, el, attrs, controller) {			
			angular.element(document).ready(function () {
				if("addDynamicTab" != angular.element(el).attr("id")) {					
					angular.element(el).attr("draggable", "true");
				} else {
					$rootScope.addDynamicTabEl = angular.element(el);				
				}

				el.bind("dragstart", function(e) {
					//get the ID of the div being moved									
					e.dataTransfer.setData('dragId', angular.element(el).attr("id"));
					//making the add tab behave as "dropabble" so we can drop tabs right before it
					$rootScope.addDynamicTabEl.attr("draggable", "true");					
					$rootScope.addDynamicTabEl.addClass("dts-target");
					$rootScope.$emit("DTS-START-DRAG");
				});

				el.bind("dragend", function(e) {
					$rootScope.$emit("DTS-END-DRAG");
				});
			});    
		}
	}
}]);

module.directive('dtsDropObject', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		scope: {
			onDrop: '&'
		},
		link: function(scope, el, attrs, controller) {
			angular.element(document).ready(function () {
				var hoveredTabId = null;				

				el.bind("dragover", function(e) {
					if (e.preventDefault) {
						e.preventDefault(); 
					}

					var targetElement = angular.element(e.target);					
					while(!targetElement.hasClass("draggableDiv")) {
						targetElement = targetElement.parent();					
					}   

					hoveredTabId = angular.element(targetElement).attr("id");
					e.dataTransfer.dropEffect = 'move';
					return false;
				});

				el.bind("dragenter", function(e) {		      
					var targetElement = angular.element(e.target);					
					while(!targetElement.hasClass("draggableDiv")) {
						targetElement = targetElement.parent();					
					}        
					
					
					targetElement.addClass("dts-over");												
				});

				el.bind("dragleave", function(e) {
					//only remove style if another tab; if this is a component from the same tab, don't remove it
					var targetElement = angular.element(e.target);					
					while(!targetElement.hasClass("draggableDiv")) {
						targetElement = targetElement.parent();					
					}   

					angular.element(e.target).removeClass('dts-over');					
				});

				el.bind("drop", function(e) {
					if (e.preventDefault) {
						e.preventDefault();
					}

					if (e.stopPropagation) {
						e.stopPropagation();
					}

					var dropId = angular.element(el).attr("id");
					var dragId = e.dataTransfer.getData("dragId");
					
					//only perform the drag-n-drop moves if the divs are different
					if(dragId != dropId) {
						scope.onDrop({dragEl: dragId, dropEl: dropId});		                
					}						

					$rootScope.$emit("DTS-END-DRAG");
				});

				$rootScope.$on("DTS-START-DRAG", function() {		       		            	         
					angular.element(el).addClass("dts-target");
				});

				$rootScope.$on("DTS-END-DRAG", function() {		            	
					angular.element(el).removeClass("dts-target");
					angular.element(el).removeClass("dts-over");

					//removing the style from the add tab too
					$rootScope.addDynamicTabEl.removeClass("dts-target");
					$rootScope.addDynamicTabEl.removeAttr("draggable");
				});
			});
}
}
}]);

module.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'tabs', 'newTab', 'selectedTab', function($scope, $modalInstance, tabs, newTab, selectedTab){ 
	if(newTab) {
		$scope.shortenedId = "Bogus text";
		$scope.defaultName = 'Tab-' + $scope.shortenedId;
		$scope.defaultContent = 'content-' + $scope.shortenedId;
	} else  {
		$scope.defaultName = selectedTab.title;
		$scope.defaultContent = selectedTab.content;
	}

	$scope.tab = {name:$scope.defaultName,content:$scope.defaultContent};   

	$scope.ok = function (tab) {
		$modalInstance.close(tab);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);

module.directive('csbuxDts', ['$sce', '$modal', function($sce, $modal) {
	return {
		restrict: 'E',		
		scope: {
			tabs: '=dts'
		},
		controller: function($scope) {
			$scope.dropped = function(dragEl, dropEl) {       
				$scope.dragEl = dragEl;
				$scope.dropEl = dropEl;

				$scope.$apply(function () {
					$scope.oldDrag = $scope.tabs[$scope.dragEl];  
					$scope.oldDrop = $scope.tabs[$scope.dropEl];  

					var reorder = false;

					//reverse the order
					if("addDynamicTab" != $scope.dropEl) {
						var initialOrder = $scope.tabs[$scope.dropEl].order;
						$scope.tabs[$scope.dropEl].order = $scope.tabs[$scope.dropEl].order + 1;
						$scope.tabs[$scope.dragEl].order = initialOrder;

						reorder = true;
					} else {
						var dragOrder = $scope.tabs[$scope.dragEl].order;
						var lastOrder = $scope.tabs[$scope.tabs.length-1].order;
						if(dragOrder < lastOrder) {						
							angular.forEach($scope.tabs, function(tab, index) {                         
								if(tab.order > dragOrder) {
									tab.order--;
								}
							});
							
							$scope.tabs[$scope.dragEl].order = lastOrder;
							
							reorder = true;
						}

					}

					//another way is to drag-n-drop by reversing elements and removing/adding elements back in
					/*if(dropEl < dragEl) {												
						$scope.tabs.splice($scope.dropEl,1);
						$scope.tabs.splice($scope.dragEl-1,1);  
					} else {						
						$scope.tabs.splice($scope.dragEl,1);
						$scope.tabs.splice($scope.dropEl-1,1);  
						$scope.selectedTabIndex = $scope.oldDrop.order;
					}
					$scope.tabs.splice($scope.dropEl,0, {title: $scope.oldDrag.title, content: $scope.oldDrag.content, active:true,toRemove:false,toEdit:false,order:$scope.oldDrop.order});  
					$scope.tabs.splice($scope.dragEl,0, {title: $scope.oldDrop.title, content: $scope.oldDrop.content, active:true,toRemove:false,toEdit:false,order:$scope.oldDrag.order});  */


					if(reorder) {
						angular.forEach($scope.tabs, function(tab, index) {                         
							tab.active = false;
							if(tab.order == $scope.tabs[$scope.dragEl].order) {
								tab.active = true;
							}
						});

						$scope.tabs.sort(function(tabA, tabB) {
							return tabA.order - tabB.order;
						});
					}
				});
			};

			$scope.addTab = function() {
				$scope.selectedTabIndex = -1;

				angular.forEach($scope.tabs, function(tab, index) {
					if(tab.active) {
						$scope.selectedTabIndex = index;
					}                         
				});

				$scope.newTab = true;

				setTimeout(function() {
					var modalInstance = $modal.open({
						animation: true,
						templateUrl: 'myModalContent.html',
						controller: 'ModalInstanceCtrl',
						size: '',
						resolve: {
							tabs: function () {
								return $scope.tabs;
							},
							newTab: function() {
								return $scope.newTab;
							},
							selectedTab: function() {
								return null;
							}
						}
					});

					modalInstance.result.then(function (tab) {
						$scope.addActive = false;
						angular.forEach($scope.tabs, function(tab) {                          
							tab.active = false;                         
						});

						$scope.order = $scope.tabs.length;

						$scope.tabs.push({title: tab.name, content: tab.content, active:true,toRemove:false,toEdit:false,order:$scope.order});
					} , function(error) {
						$scope.addActive = false;                 
						angular.forEach($scope.tabs, function(tab) {                          
							tab.active = false;                         
						});

						$scope.tabs[$scope.selectedTabIndex].active = true;    
					});
				}); 
			};


			$scope.removeTab = function() {
				if($scope.tabs.length > 1) {
					$scope.selectedTabIndex = -1;

					angular.forEach($scope.tabs, function(tab, index) {                         
						if(tab.toRemove) {
							$scope.selectedTabIndex = index;            
						}                         
					});

					$scope.tabs[$scope.selectedTabIndex].active = false;
					$scope.tabs.splice($scope.selectedTabIndex,1);
					if($scope.selectedTabIndex == 0) {
						$scope.tabs[1].active = true; 
					} else {
						$scope.tabs[$scope.selectedTabIndex-1].active = true;
					}

			               //re-order
			               $scope.newOrder = 0;
			               angular.forEach($scope.tabs, function(tab, index) {                         
			               	tab.order = $scope.newOrder;
			               	$scope.newOrder++;
			        });
			    }
			};

	       $scope.editTab = function() {   
	       	$scope.selectedTabIndex = -1;

	       	angular.forEach($scope.tabs, function(tab, index) {                         
	       		if(tab.toEdit) {
	       			$scope.selectedTabIndex = index;
	       			tab.toEdit = false;         
	       		}                         
	       	});

	       	$scope.newTab = false;    
	       	$scope.selectedTab = $scope.tabs[$scope.selectedTabIndex];

	       	setTimeout(function() {
	       		var modalInstance = $modal.open({
	       			templateUrl: 'myModalContent.html',
	       			controller: 'ModalInstanceCtrl',
	       			size: '',
	       			resolve: {
	       				tabs: function () {
	       					return $scope.tabs;
	       				},
	       				newTab: function() {
	       					return $scope.newTab;
	       				},
	       				selectedTab: function() {
	       					return $scope.selectedTab;
	       				}
	       			}
	       		});

	       		modalInstance.result.then(function (tab) {
	       			$scope.selectedTab.title = tab.name;
	       			$scope.selectedTab.content = tab.content;
	       		} , function(error) {
	                   //log error
	               });
	       	}); 
	       };

   },      
   templateUrl: 'csbux-dts-template.html'
};

}]);
