

Meteor.methods({

  getProspectoCreditoPersonal: function (id) {
    var user = ProspectosCreditoPersonal.findOne({ "_id": id });
    return user;
  },
  getProspectoDistribuidor: function (id) {
    var user = ProspectosDistribuidor.findOne({ "_id": id });
    return user;
  },
  

})