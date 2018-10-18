app =  angular.module('creditoMio',
  [
    'angular-meteor',    
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'toastr',
    'ui.router',
    'ui.grid',
    'smartadmin',
    'datePicker',
    'ui.calendar',
    'ui.bootstrap'
  ]
);

$("html").attr({lang:"es"});

NProgress.configure({ easing: 'ease', speed: 600 });