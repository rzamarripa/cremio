angular.module("creditoMio")
  .controller("AvalesFormCtrl", AvalesFormCtrl);
function AvalesFormCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;

  this.cambiarContrasena = true;
  this.action = true;
  this.actionReferencia = true;
  this.nuevo = true;
  this.objeto = {};
  this.objeto.profile = {};
  this.ocupacion = {};
  this.objeto.profile.empresa_id = "";
  this.empresa = {};
  this.objeto_id = ""
  rc.pic = "";
  rc.otrafoto = ""
  rc.folio = "";
  rc.imagen = "";
  $(".js-example-basic-single").select2();

  this.pais_id = "";
  this.estado_id = "";
  this.municipio_id = "";
  this.ciudad_id = "";
  this.empresa_id = "";

  this.con = 0;
  this.num = 0;
  this.referenciasPersonales = [];
  this.referenciaPersonal = {};


  this.buscar = {};
  this.buscar.nombre = "";
  this.buscar.coloniaNombre = "";
  this.buscar.coloniaNombreEmpresa = "";
  this.buscar.empresaNombre = "";
  this.buscando = false;
  this.buscandoColonia = false;
  this.buscandoColoniaEmpresa = false;
  this.buscandoEmpresa = false;

  var fotillo = ""
  //this.pic = {};
  this.imagenes = []
  this.documents = []

  this.estadoCivil = "";

  this.estadoCivilSeleccionado = {};
  this.empresaSeleccionada = "";

  rc.colonia = {};
  rc.coloniaEmpresa = {};
  rc.empresa = {};


  this.subscribe('buscarReferenciasPersonales', () => {
    if (this.getReactively("buscar.nombre").length > 3) {
      this.buscando = true;
      return [{
        options: { limit: 10 },
        where: {
          nombreCompleto: this.getReactively('buscar.nombre')
        }
      }];
    }
    else if (this.getReactively("buscar.nombre").length == 0)
      this.buscando = false;
  });

  this.subscribe('buscarColonias', () => {
    if (this.getReactively("buscar.coloniaNombre").length > 3) {
      this.buscandoColonia = true;
      return [{
        options: { limit: 10 },
        where: {
          ciudad_id: this.getReactively("objeto.profile.ciudad_id"),
          nombre: this.getReactively('buscar.coloniaNombre')
        }
      }];
    }
    else if (this.getReactively("buscar.coloniaNombre").length == 0)
      this.buscandoColonia = false;
  });

  this.subscribe('buscarColonias', () => {
    if (this.getReactively("buscar.coloniaNombreEmpresa").length > 3) {
      this.buscandoColoniaEmpresa = true;
      return [{
        options: { limit: 10 },
        where: {
          ciudad_id: this.getReactively("empresa.ciudad_id"),
          nombre: this.getReactively('buscar.coloniaNombreEmpresa')
        }
      }];
    }
    else if (this.getReactively("buscar.coloniaNombreEmpresa").length == 0)
      this.buscandoColoniaEmpresa = false;
  });

  this.subscribe('avales', () => {
    return [{ _id: $stateParams.objeto_id }]
  });

  // this.subscribe('referenciasPersonales', () => {
  //   return [{ _id: this.getReactively('referenciaPersonal._id') }]
  // });

  // this.subscribe('empresas', () => {
  //   return [{ estatus: true }]
  // });

  this.subscribe('buscarEmpresas', () => {
    if (this.getReactively("buscar.empresaNombre").length > 3) {
      this.buscandoEmpresa = true;
      return [{
        options: { limit: 10 },
        where: {
          nombre: this.getReactively('buscar.empresaNombre')
        }
      }];
    }
    else if (this.getReactively("buscar.empresaNombre").length == 0)
      this.buscandoEmpresa = false;
  });

  this.subscribe('estadoCivil', () => {
    return [{ estatus: true }]
  });

  this.subscribe('nacionalidades', () => {
    return [{ estatus: true }]
  });

  this.subscribe('ocupaciones', () => {
    return [{ estatus: true }]
  });

  this.subscribe('paises', () => {
    return [{ estatus: true }]
  });

  this.subscribe('documentos', () => {
    return [{ estatus: true }]
  });

  this.subscribe('configuraciones', () => {
    return [{}]
  });

  this.subscribe('estados', () => {

    if (this.getReactively("objeto.profile.pais_id") != undefined)
      return [{ pais_id: this.getReactively("objeto.profile.pais_id"), estatus: true }];
  });

  this.subscribe('estados', () => {
    if (this.getReactively("empresa.pais_id") != undefined)
      return [{ pais_id: this.getReactively("empresa.pais_id"), estatus: true }];
  });

  this.subscribe('municipios', () => {
    if (this.getReactively("objeto.profile.estado_id") != undefined)
      return [{ estado_id: this.getReactively("objeto.profile.estado_id"), estatus: true }];
  });

  this.subscribe('municipios', () => {
    if (this.getReactively("empresa.estado_id") != undefined)
      return [{ estado_id: this.getReactively("empresa.estado_id"), estatus: true }];
  });

  this.subscribe('ciudades', () => {
    if (this.getReactively("objeto.profile.municipio_id") != undefined)
      return [{ municipio_id: this.getReactively("objeto.profile.municipio_id"), estatus: true }];
  });

  this.subscribe('ciudades', () => {
    if (this.getReactively("empresa.municipio_id") != undefined)
      return [{ municipio_id: this.getReactively("empresa.municipio_id"), estatus: true }];
  });

  this.subscribe('colonias', () => {
    if (this.getReactively("objeto.profile.colonia_id") != undefined)
      return [{ _id: this.getReactively("objeto.profile.colonia_id") }]
  });

  this.subscribe('colonias', () => {
    if (this.getReactively("empresa.colonia_id") != undefined)
      return [{ _id: this.getReactively("empresa.colonia_id") }]
  });

  //Condición del Parametro

  if ($stateParams.objeto_id != undefined) {
    rc.action = false;
    rc.objeto_id = $stateParams.objeto_id
    this.subscribe('avales', () => {
      return [{
        id: $stateParams.objeto_id
      }];
    });
  }

  this.helpers({
    estadosCiviles: () => {
      return EstadoCivil.find();
    },
    nacionalidades: () => {
      return Nacionalidades.find();
    },
    ocupaciones: () => {
      return Ocupaciones.find();
    },
    paises: () => {
      return Paises.find();
    },
    estados: () => {
      return Estados.find({ pais_id: this.getReactively("objeto.profile.pais_id"), estatus: true });
    },
    estadosEmpresa: () => {
      return Estados.find({ pais_id: this.getReactively("empresa.pais_id"), estatus: true });
    },
    municipios: () => {
      return Municipios.find({ estado_id: this.getReactively("objeto.profile.estado_id"), estatus: true });
    },
    municipiosEmpresa: () => {
      return Municipios.find({ estado_id: this.getReactively("empresa.estado_id"), estatus: true });
    },
    ciudades: () => {
      return Ciudades.find({ municipio_id: this.getReactively("objeto.profile.municipio_id"), estatus: true });
    },
    ciudadesEmpresa: () => {

      return Ciudades.find({ municipio_id: this.getReactively("empresa.municipio_id"), estatus: true });
    },
    colonias: () => {
      return Colonias.find({
        ciudad_id: this.getReactively("objeto.profile.ciudad_id"),
        nombre: { '$regex': '.*' + this.getReactively('buscar.coloniaNombre') || '' + '.*', '$options': 'i' }
      });
    },
    coloniasEmpresa: () => {
      return Colonias.find({
        ciudad_id: this.getReactively("empresa.ciudad_id"),
        nombre: { '$regex': '.*' + this.getReactively('buscar.coloniaNombreEmpresa') || '' + '.*', '$options': 'i' }
      });
    },
    empresas: () => {
      return Empresas.find();
    },
    documentos: () => {
      return Documentos.find();
    },
    imagenesDocs: () => {
      var imagen = rc.imagenes
      _.each(rc.getReactively("imagenes"), function (imagen) {
        imagen.archivo = rc.imagen

      });
      return imagen
    },
    objetoEditar: () => {

      if ($stateParams.objeto_id != undefined) {

        loading(true);
        var objeto = Avales.findOne({ _id: this.getReactively("objeto_id") });
        rc.empresa = Empresas.findOne({ _id: this.getReactively("empresa_id") });
        if (objeto != undefined) {
          this.referenciasPersonales = [];
          if ($stateParams.objeto_id != undefined) {

            _.each(objeto.profile.referenciasPersonales_ids, function (referenciaPersonal) {
              Meteor.call('getReferenciaPersonal', referenciaPersonal.referenciaPersonal_id, function (error, result) {
                if (result) {
                  //console.log(result);
                  rc.referenciasPersonales.push({
                    _id: referenciaPersonal.referenciaPersonal_id,
                    nombre: result.nombre,
                    apellidoPaterno: result.apellidoPaterno,
                    apellidoMaterno: result.apellidoMaterno,
                    direccion: result.direccion,
                    telefono: result.telefono,
                    celular: result.celular,
                    ciudad: result.ciudad,
                    estado: result.estado,
                    parentesco: referenciaPersonal.parentesco,
                    tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
                    num: referenciaPersonal.num,
                    nombreCompleto: result.nombreCompleto,
                    cliente_id: objeto._id,
                    estatus: referenciaPersonal.estatus
                  });
                  $scope.$apply();
                }
              });
            });

          }

          rc.objeto = objeto;
          //getdocumentos
          Meteor.call('getDocumentosClientes', this.getReactively("objeto_id"), function (error, result) {
            if (result) {
              //console.log(result);
              //ir por los documentos
              rc.documents = result;
              $scope.$apply();
            }
          });

          //getEmpresa
          Meteor.call('getEmpresa', rc.objeto.profile.empresa_id, function (error, result) {
            if (result) {
              //ir por los documentos
              rc.empresa = result;
              $scope.$apply();
            }
          });

          //rc.documents = rc.objeto.profile.documentos;
          loading(false);

        }
      }

    },
    referenciasPersonalesHelper: () => {
      var rp = ReferenciasPersonales.find({
        nombreCompleto: { '$regex': '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options': 'i' }
      }, { sort: { "nombreCompleto": 1 } }).fetch();
      return rp;
    },
    col: () => {
      rc.colonia = Colonias.findOne({ _id: this.getReactively("objeto.profile.colonia_id") });
    },
    colE: () => {
      rc.coloniaEmpresa = Colonias.findOne({ _id: this.getReactively("empresa.colonia_id") });
    },
  });


  this.tomarFoto = function (objeto) {
    //console.log(objeto)
    $meteor.getPicture().then(function (data) {
      rc.fotillo = data
      rc.pic = rc.fotillo
      //objeto.profile.fotografia = this.objeto.profile.fotografia;
    });
  };

  this.Nuevo = function () {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.objeto = {};
  };

  this.cambiarPaisObjeto = function () {
    this.objeto.profile.estado_id = "";
    this.objeto.profile.municipio_id = "";
    this.objeto.profile.ciudad_id = "";
    this.objeto.profile.colonia_id = "";
    rc.colonia = {};

  };
  this.cambiarEstadoObjeto = function () {
    this.objeto.profile.municipio_id = "";
    this.objeto.profile.ciudad_id = "";
    this.objeto.profile.colonia_id = "";
    rc.colonia = {};
  };
  this.cambiarMunicipioObjeto = function () {
    this.objeto.profile.ciudad_id = "";
    this.objeto.profile.colonia_id = "";
    rc.colonia = {};
  };
  this.cambiarCiudadObjeto = function () {
    this.objeto.profile.colonia_id = "";
    rc.colonia = {};
  };

  this.cambiarPaisEmpresa = function () {
    this.empresa.estado_id = "";
    this.empresa.municipio_id = "";
    this.empresa.ciudad_id = "";
    this.empresa.colonia_id = "";
    rc.coloniaEmpresa = {};

  };
  this.cambiarEstadoEmpresa = function () {
    this.empresa.municipio_id = "";
    this.empresa.ciudad_id = "";
    this.empresa.colonia_id = "";
    rc.coloniaEmpresa = {};
  };
  this.cambiarMunicipioEmpresa = function () {
    this.empresa.ciudad_id = "";
    this.empresa.colonia_id = "";
    rc.coloniaEmpresa = {};
  };
  this.cambiarCiudadEmpresa = function () {
    this.empresa.colonia_id = "";
    rc.coloniaEmpresa = {};
  };

  this.guardar = async function (objeto, form) {

    if (form.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }

    if (this.action) {
      objeto.password = Math.random().toString(36).substring(2, 7);
      //console.log(objeto.password);			
    }


    if (objeto.profile.ocupacion_id == undefined || objeto.profile.ocupacion_id == "") {
      toastr.error('favor de capturar una ocupación.');
      return;

    }

    objeto.profile.estatus = true;

    objeto.profile.usuarioInserto = Meteor.userId();
    objeto.profile.sucursal_id = Meteor.user().profile.sucursal_id;
    objeto.profile.fechaCreacion = new Date();
    objeto.profile.esCliente = false;
    objeto.profile.esDistribuidor = false;
    objeto.profile.referenciasPersonales = angular.copy(this.referenciasPersonales);
    var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
    var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
    var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
    objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;


    var id = Avales.insert(objeto);

    //Guardar las referencias Personales---------------------------------------------------------------------
    objeto.profile.referenciasPersonales_ids = [];

    for (referenciaPersonal of objeto.profile.referenciasPersonales) {
      //_.each(objeto.profile.referenciasPersonales, function (referenciaPersonal) {
      if (referenciaPersonal.estatus == "N")
        referenciaPersonal.estatus = "G";

      objeto.profile.referenciasPersonales_ids.push({
        num: referenciaPersonal.num,
        referenciaPersonal_id: referenciaPersonal._id,
        nombreCompleto: referenciaPersonal.nombreCompleto,
        parentesco: referenciaPersonal.parentesco,
        tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
        estatus: referenciaPersonal.estatus
      });

      //Agregar un arrar de la info del cliente en el AVAl
      //var RP = ReferenciasPersonales.findOne(referenciaPersonal._id);
      var RP = await Meteor.callSync('getReferenciaPersonal', referenciaPersonal._id);

      //hacer un Meteor MEthod para encontrarlo

      RP.clientes.push({
        cliente_id: id,
        nombreCompleto: objeto.profile.nombreCompleto,
        parentesco: referenciaPersonal.parentesco,
        tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
        tipo: "Aval",
        estatus: referenciaPersonal.estatus
      });

      var idTemp = RP._id;
      delete RP._id;
      ReferenciasPersonales.update({ _id: idTemp }, { $set: RP })

    };

    delete objeto.profile.referenciasPersonales;

    //-------------------------------------------------------------------------------------------------------
    var idTemp = objeto._id;
    delete objeto._id;
    Avales.update({ _id: idTemp }, { $set: objeto });


    toastr.success('Guardado correctamente.');
    this.usuario = {};
    $('.collapse').collapse('hide');
    this.nuevo = true;
    form.$setPristine();
    form.$setUntouched();
    $state.go('root.avalesLista');

  };

  //////////
  this.actualizarForm = async function (objeto, form) {
    if (form.$invalid) {
      toastr.error('Error al actualizar los datos.');
      return;
    }
    var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
    var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
    var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
    objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;

    if (objeto.profile.ocupacion_id == undefined || objeto.profile.ocupacion_id == "") {
      toastr.error('favor de capturar una ocupación.');
      return;

    }

    if (objeto.profile.referenciasPersonales_ids == undefined)
      objeto.profile.referenciasPersonales_ids = [];

    //Actualizar las referencias Personales---------------------------------------------------------------------

    for (referenciaPersonal of this.referenciasPersonales) {

      if (referenciaPersonal.estatus == "N") {
        referenciaPersonal.estatus = "G";
        objeto.profile.referenciasPersonales_ids.push({
          num: referenciaPersonal.num,
          //aval_id								: objeto._id,								//Era Num Cliente
          referenciaPersonal_id: referenciaPersonal._id,
          nombreCompleto: referenciaPersonal.nombreCompleto,
          parentesco: referenciaPersonal.parentesco,
          tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
          estatus: referenciaPersonal.estatus
        });


        rc.referenciaPersonal._id = referenciaPersonal._id;

        var RP = await Meteor.callSync('getReferenciaPersonal', referenciaPersonal._id);
        //console.log(RP);

        RP.clientes.push({
          cliente_id: objeto._id,
          nombreCompleto: objeto.profile.nombreCompleto,
          parentesco: referenciaPersonal.parentesco,
          tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
          tipo: "Aval",
          estatus: referenciaPersonal.estatus
        });

        var idTemp = RP._id;
        delete RP._id;

        ReferenciasPersonales.update({ _id: idTemp }, { $set: RP });

      }
      else if (referenciaPersonal.estatus == "A") {
        //Buscar referenciasPersonales_ids y actualizarlo
        for (referenciaPersonal_ids of objeto.profile.referenciasPersonales_ids) {
          //_.each(objeto.profile.referenciasPersonales_ids, function (referenciaPersonal_ids) {
          if (referenciaPersonal_ids.num == referenciaPersonal.num) {

            referenciaPersonal_ids.parentesco = referenciaPersonal.parentesco;
            referenciaPersonal_ids.tiempoConocerlo = referenciaPersonal.tiempoConocerlo;
            referenciaPersonal_ids.estatus = "G";

            //var RP = ReferenciasPersonales.findOne(referenciaPersonal_ids.referenciaPersonal_id);
            var RP = await Meteor.callSync('getReferenciaPersonal', referenciaPersonal_ids.referenciaPersonal_id);

            _.each(RP.clientes, function (cliente) {
              if (cliente.cliente_id == objeto._id) {
                cliente.parentesco = referenciaPersonal.parentesco;
                cliente.tiempoConocerlo = referenciaPersonal.tiempoConocerlo;
              }
            });
            var idTemp = RP._id;
            delete RP._id;
            ReferenciasPersonales.update({ _id: idTemp }, { $set: RP });
          }
        };
      }
    };
    //---------------------------------------------------------------------------------------------------------------------	

    delete objeto.profile.repeatPassword;

    var idTemp = objeto._id;
    delete objeto._id;
    objeto.usuarioActualizo = Meteor.userId();
    Avales.update({ _id: idTemp }, { $set: objeto });

    toastr.success('Actualizado correctamente.');

    this.nuevo = true;
    $state.go('root.avalesLista');

  };

  this.guardarEmpresa = function (empresa, objeto, form) {
    if (form.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }
    empresa.estatus = true;
    empresa.usuarioInserto = Meteor.userId();
    //objeto.profile.foto = this.objeto.profile.foto;

    Empresas.insert(empresa, function (error, result) {
      if (error) {
        console.log("error: ", error);
      }
      if (result) {
        objeto.profile.empresa_id = result;
        toastr.success('Guardado correctamente.');
        this.empresa = {};
        $('.collapse').collapse('hide');
        this.nuevo = true;
        form.$setPristine();
        form.$setUntouched();
        $("[data-dismiss=modal]").trigger({ type: "click" });

      }
    });
  };

  this.actualizarEmpresa = function (empresa, objeto, form) {
    if (form.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }
    empresa.estatus = true;
    empresa.usuarioActualizo = Meteor.userId();

    //console.log(empresa._id)
    var tempId = empresa._id;
    delete empresa._id;

    Empresas.update({ _id: tempId }, { $set: empresa }, function (error, result) {
      if (error) {
        console.log("error: ", error);
      }
      if (result) {
        objeto.profile.empresa_id = tempId;
        toastr.success('Actualizado correctamente.');
        this.empresa = {};
        $('.collapse').collapse('hide');
        this.nuevo = true;
        form.$setPristine();
        form.$setUntouched();
        $("[data-dismiss=modal]").trigger({ type: "click" });

      }
    });
  };

  this.guardarOcupacion = function (ocupacion, objeto, form) {
    if (form.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }
    ocupacion.estatus = true;
    ocupacion.usuarioInserto = Meteor.userId();
    //objeto.profile.foto = this.objeto.profile.foto;

    Ocupaciones.insert(ocupacion, function (error, result) {
      if (error) {
        console.log("error: ", error);
      }
      if (result) {
        objeto.profile.ocupacion_id = result;
        toastr.success('Guardado correctamente.');
        this.ocupacion = {};
        $('.collapse').collapse('hide');
        this.nuevo = true;
        form.$setPristine();
        form.$setUntouched();
        $("[data-dismiss=modal]").trigger({ type: "click" });

      }
    });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  this.AgregarReferencia = function (a) {

    this.referenciaPersonal.nombre = a.nombre;
    this.referenciaPersonal.apellidoPaterno = a.apellidoPaterno;
    this.referenciaPersonal.apellidoMaterno = a.apellidoMaterno;
    this.referenciaPersonal.direccion = a.direccion;
    this.referenciaPersonal.telefono = a.telefono;
    this.referenciaPersonal.celular = a.celular;
    this.referenciaPersonal.ciudad = a.ciudad;
    this.referenciaPersonal.estado = a.estado;
    this.referenciaPersonal.tiempoConocerlo = a.tiempoConocerlo;
    this.referenciaPersonal.nombreCompleto = a.nombreCompleto;

    this.referenciaPersonal._id = a._id;
    this.buscar.nombre = "";
  };

  this.insertarReferencia = function () {
    //Validar que no venga vacio
    if (this.referenciaPersonal.nombre == undefined || this.referenciaPersonal.apellidoPaterno == undefined || this.referenciaPersonal.parentesco == undefined || this.referenciaPersonal.tiempoConocerlo == undefined || this.referenciaPersonal.parentesco == "" || this.referenciaPersonal.tiempoConocerlo == "") {
      toastr.warning('Favor de completar los datos en referencias personales.');
      return;
    }

    this.referenciaPersonal.num = this.referenciasPersonales.length + 1;
    this.referenciaPersonal.estatus = "N";
    this.referenciasPersonales.push(this.referenciaPersonal);
    this.referenciaPersonal = {};
  };

  this.actualizarReferencia = function (p) {
    p.num = this.num;
    _.each(this.referenciasPersonales, function (rp) {
      if (rp.num == p.num) {
        rp.nombre = p.nombre;
        rp.apellidoPaterno = p.apellidoPaterno;
        rp.apellidoMaterno = p.apellidoMaterno;
        rp.direccion = p.direccion;
        rp.telefono = p.telefono;
        rp.celular = p.celular;
        rp.ciudad = p.ciudad;
        rp.estado = p.estado;
        rp.parentesco = p.parentesco;
        rp.tiempoConocerlo = p.tiempoConocerlo;
        if (rp.estatus == "G")
          rp.estatus = "A";
      }
    });

    this.referenciaPersonal = {};
    this.num = 0;
    rc.actionReferencia = true;
  };

  this.cancelarReferencia = function () {
    this.referenciaPersonal = {};
    this.num = -1;
    rc.actionReferencia = true;
  };

  this.borrarReferencia = function () {
    this.referenciaPersonal.nombre = "";
    this.referenciaPersonal.apellidoPaterno = "";
    this.referenciaPersonal.apellidoMaterno = "";
    this.referenciaPersonal.direccion = "";
    this.referenciaPersonal.telefono = "";
    this.referenciaPersonal.celular = "";
    this.referenciaPersonal.ciudad = "";
    this.referenciaPersonal.estado = "";
    this.referenciaPersonal.parentesco = "";
    this.referenciaPersonal.tiempoConocerlo = "";
    delete this.referenciaPersonal["_id"];
  };

  this.quitarReferencia = function (numero) {
    var rp = this.referenciasPersonales;
    customConfirm('¿Estás seguro de  quitar la referencia?', function () {
      pos = functiontofindIndexByKeyValue(rp, "num", numero);
      rp.splice(pos, 1);
      if (rp.length == 0) this.con = 0;
      //reorganiza el consecutivo     
      functiontoOrginiceNum(rp, "num");
      this.referenciasPersonales = rp;
      $scope.$apply();
    });
  };

  this.editarReferencia = function (p) {
    this.referenciaPersonal.nombre = p.nombre;
    this.referenciaPersonal.apellidoPaterno = p.apellidoPaterno;
    this.referenciaPersonal.apellidoMaterno = p.apellidoMaterno;
    this.referenciaPersonal.direccion = p.direccion;
    this.referenciaPersonal.telefono = p.telefono;
    this.referenciaPersonal.celular = p.celular;
    this.referenciaPersonal.parentesco = p.parentesco;
    this.referenciaPersonal.tiempoConocerlo = p.tiempoConocerlo;
    this.referenciaPersonal.ciudad = p.ciudad;
    this.referenciaPersonal.estado = p.estado;

    this.num = p.num;
    this.actionReferencia = false;
  };

  this.guardarReferenciaPersonal = function (referenciaPersonal, form4) {
    if (form4.$invalid) {
      toastr.error('Error al guardar los datos.');
      return;
    }

    referenciaPersonal.usuarioInserto = Meteor.userId();
    referenciaPersonal.nombreCompleto = referenciaPersonal.nombre + " " +
      referenciaPersonal.apellidoPaterno +
      (referenciaPersonal.apellidoMaterno == undefined ? "" : " " + referenciaPersonal.apellidoMaterno);

    referenciaPersonal.clientes = [];
    this.referenciaPersonal._id = ReferenciasPersonales.insert(referenciaPersonal);

    $("#modalreferenciaPersonal").modal('hide');
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  this.borrarDoc = function (id) {
    customConfirm('¿Estás seguro Eliminar el documento?', function () {

      Meteor.call('borrarDocumentoCliente', rc.objeto_id, id, function (error, result) {
        if (result) {
          rc.documents = result;
          $scope.$apply();
        }
      });

    });
  };

  this.imprimirDoc = function (id) {

    Meteor.call('getDocumentoCliente', id, function (error, result) {
      if (result) {
        //console.log(result);
        Meteor.call('imprimirImagenDocumento', result, function (error, response) {
          if (error) {
            console.log('ERROR :', error);
            return;
          }
          else {
            function b64toBlob(b64Data, contentType, sliceSize) {
              contentType = contentType || '';
              sliceSize = sliceSize || 512;

              var byteCharacters = atob(b64Data);
              var byteArrays = [];

              for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                  byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
              }

              var blob = new Blob(byteArrays, { type: contentType });
              return blob;
            }

            var blob = b64toBlob(response, "application/docx");
            var url = window.URL.createObjectURL(blob);

            //console.log(url);
            var dlnk = document.getElementById('dwnldLnk');

            dlnk.download = "imagenDocumento.docx";
            dlnk.href = url;
            dlnk.click();
            window.URL.revokeObjectURL(url);

          }
        });
      }
    });
  }

  //busca un elemento en el arreglo
  function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
    for (var i = 0; i < arraytosearch.length; i++) {
      if (arraytosearch[i][key] == valuetosearch) {
        return i;
      }

    }
    return null;
  };

  //Obtener el mayor
  function functiontoOrginiceNum(arraytosearch, key) {
    var mayor = 0;
    for (var i = 0; i < arraytosearch.length; i++) {
      arraytosearch[i][key] = i + 1;
    }
  };

  this.AlmacenaImagen = function (imagen) {
    rc.objeto.profile.foto = imagen;
    toastr.success("Foto Cargada...");
  }

  $(document).ready(function () {

    const imageFileToBase64 = require('image-file-to-base64-exif');

    const maxWidth = 200;
    const maxHeight = 180;
    const quality = 0.8;

    var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
    //$(".Mselect2").select2();
    var fileInput1 = document.getElementById('fileInput1');
    //var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
    //JavaScript para agregar la Foto
    var foto = document.getElementById('foto');

    fileInput1.addEventListener('change', function (e) {
      var file = fileInput1.files[0];
      var imageType = /image.*/;

      if (file.type.match(imageType)) {

        if (file.size <= 2048000) {

          var reader = new FileReader();
          reader.onload = function (e) {

            rc.imagen = reader.result;

            var img = new Image();
            img.src = rc.imagen;
            img.width = 800;
            img.height = 600;

            fileDisplayArea1.appendChild(img);
          }
          reader.readAsDataURL(file);
        } else {
          toastr.error("Error la Imagen supera los 512 KB");
          return;
        }
      } else {
        //fileDisplayArea1.innerHTML = "File not supported!";
      }
    });

    foto.addEventListener('change', function (e) {
      var file = foto.files[0];
      var imageType = /image.*/;

      if (file.type.match(imageType)) {

        var reader = new FileReader();

        reader.onload = function (e) {

          imageFileToBase64(foto.files[0], maxWidth, maxHeight, quality)
            .then(addThumbnail)
        }
        reader.readAsDataURL(file);
      } else {
        fotoArea.innerHTML = "Archivo no sportado!";
      }
    });


    function addThumbnail(base64) {

      /*
fotoArea.innerHTML = ""; 
      var img = new Image();
      img.src = base64;
      img.width = 200;
      img.height= 180;
      fotoArea.appendChild(img);
*/

      rc.AlmacenaImagen(base64);
    }

  });

  this.agregarImagen = function () {
    var fileDisplayArea1 = document.getElementById('fileDisplayArea1');
    while (fileDisplayArea1.firstChild) {
      fileDisplayArea1.removeChild(fileDisplayArea1.firstChild);
    }
    $("#modalDocumentoImagen").modal('show');
  }

  this.agregarDoc = function (doc, imagen) {


    if (imagen == false) {
      toastr.error("Ninguna imagen agregada");

    }
    else {
      loading(true);
      Meteor.call('setDocumentosCliente', rc.objeto_id, this.documento_id, imagen, function (error, result) {
        if (result) {
          //ir por los documentos
          rc.documents = result;
          $scope.$apply();
          loading(false);
        }
      });
    }

    $("#modalDocumentoImagen").modal('hide');

  };

  this.actDoc = function (doc, imagen) {

    Meteor.call('getDocs', doc, function (error, result) {
      if (result) {
        rc.objeto.profile.documentos.push({ imagen: imagen, nombre: result.nombre });
        $scope.$apply();
      }

    });

    $("#modalDocumentoImagen").modal('hide');
  }

  this.getDocumentos = function (documento_id) {

    console.log(documento_id);
    rc.documento = Documentos.findOne(documento_id);
    //rc.nota.unidad = Unidades.findOne(rc.nota.unidad_id);
  };

  this.mostrarModal = function (id) {
    Meteor.call('getDocumentoCliente', id, function (error, result) {
      if (result) {
        var imagen = '<img class="img-responsive" src="' + result + '" style="margin:auto;">';
        $('#imagenDiv').empty().append(imagen);
        $("#myModal").modal('show');
      }
    });
  };

  this.seleccionEstadoCivil = function (estadoCivil) {
    console.log(estadoCivil);

  }

  this.calcularTotales = function () {


    rc.objeto.profile.totalIngresos = Number(rc.objeto.profile.ingresosPersonales == "" ? 0 : rc.objeto.profile.ingresosPersonales) +
      Number(rc.objeto.profile.ingresosConyuge == "" ? 0 : rc.objeto.profile.ingresosConyuge) +
      Number(rc.objeto.profile.otrosIngresos == "" ? 0 : rc.objeto.profile.otrosIngresos);

    rc.objeto.profile.totalGastos = Number(rc.objeto.profile.gastosFijos == "" ? 0 : rc.objeto.profile.gastosFijos) +
      Number(rc.objeto.profile.gastosEventuales == "" ? 0 : rc.objeto.profile.gastosEventuales);

    rc.objeto.profile.resultadoNeto = Number(rc.objeto.profile.totalIngresos) - Number(rc.objeto.profile.totalGastos);

  };

  this.seleccionarEstadoCivil = function (estadoCivil_id) {
    this.estadoCivilSeleccionado = EstadoCivil.findOne(estadoCivil_id);
  }

  this.cambiarPassword = function () {
    this.cambiarContrasena = !this.cambiarContrasena;
  }

  this.getColonias = function (colonia_id) {
    rc.coloniaSeleccionado = Colonias.findOne(colonia_id);
  };

  this.agregarColonia = function (colonia) {
    rc.colonia = colonia;
    rc.objeto.profile.colonia_id = colonia._id;
    rc.buscar.coloniaNombre = "";
  };

  this.agregarColoniaEmpresa = function (colonia) {
    rc.coloniaEmpresa = colonia;
    rc.empresa.colonia_id = colonia._id;
    rc.buscar.coloniaNombreEmpresa = "";
  };

  this.agregarEmpresa = function (empresa) {
    rc.empresa = empresa;
    rc.objeto.profile.empresa_id = empresa._id;
    rc.buscar.empresaNombre = "";
  };

  this.getEmpresa = function (empresa_id) {
    rc.empresa = Empresas.findOne(empresa_id);
  };

  this.createEmpresa = function () {
    this.empresa = {};
    this.nuevoEmpresa = true;
  }

};