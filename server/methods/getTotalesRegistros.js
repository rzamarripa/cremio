Meteor.methods({

  getTotalesRegistrosNotasCredito: function (tam) {

    var resultado = {};

    resultado.conSaldo = Math.trunc(NotasCredito.find({ estatus: 1 }).count() / tam);
    resultado.caducados = Math.trunc(NotasCredito.find({ estatus: 2 }).count() / tam);
    resultado.aplicados = Math.trunc(NotasCredito.find({ estatus: 3 }).count() / tam);

    return resultado;
  },


  getTotalesRegistrosCreditosPromotoras: function (tam, promotora_id) {

    var resultado = {};
    //resultado.Pagos = Math.trunc(Pagos.find({ usuario_id: promotora_id }).count() / tam);
    resultado.Pagos = Math.trunc(Pagos.find({ usuario_id: promotora_id }).count() / tam);

    return resultado;
  },

})