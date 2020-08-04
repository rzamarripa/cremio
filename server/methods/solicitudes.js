Meteor.methods({

  asignaSucursalSolicitud: function (objeto_id, sucursal_id, tipo) {

    try {

      if (tipo == "Cliente Crédito Personal") {
        SolicitudesClientes.update({ _id: objeto_id }, { $set: { "profile.sucursal_id": sucursal_id, "profile.estatus": 2, "profile.usuarioAsigno": Meteor.userId() } });
      }
      else {
        SolicitudesDistribuidores.update({ _id: objeto_id }, { $set: { "profile.sucursal_id": sucursal_id, "profile.estatus": 2, "profile.usuarioAsigno": Meteor.userId() } });
      }
      return true;
    }
    catch (err) {

      return false;
    }
  },

  guardarSolicitudCreditoPersonal: function (objeto) {
    SolicitudesClientes.insert(objeto);
    return true;
  },

  guardarSolicitudDistribuidor: function (objeto) {
    SolicitudesDistribuidores.insert(objeto);
    return true;
  },

  actualizarSolicitudCreditoPersonal: function (objeto) {
    var idTemp = objeto._id;
    delete objeto._id;
    SolicitudesClientes.update({ _id: idTemp }, { $set: objeto });
    return true;
  },

  actualizarSolicitudDistribuidor: function (objeto) {
    var idTemp = objeto._id;
    delete objeto._id;
    SolicitudesDistribuidores.update({ _id: idTemp }, { $set: objeto });
    return true;
  },

  crearProspectosCreditosPersonalesDistribuidores: function (objeto, tipo, objeto_id) {

    if (tipo == "Distribuidor") {
      var busca = ProspectosDistribuidor.find({ "profile.nombreCompleto": objeto.profile.nombreCompleto });
      if (busca.lenght > 0) {
        SolicitudesDistribuidores.update({ _id: objeto_id }, { $set: { "profile.estatus": 4 } }); 
        //1.- Sin Sucursal, 2.- Asignado .- 3.- En Prospecto, 4.- Ya xiste, 5.- Aceptado, 6.- Rechazado, 7.- Trunco
        return 1;
      }
      objeto.profile.estatusProspecto = 1; //1.- No es Cliente, 2.- es Cliente.- 3.- No Aprobado
      objeto.profile.estaVerificado = false; //false.- NO, true.- Si
      objeto.profile.estatus = 1; //1.- Sin Verificar, 2.- Por Verificar.- 3.- Verificado
      var id = ProspectosDistribuidor.insert(objeto);
      SolicitudesDistribuidores.update({ _id: objeto_id }, { $set: { "profile.estatus": 3 } });
      return id;
    }
    else {
      var busca = ProspectosCreditoPersonal.find({ "profile.nombreCompleto": objeto.profile.nombreCompleto });
      if (busca.lenght > 0) {
        SolicitudesClientes.update({ _id: objeto_id }, { $set: { "profile.estatus": 4 } });
        //1.- Sin Sucursal, 2.- Asignado .- 3.- En Prospecto, 4.- Ya xiste, 5.- Aceptado, 6.- Rechazado, 7.- Trunco
        return 1;
      }
      objeto.profile.estatusProspecto = 1;
      objeto.profile.estaVerificado = false;
      objeto.profile.estatus = 1; //1.- Sin Verificar, 2.- Por Verificar.- 3.- Verificado
      var id = ProspectosCreditoPersonal.insert(objeto);
      SolicitudesClientes.update({ _id: objeto_id }, { $set: { "profile.estatus": 3 } });
      return id;
    }

  },

  actualizarProspectosCreditosPersonalesDistribuidores: function (user, referenciasPersonales, tipo) {

    _.each(referenciasPersonales, function (referenciaPersonal) {

      if (referenciaPersonal.estatus == "N") {
        referenciaPersonal.estatus = "G";
        user.profile.referenciasPersonales_ids.push({
          num: referenciaPersonal.num,
          numeroCliente: user.profile.numeroCliente,
          referenciaPersonal_id: referenciaPersonal._id,
          nombreCompleto: referenciaPersonal.nombreCompleto,
          parentesco: referenciaPersonal.parentesco,
          tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
          estatus: referenciaPersonal.estatus
        });

        var RP = ReferenciasPersonales.findOne(referenciaPersonal._id);
        RP.clientes.push({
          cliente_id: user._id,
          nombreCompleto: user.profile.nombreCompleto,
          parentesco: referenciaPersonal.parentesco,
          tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
          tipo: tipo == "Distribuidor" ? tipo : "Cliente",
          estatus: referenciaPersonal.estatus
        });

        var idTemp = RP._id;
        delete RP._id;
        ReferenciasPersonales.update({ _id: idTemp }, { $set: RP });

      }
      else if (referenciaPersonal.estatus == "A") {
        //Buscar referenciasPersonales_ids y actualizarlo						
        _.each(user.profile.referenciasPersonales_ids, function (referenciaPersonal_ids) {
          if (referenciaPersonal_ids.num == referenciaPersonal.num) {

            referenciaPersonal_ids.parentesco = referenciaPersonal.parentesco;
            referenciaPersonal_ids.tiempoConocerlo = referenciaPersonal.tiempoConocerlo;
            referenciaPersonal_ids.estatus = "G";

            var RP = ReferenciasPersonales.findOne(referenciaPersonal_ids.referenciaPersonal_id);

            RP.telefono = referenciaPersonal.telefono;
            RP.direccion = referenciaPersonal.direccion;
            RP.celular = referenciaPersonal.celular;
            RP.ciudad = referenciaPersonal.ciudad;
            RP.estado = referenciaPersonal.estado;

            _.each(RP.clientes, function (cliente) {
              if (cliente.cliente_id == user._id) {
                cliente.parentesco = referenciaPersonal.parentesco;
                cliente.tiempoConocerlo = referenciaPersonal.tiempoConocerlo;
              }
            });
            var idTemp = RP._id;
            delete RP._id;
            ReferenciasPersonales.update({ _id: idTemp }, { $set: RP });
          }
        });
      }

    });

    if (tipo == "Distribuidor") {
      var idTemp = user._id;
      delete user._id;
      ProspectosDistribuidor.update({ _id: idTemp }, { $set: user });
      return true;
    }
    else {

      var idTemp = user._id;
      delete user._id;
      ProspectosCreditoPersonal.update({ _id: idTemp }, { $set: user });
      return true;
    }

  },

  programarVerificacionProspecto: function (objeto) {

    if (objeto.profile.tipo == "Distribuidor") {
      ProspectosDistribuidor.update({ _id: objeto._id }, {
        $set: {
          "profile.fechaVerificacion": objeto.profile.fechaVerificacion,
          "profile.turno": objeto.profile.turno,
          "profile.hora": objeto.profile.hora,
          "profile.estatus": 2
        }
      });
      return true;
    }
    else {

      ProspectosCreditoPersonal.update({ _id: objeto._id }, {
        $set: {
          "profile.fechaVerificacion": objeto.profile.fechaVerificacion,
          "profile.turno": objeto.profile.turno,
          "profile.hora": objeto.profile.hora,
          "profile.estatus": 2
        }
      });
      return true;
    }

  },

});	