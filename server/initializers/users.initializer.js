Meteor.startup(function () {
  if (Meteor.users.find().count() === 0) {
    Accounts.createUser({
      username: 'admin',
      password: '123qwe',
    }); 
    
  }
  var tipoNotaCredito = TiposIngreso.find({nombre:"Nota de Credito"}).fetch();
  if (tipoNotaCredito.length < 1){
      TiposIngreso.insert({
        nombre : "Nota de Credito",
        estatus : true
      })
  }
  if (Configuraciones.find().count() === 0) {
    Configuraciones.insert({seguro: 20});
  }
      
  var multas = function () {
	  	
	  	var objeto = {};
	  	
	  	objeto.inicio = new Date();

			Meteor.call("actualizarMultas");
      Meteor.call("actualizarMultasVales");
      Meteor.call("generarMultasVales");
      Meteor.call("generarMultas");
      
      Meteor.call("deprecarNotasDeCredito");
      objeto.fin = new Date();
      BitacoraCron.insert(objeto);
  }
	
  var cron = new Meteor.Cron( {
    events:{
      "0 1 * * *"  : multas
    }
    //el primer valor es a que minuto se ejecuta
  });

});