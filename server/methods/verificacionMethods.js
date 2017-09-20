Meteor.methods({
		
	getVerificacionesCredito: function (credito_id) {	
	  var verificaciones = Verificaciones.find({credito_id : credito_id}).fetch();
		return verificaciones;
	},
	
	getVerificacionesDistribuidor: function (id) {	
	  var verificaciones = Verificaciones.find({cliente_id : id}).fetch();
		return verificaciones;
	},
	
});