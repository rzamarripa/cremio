angular
  .module("creditoMio")
  .controller("PagarPromotoraCtrl", PagarPromotoraCtrl);

function PagarPromotoraCtrl($scope, $filter, $meteor, $reactive, $state, $stateParams, toastr) {

  let rc = $reactive(this).attach($scope);
  this.action = false;
  this.fechaActual = new Date();

  window.rc = rc;

  this.pago = {};
  this.pago.totalPago = 0;

  rc.totalComisiones = 0;
  rc.ban = false;
  rc.selected_numero = 0;
  rc.arregloComisiones = [];

  rc.creditoRefinanciar = {};
  rc.creditosAutorizados = [];

  rc.numeroPagosSeleccionados = 0;

  rc.promotora_id = $stateParams.objeto_id;

  this.subscribe('sucursales', () => {
		return [{}]
	},
		{
			onReady: function () {
				rc.sucursales = Sucursales.find({ estatus: true }).fetch();
			}
		});

  this.subscribe('cliente', () => {
    return [{ _id: $stateParams.objeto_id }];
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

  this.subscribe('configuraciones', () => {
    return [{}];
  },
    {
      onReady: function () {
        const configuraciones = Configuraciones.findOne({});
        rc.comisionCreditoPersonal = configuraciones.comisionPromotoraCreditoPersonal;
        rc.comisionDistribuidor = configuraciones.comisionPromotoraDistribuidor;
      }
    });

  this.subscribe('creditosPromotoraComposite', () => {
    return [{
      options: {
        skip: rc.getReactively("numeroPagina"),
        limit: rc.avance
      },
      where: {
        promotora_id: rc.promotora_id,
        estaPagadoComision: false,
      }
    }];
  });


  this.helpers({
    objeto: () => {
      var cli = Meteor.users.findOne({ _id: rc.promotora_id });
      return cli;
    },
    tiposIngreso: () => {

      var ti = TiposIngreso.find({}, { sort: { nombre: 1 } }).fetch();

      if (ti != undefined) {
        var fondos = Cuentas.find({}).fetch();
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
    caja: () => {
      var c = Cajas.findOne({ usuario_id: Meteor.userId() });
      if (c != undefined) {
        return c;
      }
    },
    comisiones: () => {
      var arreglo = {};
      rc.totalComisiones = 0;
      var comisiones = Creditos.find({ promotora_id: rc.promotora_id }, { sort: { fechaEntrega: 1 } }).map(function (c) {

        //obtener los datos del crédito
        c.cliente = Meteor.users.findOne(c.cliente_id).profile.nombreCompleto;
        c.usuario = Meteor.users.findOne(c.usuario_id).profile.nombre;
        c.sucursal = Sucursales.findOne(c.sucursal_id).nombreSucursal;
        c.pagoSeleccionado = true;

        var fecha = new Date(c.fechaEntrega)
        var dia = fecha.getDate();
        var numeroQuincena = "";
        var subindice = "";
        var numeroDia = 0;
        if (dia <= 15) {
          numeroQuincena = "1";
          numeroDia = 15;
        }
        else {
          numeroQuincena = "2";
          numeroDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
        }

        if (c.tipo == "creditoP") {
          c.tipoCredito = "Crédito Personal";
          c.comision = rc.comisionCreditoPersonal
        }
        else if (c.tipo == "vale") {
          c.tipoCredito = "Vale";
          c.comision = rc.comisionDistribuidor
        }
        else {
          c.tipoCredito = "Crédito Personal Distribuidor";
          c.comision = rc.comisionCreditoPersonal;
        }


        subindice = numeroQuincena + "-" + (fecha.getMonth() + 1) + "-" + fecha.getFullYear();
        if (arreglo[subindice] == undefined) {
          arreglo[subindice] = {};
          arreglo[subindice].creditos = [];
          arreglo[subindice].creditos.push(c);
          arreglo[subindice].quincena = numeroQuincena;
          arreglo[subindice].cantidad = 1;
          arreglo[subindice].pagoSeleccionado = true;

          arreglo[subindice].fecha = new Date(fecha.getFullYear(), fecha.getMonth() + 1, numeroDia);

          if (c.tipo == "creditoP") {
            arreglo[subindice].comisiones = rc.comisionCreditoPersonal;
          }
          else if (c.tipo == "vale")
            arreglo[subindice].comisiones = rc.comisionDistribuidor;

        }
        else {
          arreglo[subindice].creditos.push(c);
          arreglo[subindice].quincena = numeroQuincena;
          arreglo[subindice].cantidad++;
          arreglo[subindice].fecha = new Date(fecha.getFullYear(), fecha.getMonth() + 1, numeroDia);
          if (c.tipo == "creditoP")
            arreglo[subindice].comisiones += rc.comisionCreditoPersonal;
          else if (c.tipo == "vale")
            arreglo[subindice].comisiones += rc.comisionDistribuidor;
        }
        rc.totalComisiones += arreglo[subindice].comisiones;

        return c;
      });
      rc.arregloComisiones = _.toArray(arreglo);
    },
  });

  //Este es la columna + - (todos)
  this.seleccionarTodos = function (objeto) {
    rc.totalComisiones = 0;
    //Cambiar el estatus
    objeto.pagoSeleccionado = !objeto.pagoSeleccionado;
    _.each(objeto.creditos, function (c) {
      c.pagoSeleccionado = objeto.pagoSeleccionado;
    });

    //sumar el total de comisiones
    _.each(rc.arregloComisiones, function (comision) {
      _.each(comision.creditos, function (c) {
        if (c.pagoSeleccionado) {
          if (c.tipo == "creditoP") {
            rc.totalComisiones += rc.comisionCreditoPersonal;
          }
          else if (c.tipo == "vale") {
            rc.totalComisiones += rc.comisionDistribuidor;
          }
          else {
            rc.totalComisiones += rc.comisionCreditoPersonal;
          }
        }
      });
    });

  }


  this.guardarPago = function (pago) {

    if (rc.caja.estadoCaja == "Cerrada") {
      toastr.error("La caja esta cerrada, favor de reportar con el Gerente");
      return;
    }

    var cuenta = rc.caja.cuenta[pago.tipoIngreso_id];
    if (rc.totalComisiones > cuenta.saldo) {
      toastr.warning("No tienes suficientes fondos en esta forma de pago para efectuar el pago de la comisión.");
      return;
    }

    //Valida que tenga dinero de donde va a pagar
    if (pago.tipoIngreso_id == undefined) {
      toastr.warning("Seleccione una forma de pago");
      return;
    }

    var seleccionadosId = [];
    _.each(rc.arregloComisiones, function (cortes) {
      _.each(cortes.creditos, function (p) {
        if (p.pagoSeleccionado) {
          seleccionadosId.push({ id: p._id, comision: p.comision })
        }
      });
    });

    pago.totalPago = rc.totalComisiones;
    pago.usuario_id = rc.promotora_id;

    Meteor.call("pagoComisionPromotora",
      seleccionadosId,
      pago, 							//Con cuanto Pago el distribuidor
      function (error, success) {
        if (!success) {
          toastr.error('Error al guardar el pago de la comisión.', success);
          return;
        }
        toastr.success('Guardado correctamente.');
        rc.pago = {};
        var url = $state.href("anon.ticketComisionPromotora", { pago_id: success }, { newTab: true });
        window.open(url, '_blank');
        $state.go("root.miPerfilPromotora", { objeto_id: $stateParams.objeto_id });

      });

  };


  $(document).ready(function () {
    //$('body').addClass("hidden-menu");

    //Quita el mouse wheels 
    //document.getElementById('cobro').onwheel = function () { return false; }


  });



  this.mostrarTodos = function (valor) {

    rc.ocultarMultas = false;

    var arreglo = {};
    var arregloSeguro = {};

    if (valor) {
      rc.planPagosViejo = PlanPagos.find({ importeRegular: { $gt: 0 } }, { sort: { fechaLimite: 1 } }).fetch();
    }
    else {

      var fecha = new Date();
      var n = fecha.getDate();
      //var fechaLimite = "";
      verificarDiaInhabil = function (fecha) {
        var diaFecha = fecha.isoWeekday();
        var diaInhabiles = DiasInhabiles.find({ tipo: "DIA", estatus: true }).fetch();
        var ban = false;
        _.each(diaInhabiles, function (dia) {
          if (Number(dia.dia) === diaFecha) {
            ban = true;
            return ban;
          }
        })
        var fechaBuscar = new Date(fecha);

        var fechaInhabil = DiasInhabiles.findOne({ tipo: "FECHA", fecha: fechaBuscar, estatus: true });
        if (fechaInhabil != undefined) {
          ban = true;
          return ban;
        }
        return ban;
      };

      if (n >= 22) {
        rc.fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1, 0, 0, 0, 0);
      }
      else if (n < 7) {
        rc.fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0, 0);
      }
      else if (n >= 7 && n <= 22) {
        rc.fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth(), 16, 0, 0, 0, 0);
      }

      var validaFecha = true;
      var fechaValidar = moment(rc.fechaLimite);
      while (validaFecha) {
        validaFecha = verificarDiaInhabil(fechaValidar);
        if (validaFecha == true)
          fechaValidar = fechaValidar.add(1, 'days');
      }

      rc.fechaLimite = new Date(fechaValidar);

      rc.fechaLimite.setHours(23, 59, 59, 999);
      rc.planPagosViejo = PlanPagos.find({ fechaLimite: { $lte: rc.fechaLimite }, importeRegular: { $gt: 0 }, estatus: { $in: [0, 2] } }, { sort: { fechaLimite: 1 } }).fetch();

    }

    var colores = ['active', 'info', 'warning', 'success', 'danger'];
    var asignados = [];


    rc.pago.totalPago = 0;
    rc.pago.bonificacion = 0;
    rc.pago.cargosMoratorios = 0;

    rc.subtotal = 0;
    rc.cargosMoratorios = 0;
    rc.numeroPagosSeleccionados = 0;
    rc.total = 0;

    _.each(rc.planPagosViejo, function (pago) {
      //var credito = Creditos.findOne(pago.credito_id);

      pago.credito = Creditos.findOne(pago.credito_id);

      pago.color = colores[0];
      pago.verCargo = true;

      if (pago.credito != undefined && pago.credito.beneficiario_id != undefined) {
        Meteor.call('getBeneficiario', pago.credito.beneficiario_id, function (error, result) {
          if (result) {
            pago.beneficiario = result;
            //console.log(result);
            $scope.$apply();
          }
        });
      }

      if (pago.credito.tipo == "vale") {
        var configuraciones = Configuraciones.findOne();
        var comision = 0;
        pago.bonificacion = 0;
        comision = calculaBonificacion(pago.fechaLimite, configuraciones.arregloComisiones);
        pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);

      }
      else if (pago.credito.tipo == "creditoPersonalDistribuidor") {
        pago.bonificacion = 0;
        pago.beneficiario = {};
        pago.beneficiario.nombreCompleto = "CRÉDITO PERSONAL";
      }

      pago.saldo = Number(parseFloat(pago.importeRegular).toFixed(2));

      if (pago.fechaLimite < rc.fechaLimite) {
        pago.importepagado = Number(parseFloat(pago.importeRegular).toFixed(2));
        pago.pagoSeleccionado = true;

        if (pago.descripcion == "Recibo") {
          rc.pago.totalPago += Number(parseFloat(pago.importeRegular).toFixed(2));
        }

        rc.pago.bonificacion += Number(parseFloat(pago.bonificacion).toFixed(2));

        rc.numeroPagosSeleccionados += 1;

        if (pago.descripcion == "Cargo Moratorio") {
          rc.pago.cargosMoratorios += pago.importeRegular;
        }
      }
      else {
        pago.importepagado = 0;
        pago.pagoSeleccionado = false;
      }

      if (pago.descripcion == "Recibo")
        rc.subtotal += pago.importeRegular;
      else if (pago.descripcion == "Cargo Moratorio") {
        rc.cargosMoratorios += pago.importeRegular;
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


      pago.beneficiado = pago.credito.beneficiado;
      pago.numeroPagos = pago.credito.numeroPagos;
      pago.verCargo = true;

      var numeroCorte = 0;
      if (pago.fechaLimite.getDate() >= 15) {
        numeroCorte = pago.fechaLimite.getMonth() * 2;
        fechaCorteInicio = new Date(pago.fechaLimite.getFullYear(), pago.fechaLimite.getMonth() - 1, 22);
        fechaCorteFin = new Date(pago.fechaLimite.getFullYear(), pago.fechaLimite.getMonth(), 06);
      }
      else {
        var m = pago.fechaLimite.getMonth();
        if (m == 0) {
          numeroCorte = 12 * 2 - 1;
          fechaCorteInicio = new Date(pago.fechaLimite.getFullYear() - 1, 11, 07);
          fechaCorteFin = new Date(pago.fechaLimite.getFullYear() - 1, 11, 21);
        }
        else {
          numeroCorte = pago.fechaLimite.getMonth() * 2 - 1;
          fechaCorteInicio = new Date(pago.fechaLimite.getFullYear(), pago.fechaLimite.getMonth() - 1, 07);
          fechaCorteFin = new Date(pago.fechaLimite.getFullYear(), pago.fechaLimite.getMonth() - 1, 21);
        }
      }

      var subindice = numeroCorte + "-" + fechaCorteInicio.getFullYear();

      if (arreglo[subindice] == undefined) {
        arreglo[subindice] = {};
        arreglo[subindice].numeroCorte = numeroCorte;
        arreglo[subindice].fechaCorteInicio = fechaCorteInicio;
        arreglo[subindice].fechaCorteFin = fechaCorteFin;
        arreglo[subindice].fechaPago = pago.fechaLimite;
        arreglo[subindice].importe = 0;
        arreglo[subindice].cargosMoratorios = 0;

        if (pago.descripcion == 'Recibo')
          arreglo[subindice].importe = pago.importeRegular;
        else
          arreglo[subindice].cargosMoratorios = pago.importeRegular;

        arreglo[subindice].bonificacion = Number(pago.bonificacion);

        arreglo[subindice].planPagos = [];
        arreglo[subindice].planPagos.push(pago);
      }
      else {
        if (pago.descripcion == 'Recibo')
          arreglo[subindice].importe += pago.importeRegular;
        else
          arreglo[subindice].cargosMoratorios += pago.importeRegular;

        arreglo[subindice].bonificacion += Number(pago.bonificacion);

        arreglo[subindice].planPagos.push(pago);
      }

      //Arreglo Seguro Pagos Seguro
      if (arregloSeguro[subindice] == undefined) {
        arregloSeguro[subindice] = {};
        arregloSeguro[subindice].numeroCorte = numeroCorte;
        arregloSeguro[subindice].anio = pago.fechaLimite.getFullYear();
        arregloSeguro[subindice].fechaCorteInicio = fechaCorteInicio;
        arregloSeguro[subindice].fechaCorteFin = fechaCorteFin;
        arregloSeguro[subindice].seguro = 0;
        arregloSeguro[subindice].pagado = true;

        Meteor.call("getPagoSeguro", rc.distribuidor_id, pago.fechaLimite.getFullYear(), numeroCorte, function (error, result) {
          if (error) {
            toastr.error('Error al obtener pagos: ', error.details);
            return
          }
          if (result) {
            arregloSeguro[subindice].seguro = result;
            $scope.$apply();
          }
        });
      }


    });
    rc.arregloPagosSeguro = _.toArray(arregloSeguro);
    rc.arregloCortes = _.toArray(arreglo);


    rc.total = rc.subtotal + rc.cargosMoratorios;
    rc.pago.aPagar = Number(parseFloat(rc.pago.totalPago - rc.pago.bonificacion + rc.pago.cargosMoratorios + rc.pago.seguro).toFixed(2));

  };

  this.selCorte = function (objeto, num) {
    rc.ban = !rc.ban;
    rc.selected_numero = num;
  };

  this.isSelected = function (objeto) {
    return rc.selected_numero === objeto;
  };

  this.seleccionTipoIngreso = function (tipoIngreso) {
    rc.tipoIngresoSeleccionado = Cuentas.findOne({ tipoIngreso_id: tipoIngreso });
  }




};