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
		})
		.state('anon.imprimirTicket',{
			url: '/pago/ticket/:pago_id',
			templateUrl: 'client/planPagos/tickets/pago.ng.html',
			controller: 'TicketPagoCtrl as tkpctrl'
		});

	/***************************
	 * Login Users Routes
	 ***************************/
	$stateProvider
		.state('root', {
			url: '',
			abstract: true,
			templateUrl: 'client/layouts/root.ng.html',
			controller: 'RootCtrl as ro',
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
		.state('root.tiposNotaCredito', {
			url: '/tiponotascredito',
			templateUrl: 'client/notaCredito/tipoform.ng.html',
			controller: 'TiposNotasCreditoCtrl as tnc',
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
		.state('root.tiposIngreso', {
			url: '/tiposIngreso',
			templateUrl: 'client/tiposIngreso/tiposIngreso.ng.html',
			controller: 'TiposIngresoCtrl as tictrl',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cuentas', {
			url: '/cuentas',
			templateUrl: 'client/cuentas/cuentas.ng.html',
			controller: 'CuentasCtrl as ctactrl',
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
						if(user.roles[0] == "Gerente" || user.roles[0] == "Cajero" || user.roles[0] == "Verificador"){
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
						if(user.roles[0] == "Gerente" || user.roles[0] == "Cajero" || user.roles[0] == "Verificador"){
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
						if(user.roles[0] == "Gerente" || user.roles[0] == "Cajero" || user.roles[0] == "Verificador"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
					});
				}]
			}
		})
		.state('anon.imprimirTabla', {
			url: '/imprimirTabla/:objeto_id/:credito_id',
			params: {'planPagos':':planPagos'},
			templateUrl: 'client/planPagos/generadorPlan/_imprimirTabla.html',
			controller: 'VerPlanPagosCtrl as vpp',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Cajero" || user.roles[0] == "Verificador"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
					});
				}]
			}
		})
		.state('root.actualizarPlan', {
			url: '/actualizarPlan/:objeto_id/:credito_id',
			templateUrl: 'client/planPagos/actualizarPlan/generadorPlan.html',
			controller: 'ActualizarPlanCtrl as ae',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Cajero" || user.roles[0] == "Verificador"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
					});
				}]
			}
		})
		.state('root.generarNotaCredito', {
			url: '/generarNotaCredito/:objeto_id',
			templateUrl: 'client/notaCredito/form.html',
			controller: 'GenerarNotaCredito as gnc',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" ||	user.roles[0] == "Verificador"){
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
			url: '/verPlanPagos/:objeto_id/:credito_id',
			templateUrl: 'client/planPagos/verPlanPagos/verPlanPagos.html',
			controller: 'VerPlanPagosCtrl as vpp',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Cajero" || user.roles[0] == "Verificador"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
					});
				}]
			}
		})
		.state('root.pagarPlanPagos', {
			url: '/pagar/:objeto_id',
			templateUrl: 'client/planPagos/pagar/pagar.ng.html',
			controller: 'PagarPlanPagosCtrl as pvpp',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Cajero" || user.roles[0] == "Verificador"){
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
		.state('root.cajerosLista', {
			url: '/cajeros',
			templateUrl: 'client/cajeros/cajerosLista.ng.html',
			controller: 'CajerosListaCtrl as lven',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cajerosForm', {
			url: '/cajerosForm',
			templateUrl: 'client/cajeros/cajerosForm.ng.html',
			controller: 'CajerosFormCtrl as ven',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.editarCajero', {
			url: '/editarCajero/:objeto_id',
			templateUrl: 'client/cajeros/cajerosForm.ng.html',
			controller: 'CajerosFormCtrl as ven',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente" || user.roles[0] == "Cajero" || user.roles[0] == "Verificador"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 
				 });
			 }]
			}
		})

		.state('root.reportes', {
			url: '/reportes',
			templateUrl: 'client/reportes/reportes.ng.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 
					});
				}]
			}
		})
		.state('root.diarioCobranza', {
			url: '/reportes/diarioCobranza',
			templateUrl: 'client/reportes/_diarioCobranza.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 
					});
				}]
			}
		})

		.state('root.diarioCreditos', {
			url: '/reportes/diarioCreditos',
			templateUrl: 'client/reportes/_diarioCreditos.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 
					});
				}]
			}
		})
		.state('root.movimientoCuenta', {
			url: '/reportes/movimientoCuenta',
			templateUrl: 'client/reportes/_movimientoCuenta.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "Gerente"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 
					});
				}]
			}
		})
		.state('root.verificadoresLista', {
			url: '/verificadores',
			templateUrl: 'client/verificadores/verificadoresLista.ng.html',
			controller: 'VerificadoresListaCtrl as lver',
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
		.state('root.cobranza', {
			url: '/cobranza',
			templateUrl: 'client/cobranza/cobranza.ng.html',
			controller: 'CobranzaCtrl as cob',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.panelVerificador', {
			url: '/panelverificador',
			templateUrl: 'client/verificadores/panel/panelVerificador.ng.html',
			controller: 'panelVerificadorCtrl as pver',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.verificacion', {
			url: '/verificacion/:id',
			templateUrl: 'client/verificadores/verificacion.ng.html',
			controller: 'VerificacionCtrl as ver',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.historialPagos', {
			url: '/historialPagos/:objeto_id/:credito_id',
			templateUrl: 'client/historialPagos/historialPagos.ng.html',
			controller: 'HistorialPagosCtrl as hp',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.creditosPorAutorizar', {
			url: '/creditosPorAutorizar',
			templateUrl: 'client/creditos/creditosPorAutorizar/creditosPorAutorizar.html',
			controller: 'CreditosPorAutorizarCtrl as cpa',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.entregarCredito', {
			url: '/entregarCredito/:credito_id',
			templateUrl: 'client/creditos/entregarCredito/entregarCredito.ng.html',
			controller: 'EntregarCreditoCtrl as ecCtrl',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cajas', {
			url: '/cajas',
			templateUrl: 'client/cajas/cajas.ng.html',
			controller: 'CajasCtrl as caj',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cajasActivas', {
			url: '/cajas/activas',
			templateUrl: 'client/cajas/cajasActivas.ng.html',
			controller: 'CajasActivasCtrl as caaj',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.movimientosCaja', {
			url: '/cajas/:caja_id/movimientos',
			templateUrl: 'client/cajas/movimientosCaja.ng.html',
			controller: 'MovimientosCajaCtrl as mcaj',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.intraCajas', {
			url: '/cajas/traspasointra',
			templateUrl: 'client/cajas/intraCajas.ng.html',
			controller: 'IntraCajasCtrl as incaj',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.corteCaja', {
			url: '/cajas/corte',
			templateUrl: 'client/cajas/corteCaja.ng.html',
			controller: 'CorteCajeCtrl as corcajCtrl',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.abrirCaja', {
			url: '/abricaja/:caja_id',
			templateUrl: 'client/cajas/abrirCaja.ng.html',
			controller: 'AbrirCajaCtrl as ocaj',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.calculadora', {
			url: '/calculadora',
			templateUrl: 'client/administracion/calculadora.html',
			controller: 'calculadoraCtrl as cal',
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
		.state('anon.imprimirCredito', {
			url: '/imprimirCredito',
			templateUrl: 'client/administracion/_imprimirCredito.html',
			controller: 'calculadoraCtrl as cal',
			params: {'pago':':pago'},
			resolve: {
				"currentUser": ["$meteor", function($meteor){
					return $meteor.requireUser();
				}]
			}
		})
}]);