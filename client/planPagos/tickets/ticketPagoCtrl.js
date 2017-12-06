angular
.module("creditoMio")
.controller("TicketPagoCtrl", TicketPagoCtrl);
function TicketPagoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	rc.pago = {};
	rc.caja = {};	
	rc.cliente = {};
	rc.credito = {};
	rc.sucursal = {};
	rc.cajero = {};
	rc.tipoIngreso = {};
	
	window.rc = rc;
	
	this.subscribe('tiposIngreso',()=>{
		return [{}]
	});
		
	this.subscribe('pagos',()=>{
		return [{
			_id : $stateParams.pago_id
		}]
	},
	{
		onReady: function () {
			rc.pago = Pagos.findOne($stateParams.pago_id);
			rc.tipoIngreso = TiposIngreso.findOne(rc.pago.tipoIngreso_id);
			rc.pago = rc.pago? rc.pago:{};
			
			
			rc.pago.planPagos = rc.pago.planPagos.sort(function(a, b) {
																																	return a["folioCredito"] - b["folioCredito"] || a["numeroPago"] - b["numeroPago"];
																																});
			
			Meteor.call('datosCliente', rc.pago.usuario_id ,function(err, res){
				rc.cliente = res;
			});
			
			//console.log(rc.pago.totalPago);
			
			function Unidades(num){

		        switch(num)
		        {
		            case 1: return 'UN';
		            case 2: return 'DOS';
		            case 3: return 'TRES';
		            case 4: return 'CUATRO';
		            case 5: return 'CINCO';
		            case 6: return 'SEIS';
		            case 7: return 'SIETE';
		            case 8: return 'OCHO';
		            case 9: return 'NUEVE';
		        }
		
		        return '';
		    
    }//Unidades()
			function Decenas(num){
			
			        let decena = Math.floor(num/10);
			        let unidad = num - (decena * 10);
			
			        switch(decena)
			        {
			            case 1:
			                switch(unidad)
			                {
			                    case 0: return 'DIEZ';
			                    case 1: return 'ONCE';
			                    case 2: return 'DOCE';
			                    case 3: return 'TRECE';
			                    case 4: return 'CATORCE';
			                    case 5: return 'QUINCE';
			                    default: return 'DIECI' + Unidades(unidad);
			                }
			            case 2:
			                switch(unidad)
			                {
			                    case 0: return 'VEINTE';
			                    default: return 'VEINTI' + Unidades(unidad);
			                }
			            case 3: return DecenasY('TREINTA', unidad);
			            case 4: return DecenasY('CUARENTA', unidad);
			            case 5: return DecenasY('CINCUENTA', unidad);
			            case 6: return DecenasY('SESENTA', unidad);
			            case 7: return DecenasY('SETENTA', unidad);
			            case 8: return DecenasY('OCHENTA', unidad);
			            case 9: return DecenasY('NOVENTA', unidad);
			            case 0: return Unidades(unidad);
			        }
			    }//Unidades()
		  function DecenasY(strSin, numUnidades) {
		      if (numUnidades > 0)
		          return strSin + ' Y ' + Unidades(numUnidades)
		
		      return strSin;
		  }//DecenasY()
		  function Centenas(num) {
			        let centenas = Math.floor(num / 100);
			        let decenas = num - (centenas * 100);
			
			        switch(centenas)
			        {
			            case 1:
			                if (decenas > 0)
			                    return 'CIENTO ' + Decenas(decenas);
			                return 'CIEN';
			            case 2: return 'DOSCIENTOS ' + Decenas(decenas);
			            case 3: return 'TRESCIENTOS ' + Decenas(decenas);
			            case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
			            case 5: return 'QUINIENTOS ' + Decenas(decenas);
			            case 6: return 'SEISCIENTOS ' + Decenas(decenas);
			            case 7: return 'SETECIENTOS ' + Decenas(decenas);
			            case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
			            case 9: return 'NOVECIENTOS ' + Decenas(decenas);
			        }
			
			        return Decenas(decenas);
			    }//Centenas()
		  function Seccion(num, divisor, strSingular, strPlural) {
		      let cientos = Math.floor(num / divisor)
		      let resto = num - (cientos * divisor)
		
		      let letras = '';
		
		      if (cientos > 0)
		          if (cientos > 1)
		              letras = Centenas(cientos) + ' ' + strPlural;
		          else
		              letras = strSingular;
		
		      if (resto > 0)
		          letras += '';
		
		      return letras;
		  }//Seccion()
		  function Miles(num) {
		      let divisor = 1000;
		      let cientos = Math.floor(num / divisor)
		      let resto = num - (cientos * divisor)
		
		      let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
		      let strCentenas = Centenas(resto);
		
		      if(strMiles == '')
		          return strCentenas;
		
		      return strMiles + ' ' + strCentenas;
		  }//Miles()
		  function Millones(num) {
		      let divisor = 1000000;
		      let cientos = Math.floor(num / divisor)
		      let resto = num - (cientos * divisor)
		
		      let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
		      let strMiles = Miles(resto);
		
		      if(strMillones == '')
		          return strMiles;
		
		      return strMillones + ' ' + strMiles;
		  }//Millones()
			function NumeroALetras(num, currency) {
		      currency = currency || {};
		      let data = {
		          numero: num,
		          enteros: Math.floor(num),
		          centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
		          letrasCentavos: '',
		          letrasMonedaPlural: currency.plural || '',//'PESOS', 'Dólares', 'Bolívares', 'etcs'
		          letrasMonedaSingular: currency.singular || '', //'PESO', 'Dólar', 'Bolivar', 'etc'
		          letrasMonedaCentavoPlural: currency.centPlural || '',
		          letrasMonedaCentavoSingular: currency.centSingular || ''
		
		      };
		
		      if (data.centavos > 0) {
		          data.letrasCentavos = 'CON ' + (function () {
		                  if (data.centavos == 1)
		                      return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
		                  else
		                      return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
		              })();
		      };
		
		      if(data.enteros == 0)
		          return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
		      if (data.enteros == 1)
		          return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
		      else
		          return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
		  };	
			
			
			var valores = (rc.pago.totalPago).toString().split('.');
			console.log(valores);
			console.log(valores[0]);
			console.log(valores[1]);
			
			rc.pago.centavos = valores[1];
			
			rc.pago.letra = NumeroALetras(valores[0]);
			
			console.log(rc.pago.letra);
			
			Meteor.call('getCredito', rc.pago.credito_id ,function(err, res){
				rc.credito = res;
			});
				
			rc.subscribe('cajas',()=>{
				return[{
					_id : rc.pago.caja_id? rc.pago.caja_id:""
				}]
			},
			{
				onReady: function () {
					rc.caja = Cajas.findOne(rc.pago.caja_id);
					rc.caja = rc.caja? rc.caja:{};
				}
			});
			rc.subscribe('cajeroId',()=>{
				return[{
					id: rc.pago.usuarioCobro_id? rc.pago.usuarioCobro_id:""
				}]
			},
			{
				onReady:()=>{
					rc.cajero = Meteor.users.findOne(rc.pago.usuarioCobro_id);
					rc.cajero = rc.cajero? rc.cajero:{};
				}
			});
			rc.subscribe('sucursales',()=>{
				return[{
					_id: rc.pago.sucursalPago_id? rc.pago.sucursalPago_id:""
				}]
			},
			{
				onReady:()=>{
					rc.sucursal = Sucursales.findOne(rc.pago.sucursalPago_id);
					rc.sucursal = rc.sucursal? rc.sucursal:{};
				}
			});
		}
	});

	this.borrarBotonImprimir= function()
	{
		var printButton = document.getElementById("printpagebutton");
	 	printButton.style.visibility = 'hidden';
	 	window.print()
	 	printButton.style.visibility = 'visible';
	};
	
	

	
	
};