angular
	.module("creditoMio")
	.controller("PagarPlanPagosCtrl", PagarPlanPagosCtrl);

function PagarPlanPagosCtrl($scope, $filter, $meteor, $reactive, $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	this.action = false;
	this.fechaActual = new Date();

	window.rc = rc;
	this.credito_id = "";

	this.credito = {};
	this.pago = {};
	this.pago.pagar = 0;
	this.pago.totalPago = 0;
	this.pago.totalito = 0
	this.creditos = [];
	this.creditos_id = []
	this.total = 0;
	rc.credit = $stateParams
	this.creditoAp = true;
	this.masInfo = true;
	this.masInfo = true;
	this.masInfoCredito = true;
	rc.openModal = false
	rc.foliosCreditos = [];

	this.valorOrdenar = "Folio";


	rc.creditoRefinanciar = {};
	rc.creditosAutorizados = [];
	rc.pagoR = {};
	rc.subtotal = 0;
	rc.cargosMoratorios = 0;
	rc.total = 0;

	rc.selectedRow = null;  // initialize our variable to null
	//console.log(rc.credito)

	this.subscribe('planPagos', () => {
		return [{
			cliente_id: $stateParams.objeto_id,
			credito_id: { $in: rc.getCollectionReactively("creditos_id") },
			importeRegular: { $gt: 0 }
		}];
	});

	this.subscribe("tiposCredito", () => {
		return [{ estatus: true, sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});

	this.subscribe('cliente', () => {
		return [{ _id: $stateParams.objeto_id }];
	});

	this.subscribe('creditos', () => {
		return [{ cliente_id: $stateParams.objeto_id, estatus: { $in: [2, 4] } }];
	});
	this.subscribe('pagos', () => {
		return [{ estatus: true }];
	});

	this.subscribe('personas', () => {
		return [{}];
	});
	this.subscribe('tiposIngreso', () => {
		return [{ estatus: true }]
	});

	this.subscribe('cuentas', () => {
		return [{}]
	});

	this.subscribe('cajas', () => {
		return [{
			usuario_id: Meteor.userId()
		}]
	});


	this.subscribe('notasCreditoTop1', () => {
		return [{
			cliente_id: $stateParams.objeto_id, saldo: { $gt: 0 }, estatus: 1
		}]
	});


	this.helpers({
		notasCredito: () => {
			return NotasCredito.find({ cliente_id: $stateParams.objeto_id, saldo: { $gt: 0 }, estatus: 1 }).fetch();
		},
		objeto: () => {
			var cli = Meteor.users.findOne({ _id: $stateParams.objeto_id });

			_.each(rc.getReactively("notaPerfil"), function (nota) {
				//console.log(rc.notaPerfil.cliente_id,"nota a l avga")
				if (cli._id == rc.notaPerfil.cliente_id) {
					//console.log("entro aqui compilla")
					$("#notaPerfil").modal();
				}
			});

			_.each(cli, function (objeto) {
				//console.log(objeto,"objeto")
				rc.referencias = [];
				//rc.empresas = [];

				objeto.empresa = Empresas.findOne(objeto.empresa_id)
				// objeto.documento = Documentos.findOne(objeto.docuemnto_id)
				objeto.documento = Documentos.findOne(objeto.documento_id)
				objeto.pais = Paises.findOne(objeto.pais_id)
				objeto.estado = Estados.findOne(objeto.estado_id)
				objeto.municipio = Municipios.findOne(objeto.municipio_id)
				objeto.ciudad = Ciudades.findOne(objeto.ciudad_id)
				objeto.colonia = Colonias.findOne(objeto.colonia_id)
				objeto.ocupacion = Ocupaciones.findOne(objeto.ocupacion_id)
				objeto.nacionalidad = Nacionalidades.findOne(objeto.nacionalidad_id)
				objeto.estadoCivil = EstadoCivil.findOne(objeto.estadoCivil_id)

				_.each(objeto.referenciasPersonales_ids, function (referencia) {
					Meteor.call('getReferencias', referencia, function (error, result) {
						if (result) {
							//console.log("entra aqui");
							//console.log("result",result);
							rc.referencias.push(result);
							$scope.$apply();
						}
					});
				});

				Meteor.call('getEmpresas', objeto.empresa_id, function (error, result) {
					if (result) {
						rc.empresa = result
						$scope.$apply();
					}
				});

			});

			if (cli) {
				this.ocupacion_id = cli.profile.ocupacion_id;
				return cli;
			}
		},
		tiposIngreso: () => {

			var ti = TiposIngreso.find().fetch();

			if (ti != undefined) {
				var fondos = Cuentas.find({}).fetch();
				//console.log("Fonfo:",fondos);  	
				if (fondos != undefined) {
					_.each(ti, function (tipo) {

						var fondo = Cuentas.findOne({ tipoIngreso_id: tipo._id });
						if (fondo != undefined)
							tipo.tipoCuenta = fondo.tipoCuenta;
					});
				}
				return ti;
			}
		},
		tiposCredito: () => {
			return TiposCredito.find();
		},
		planPagosViejo: () => {
			var colores = ['active', 'info', 'warning', 'success', 'danger'];
			var asignados = [];
			var pp = PlanPagos.find({ importeRegular: { $gt: 0 } }, { sort: { fechaLimite: 1, numeroPago: 1, descripcion: -1 } }).fetch();
			//console.log(pp);
			rc.subtotal = 0;
			rc.cargosMoratorios = 0;

			if (pp != undefined) {
				_.each(pp, function (pago) {
					pago.credito = Creditos.findOne(pago.credito_id);
					pago.color = colores[0];
					//var credito = Creditos.findOne({_id:pago.credito_id});
					pago.verCargo = true;

					if (pago.descripcion == "Recibo")
						rc.subtotal += pago.importeRegular;
					else if (pago.descripcion == "Cargo Moratorio") {
						rc.cargosMoratorios += pago.importeRegular;
						//console.log("Entro: CM", pago)
					}
					pago.folio = pago.credito.folio;

					if (pago.pagoSeguro != undefined)
						pago.seguro = pago.seguro - pago.pagoSeguro;

					if (pago.pagoIva != undefined)
						pago.iva = pago.iva - pago.pagoIva;

					if (pago.pagoInteres != undefined)
						pago.interes = pago.interes - pago.pagoInteres;

					if (pago.pagoCapital != undefined)
						pago.capital = pago.capital - pago.pagoCapital;

				});

				pp = $filter('orderBy')(pp, 'folio')
				_.each(pp, function (pago) {
					if (asignados[pago.credito.folio] == undefined) {
						ultimo = _.last(asignados);
						asignados[pago.credito.folio] = (ultimo == undefined ? 0 : ultimo + 1 > 4 ? ultimo - 4 : ultimo + 1);
					}
					pago.color = colores[asignados[pago.credito.folio]];
					rc.total = rc.subtotal + rc.cargosMoratorios;
				});
			}

			return pp;

		},
		creditos: () => {
			var creditos = Creditos.find({ estatus: 4 }).fetch();
			if (creditos != undefined) {
				rc.creditos_id = _.pluck(creditos, "_id");

				_.each(creditos, function (credito) {
					credito.planPagos = PlanPagos.find({ credito_id: credito._id }, { sort: { numeroPago: -1 } }).fetch();
					credito.nombreTipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
				})
			}

			if (creditos) {
				_.each(creditos, function (credito) {
					// credito[0].color = credito.folio

					_.each(credito.avales_ids, function (aval) {
						credito.aval = Personas.findOne(aval)

					});

				})
			}

			return creditos;
		},
		pagos: () => {
			return Pagos.find().fetch()
		},
		pagosReporte: () => {
			_.each(rc.planPagosViejo, function (pp) {
				var pagos = pp.pagos
			});

			return Pagos.find().fetch()
		},
		notas: () => {
			return Notas.find().fetch();
		},
		caja: () => {
			var c = Cajas.findOne({ usuario_id: Meteor.userId() });
			if (c != undefined) {
				return c;
			}
		},
	});


	this.getFolio = function (credito_id) {
		var credito = Creditos.findOne(credito_id);
		return credito ? credito.folio : "";

	};

	this.getnumeroPagos = function (credito_id) {
		var credito = Creditos.findOne(credito_id);
		return credito ? credito.numeroPagos : "";

	};

	this.editar = function (pago) {
		this.pago = pago;
		this.action = false;
		$('.collapse').collapse('show');
		this.nuevo = false;
	};

	this.cambiarEstatus = function (pago, estatus, tipoMov) {
		var res = confirm("Está seguro que quiere " + tipoMov + " el pago?");
		if (res == true) {
			PlanPagos.update(pago._id, { $set: { estatus: estatus } });
			toastr.success('Cancelado correctamente.');
		}
	}


	this.tieneFoto = function (sexo, foto) {
		if (foto === undefined) {
			if (sexo === "Masculino")
				return "img/badmenprofile.png";
			else if (sexo === "Femenino") {
				return "img/badgirlprofile.png";
			} else {
				return "img/badprofile.png";
			}
		} else {
			return foto;
		}
	}

	this.seleccionarPago = function (pago) {
		pago.pagoSeleccionado = !pago.pagoSeleccionado;
		pago.estatus = 0;
		rc.pago.totalPago = 0;

		if (pago.pagoSeleccionado == true && pago.movimiento == "Cargo Moratorio") {
			pago.importeRegular = Number(parseFloat(pago.importeRegular).toFixed(2));
			pago.importepagado = Number(parseFloat(pago.importeRegular).toFixed(2));
			pago.pagoSeleccionado = true;

		}

		if (!pago.pagoSeleccionado)
			pago.importepagado = 0;
		_.each(rc.planPagosViejo, function (p) {
			if (p.verCargo) {
				if (!pago.pagoSeleccionado && pago.credito_id == p.credito_id && p.numeroPago > pago.numeroPago && p.estatus != 1 && pago.movimiento == "Recibo") {
					p.importepagado = 0;
					p.pagoSeleccionado = false;
				}
				if (pago.pagoSeleccionado && pago.credito_id == p.credito_id && p.numeroPago <= pago.numeroPago && p.estatus != 1 && pago.movimiento == "Recibo") {
					p.importeRegular = Number(parseFloat(p.importeRegular).toFixed(2));
					p.importepagado = Number(parseFloat(p.importeRegular).toFixed(2));
					p.pagoSeleccionado = true;
				}

				if (p.pagoSeleccionado != undefined) {
					if (p.pagoSeleccionado == true) {
						rc.pago.totalPago += Number(parseFloat(p.importepagado).toFixed(2));
					}
				}
			}
		});
		rc.pago.totalPago = Number(parseFloat(rc.pago.totalPago).toFixed(2));
	}

	this.seleccionarMontoPago = function (pago) {
		rc.pago.totalPago = 0;
		var i = 0;
		_.each(rc.planPagosViejo, function (p) {
			if (p.verCargo) {
				if (pago.credito_id == p.credito_id && p.numeroPago < pago.numeroPago && p.estatus != 1) {
					p.importeRegular = Number(p.importeRegular).toFixed(2);
					p.importepagado = parseFloat(p.importeRegular);
					p.pagoSeleccionado = true;
					p.estatus = 0;
				}
				if (pago == p) {
					p.estatus = 0;
					p.pagoSeleccionado = true;
					if (p.importepagado > p.importeRegular) {
						p.importeRegular = Number(p.importeRegular).toFixed(2);
						p.importepagado = parseFloat(p.importeRegular);
					}
					if (p.importepagado <= 0 || !p.importepagado || isNaN(p.importepagado)) {
						//p.importepagado = 0
						p.pagoSeleccionado = false;
					}
				}
				if (p.pagoSeleccionado != undefined) {
					if (p.pagoSeleccionado == true) {
						rc.pago.totalPago += p.importepagado;
					}
				}
			}
		});
	}

	this.funcionOrdenar = function () {

		if (this.valorOrdenar == "Folio")
			return ['folio'];
		if (this.valorOrdenar == "Fecha")
			return ['fechaLimite'];
		if (this.valorOrdenar == "Recibo")
			return ['numeroPago'];
	};

	this.guardarPago = function (pago, credito) {

		if (rc.caja.estadoCaja == "Cerrada") {
			toastr.error("La caja esta cerrada, favor de reportar con el Gerente");
			return;
		}


		if (this.pago.tipoIngreso_id == undefined) {
			toastr.warning("Seleccione una forma de pago");
			return;
		}

		if (pago.pagar == undefined || pago.pagar <= 0) {
			toastr.warning("Ingrese la cantidad a cobrar correctamente");
			return;
		}

		if (Number(parseFloat(pago.pagar).toFixed(2)) < Number(parseFloat(pago.totalPago).toFixed(2))) {
			toastr.warning("No alcanza a pagar con el total ingresado");
			return;
		}

		if (pago.totalPago == 0) {
			toastr.warning("No hay nada que cobrar");
			return;
		}

		$("#cobrar").prop("disabled", true);

		//Validar que sea completo el crédito a pagar    
		var tipoIngreso = TiposIngreso.findOne(pago.tipoIngreso_id);
		if (tipoIngreso.nombre == "REFINANCIAMIENTO") {

			//Validar que no tenga cargos Moratorios
			var CM = 0;

			var pp = PlanPagos.find({ movimiento: "Cargo Moratorio" }).fetch();
			_.each(pp, function (pago) {

				CM += pago.importeRegular;
			});

			if (CM > 0) {
				toastr.warning("No es posible refinanciar con cargos moratorios");
				$("#cobrar").prop("disabled", false);
				return;
			}


			//Validar si hay creditos Autorizados
			rc.creditosAutorizados = Creditos.find({ estatus: 2 }).fetch();
			//console.log(rc.creditosAutorizados);
			if (rc.creditosAutorizados.length == 0) {
				toastr.warning("No existen créditos autorizados para liquidar los pagos");
				$("#cobrar").prop("disabled", false);
				return;
			}

			//Si existen creditos Validar que alcance sobre el total
			var ban = false;
			_.each(rc.creditosAutorizados, function (ca) {
				if (ca.capitalSolicitado >= pago.totalPago) {
					ban = true;
					ca.esRefinanciado = ban;
				}
			});

			if (!ban) {
				toastr.warning("El cliente no tiene al menos un crédito autorizado que pueda liquidar el crédito actual");
				$("#cobrar").prop("disabled", false);
				return;
			}
			rc.pagoR = pago;
			//Abrir el modal de los creditos
			$("#modalRefinanciamiento").modal('show');

		}
		else {
			var fechaProximoPago = "";

			if (tipoIngreso.nombre == "Nota de Credito") {
				//Revisar que tenga notas de credito si no para que ir al Metodo
				var nc = NotasCredito.findOne({});
				if (nc.length == 0) {
					toastr.warning("El cliente no tiene notas de credito por aplicar");
					$("#cobrar").prop("disabled", false);
					return;
				}

				//Validar que es lo que se va a pagar recibo, cargo o ambos
				var sePagaraRecibo = false;
				var sePagaraCargo = false;


				var fechaProximoPagoArray = [];

				var seleccionadosId = [];
				_.each(rc.planPagosViejo, function (p) {
					if (p.pagoSeleccionado) {
						if (p.descripcion == "Recibo") sePagaraRecibo = true;
						if (p.descripcion == "Cargo Moratorio") sePagaraCargo = true;
						seleccionadosId.push({ id: p._id, importe: p.importepagado })
					}
					if (p.importepagado != p.importeRegular)
						fechaProximoPagoArray.push(p.fechaLimite);
				});

				fechaProximoPago = new Date(Math.min.apply(null, fechaProximoPagoArray));

				if (fechaProximoPago == "Invalid Date")
					fechaProximoPago = "";

				if (nc.aplica == "RECIBO" && sePagaraCargo == true) {
					toastr.warning("La nota de crédito es solo para recibos");
					$("#cobrar").prop("disabled", false);
					return;
				}

				if (nc.aplica == "CARGO MORATORIO" && sePagaraRecibo == true) {
					toastr.warning("La nota de crédito es solo para cargos moratorios");
					$("#cobrar").prop("disabled", false);
					return;
				}
			}
			else {

				var fechaProximoPagoArray = [];

				var seleccionadosId = [];
				_.each(rc.planPagosViejo, function (p) {
					if (p.pagoSeleccionado) {
						if (p.descripcion == "Recibo") sePagaraRecibo = true;
						if (p.descripcion == "Cargo Moratorio") sePagaraCargo = true;
						seleccionadosId.push({ id: p._id, importe: p.importepagado })
					}

					if (p.importepagado != p.importeRegular)
						fechaProximoPagoArray.push(p.fechaLimite);
				});

				fechaProximoPago = new Date(Math.min.apply(null, fechaProximoPagoArray));

				if (fechaProximoPago == "Invalid Date")
					fechaProximoPago = "";

			}

			loading(true);
			Meteor.call("pagoParcialCredito", seleccionadosId,
				pago.pagar,
				pago.totalPago,
				pago.tipoIngreso_id,
				$stateParams.objeto_id,
				rc.ocultarMultas,
				rc.subtotal,
				rc.cargosMoratorios,
				rc.total,
				fechaProximoPago,
				pago.fechaDeposito,
				0, function (error, success) {
					if (!success) {

						toastr.error('Error al guardar.', success);
						$("#cobrar").prop("disabled", false);
						return;
					}
					loading(false);

					$("#cobrar").prop("disabled", false);

					toastr.success('Guardado correctamente.');
					rc.pago = {};
					rc.pago.totalPago = 0;
					rc.pago.totalito = 0
					rc.pago.fechaEntrega = pago.fechaEntrega
					rc.ocultarMultas = false;
					var url = $state.href("anon.imprimirTicket", { pago_id: success }, { newTab: true });
					window.open(url, '_blank');
					rc.tipoIngresoSeleccionado = {};
				});
		}
	};

	this.creditosAprobados = function () {
		this.creditoAp = !this.creditoAp;
	}

	this.verPagos = function (credito) {
		//console.log(credito,"el ob ")
		rc.credito = credito;
		rc.credito_id = credito._id;
		$("#modalpagos").modal();
		credito.pagos = Pagos.find({ credito_id: rc.getReactively("credito_id") }).fetch()
		rc.pagos = credito.pagos
		rc.openModal = true

		////console.log(rc.pagos,"pagos")
		//console.log(rc.historial,"historial act")


	};

	$(document).ready(function () {
		$('body').addClass("hidden-menu");

		//Quita el mouse wheels 
		document.getElementById('cobro').onwheel = function () { return false; }


	});

	this.ocultar = function () {
		rc.subtotal = 0;
		rc.cargosMoratorios = 0;
		rc.total = 0;

		_.each(this.planPagosViejo, function (pago) {

			if (pago.descripcion == "Cargo Moratorio") {
				pago.verCargo = !pago.verCargo;
			}

			if (pago.pagoSeleccionado == true && pago.verCargo == false) {
				pago.pagoSeleccionado = false;
				//console.log("false:", pago.importepagado);
				//console.log("false:", rc.pago.totalPago);
				rc.pago.totalPago = rc.pago.totalPago - Number(parseFloat(pago.importepagado).toFixed(2));
				pago.importepagado = 0;
			}
			if (pago.verCargo == true) {

				if (pago.descripcion == "Recibo") {
					rc.subtotal = rc.subtotal + Number(parseFloat(pago.importeRegular).toFixed(2));

				}
				if (pago.descripcion == "Cargo Moratorio")
					rc.cargosMoratorios += Number(parseFloat(pago.importeRegular).toFixed(2));


			}
			else if (pago.verCargo == false) {
				if (pago.descripcion == "Recibo")
					rc.subtotal += Number(parseFloat(pago.importeRegular).toFixed(2));
				/*
if(pago.descripcion=="Cargo Moratorio")
					rc.cargosMoratorios = 0;
*/
			}

		});


		rc.total = rc.subtotal + rc.cargosMoratorios;

	};

	this.guardarRefinanciamiento = function () {

		var fechaProximoPago = "";
		rc.creditoRefinanciar.refinanciar = Number(parseFloat(rc.pagoR.totalPago).toFixed(2));


		var fechaProximoPagoArray = [];
		var seleccionadosId = [];
		_.each(rc.planPagosViejo, function (p) {
			if (p.pagoSeleccionado) {
				if (p.descripcion == "Recibo") sePagaraRecibo = true;
				if (p.descripcion == "Cargo Moratorio") sePagaraCargo = true;
				seleccionadosId.push({ id: p._id, importe: p.importepagado })
			}

			if (p.importepagado != p.importeRegular)
				fechaProximoPagoArray.push(p.fechaLimite);

		});

		fechaProximoPago = new Date(Math.min.apply(null, fechaProximoPagoArray));

		if (fechaProximoPago == "Invalid Date")
			fechaProximoPago = "";

		//Cantidad a refinanciar
		var cantidadEntregar = Number(parseFloat(rc.creditoRefinanciar.capitalSolicitado - rc.creditoRefinanciar.refinanciar).toFixed(2));

		//cons ole.log(seleccionadosId, pago.pagar, pago.totalPago, pago.tipoIngreso_id)
		Meteor.call("pagoParcialCredito", seleccionadosId,
			rc.pagoR.pagar,
			rc.pagoR.totalPago,
			rc.pagoR.tipoIngreso_id,
			$stateParams.objeto_id,
			rc.ocultarMultas,
			rc.subtotal,
			rc.cargosMoratorios,
			rc.total,
			fechaProximoPago,
			undefined,
			cantidadEntregar, function (error, success) {
				if (!success) {
					toastr.error('Error al guardar.');
					$("#cobrar").prop("disabled", false);
					return;
				}
				//console.log("Entro a actualizar ");
				//Actualizar Creditos

				//var tempId = rc.creditoRefinanciar._id;
				//delete rc.creditoRefinanciar._id;
				Creditos.update({ _id: rc.creditoRefinanciar._id }, { $set: { esRefinanciado: true, refinanciar: rc.creditoRefinanciar.refinanciar } });

				toastr.success('Guardado correctamente.');
				$("#cobrar").prop("disabled", false);

				rc.pago = {};
				rc.pago.totalPago = 0;
				rc.pago.totalito = 0
				rc.pago.fechaEntrega = rc.pagoR.fechaEntrega
				var url = $state.href("anon.imprimirTicket", { pago_id: success }, { newTab: true });
				window.open(url, '_blank');

			});


		$("#modalRefinanciamiento").modal('hide');
	}

	this.marcarRefinanciamiento = function (credito, index) {
		//console.log(credito);
		rc.selectedRow = index;
		rc.creditoRefinanciar = credito;

		//console.log(index);
		//console.log(rc.selectedRow);

	}

	this.cerrarRefinanciamiento = function () {
		rc.modalRefinanciamiento = false;

	}

	this.seleccionTipoIngreso = function (tipoIngreso) {

		var ti = TiposIngreso.findOne(tipoIngreso);
		rc.tipoIngresoSeleccionado = Cuentas.findOne({ tipoIngreso_id: tipoIngreso });

		if (ti.nombre == "Nota de Credito") {
			var p = document.getElementById('cobro');
			p.disabled = true;

			var nc = NotasCredito.findOne({ cliente_id: $stateParams.objeto_id, saldo: { $gt: 0 }, estatus: 1 });
			if (nc != undefined) {
				this.pago.pagar = Number(parseFloat(nc.saldo).toFixed(2));
			}
			else
				this.pago.pagar = 0;
		}
		else {
			var p = document.getElementById('cobro');
			p.disabled = false;
			this.pago.pagar = 0;
		}

	}


	this.setClickedRow = function (index) {  //function that sets the value of selectedRow to current index
		//console.log(index);
		rc.selectedRow = index;
	}

};