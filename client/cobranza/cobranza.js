angular.module("creditoMio")
.controller("CobranzaCtrl", CobranzaCtrl);
 function CobranzaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	  
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,0,0,0);
  
  var FI, FF;
  
  rc.cobranza = {};
  	
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
			var ini, fin;
		
	    var simple = new Date(y, 0, 1 + (w - 1) * 7);
	    FI = new Date(simple);
	    FF = new Date(moment(simple).add(7,"days"));
	    
	    FF.setHours(23,59,59,0);
	    
	}
	
	this.calcularMes = function(m, y) 
	{
	    var startDate = moment([y, m]);
			var endDate = moment(startDate).endOf('month');
	    FI = startDate.toDate();
	    FF = endDate.toDate();
	    FF.setHours(23,59,59,0);
	}
	
	this.AsignaFecha = function(op)
	{	
			
			
			if (op == 0) //Vencimiento Hoy
			{

				  this.fechaInicial.setHours(0,0,0,0);
				  this.fechaFinal = new Date(this.fechaInicial.getTime());
				  this.fechaFinal.setHours(23,59,59,0);
				  FI = this.fechaInicial;
				  FF = this.fechaFinal;
				  
				  console.log("FI:", FI);
					console.log("FF:", FF);
			}	
			else if (op == 1) //Día
			{
					FI = new Date();
				  FI.setHours(0,0,0,0);
				  FF = new Date();
				  FF.setHours(23,59,59,0);
				  console.log("FI:",FI);
					console.log("FF:",FF);
			}	
			else if (op == 2) //Semana
			{					
					
					FI = new Date();
				  FI.setHours(0,0,0,0);
				  FF = new Date(FI.getTime());
				  FF.setHours(23,59,59,0);
					
					var semana = moment().isoWeek();
					var anio = FI.getFullYear();
					this.calcularSemana(semana, anio);
					console.log("FI:", FI);
					console.log("FF:", FF);
				
			}
			else if (op == 3) //Mes
			{
				
					FI = new Date();
					FI.setHours(0,0,0,0);
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					console.log(mes);
					this.calcularMes(mes,anio);
					console.log("FI:", FI);
					console.log("FF:", FF);
				
			}
			else if (op == 4) //Siguiente Mes
			{
					FI = new Date();
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					if (mes == 11) 
					{
							mes = 0;
							anio = anio + 1; 
					}
					else
							mes = mes + 1;	
					
					this.calcularMes(mes,anio);
					console.log("FI:", FI);
					console.log("FF:", FF);
			}
			
			Meteor.call('getCobranza', FI, FF, op, function(error, result) {
						console.log(result);						
						if (result)
						{
								rc.cobranza = result;
								$scope.$apply();
						}
				
			});	
	}
};