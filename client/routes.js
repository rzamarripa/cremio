angular.module("creditoMio").run(function ($rootScope, $state, toastr) {
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireUser promise is rejected
    // and redirect the user back to the main page
    switch(error) {
      case "AUTH_REQUIRED":
        $state.go('anon.login');
        break;
      case "FORBIDDEN":
        //$state.go('root.home');
        break;
      case "UNAUTHORIZED":
      	toastr.error("Acceso Denegado");
				toastr.error("No tiene permiso para ver esta opción");
        break;
      default:
        $state.go('internal-client-error');
    }
/*
    if (error === 'AUTH_REQUIRED') {
      $state.go('anon.login');
    }
*/
  });
});

angular.module('creditoMio').config(['$injector', function ($injector) {
  var $stateProvider = $injector.get('$stateProvider');
  var $urlRouterProvider = $injector.get('$urlRouterProvider');
  var $locationProvider = $injector.get('$locationProvider');

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  /***************************
   * Anonymous Routes
   ***************************/
  $stateProvider
    .state('anon', {
      url: '',
      abstract: true,
      template: '<ui-view/>'
    })
    .state('anon.login', {
      url: '/login',
      templateUrl: 'client/login/login.ng.html',
      controller: 'LoginCtrl',
      controllerAs: 'lc'
    })
    .state('anon.logout', {
      url: '/logout',
      resolve: {
        'logout': ['$meteor', '$state', 'toastr', function ($meteor, $state, toastr) {
          return $meteor.logout().then(
            function () {
	            toastr.success("Vuelva pronto.");
              $state.go('anon.login');
            },
            function (error) {
              toastr.error(error.reason);
            }
          );
        }]
      }
    });

  /***************************
   * Login Users Routes
   ***************************/
  $stateProvider
    .state('root', {
      url: '',
      abstract: true,
      templateUrl: 'client/layouts/root.ng.html',
      controller: 'RootCtrl',
    })
    .state('root.home', {
      url: '/',
      templateUrl: 'client/home/home.ng.html',      
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.documentos', {
      url: '/documentos',
      templateUrl: 'client/documentos/documentos.ng.html',
      controller: 'DocumentosCtrl as doc',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.sexo', {
      url: '/sexo',
      templateUrl: 'client/sexo/sexo.ng.html',
      controller: 'SexoCtrl as sex',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.estadoCivil', {
      url: '/estadoCivil',
      templateUrl: 'client/estadoCivil/estadoCivil.ng.html',
      controller: 'EstadoCivilCtrl as edocivil',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.nacionalidades', {
      url: '/nacionalidades',
      templateUrl: 'client/nacionalidades/nacionalidades.ng.html',
      controller: 'NacionalidadesCtrl as nac',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.estados', {
      url: '/estados',
      templateUrl: 'client/estados/estados.ng.html',
      controller: 'EstadosCtrl as edo',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.paises', {
      url: '/paises',
      templateUrl: 'client/paises/paises.ng.html',
      controller: 'PaisesCtrl as pai',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.ocupaciones', {
      url: '/ocupaciones',
      templateUrl: 'client/ocupaciones/ocupaciones.ng.html',
      controller: 'OcupacionesCtrl as ocu',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.colonias', {
      url: '/colonias',
      templateUrl: 'client/colonias/colonias.ng.html',
      controller: 'ColoniasCtrl as col',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.estatus', {
      url: '/estatus',
      templateUrl: 'client/estatus/estatus.ng.html',
      controller: 'EstatusCtrl as est',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.ciudades', {
      url: '/ciudades',
      templateUrl: 'client/ciudades/ciudades.ng.html',
      controller: 'CiudadesCtrl as ciu',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.municipios', {
      url: '/municipios',
      templateUrl: 'client/municipios/municipios.ng.html',
      controller: 'MunicipiosCtrl as mun',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.parentesco', {
      url: '/parentesco',
      templateUrl: 'client/parentesco/parentesco.ng.html',
      controller: 'ParentescoCtrl as pare',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.departamentos', {
      url: '/departamentos',
      templateUrl: 'client/departamentos/departamentos.ng.html',
      controller: 'DepartamentosCtrl as deptos',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.divisas', {
      url: '/divisas',
      templateUrl: 'client/divisas/divisas.ng.html',
      controller: 'DivisasCtrl as div',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.roles', {
      url: '/roles',
      templateUrl: 'client/roles/roles.ng.html',
      controller: 'RolesCtrl as rol',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.sucursales', {
      url: '/sucursales',
      templateUrl: 'client/sucursales/sucursales.ng.html',
      controller: 'SucursalesCtrl as suc',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.clientesLista', {
      url: '/clientes',
      templateUrl: 'client/clientes/clientesLista.ng.html',
      controller: 'ClientesListaCtrl as lcli',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.clientesForm', {
      url: '/clientesForm',
      templateUrl: 'client/clientes/clientesForm.ng.html',
      controller: 'ClientesFormCtrl as cli',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.editarCliente', {
      url: '/editarCliente/:objeto_id',
      templateUrl: 'client/clientes/clientesForm.ng.html',
      controller: 'ClientesFormCtrl as cli',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Ventanilla"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.clienteDetalle', {
      url: '/clientes/:objeto_id',
      templateUrl: 'client/clientes/clientesDetalle.html',
      controller: 'ClientesDetalleCtrl as cd',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Ventanilla"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.generadorPlan', {
      url: '/generadorPlan/:objeto_id',
      templateUrl: 'client/planPagos/generadorPlan/generadorPlan.html',
      controller: 'GeneradorPlanCtrl as ge',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Ventanilla"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
					});
				}]
			}
    })
    // /:credito_id
    .state('root.verPlanPagos', {
      url: '/verPlanPagos/:objeto_id',
      templateUrl: 'client/planPagos/verPlanPagos/verPlanPagos.html',
      controller: 'VerPlanPagosCtrl as vpp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Ventanilla"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
					});
				}]
			}
    })
    .state('root.tiposCredito', {
      url: '/tiposCredito',
      templateUrl: 'client/tiposCredito/tiposCredito.ng.html',
      controller: 'TiposCreditoCtrl as tc',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.ventanillasLista', {
      url: '/ventanillas',
      templateUrl: 'client/ventanillas/ventanillasLista.ng.html',
      controller: 'VentanillasListaCtrl as lven',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.ventanillasForm', {
      url: '/ventanillasForm',
      templateUrl: 'client/ventanillas/ventanillasForm.ng.html',
      controller: 'VentanillasFormCtrl as ven',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.verificadoresLista', {
      url: '/verificadores',
      templateUrl: 'client/verificadores/verificadoresLista.ng.html',
      controller: 'VentanillasListaCtrl as lver',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.verificadoresForm', {
      url: '/verificadoresForm',
      templateUrl: 'client/verificadores/verificadoresForm.ng.html',
      controller: 'VerificadoresFormCtrl as ver',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.cobranzapordia', {
      url: '/cobranzapordia',
      templateUrl: 'client/cobranza/cobranzapordia.ng.html',
      controller: 'CobranzapordiaCtrl as cdia',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })

}]);