Meteor.methods({

    getBitacoraCambioDistribuidor: function (beneficiario_id) {
        return BitacoraCambioDistribuidor.find({ beneficiario_id: beneficiario_id }).fetch();
    },

    setBitacoraCambioDistribuidor: function (beneficiario_id, distribuidor) {

        try {
            var objeto = {};
            objeto.beneficiario_id = beneficiario_id;
            objeto.distribuidor_id = distribuidor._id;
            objeto.distribuidorNombre = distribuidor.profile.nombreCompleto;
            objeto.fecha = new Date();
            objeto.usuario_id = Meteor.userId();
            objeto.usuarioNombre = Meteor.user().profile.nombre;
            BitacoraCambioDistribuidor.insert(objeto);
            delete distribuidor.$$hashKey;

            Beneficiarios.update({ _id: beneficiario_id }, { $set: { distribuidor_id: distribuidor._id, distribuidor: distribuidor } });

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }

    },

});	