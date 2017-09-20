Meteor.methods({
		
	getVerificacionesCredito: function (credito_id) {	
	  var verificaciones = Verificaciones.find({credito_id : credito_id}).fetch();
		return verificaciones;
	},
	
	getVerificacionesDistribuidor: function (id) {	
	  var verificaciones = Verificaciones.find({cliente_id : id}).fetch();
		return verificaciones;
	},
	
	finalizarVerificacionDistribuidor: function (id, objeto) {	
	 	Meteor.users.update({_id: id}, {$set: {"profile.estaVerificado"	: true, 
																					 "profile.verificacionEstatus" 	: objeto.evaluacion, 
																					 "profile.indicacion"						: objeto.indicacion}});	
	},
	
	autorizaoRechazaDistribuidor: function (id, valor, motivo) {	
	 	Meteor.users.update({_id: id}, {$set: {"profile.estatusCredito"	: valor,
		 																			 "profile.motivo"					: motivo}});	
	},
	
});