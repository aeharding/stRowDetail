angular.module('stRowDetail', ['smart-table'])
  .directive('stRowMaster', function() {
    return {
      scope: {
        stRowMaster: '='
      },
      link: function(scope, element, attrs) {
        element.on('click', function() {
          scope.stRowMaster = !scope.stRowMaster;
          scope.$apply();
        });
        scope.$watch('stRowMaster', function(open) {
          if (open) {
            element.addClass('st-row-open');
          } else {
            element.removeClass('st-row-open');
          }
        });
      }
    }
  })
  .directive('stRowSlave', function() {
    return {
      scope: {
        open: '='
      },
      transclude: true,
      template: '<div ng-transclude></div>',
      link: function(scope, element, attrs) {
        scope.$watch('open', function(open) {
          if (open) {
            element.parent().parent().addClass('st-row-open');
          } else {
            element.parent().parent().removeClass('st-row-open');
          }
        });
      }
    }
  });




  angular.module('stRowDetail').factory('cuiTransition', function($q, $timeout, $rootScope) {
  var animationEndEventNames, cuiTransition, findEndEventName, transElement, transitionEndEventNames;
  cuiTransition = function(element, trigger, options) {
    var deferred, endEventName, transitionEndHandler;
    options = options || {};
    deferred = $q.defer();
    endEventName = cuiTransition[(options.animation ? 'animationEndEventName' : 'transitionEndEventName')];
    transitionEndHandler = function(event) {
      if (event.target !== element[0]) {
        return;
      }
      return $rootScope.$apply(function() {
        element.unbind(endEventName, transitionEndHandler);
        return deferred.resolve(element);
      });
    };
    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }
    $timeout(function() {
      if (angular.isString(trigger)) {
        element.addClass(trigger);
      } else if (angular.isFunction(trigger)) {
        trigger(element);
      } else if (angular.isObject(trigger)) {
        element.css(trigger);
      }

      /* istanbul ignore if */
      if (!endEventName) {
        return deferred.resolve(element);
      }
    });
    deferred.promise.cancel = function() {
      if (endEventName) {
        element.unbind(endEventName, transitionEndHandler);
      }
      return deferred.reject('Transition cancelled');
    };
    return deferred.promise;
  };
  transElement = document.createElement('trans');
  transitionEndEventNames = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd',
    transition: 'transitionend'
  };
  animationEndEventNames = {
    WebkitTransition: 'webkitAnimationEnd',
    MozTransition: 'animationend',
    OTransition: 'oAnimationEnd',
    transition: 'animationend'
  };
  findEndEventName = function(endEventNames) {
    var name;
    for (name in endEventNames) {
      if (transElement.style[name] !== void 0) {
        return endEventNames[name];
      }
    }
  };
  cuiTransition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  cuiTransition.animationEndEventName = findEndEventName(animationEndEventNames);
  return cuiTransition;
});

  angular.module('stRowDetail').directive('cuiCollapse', function(cuiTransition) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var collapse, collapseDone, currentTransition, doTransition, expand, expandDone, initialAnimSkip;
      initialAnimSkip = attrs['cuiCollapseSkipInitial'] === 'true';
      currentTransition = void 0;
      doTransition = function(change) {
        var newTransition, newTransitionDone;
        newTransitionDone = function() {
          if (currentTransition === newTransition) {
            return currentTransition = void 0;
          }
        };
        newTransition = cuiTransition(element, change);
        if (currentTransition) {
          currentTransition.cancel();
        }
        currentTransition = newTransition;
        newTransition.then(newTransitionDone, newTransitionDone);
        return newTransition;
      };
      expand = function() {
        var scrollHeight;
        if (initialAnimSkip) {
          initialAnimSkip = false;
          return expandDone();
        } else {
          element.removeClass('cui-collapse').addClass('cui-collapsing');
          scrollHeight = element[0].scrollHeight;
          if (scrollHeight === 0) {
            return expandDone();
          }
          return doTransition({
            height: scrollHeight + 'px'
          }).then(expandDone);
        }
      };
      expandDone = function() {
        element.removeClass('cui-collapsing');
        element.addClass('cui-collapse cui-in');
        element.css({
          height: 'auto'
        });
        return scope.$emit('cui:collapse:expanded');
      };
      collapse = function() {
        var x;
        if (initialAnimSkip) {
          initialAnimSkip = false;
          collapseDone();
          return element.css({
            height: 0
          });
        } else {
          element.css({
            height: element[0].scrollHeight + 'px'
          });
          x = element[0].offsetWidth;
          element.removeClass('cui-collapse cui-in').addClass('cui-collapsing');
          return doTransition({
            height: 0 + 'px'
          }).then(collapseDone);
        }
      };
      collapseDone = function() {
        element.removeClass('cui-collapsing');
        element.addClass('cui-collapse');
        return scope.$emit('cui:collapse:collapsed');
      };
      return scope.$watch(attrs['cuiCollapse'], function(shouldCollapse) {
        if (shouldCollapse) {
          return collapse();
        } else {
          return expand();
        }
      });
    }
  };
});