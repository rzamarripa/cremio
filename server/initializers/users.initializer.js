Meteor.startup(function () {
  if (Meteor.users.find().count() === 0) {
    Accounts.createUser({
      username: 'admin',
      password: '123qwe',
    }); 
  }
  var tipoNotaCredito = TiposIngreso.find({nombre:"Nota de Crédito"}).fetch();
  if (tipoNotaCredito.length < 1){
      TiposIngreso.insert({
        nombre : "Nota de Crédito",
        estatus : true
      })
  }
  /*	var multas = function () {
      console.log('multas!');
      Meteor.call("actualizarMultas");
      Meteor.call("deprecarNotasDeCredito");
    }

    var cron = new Meteor.Cron( {
      events:{
        "0 1 * * *"  : multas
      }
    });
  */
});