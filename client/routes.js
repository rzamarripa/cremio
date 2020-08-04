
angular.module("creditoMio").run(function ($rootScope, $state, toastr) {


	$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
		// We can catch the error thrown when the $requireUser promise is rejected
		// and redirect the user back to the main page

		switch (error) {
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
	});

	// $rootScope.$on('$stateChangeStart', function (next, current) {

	// 	setTimeout(() => {
	// 		NProgress.set(0.2);
	// 	}, 200);


	// });
	// $rootScope.$on('$stateChangeSuccess', function (next, current) {
	// 	NProgress.set(1.0);
	// });


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
							//toastr.success("Vuelva pronto.");
							$state.go('anon.login');
						},
						function (error) {
							toastr.error(error.reason);
						}
					);
				}]
			}
		})
		.state('anon.imprimirTicket', {
			url: '/pago/ticket/:pago_id',
			templateUrl: 'client/planPagos/tickets/pago.ng.html',
			controller: 'TicketPagoCtrl as tkpctrl'
		})
		.state('anon.imprimirTicketVale', {
			url: '/pago/ticketVale/:pago_id',
			templateUrl: 'client/planPagos/tickets/pagoVale.ng.html',
			controller: 'TicketPagoValeCtrl as tkpvctrl'
		})
		.state('anon.imprimirTicketTraspaso', {
			url: '/pago/ticketTraspaso/:pago_id',
			templateUrl: 'client/planPagos/tickets/traspaso.ng.html',
			controller: 'TicketTraspasoCtrl as tktctrl'
		})
		.state('anon.ticketEntregaVale', {
			url: '/creditos/entregarCredito/ticketEntregaVale/:credito_id',
			templateUrl: 'client/creditos/entregarCredito/ticketEntregaVale.ng.html',
			controller: 'ticketEntregaValeCtrl as tktEV'
		})
		.state('anon.ticketPagare', {
			url: '/creditos/entregarCredito/ticketPagare/:credito_id',
			templateUrl: 'client/creditos/entregarCredito/ticketPagare.ng.html',
			controller: 'TicketPagareCtrl as tktP'
		})
		.state('anon.ticketAmortizacion', {
			url: '/creditos/entregarCredito/ticketAmortizacion/:credito_id',
			templateUrl: 'client/creditos/entregarCredito/ticketAmortizacion.ng.html',
			controller: 'TicketAmortizacionCtrl as tktA'
		})
		.state('anon.ticketValesDistribuidor', {
			url: '/client/cobranzaVales/ticketDistribuidor/:distribuidor_id/:dia/:mes/:anio/:diaC/:mesC/:anioC',
			templateUrl: 'client/cobranzaVales/ticketDistribuidor.ng.html',
			controller: 'TicketDistribuidorCtrl as tktD'
		})
		.state('anon.ticketComisionPromotora', {
			url: '/client/promotoras/ticketComisionPromotora/:pago_id',
			templateUrl: 'client/promotoras/ticketComisionPromotora.html',
			controller: 'TicketComisionPromotoraCtrl as obj'
		})

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
			controller: 'HomeCtrl as ho',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.tiposNotaCredito', {
			url: '/tiponotascredito',
			templateUrl: 'client/notaCredito/tipoform.ng.html',
			controller: 'TiposNotasCreditoCtrl as tnc',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.sexo', {
			url: '/sexo',
			templateUrl: 'client/sexo/sexo.ng.html',
			controller: 'SexoCtrl as sex',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.estadoCivil', {
			url: '/estadoCivil',
			templateUrl: 'client/estadoCivil/estadoCivil.ng.html',
			controller: 'EstadoCivilCtrl as edocivil',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.nacionalidades', {
			url: '/nacionalidades',
			templateUrl: 'client/nacionalidades/nacionalidades.ng.html',
			controller: 'NacionalidadesCtrl as nac',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.estados', {
			url: '/estados',
			templateUrl: 'client/estados/estados.ng.html',
			controller: 'EstadosCtrl as edo',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.empresas', {
			url: '/empresas',
			templateUrl: 'client/empresas/empresas.ng.html',
			controller: 'EmpresasCtrl as emp',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.paises', {
			url: '/paises',
			templateUrl: 'client/paises/paises.ng.html',
			controller: 'PaisesCtrl as pai',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.ocupaciones', {
			url: '/ocupaciones',
			templateUrl: 'client/ocupaciones/ocupaciones.ng.html',
			controller: 'OcupacionesCtrl as ocu',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.colonias', {
			url: '/colonias',
			templateUrl: 'client/colonias/colonias.ng.html',
			controller: 'ColoniasCtrl as col',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.estatus', {
			url: '/estatus',
			templateUrl: 'client/estatus/estatus.ng.html',
			controller: 'EstatusCtrl as est',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.ciudades', {
			url: '/ciudades',
			templateUrl: 'client/ciudades/ciudades.ng.html',
			controller: 'CiudadesCtrl as ciu',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.municipios', {
			url: '/municipios',
			templateUrl: 'client/municipios/municipios.ng.html',
			controller: 'MunicipiosCtrl as mun',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.departamentos', {
			url: '/departamentos',
			templateUrl: 'client/departamentos/departamentos.ng.html',
			controller: 'DepartamentosCtrl as deptos',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.divisas', {
			url: '/divisas',
			templateUrl: 'client/divisas/divisas.ng.html',
			controller: 'DivisasCtrl as div',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.tiposIngreso', {
			url: '/tiposIngreso',
			templateUrl: 'client/tiposIngreso/tiposIngreso.ng.html',
			controller: 'TiposIngresoCtrl as tictrl',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cuentas', {
			url: '/cuentas',
			templateUrl: 'client/cuentas/cuentas.ng.html',
			controller: 'CuentasCtrl as ctactrl',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.documentos', {
			url: '/documentos',
			templateUrl: 'client/documentos/documentos.ng.html',
			controller: 'DocumentosCtrl as doc',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.sucursales', {
			url: '/sucursales',
			templateUrl: 'client/sucursales/sucursales.ng.html',
			controller: 'SucursalesCtrl as suc',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.gerentes', {
			url: '/gerentes',
			templateUrl: 'client/gerentes/gerentes.ng.html',
			controller: 'GerentesCtrl as ger',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.clientesLista', {
			url: '/clientes',
			templateUrl: 'client/clientes/clientesLista.ng.html',
			controller: 'ClientesListaCtrl as lcli',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.clientesForm', {
			url: '/clientesForm',
			templateUrl: 'client/clientes/clientesForm.ng.html',
			controller: 'ClientesFormCtrl as cli',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('anon.imprimirDoc', {
			url: '/imprimirDoc',
			templateUrl: 'client/clientes/imprimirDoc.ng.html',
			controller: 'ImprimirDocCtrl as dc',
			params: { 'documentoImagen': ':documentoImagen' },
		})
		.state('root.editarCliente', {
			url: '/editarCliente/:objeto_id',
			templateUrl: 'client/clientes/clientesForm.ng.html',
			controller: 'ClientesFormCtrl as cli',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.avalCliente', {
			url: '/editarCliente/:objeto_id/:tipo',
			templateUrl: 'client/clientes/clientesForm.ng.html',
			controller: 'ClientesFormCtrl as cli',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.editarDistribuidores', {
			url: '/editarDistribuidor/:objeto_id',
			templateUrl: 'client/distribuidores/distribuidoresForm.ng.html',
			controller: 'DistribuidoresFormCtrl as dis',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.avalesLista', {
			url: '/avales',
			templateUrl: 'client/avales/avalesLista.ng.html',
			controller: 'AvalesListaCtrl as lava',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.avalesForm', {
			url: '/avalesForm',
			templateUrl: 'client/avales/avalesForm.ng.html',
			controller: 'AvalesFormCtrl as ava',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.editarAval', {
			url: '/editarAval/:objeto_id',
			templateUrl: 'client/avales/avalesForm.ng.html',
			controller: 'AvalesFormCtrl as ava',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
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
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.distribuidoresDetalle', {
			url: '/distribuidores/:objeto_id',
			templateUrl: 'client/distribuidores/distribuidoresDetalle.html',
			controller: 'DistribuidoresDetalleCtrl as dis',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					setTimeout(() => {
						return $meteor.requireValidUser(function (user) {
							if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor", "Distribuidor"])) {
								return true;
							} else {
								return 'UNAUTHORIZED';
							}
						});
					}, 400);
				}]
			}
		})
		.state('root.distribuidoresForm', {
			url: '/distribuidoresForm',
			templateUrl: 'client/distribuidores/distribuidoresForm.ng.html',
			controller: 'DistribuidoresFormCtrl as dis',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.generadorPlan', {
			url: '/generadorPlan/:objeto_id/:op',
			templateUrl: 'client/planPagos/generadorPlan/generadorPlan.html',
			controller: 'GeneradorPlanCtrl as ge',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor", "Distribuidor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.actualizarPlan', {
			url: '/actualizarPlan/:objeto_id/:credito_id/:op',
			templateUrl: 'client/planPagos/actualizarPlan/generadorPlan.html',
			controller: 'ActualizarPlanCtrl as ae',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor", "Distribuidor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('anon.imprimirTabla', {
			url: '/imprimirTabla/:objeto_id/:credito_id',
			params: { 'planPagos': ':planPagos' },
			templateUrl: 'client/planPagos/generadorPlan/_imprimirTabla.html',
			controller: 'VerPlanPagosCtrl as vpp',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
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
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
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
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
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
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.pagarVale', {
			url: '/pagarVale/:objeto_id',
			templateUrl: 'client/planPagos/pagar/pagarVale.ng.html',
			controller: 'PagarValeCtrl as pagV',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					setTimeout(() => {
						return $meteor.requireValidUser(function (user) {
							if (Roles.userIsInRole(user._id, ["Cajero"])) {
								return true;
							} else {
								return 'UNAUTHORIZED';
							}
						});
					}, 200);
				}]
			}
		})
		.state('root.pagarValeLiquidar', {
			url: '/pagarValeLiquidar/:objeto_id',
			templateUrl: 'client/planPagos/pagar/pagarValeLiquidar.ng.html',
			controller: 'PagarValeLiquidarCtrl as pagV',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor"])) {
							return true;
						} else {
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
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.supervisoresLista', {
			url: '/supervisores',
			templateUrl: 'client/supervisores/supervisoresLista.ng.html',
			controller: 'SupervisoresListaCtrl as sup',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cajerosLista', {
			url: '/cajeros',
			templateUrl: 'client/cajeros/cajerosLista.ng.html',
			controller: 'CajerosListaCtrl as lven',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cajerosForm', {
			url: '/cajerosForm',
			templateUrl: 'client/cajeros/cajerosForm.ng.html',
			controller: 'CajerosFormCtrl as ven',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.supervisoresForm', {
			url: '/supervisoresForm',
			templateUrl: 'client/supervisores/supervisoresForm.ng.html',
			controller: 'SupervisoresFormCtrl as sup',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.editarSupervisor', {
			url: '/editarSupervisor/:objeto_id',
			templateUrl: 'client/supervisores/supervisoresForm.ng.html',
			controller: 'SupervisoresFormCtrl as sup',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (user.roles[0] == "Gerente") {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.editarCajero', {
			url: '/editarCajero/:objeto_id',
			templateUrl: 'client/cajeros/cajerosForm.ng.html',
			controller: 'CajerosFormCtrl as ven',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.editarVerificador', {
			url: '/editarVerificador/:objeto_id',
			templateUrl: 'client/verificadores/verificadoresForm.ng.html',
			controller: 'VerificadoresFormCtrl as ver',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
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
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.carteraVencida', {
			url: '/reportes/carteraVencida',
			templateUrl: 'client/reportes/_carteraVencida.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		//***********Reportes*****************************
		.state('root.reportes', {
			url: '/reportes',
			templateUrl: 'client/reportes/reportes.ng.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
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
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
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
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.reportesCreditosLiquidados', {
			url: '/reportes/reportesCreditosLiquidados',
			templateUrl: 'client/reportes/_reportesCreditosLiquidados.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.reportesSeguroDistribuidores', {
			url: '/reportes/reportesSeguroDistribuidores',
			templateUrl: 'client/reportes/_reportesSeguroDistribuidores.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.reportesBanco', {
			url: '/reportes/reportesBanco',
			templateUrl: 'client/reportes/_reportesBanco.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.reportesDocumentos', {
			url: '/reportes/reportesDocumentos',
			templateUrl: 'client/reportes/_reporteDocumentos.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.reporteClienteDistribuidores', {
			url: '/reportes/reporteClienteDistribuidores',
			templateUrl: 'client/reportes/_reporteClienteDistribuidores.html',
			controller: 'ReportesCtrl as re',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		//************************************************
		.state('root.verificadoresLista', {
			url: '/verificadores',
			templateUrl: 'client/verificadores/verificadoresLista.ng.html',
			controller: 'VerificadoresListaCtrl as lver',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.verificadoresForm', {
			url: '/verificadoresForm',
			templateUrl: 'client/verificadores/verificadoresForm.ng.html',
			controller: 'VerificadoresFormCtrl as ver',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cobranza', {
			url: '/cobranza',
			templateUrl: 'client/cobranza/cobranza.ng.html',
			controller: 'CobranzaCtrl as cob',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cobranzaVales', {
			url: '/cobranzaVales',
			templateUrl: 'client/cobranzaVales/cobranzaVales.ng.html',
			controller: 'CobranzaValesCtrl as cobv',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.panelVerificador', {
			url: '/panelverificador',
			templateUrl: 'client/verificadores/panel/panelVerificador.ng.html',
			controller: 'panelVerificadorCtrl as pver',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.verificacion', {
			url: '/verificacion/:id/:verificacion_id/:tipo/:persona',
			templateUrl: 'client/verificadores/verificacion.ng.html',
			controller: 'VerificacionCtrl as ver',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.verificacionVecino', {
			url: '/verificacionVecino/:id/:verificacion_id/:tipo/:persona',
			templateUrl: 'client/verificadores/verificacionVecino.ng.html',
			controller: 'VerificacionVecinoCtrl as verV',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})

		.state('root.historialPagos', {
			url: '/historialPagos/:objeto_id/:credito_id',
			templateUrl: 'client/historialPagos/historialPagos.ng.html',
			controller: 'HistorialPagosCtrl as hp',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.creditosPorAutorizar', {
			url: '/creditosPorAutorizar',
			templateUrl: 'client/creditos/creditosPorAutorizar/creditosPorAutorizar.html',
			controller: 'CreditosPorAutorizarCtrl as cpa',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.entregarCredito', {
			url: '/entregarCredito/:credito_id',
			templateUrl: 'client/creditos/entregarCredito/entregarCredito.ng.html',
			controller: 'EntregarCreditoCtrl as ecCtrl',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.entregarVale', {
			url: '/entregarVale/:credito_id',
			templateUrl: 'client/creditos/entregarCredito/entregarVale.ng.html',
			controller: 'EntregarValeCtrl as ecCtrl',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cajas', {
			url: '/cajas',
			templateUrl: 'client/cajas/cajas.ng.html',
			controller: 'CajasCtrl as caj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.cajasActivas', {
			url: '/cajas/activas',
			templateUrl: 'client/cajas/cajasActivas.ng.html',
			controller: 'CajasActivasCtrl as caaj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.movimientosCaja', {
			url: '/cajas/:caja_id/movimientos',
			templateUrl: 'client/cajas/movimientosCaja.ng.html',
			controller: 'MovimientosCajaCtrl as mcaj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.intraCajas', {
			url: '/cajas/traspasointra',
			templateUrl: 'client/cajas/intraCajas.ng.html',
			controller: 'IntraCajasCtrl as incaj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.traspasoCajaCuenta', {
			url: '/cajas/trascajacuenta',
			templateUrl: 'client/cajas/trasCajaCuenta.ng.html',
			controller: 'TraspasoCajaCuentaCtrl as tincc',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.traspasoCuentaCaja', {
			url: '/cajas/trascuentacaja',
			templateUrl: 'client/cajas/trasCuentaCaja.ng.html',
			controller: 'TraspasoCuentaCajaCtrl as tincuca',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.traspasoCuentaCuenta', {
			url: '/cuentas/traspaso',
			templateUrl: 'client/cuentas/traspaso.ng.html',
			controller: 'TraspasoCuentaCtrl as tincu',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.corteCaja', {
			url: '/cajas/corte/:caja_id/:cajero_id',
			templateUrl: 'client/cajas/corteCaja.ng.html',
			controller: 'CorteCajeCtrl as corcajCtrl',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.abrirCaja', {
			url: '/abricaja/:caja_id',
			templateUrl: 'client/cajas/abrirCaja.ng.html',
			controller: 'AbrirCajaCtrl as ocaj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.verCajaActiva', {
			url: '/verCajaActiva/:caja_id',
			templateUrl: 'client/cajas/verCajaActiva.html',
			controller: 'verCajaActivaCtrl as vca',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.verCajaInactiva', {
			url: '/verCajaInactiva/:caja_id/:corteCaja_id/:movimientosCaja_id',
			templateUrl: 'client/cajas/verCajaInactiva.html',
			controller: 'verCajaInactivaCtrl as vci',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.calculadora', {
			url: '/calculadora',
			templateUrl: 'client/administracion/calculadora.html',
			controller: 'calculadoraCtrl as cal',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('anon.imprimirCredito', {
			url: '/imprimirCredito',
			templateUrl: 'client/administracion/_imprimirCredito.html',
			controller: 'calculadoraCtrl as cal',
			params: { 'pago': ':pago' },
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('anon.imprimirResumen', {
			url: '/imprimir/resumen/:caja_id/:fechaApertura',
			params: { 'caja_id': ':caja_id', 'fechaApertura': ':fechaApertura' },
			templateUrl: 'client/cajas/resumen.ng.html',
			controller: 'CajaResumenCtrl as cj',
		})
		.state('anon.imprimirCorte', {
			url: '/imprimir/resumenCorte/:corte_id/',
			params: { 'corte_id': ':corte_id' },
			templateUrl: 'client/cajas/resumenCorte.ng.html',
			controller: 'CajaResumenCorteCtrl as cjc',
		})
		.state('root.diasInhabiles', {
			url: '/diasInhabiles',
			templateUrl: 'client/administracion/diasInhabiles.ng.html',
			controller: 'diasInhabilesCtrl as di',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.panelNotasCredito', {
			url: '/panelNotasCredito',
			templateUrl: 'client/administracion/notasCredito/panelNotasCredito.ng.html',
			controller: 'PanelNotasCreditoCtrl as pnc',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.validacionCARP', {
			url: '/validacionCARP',
			templateUrl: 'client/validacionCARP/validacionCARP.ng.html',
			controller: 'validacionCARPCtrl as valcarp',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.ver', {
			url: '/ver',
			templateUrl: 'client/clientes/ver.ng.html',
			controller: 'verCtrl as v',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.reimpresionTickets', {
			url: '/reimpresionTickets',
			templateUrl: 'client/reimpresionTickets/reimpresionTickets.ng.html',
			controller: 'ReimpresionTicketsCtrl as impt',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.importarClientes', {
			url: '/importarClientes',
			templateUrl: 'client/importarClientes/importarClientes.ng.html',
			controller: 'ImportarClientesCtrl as impC',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.importarNotas', {
			url: '/importarNotas',
			templateUrl: 'client/importarClientes/importarNotas.ng.html',
			controller: 'ImportarNotasCtrl as impN',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		///////////////////////////////////////////////
		.state('root.configuraciones', {
			url: '/configuraciones',
			templateUrl: 'client/configuraciones/configuraciones.ng.html',
			controller: 'ConfiguracionesCtrl as conf',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		///////////////////////////////////////////////
		.state('root.pagoSistema', {
			url: '/pagoSistema',
			templateUrl: 'client/pagoSistema/pagoSistema.ng.html',
			controller: 'PagoSistemaCtrl as pags',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.generarMultas', {
			url: '/generarMultas',
			templateUrl: 'client/generarMultas/generarMultas.ng.html',
			controller: 'GenerarMultasCtrl as genM',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.prospectos', {
			url: '/prospectos',
			templateUrl: 'client/prospectos/prospectos.ng.html',
			controller: 'ProspectosCtrl as pros',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.prospectosLista', {
			url: '/prospectosLista',
			templateUrl: 'client/prospectos/prospectosLista.ng.html',
			controller: 'ProspectosListaCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.prospectosForm', {
			url: '/prospectosForm',
			templateUrl: 'client/prospectos/prospectosForm.ng.html',
			controller: 'ProspectosFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.prospectosFormEditar', {
			url: '/prospectosFormEditar/:objeto_id',
			templateUrl: 'client/prospectos/prospectosForm.ng.html',
			controller: 'ProspectosFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.panelProspectos', {
			url: '/panelProspectos',
			templateUrl: 'client/prospectos/panelProspectos.ng.html',
			controller: 'PanelProspectosCtrl as ppros',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.beneficiarios', {
			url: '/beneficiarios',
			templateUrl: 'client/beneficiarios/beneficiarios.ng.html',
			controller: 'BeneficiariosCtrl as ben',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.miPerfil', {
			url: '/distribuidores/:objeto_id',
			templateUrl: 'client/distribuidores/distribuidoresDetalle.html',
			controller: 'DistribuidoresDetalleCtrl as dis',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor", "Distribuidor"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.panelSolicitudesVales', {
			url: '/panelSolicitudesVales',
			templateUrl: 'client/distribuidores/panelSolicitudesVales.ng.html',
			controller: 'PanelSolicitudesValesCtrl as psolv',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.panelValesAcreditados', {
			url: '/panelValesAcreditados',
			templateUrl: 'client/distribuidores/panelValesAcreditados.ng.html',
			controller: 'PanelValesAcreditadosCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.beneficiariosLista', {
			url: '/beneficiariosLista',
			templateUrl: 'client/beneficiarios/beneficiariosLista.ng.html',
			controller: 'BeneficiariosListaCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.beneficiariosFormEditar', {
			url: '/beneficiariosFormEditar/:objeto_id',
			templateUrl: 'client/beneficiarios/beneficiariosForm.ng.html',
			controller: 'BeneficiariosFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.prospectosCreditoPersonalEditarForm', {
			url: '/prospectosCreditoPersonalEditarForm/:objeto_id',
			templateUrl: 'client/prospectosCreditoPersonal/prospectosCreditoPersonal.html',
			controller: 'prospectosCreditoPersonalFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		/////////////////Promotoras///////////////////
		.state('root.promotorasLista', {
			url: '/promotorasLista',
			templateUrl: 'client/promotoras/promotorasLista.ng.html',
			controller: 'PromotorasListaCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.promotorasForm', {
			url: '/promotorasForm',
			templateUrl: 'client/promotoras/promotorasForm.ng.html',
			controller: 'PromotorasFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.editarPromotora', {
			url: '/promotorasForm/:objeto_id',
			templateUrl: 'client/promotoras/promotorasForm.ng.html',
			controller: 'PromotorasFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.miPerfilPromotora', {
			url: '/promotoras/:objeto_id',
			templateUrl: 'client/promotoras/promotorasDetalle.html',
			controller: 'PromotorasDetalleCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Cajero", "Verificador", "Supervisor", "Promotora"])) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.prospectosDistribuidorForm', {
			url: '/prospectosDistribuidorForm',
			templateUrl: 'client/promotoras/prospectosDistribuidor/prospectosDistribuidorForm.ng.html',
			controller: 'ProspectosDistribuidorFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.prospectosDistribuidorFormEditar', {
			url: '/prospectosDistribuidorFormEditar/:objeto_id',
			templateUrl: 'client/promotoras/prospectosDistribuidor/prospectosDistribuidorForm.ng.html',
			controller: 'ProspectosDistribuidorFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})//Es el del perfil de la promotora
		.state('root.prospectosDistribuidor', {
			url: '/prospectosDistribuidor',
			templateUrl: 'client/promotoras/prospectosDistribuidor/prospectosDistribuidor.ng.html',
			controller: 'ProspectosDistribuidorCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})//Es el perfil de credito mio
		.state('root.panelProspectosCreditosPersonalesDestribuidores', {
			url: '/panelProspectosCreditosPersonalesDestribuidores',
			templateUrl: 'client/promotoras/panelProspectosCreditosPersonalesDestribuidores.ng.html',
			controller: 'PanelProspectosCreditosPersonalesDestribuidoresCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.misSolicitudes', {
			url: '/misSolicitudes',
			templateUrl: 'client/promotoras/misSolicitudes.html',
			controller: 'MisSolicitudesCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.misProspectos', {
			url: '/misProspectos',
			templateUrl: 'client/promotoras/misProspectos.html',
			controller: 'MisProspectosCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.pagarPromotora', {
			url: '/misProspectos/:objeto_id',
			templateUrl: 'client/planPagos/pagar/pagarPromotora.html',
			controller: 'PagarPromotoraCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})


		////////////////Solicitudes Clientes Distribuidores/////////////////////////////////////////////////////////////////////
		.state('root.panelAsignaSucursalSolicitudesCD', {
			url: '/panelAsignaSucursalSolicitudesCD',
			templateUrl: 'client/solicitudesClientesDistribuidores/panelAsignaSucursalSolicitudesCD.html',
			controller: 'PanelAsignaSucursalSolicitudesCD as obj',
			resolve: {
				"currentUser": ["$meteor", "toastr", function ($meteor, toastr) {
					return $meteor.requireValidUser(function (user) {
						if (Roles.userIsInRole(user._id, ["Gerente", "Supervisor"]) || user.profile.asignarSolicitudesSucursal == true) {
							return true;
						} else {
							return 'UNAUTHORIZED';
						}
					});
				}]
			}
		})
		.state('root.panelSolicitudesCD', {
			url: '/panelSolicitudesCD',
			templateUrl: 'client/solicitudesClientesDistribuidores/panelSolicitudesCD.html',
			controller: 'PanelSolicitudesCD as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.solicitudCreditoPersonalForm', {
			url: '/solicitudCreditoPersonalForm',
			templateUrl: 'client/prospectos/creditosPersonales/solicitudCreditoPersonal.html',
			controller: 'SolicitudCreditoPersonalFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.solicitudCreditoPersonalEditarForm', {
			url: '/solicitudCreditoPersonalEditarForm/:id',
			templateUrl: 'client/prospectos/creditosPersonales/solicitudCreditoPersonal.html',
			controller: 'SolicitudCreditoPersonalFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.solicitudDistribuidorForm', {
			url: '/solicitudDistribuidorForm',
			templateUrl: 'client/prospectos/distribuidor/solicitudDistribuidor.html',
			controller: 'SolicitudDistribuidorFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})
		.state('root.solicitudDistribuidorEditarForm', {
			url: '/solicitudDistribuidorEditarForm/:id',
			templateUrl: 'client/prospectos/distribuidor/solicitudDistribuidor.html',
			controller: 'SolicitudDistribuidorFormCtrl as obj',
			resolve: {
				"currentUser": ["$meteor", function ($meteor) {
					return $meteor.requireUser();
				}]
			}
		})



	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}]);

function irArriba() {
	$("html, body").animate({ scrollTop: 0 }, "slow");
}