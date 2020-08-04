angular.module("creditoMio")
  .controller("PanelSolicitudesCD", PanelSolicitudesCD);
function PanelSolicitudesCD($scope, $meteor, $reactive, $state, toastr) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;

  rc.buscar = {};
  rc.buscar.nombre = "";

  rc.tipoSolicitud = "creditoPersonal";

  rc.asignaSucursal_id = "";


  this.subscribe('sucursales', () => {
		return [{}]
	},
		{
			onReady: function () {
				rc.sucursales = Sucursales.find({ estatus: true }).fetch();
			}
		});

  this.subscribe('buscarSolicitudCreditoPersonal', () => {
    if (this.getReactively("tipoSolicitud") == "creditoPersonal" && this.getReactively("buscar.nombre").length > 4) {
      return [{
        options: { limit: 20 },
        where: {
          nombreCompleto: this.getReactively('buscar.nombre'),
          sucursal_id: Meteor.user().profile.sucursal_id
        }
      }];
    }
  });

  this.subscribe('buscarSolicitudDistribuidor', () => {
    if (this.getReactively("tipoSolicitud") == "distribuidor" && this.getReactively("buscar.nombre").length > 4) {
      return [{
        options: { limit: 20 },
        where: {
          nombreCompleto: this.getReactively('buscar.nombre'),
          sucursal_id: Meteor.user().profile.sucursal_id
        }
      }];
    }
  });

  this.subscribe('solicitudesClientesComposite', () => {
    return [{ "profile.sucursal_id": Meteor.user().profile.sucursal_id, "profile.estatus": 2 }];
  })

  this.subscribe('solicitudesDistribuidoresComposite', () => {
    return [{ "profile.sucursal_id": Meteor.user().profile.sucursal_id, "profile.estatus": 2 }];
  })


  this.helpers({

    arreglo: () => {
      var arreglo = [];
      var clientes = SolicitudesClientes.find({ "profile.sucursal_id": Meteor.user().profile.sucursal_id, "profile.estatus": 2 }, { sort: { "profile.fechaSolicito": -1 } }).map(function (c) {
        c.profile.tipo = "Cliente Crédito Personal";
        if (c.profile.usuario_id != undefined) {
          var u = Meteor.users.findOne(c.profile.usuario_id);
          if (u)
            c.profile.usuario = u.profile.nombreCompleto
        }
        else
          c.profile.usuario = ""
        arreglo.push(c);
        return c;
      });
      var distribuidores = SolicitudesDistribuidores.find({ "profile.sucursal_id": Meteor.user().profile.sucursal_id, "profile.estatus": 2 }, { sort: { "profile.fechaSolicito": -1 } }).map(function (c) {
        c.profile.tipo = "Distribuidor";
        if (c.profile.usuario_id != undefined) {
          var u = Meteor.users.findOne(c.profile.usuario_id);
          if (u)
            c.profile.usuario = u.profile.nombreCompleto
        }
        else
          c.profile.usuario = ""
        arreglo.push(c);
        return c;
      });

      return arreglo;
    },
    arregloElaboradas: () => {

      if (rc.tipoSolicitud == "creditoPersonal") {
        var cli = SolicitudesClientes.find({
          "profile.nombreCompleto": { '$regex': '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options': 'i' },
          "profile.estatus": { $in: [3, 4, 5, 6, 7] }
        }, { sort: { "profile.nombreCompleto": 1 } }).fetch();
        _.each(cli, function (c) {
          Meteor.call('getUsuario', c.profile.usuarioCreacion, function (error, result) {
            if (result) {
              c.profile.nombreUsuario = result.nombre;
              $scope.$apply()
            }
          });
          c.profile.tipo = "Cliente Crédito Personal";
        })
      }
      if (rc.tipoSolicitud == "distribuidor") {
        var cli = SolicitudesDistribuidores.find({
          "profile.nombreCompleto": { '$regex': '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options': 'i' },
          "profile.estatus": { $in: [3, 4, 5, 6, 7] }
        }, { sort: { "profile.nombreCompleto": 1 } }).fetch();
        _.each(cli, function (c) {
          Meteor.call('getUsuario', c.profile.usuarioCreacion, function (error, result) {
            if (result) {
              c.profile.nombreUsuario = result.nombre;
              $scope.$apply()
            }
          });
          c.profile.tipo = "Distribuidor";
        })

      }


      return cli;

    },
    sucursales: () => {
      return Sucursales.find();
    },
  });


  this.imprimir = function (objeto) {

    var o = objeto.profile;

    var sucursal = Sucursales.findOne({ _id: o.sucursal_id });
    o.sucursal = sucursal.nombreSucursal;
    o.dE = o.dependientesEconomicos;
    o.iTipo = o.identificacionTipo;
    o.iClave = o.identificacionClave;
    o.pHab = o.personasHabitan;
    o.avalTiempoC = o.avalTiempoConocerlo;
    o.avalCPEmpresa = o.avalCodigoPostalEmpresa;

    //Referencias
    o.rp1TC = o.referenciaPersonal1TiempoConocerlo;
    o.rp2TC = o.referenciaPersonal2TiempoConocerlo;
    o.rp3TC = o.referenciaPersonal3TiempoConocerlo;
    o.rp4TC = o.referenciaPersonal4TiempoConocerlo;

    o.rp1Par = o.referenciaPersonal1Parentesco;
    o.rp2Par = o.referenciaPersonal2Parentesco;
    o.rp3Par = o.referenciaPersonal3Parentesco;
    o.rp4Par = o.referenciaPersonal4Parentesco;

    //Referencias////////////////////////////////////

    //Fecha Solicitud
    o.diaC = new Date(o.fechaCreacion).getDate();
    o.mesC = new Date(o.fechaCreacion).getMonth() + 1;
    o.anioC = new Date(o.fechaCreacion).getFullYear();

    //Solicitante
    o.diaN = new Date(o.fechaNacimiento).getDate();
    o.mesN = new Date(o.fechaNacimiento).getMonth() + 1;
    o.anioN = new Date(o.fechaNacimiento).getFullYear();




    if (o.tipoVivienda == "propia")
      o.vp = "X";
    else if (o.tipoVivienda == "familiar")
      o.vf = "X";
    else if (o.tipoVivienda == "rentada") {
      o.vr = "X";
      //Aval
      o.diaA = new Date(o.fechaNacimientoAval).getDate();
      o.mesA = new Date(o.fechaNacimientoAval).getMonth() + 1;
      o.anioA = new Date(o.fechaNacimientoAval).getFullYear();
    }


    if (o.otraPropiedad == "si")
      o.ps = "X";
    else
      o.pn = "X";

    if (o.cuentaConAuto == "si")
      o.as = "X";
    else
      o.an = "X";

    var plantilla = "";
    if (o.tipo == "Cliente Crédito Personal")
      plantilla = "SolicitudCredito";
    else
      plantilla = "SolicitudDistribuidor";


    loading(true);
    Meteor.call('report', {
      templateNombre: plantilla,
      reportNombre: 'solicitud',
      type: 'docx',
      datos: o,
    }, function (err, file) {
      if (!err) {
        downloadFile(file);
      } else {
        toastr.warning("Error al generar el reporte");
      }
      loading(false);
    });

  };

  this.crearProspecto = function (objeto) {

    delete objeto.$$hashKey;

    var prospecto = {};
    prospecto.profile = {};

    prospecto.profile.nombre = objeto.profile.nombre;
    prospecto.profile.apellidoPaterno = objeto.profile.apellidoPaterno;
    prospecto.profile.apellidoMaterno = objeto.profile.apellidoMaterno;
    prospecto.profile.nombreCompleto = objeto.profile.nombreCompleto;

    prospecto.profile.sexo = objeto.profile.sexo;
    prospecto.profile.fechaNacimiento = objeto.profile.fechaNacimiento;
    prospecto.profile.lugarNacimiento = objeto.profile.lugarNacimiento;

    prospecto.profile.estadoCivil_id = objeto.profile.estadoCivil_id;
    if (prospecto.profile.estadoCivil_id == "D7ShEFTmPjLnsQqtH") {
      var nombre = objeto.profile.nombreConyuge != undefined ? objeto.profile.nombreConyuge + " " : "";
      var apPaterno = objeto.profile.apellidoPaternoConyuge != undefined ? objeto.profile.apellidoPaternoConyuge + " " : "";
      var apMaterno = objeto.profile.apellidoMaternoConyuge != undefined ? objeto.profile.apellidoMaternoConyuge : "";
      prospecto.profile.nombreConyuge = nombre + apPaterno + apMaterno;

      prospecto.profile.celularConyuge = objeto.profile.celularConyuge;
      prospecto.profile.empresaConyuge = objeto.profile.empresaConyuge;
      prospecto.profile.puestoConyuge = objeto.profile.puestoConyuge;
      prospecto.profile.telefonoConyugeTrabajo = objeto.profile.telefonoOficinaConyuge;
      prospecto.profile.direccionEmpresa = "Calle: " + objeto.profile.calleEmpresaConyuge + " Num." + objeto.profile.numeroEmpresaConyuge + " Col. " + objeto.profile.coloniaEmpresaConyuge;
      prospecto.profile.datosjefeInmediato = objeto.profile.datosjefeInmediato;
    }

    prospecto.profile.ocupacion_id = objeto.profile.ocupacion_id;
    prospecto.profile.nacionalidad_id = objeto.profile.nacionalidad_id;
    prospecto.profile.pais_id = objeto.profile.pais_id;
    prospecto.profile.estado_id = objeto.profile.estado_id;
    prospecto.profile.municipio_id = objeto.profile.municipio_id;
    prospecto.profile.ciudad_id = objeto.profile.ciudad_id;
    prospecto.profile.colonia_id = objeto.profile.colonia_id;

    prospecto.profile.particular = objeto.profile.telefono;
    prospecto.profile.celular = objeto.profile.celular;
    prospecto.profile.telefonoOficina = objeto.profile.telefonoEmpresa;

    prospecto.profile.telefonoAlternativo = objeto.profile.telefonoAlternativo;
    prospecto.profile.duenoAlternativo = objeto.profile.duenoAlternativo;
    prospecto.profile.parentescoAlternativo = objeto.profile.parentescoAlternativo;

    prospecto.profile.calle = objeto.profile.calle;
    prospecto.profile.numero = objeto.profile.numero;
    prospecto.profile.codigoPostal = objeto.profile.codigoPostal;

    prospecto.profile.tiempoResidencia = objeto.profile.antiguedadVivienda;
    prospecto.profile.casa = objeto.profile.tipoVivienda;

    prospecto.profile.correo = objeto.profile.correoElectronico;
    prospecto.profile.senasParticulares = objeto.profile.entreCalles;

    prospecto.profile.ingresosPersonales = objeto.profile.ingresosPersonales;
    prospecto.profile.ingresosConyuge = objeto.profile.ingresosConyuge;
    prospecto.profile.otrosIngresos = objeto.profile.otrosIngresos;
    prospecto.profile.totalIngresos = objeto.profile.totalIngresos;
    prospecto.profile.gastosFijos = objeto.profile.gastosFijos;
    prospecto.profile.gastosEventuales = objeto.profile.gastosEventuales;
    prospecto.profile.totalGastos = objeto.profile.totalGastos;
    prospecto.profile.resultadoNeto = objeto.profile.resultadoNeto;

    prospecto.profile.telefonoEmpresa = objeto.profile.telefonoEmpresa;
    prospecto.profile.tiempoLaborando = objeto.profile.antiguedad;
    prospecto.profile.puesto = objeto.profile.puesto;
    prospecto.profile.departamento = objeto.profile.departamento;
    prospecto.profile.puesto = objeto.profile.puesto;
    prospecto.profile.jefeInmediato = objeto.profile.jefeInmediato;
    prospecto.profile.telefonoJefe = objeto.profile.celularJefe;

    prospecto.profile.tipo = objeto.profile.tipo;
    prospecto.profile.sucursal_id = objeto.profile.sucursal_id;
    prospecto.profile.fechaCreacion = new Date();
    prospecto.profile.fechaSolicito = objeto.profile.fechaCreacion;
    prospecto.profile.usuarioCreacion = Meteor.userId();
    prospecto.profile.origen = objeto.profile.origen;
    prospecto.profile.referenciasPersonales_ids = [];

    if (objeto.profile.origen == "Promotora") {
      prospecto.profile.promotora_id = objeto.profile.usuario_id;
      prospecto.profile.sePagoComision = false;
    }

    if (objeto.profile.tipoVivienda == "rentada") {
      prospecto.profile.renta = true;
      prospecto.profile.rentaMes = objeto.profile.valorCosto;
      prospecto.profile.avales_ids = [];
    }

    if (prospecto.profile.tipo == "Distribuidor") {
      prospecto.profile.avales_ids = [];
      prospecto.profile.solicitudDistribuidor_id = objeto._id;
      prospecto.profile.saldoCredito = 25000;
      prospecto.profile.limiteCredito = 25000;
    }
    else if (prospecto.profile.tipo == "Cliente Crédito Personal") {
      prospecto.profile.limiteCredito = objeto.profile.montoSolicitado;
      prospecto.profile.solicitudCreditoPersonal_id = objeto._id;

      //Ojo Revisar y Correjir
      prospecto.profile.requiereVerificacionAval = false;
    }


    customConfirm('¿Estás seguro de crear al prospecto ' + objeto.profile.nombreCompleto + '?', function () {
      loading(true);
      Meteor.call('crearProspectosCreditosPersonalesDistribuidores', prospecto, objeto.profile.tipo, objeto._id, function (error, result) {
        if (error) {
          console.log('ERROR :', error);
          loading(false);
          return;
        }
        else if (result == 1) {
          loading(false);
          toastr.warning("El solicitante ya existe en la base de datos");
          return;
        }
        else if (result) {
          loading(false);
          //mandarlo al formulario de propectos para que llene lo que falta
          $state.go('root.panelProspectosCreditosPersonalesDestribuidores');
          $scope.$apply();
        }
      });
    });

  };

  this.mostrarAsignarSucursal = function (objeto) {
    rc.objeto = objeto;
    $("#modalAsignarSucursal").modal();
  };

  this.asignarSucursal = function (form) {

    if (form.$invalid) {
      toastr.error('Error al rechazar.');
      return;
    }

    Meteor.call('asignaSucursalSolicitud', rc.objeto._id, rc.asignaSucursal_id, rc.objeto.profile.tipo, function (error, result) {
      if (result) {
        if (result)
          toastr.success("Solicitud Asignada");
        else
          toastr.danger("Error al asignar la Solicitud");

        $scope.$apply();
      }
    });

    rc.objeto = {};

    $('#modalAsignarSucursal').modal('hide');

  }

};