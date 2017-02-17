angular.module("creditoMio")
.controller("CobranzaCtrl", CobranzaCtrl);
 function CobranzaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	  
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,0,0,0);
  
  this.cobranza = {};
  
  /*
  this.subscribe('planPagos', () => {
			return [{fechaLimite: {$gte: rc.getReactively("fechaInicial"),$lt: rc.getReactively("fechaFinal")}, estatus: 0}]
			
  });
  
  this.helpers({
		cobranza : () => {
			return PlanPagos.find();
		},
	});
	
	*/
	
	this.getCobranza = function()
	{
			Meteor.call('getCobranza', rc.getReactively("fechaInicial"), rc.getReactively("fechaFinal"), function(error, result) {
						
						if (result)
						{
								this.cobranza = result;
							
						}
				
			});	
		
	}
	
	this.calcularSemana = function(w, y) 
	{
	    var simple = new Date(y, 0, 1 + (w - 1) * 7);
	    rc.fechaInicial = new Date(simple);
	    rc.fechaFinal = new Date(moment(simple).add(7,"days"));
	}
	
	this.calcularMes = function(m, y) 
	{
	    var startDate = moment([y, m]);
			var endDate = moment(startDate).endOf('month');
	    rc.fechaInicial = startDate.toDate();
	    rc.fechaFinal = endDate.toDate();
	}
	
	this.AsignaFecha = function(op)
	{	
			
			if (op == 0 || op == 1)
			{
					this.fechaInicial = new Date();
				  this.fechaInicial.setHours(0,0,0,0);
				  this.fechaFinal = new Date();
				  this.fechaFinal.setHours(23,0,0,0);
				  console.log("FI:",rc.fechaInicial);
					console.log("FF:",rc.fechaFinal);
			}	
			else if (op == 2)
			{					
					var semana = moment().isoWeek();
					var anio = rc.fechaInicial.getFullYear();
					this.calcularSemana(semana, anio);
					console.log("FI:",rc.fechaInicial);
					console.log("FF:",rc.fechaFinal);
				
			}
			else if (op == 3)
			{
					rc.fechaInicial = new Date();
					var anio = rc.fechaInicial.getFullYear();
					var mes = rc.fechaInicial.getMonth();
					console.log(mes);
					this.calcularMes(mes,anio);
					console.log("FI:",rc.fechaInicial);
					console.log("FF:",rc.fechaFinal);
				
			}
			else if (op == 4)
			{
					rc.fechaInicial = new Date();
					var anio = rc.fechaInicial.getFullYear();
					var mes = rc.fechaInicial.getMonth();
					if (mes == 11) 
					{
							mes = 0;
							anio = anio + 1; 
					}	
					this.calcularMes(mes+1,anio);
					console.log("FI:",rc.fechaInicial);
					console.log("FF:",rc.fechaFinal);
			}
			
			Meteor.call('getCobranza', rc.fechaInicial, rc.fechaFinal, function(error, result) {
						console.log(result);						
						if (result)
						{
								rc.cobranza = result;
								$scope.$apply();
						}
				
			});	
	}
};