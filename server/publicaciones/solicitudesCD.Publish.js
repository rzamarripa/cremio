Meteor.publish("solicitudesClientes", function (params) {
  return SolicitudesClientes.find(params);
});

Meteor.publish("solicitudesDistribuidores", function (params) {
  return SolicitudesDistribuidores.find(params);
});


Meteor.publish("buscarSolicitudCreditoPersonal", function (options) {

  if (options != undefined)
    if (options.where.nombreCompleto.length > 0) {
      let selector = {
        "profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
        "profile.sucursal_id": options.where.sucursal_id,
        "profile.estatus": 3
      }

      return SolicitudesClientes.find(selector, options.options);
    }
});

Meteor.publish("buscarSolicitudDistribuidor", function (options) {
  if (options != undefined)
    if (options.where.nombreCompleto.length > 0) {
      let selector = {
        "profile.nombreCompleto": { '$regex': '.*' + options.where.nombreCompleto || '' + '.*', '$options': 'i' },
        "profile.sucursal_id": options.where.sucursal_id,
        "profile.estatus": 3
      }
      return SolicitudesDistribuidores.find(selector, options.options);
    }
});