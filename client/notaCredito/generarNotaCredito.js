angular
	.module('creditoMio')
	.controller('GenerarNotaCredito', GenerarNotaCredito);
 
function GenerarNotaCredito($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	this.fechaActual = new Date();
	
	window.rc = rc;
	
	this.subscribe("ocupaciones",()=>{
		return [{_id : this.getReactively("ocupacion_id"), estatus : true }]
	});
	
	this.subscribe('cliente', () => {
		return [{
			_id : $stateParams.objeto_id
		}];
	});
	
	
			
	this.helpers({
		
		objeto : () => {
			var cli = Meteor.users.findOne({_id : $stateParams.objeto_id});
			if(cli){
				this.ocupacion_id = cli.profile.ocupacion_id;
				return cli;
			}		
		},
		ocupaciones : () => {
			if(this.getReactively("creditos")){
				this.creditos_id = _.pluck(rc.creditos, "_id");
			}
			return Ocupaciones.find();
		},
		
	});
	
	

	
}