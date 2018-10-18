angular
  .module("creditoMio")
  .controller("PagoSistemaCtrl", PagoSistemaCtrl);

function PagoSistemaCtrl($scope, $filter, $meteor, $reactive, $state, $stateParams, toastr) {

  let rc = $reactive(this).attach($scope);
  this.action = false;
  this.fechaActual = new Date();

  window.rc = rc;
  this.credito_id = "";
  
  this.credito = {};
  this.pago = {};
  this.pago.pagar = 0;
  this.pago.totalPago = 0;
  this.pago.totalito = 0
  this.creditos = [];
  this.creditos_id = []
  this.total = 0;
  rc.credit = $stateParams
  this.creditoAp = true;
  this.masInfo = true;
  this.masInfo = true;
  this.masInfoCredito = true;
  rc.openModal = false
  rc.foliosCreditos = [];
	
	this.valorOrdenar = "Folio";
	
	
	rc.creditoRefinanciar = {};
	rc.creditosAutorizados = [];
	rc.pagoR = {};
	rc.subtotal = 0;
	rc.cargosMoratorios = 0;
	rc.total = 0;
	
	rc.selectedRow = null;  // initialize our variable to null
  //console.log(rc.credito)

  this.subscribe('planPagos', () => {
    return [{
      cliente_id: $stateParams.objeto_id,
      credito_id: { $in: rc.getCollectionReactively("creditos_id") }
    }];
  });

  this.subscribe('tiposIngreso', () => {
    return [{estatus: true}]
  });
  
  this.subscribe('cuentas', () => {
    return [{}]
  });
  
  this.subscribe('cajas', () => {
    return [{usuario_id : Meteor.userId()
    }]
  });

  this.helpers({
    tiposIngreso: () => {
	    
	    var ti = TiposIngreso.find().fetch();
	    
	    if (ti != undefined)
	    {
		  		var fondos = Cuentas.find({}).fetch();
					//console.log("Fonfo:",fondos);  	
					if (fondos != undefined)
					{
							_.each(ti, function(tipo){
									
									var fondo = Cuentas.findOne({tipoIngreso_id: tipo._id});
									if (fondo != undefined)
											tipo.tipoCuenta = fondo.tipoCuenta;
							});	
					}
					return ti;
	    }
    },	
    caja: () => {
	  	var c = Cajas.findOne({usuario_id: Meteor.userId()});   
      if (c != undefined)
      {
	      	return c;	      	
      }
    },
  });
  
  this.guardarPago = function(pago) {
		
		
		if (rc.caja.estadoCaja == "Cerrada")
		{
				toastr.error("La caja esta cerrada, favor de reportar con el Gerente");
				return;	
		}
		
		
	  if (this.pago.tipoIngreso_id == undefined)
	  {
		  	toastr.warning("Seleccione una forma de pago");
		  	return;
	  }
	  
	  if (pago.pagar == undefined || pago.pagar <= 0)
	  {
		  	toastr.warning("Ingrese la cantidad a cobrar correctamente");
		  	return;
	  }
	  
	  if (pago.pagar < pago.totalPago)
	  {
		  	toastr.warning("No alcanza a pagar con el total ingresado");
		  	return;
	  }
	  
	  if (pago.totalPago == 0)
	  {
		  	toastr.warning("No hay nada que cobrar");
		  	return;
	  }
	  console.log(pago);
	  
	  //Validar que sea completo el crédito a pagar    
	  var tipoIngreso = TiposIngreso.findOne(pago.tipoIngreso_id);
	  
	  
	  loading(true);
		Meteor.call("pagoOtroSistema", [], 
																	 pago.pagar, 
																	 pago.totalPago, 
																	 pago.tipoIngreso_id, 
																	 pago.descripcion,  
																	 0,  
																	 0, 
																	 0, 
																	 pago.fechaDeposito,function(error, success) {
      if (!success) {
	      
        toastr.error('Error al guardar.', success);
        loading(false);
        return;
      }
      
      loading(false);
      toastr.success('Guardado correctamente.');
      rc.tipoIngresoSeleccionado = {};
      rc.pago = {};
      rc.pago.totalPago = 0;
	  })

  };

  $(document).ready(function() {
		//Quita el mouse wheels 
		document.getElementById('totalPago').onwheel = function(){ return false; }
		document.getElementById('cobro').onwheel = function(){ return false; }

	});
	
	this.seleccionTipoIngreso = function(tipoIngreso) 
	{

			var ti = TiposIngreso.findOne(tipoIngreso);
			rc.tipoIngresoSeleccionado = Cuentas.findOne({tipoIngreso_id: tipoIngreso});

			if (ti.nombre == "Nota de Credito")
			{
					var p = document.getElementById('cobro');
					p.disabled = true;
					
					var nc = NotasCredito.findOne({cliente_id: $stateParams.objeto_id, saldo : {$gt: 0}, estatus : 1});
					if (nc != undefined)
					{
							this.pago.pagar = Number(parseFloat(nc.saldo).toFixed(2));		
					}					
					else
							this.pago.pagar = 0;
			}
			else
			{
					var p = document.getElementById('cobro');
					p.disabled = false;
					this.pago.pagar = 0;
			}		
			
	}

};