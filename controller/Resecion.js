const {response} = require('express')
const { pool } = require('../database/connection')
const fetch  = require('node-fetch')
const moment = require('moment/moment');


const  GetRooms =async(req, res=response) =>{

    const {id} = req.params   
    try {

        const  query = await  pool.query("SELECT ID as id, ID_Tipo_habitaciones, ID_Tipo_estados, Numero as title FROM Habitaciones WHERE ID_Hotel = ?", [id])
 
            /* id: 116,
            ID_Tipo_habitaciones: 1,
            ID_Tipo_estados: 1,
            title: '71'
        */
        if(query.length ==0){
            return res.status(401).json({
                ok:false
            })
        }

        
        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {

        res.status(401).json({
            ok:false,
            msg:"comuniquese con el administrador"
        })
    }
}

const validateAvaible =async(req,res=response) => {

    const  {desde,hasta,habitaciones,disponibilidad,id_estados_habitaciones,ID_Canal,Adultos,Ninos,ID_Talla_mascota,Infantes,Noches,Observacion,huespe,valor,ID_Tipo_Forma_pago,abono,valor_habitacion,Tipo_persona,valor_dia_habitacion} = req.body
    console.log(huespe)
    const date1 = new Date(desde)
    const date2 = new  Date(hasta)

    try {

        if(date1 >date2){
            return  res.status(201).json({
                msg:"no puede ser mayor de la fecha",
                ok:false,
            })
        }
        //reservas
        let desdeSinHora = desde.split(' ', 1);
        let hastaSinHora = hasta.split(' ', 1);

        //const reservation = await pool.query("SELECT Reservas.ID_Habitaciones,  Reservas.ID, Reservas.Codigo_reserva FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones =? AND Reservas.Fecha_inicio BETWEEN ? AND ? OR Reservas.Fecha_final BETWEEN ? AND ?",[habitaciones, desde, hasta, desde, hasta])
        const reservation = await pool.query("SELECT * FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.Date > ? AND  Lista_Fechas_Reservada.Date <= ? GROUP BY Lista_Fechas_Reservada.ID_Habitaciones",[habitaciones, desdeSinHora, hastaSinHora])
        
        //disponibilidad
        const avaible =  await pool.query("SELECT ID  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",[habitaciones]) 

        let result1 = avaible.map(index => {
            return index.ID
        })

        

            /*const ray = []

            for(let i =0;i<avaible.length;i++){
                for(let e =0;e<avaible.length;e++){
                    if( avaible[i]?.ID  != reservation[i]?.ID_Habitaciones){
                        ray.push(avaible[i].ID)
                    }else{
                    
                    }
                }
            }

            var unique = ray.filter((x, i) => ray.indexOf(x) === i);
            console.log(unique);

            let id_disponible = Math.min(...ray);
            */

            var n1 = 2000;
            var n2 = 1000;
            var numero = Math.floor(Math.random()*(n1 -(n2 -1))) + n2
            
            let id_disponible = disponibilidad

            if (reservation.length == 0 ) {
                id_disponible = id_disponible
            }

            const data ={
                    ID_Usuarios:1,
                    ID_Habitaciones: parseInt(id_disponible.toString()),
                    ID_Talla_mascota:ID_Talla_mascota,
                    Codigo_reserva:numero,
                    Adultos:Adultos,
                    Ninos:Ninos,
                    Infantes:Infantes,
                    Fecha_inicio: desde,  
                    Fecha_final: hasta,
                    Noches:Noches,
                    Descuento:0,
                    ID_Canal:ID_Canal,
                    ID_Tipo_Estados_Habitaciones:id_estados_habitaciones,
                    Observacion:Observacion,
                 
                }

            const  to = await pool.query('INSERT INTO Reservas set ?', data)

            var prueba=  desde.split(" ",1).toString()
            var pruebaone=  hasta.split(" ",1).toString()
            
            var fechaInicio = new Date(prueba)
            var fechaFin = new Date(pruebaone) 

            const dateOne  = {
                ID_Habitaciones: parseInt(id_disponible.toString()),
                Date:prueba,
                Proceso: 0
            }   

            await pool.query('INSERT INTO Lista_Fechas_Reservada set ?', dateOne)

            fechaInicio.setDate(fechaInicio.getDate() + 1)
                        
            while(fechaFin.getTime() > fechaInicio.getTime()){
                let fecha;
                
                fechaInicio.setDate(fechaInicio.getDate() + 1);
                
                    fecha  = {
                        ID_Habitaciones: parseInt(id_disponible.toString()),
                        Date:fechaInicio.getFullYear() + '/' + (fechaInicio.getMonth() + 1) + '/' + fechaInicio.getDate(),
                        Proceso: 1
                    }
              
                await pool.query('INSERT INTO Lista_Fechas_Reservada set ?', fecha)

            }

            const dateTwo  = {
                ID_Habitaciones: parseInt(id_disponible.toString()),
                Date:pruebaone,
                Proceso: 0
            }

            await pool.query('INSERT INTO Lista_Fechas_Reservada set ?', dateTwo)
        

            const newReservation = {
                ID_Tipo_estados:2
            }

            await  pool.query("UPDATE Habitaciones set ? WHERE ID = ?",[newReservation,data.ID_Habitaciones])

            const query1 = await  pool.query("SELECT MAX(ID) as max FROM Reservas")

            const result = query1.map(index=>{
                return index.max
            })  

           for(let i =0;i<huespe?.length;i++){
             
            if(i==0){
                const date ={
                    ID_Reserva:parseInt(result.toString()),
                    ID_Tipo_documento:huespe[i]?.Tipo_documento,   
                    Num_documento:huespe[i]?.Num_documento,   
                    Nombre:huespe[i]?.Nombre,
                    Apellido:huespe[i]?.Apellido,
                    Fecha_nacimiento:huespe[i]?.Fecha_nacimiento,
                    Celular:huespe[i]?.Celular,
                    Correo:huespe[i]?.Correo,
                    Ciudad:huespe[i]?.Ciudad,
                    ID_Prefijo:huespe[i]?.Nacionalidad,
                    Tipo_persona
                }
                
                const toone = pool.query('INSERT INTO  web_checking set ?',date ,(q_err, q_res) =>{
                    if (q_err) return res.status(401).json({
                        ok:false
                    })
                }) 
            }

            const huep ={
                ID_Reserva:parseInt(result.toString()),
                ID_Tipo_documento:huespe[i]?.Tipo_documento,   
                ID_Tipo_genero:1,
                Num_documento:huespe[i]?.Num_documento,   
                Nombre:huespe[i]?.Nombre,
                Apellido:huespe[i]?.Apellido,
                Fecha_nacimiento:huespe[i]?.Fecha_nacimiento,
                Celular:huespe[i]?.Celular,
                Correo:huespe[i]?.Correo,
                Ciudad:huespe[i]?.Ciudad,
                ID_Prefijo:huespe[i]?.Nacionalidad,
            }

            const totwo = pool.query('INSERT INTO  Huespedes  set ?',huep ,(q_err, q_res) =>{
                if (q_err) return res.status(401).json({
                    ok:false,
                    msg:"error de web huespedes"
                })
            }) 
           }

            //https://codesandbox.io/s/add-remove-dynamic-input-fields-ho226?file=/src/App.js:1830-2096
           
            const pay ={
                ID_Reserva:parseInt(result.toString()),
                ID_Motivo:1,
                ID_Tipo_Forma_pago,
                Valor:valor,
                Abono:abono,
                Valor_habitacion:valor_habitacion,
                valor_dia_habitacion:valor_dia_habitacion
            }
            
            const tothre = pool.query('INSERT INTO  Pagos  set ?',pay) 
            
            return res.status(201).json({
                msg:"aceptado",
                ok:true
            })

            

    } catch (error) {
        console.log(error);
        res.status(401).json({
            ok:false,
            msg:"comuniquese con el administrador "
        })
    } 
}

const insertReservaRecepcion =async(req,res=response) => {
    
    try {

        return res.status(201).json({
            ok:true
        })
    
    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}

const getTypePet =async(req,res=response) =>{

    try {

        const query = await pool.query("SELECT ID, Talla as nombre FROM Talla_mascota")

        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
        res.status(201).json({
            ok:false
        })
    }
}

const getReserva =async(req,res=response) =>{

    const {id}= req.params
   
    try {

        const response =  await pool.query("SELECT  Reservas.ID_Tipo_Estados_Habitaciones ,Habitaciones.Numero, Reservas.ID, Reservas.ID_Habitaciones, Reservas.Codigo_reserva, Reservas.Fecha_inicio, Reservas.Fecha_final, Habitaciones.ID_Tipo_estados FROM Reservas INNER JOIN Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones WHERE Habitaciones.ID_Hotel = ?",[id])

        const query = []

       for(let i = 0;i<response.length; i++){
        const web_checking =  await pool.query("SELECT ID, ID_Reserva, ID_Tipo_documento, Num_documento, Nombre, Apellido, Fecha_nacimiento, Celular, Correo, Ciudad, Foto_documento_adelante, Foto_documento_atras,Pasaporte,Firma FROM web_checking WHERE ID_Reserva =?",[response[i].ID])


        web_checking.forEach(element => {
           query.push({
                Title: `${response[i].Numero} ${element.Nombre} ${element.Apellido}` ,
                ID:response[i].ID,
                ID_Habitaciones:response[i].ID_Habitaciones,
                Codigo_reserva:response[i].Codigo_reserva,
                Fecha_inicio:response[i].Fecha_inicio,
                Fecha_final:response[i].Fecha_final,
                ID_Tipo_estados:response[i].ID_Tipo_Estados_Habitaciones,
                Nombre:element.Nombre,
                Document:element.Num_documento,
                Last_name:element.Apellido
            })
        })
    }

        return  res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
        res.status(201).json({
            ok:false
        })
    }
}

const PruebaGet =(req,res=response) =>{

    try {
        const prueba  = query.pool ("SELECT ID, Codigo_reserva FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = 2 AND Habitaciones.ID_Tipo_estados == 1 AND Reservas.Fecha_inicio >= 2022-10-9 AND Reservas.Fecha_final <= 2022-10-16")
        
        return res.status(201).json({
            ok:true
        })

    } catch (error) {
        res.status(201).json({
            ok:false
        })
    }
}

const GetCanales =async(req,res=response) =>{

    try {

        const query = await  pool.query("SELECT * FROM Canales")
        
        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
        
        res.status(201).json({
            ok:false
        })
    }
}

/*const avaibleRecection =async(req,res=response) =>{

    
    
    const  {desde,hasta,habitaciones} = req.body

    const date1 = new Date(desde)
    const date2 = new  Date(hasta)

    var prueba=  desde.split(" ",1).toString()
    var pruebaone=  hasta.split(" ",1).toString()
    
    var fechaInicio = new Date(prueba)
    var fechaFin = new Date(pruebaone)
    
    const fecha_final = []
                
    while(fechaFin.getTime() >= fechaInicio.getTime()){
        fechaInicio.setDate(fechaInicio.getDate() + 1);
           fecha_final.push(fechaInicio.getFullYear() + '/' + (fechaInicio.getMonth() + 1) + '/' + fechaInicio.getDate())

    }

    

    try {

        if(date1 >date2){
            return  res.status(201).json({
                msg:"no puede ser mayor de la fecha",
                ok:false,
            })
        }
        //reservas
        let desdeSinHora = desde.split(' ', 1);
        let hastaSinHora = hasta.split(' ', 1);


       const reservation = await pool.query("SELECT ID_Habitaciones FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.Date >= ?  AND  Lista_Fechas_Reservada.Date <= ? AND Proceso = 1  GROUP BY Lista_Fechas_Reservada.ID_Habitaciones",[habitaciones, desdeSinHora, hastaSinHora])
       const reservatioone = await pool.query("SELECT ID_Habitaciones FROM Reservas WHERE Reservas.Fecha_inicio >= ? AND Reservas.Fecha_final <= ?",[desde, hasta])
       
       //const totalValue = fecha_final?.length==2 ? reservatioone :reservation

        //disponibilidad
        const avaible =  await pool.query("SELECT ID  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",[habitaciones]) 

        const avaibleList =[]
        
        let listHabitacionesOcupadas = new Array();
        if ( reservation.length > 0 || reservatioone.length > 0 ) {
             
            reservation.forEach( dato => {
                listHabitacionesOcupadas.push(dato);
            });

            reservatioone.forEach(dato => {
                if ( listHabitacionesOcupadas.indexOf(dato) == -1) {
                    listHabitacionesOcupadas.push(dato);
                }
            });
            
        } 

        if(avaible.length > reservation.length ){

            const ray = []

            for(let i =0;i<avaible.length;i++){
                for(let e =0;e<avaible.length;e++){
                    if( avaible[i]?.ID  != listHabitacionesOcupadas[i]?.ID_Habitaciones){
                        ray.push(avaible[i].ID)
                    }else{
                    
                    }
                }
            }

            ray.filter((x, i) =>{
                if(ray.indexOf(x) === i){
                    avaibleList.push(x)
                }
            });
            
        }

 
        const queryDefinid = []
        
        for(let i = 0;i<avaibleList.length;i++){
          const totalHabiatacion =  await pool.query("SELECT * FROM `Habitaciones` WHERE ID = ?",[avaibleList[i]])

          totalHabiatacion.forEach(element =>{
                queryDefinid.push({
                    ID:element.ID,
                    ID_Hotel:element.ID_Hotel,
                    ID_Tipo_habitaciones:element.ID_Tipo_habitaciones,
                    ID_Tipo_estados:element.ID_Tipo_estados,
                    Numero:element.Numero
                })
          })

        }
    


        if(avaibleList.length ==0){
          return  res.status(401).json({
                ok:false,
                msg:"no se encontro nada"
            })
        }

         res.status(201).json({
                ok:true,
                queryDefinid
            })
        
    } catch (error) {
        console.log(error)

        res.status(401).json({
            ok:false
        })
    }
}
*/

const roomAvaible =async(req,res=response) => {

    const  {desde,hasta,habitaciones,ID_Habitaciones} = req.body
    const date1 = new Date(desde)
    const date2 = new  Date(hasta)

    var fechaInicio = new Date(desde)
    var fechaFin = new Date(hasta)

    let desdeSinHora = desde.split(' ', 1);
    let hastaSinHora = hasta.split(' ', 1);

    try {   

        if(date1 >date2){
            return  res.status(401).json({
                msg:"no puede ser mayor de la fecha",
                ok:false,
            })
        }
        
        var fecha1 = moment(desde);
        var fecha2 = moment(hasta);
        
        const totalDays =(fecha2.diff(fecha1, 'days'))

        let habi = new Array();
        const acum =[]
        fechaInicio.setDate(fechaInicio.getDate())

        x = 0;
        while(fechaFin.getTime() >= fechaInicio.getTime()+1){
            let fecha;
        
          const fechaone =  fechaInicio.setDate(fechaInicio.getDate() + 1);
                    //disponibilidad
               
                fecha  = {
                    Date:fechaInicio.getFullYear() + '/' + (fechaInicio.getMonth() + 1) + '/' + fechaInicio.getDate()
                }
                
                const fechaOne ={
                    Date:fechaInicio.getFullYear() + '-' + (fechaInicio.getMonth() + 1) + '-' + fechaInicio.getDate()+" 15:00:00"
                }

                const fechaTwo ={
                    Date:fechaInicio.getFullYear() + '-' + (fechaInicio.getMonth() + 1) + '-' + fechaInicio.getDate()+" 13:00:00"
                }
          
                const querys  = await pool.query("SELECT Date, ID_Habitaciones FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.ID_Habitaciones= ? AND Lista_Fechas_Reservada.Date = ? AND Proceso = 1 AND Proceso = 1",[habitaciones,ID_Habitaciones,fecha.Date])
                
                const reservatioone = await pool.query("SELECT ID_Habitaciones FROM Reservas WHERE Reservas.Fecha_inicio = ? AND Reservas.ID_Habitaciones = ?  ",[fechaOne.Date,ID_Habitaciones])

                const reservatiotwo = await pool.query("SELECT ID_Habitaciones FROM Reservas WHERE Reservas.Fecha_final = ? AND Reservas.ID_Habitaciones = ?",[fechaTwo.Date,ID_Habitaciones])

                console.log(fechaTwo)

                if(reservatioone.length ==1){
                    acum.push(1)
                }else if(reservatiotwo.length ==1){
                    acum.push(2)
                }
                
                
                if(querys.length ==1){
                    return res.status(401).json({
                        ok:false,
                        msg:"ya esta en uso de la reserva"
                    })
                }   
            }

        if(acum.length>= 2){
            return res.status(401).json({
                ok:false,
                msg:"sdkhajdkj"
            })
        }else{

            if(reservatioone.length ==1){
                return res.status(201).json({
                    ok:true
                })
            }
    
        }

        res.status(201).json({
            ok:true
        })

    } catch (e) {
       return  res.status(201).json({
            ok:false,
        })
    }
}

const updateDetailReserva =async(req, res=response) =>{
    const  {desde,hasta,habitaciones,ID_Habitaciones,id} = req.body

    const date1 = new Date(desde)
    const date2 = new  Date(hasta)

    try {   

        if(date1 >date2){
            return  res.status(401).json({
                msg:"no puede ser mayor de la fecha",
                ok:false,
            })
        }
        
        var fecha1 = moment(desde);
        var fecha2 = moment(hasta);
        
        const totalDays =(fecha2.diff(fecha1, 'days'))

        let habi = new Array();
        const acum =[]

        x = 0;

        var fechaInicio = new Date(desde);
        var fechaFin    = new Date(hasta);

        fechaInicio.setDate(fechaInicio.getDate());
        while(fechaFin.getTime() >= fechaInicio.getTime()){
            fechaInicio.setDate(fechaInicio.getDate() + 1);
        
            fecha  = {
                Date:fechaInicio.getFullYear() + '/' + (fechaInicio.getMonth() + 1) + '/' + fechaInicio.getDate()
            }
            
            const fechaOne ={
                Date:fechaInicio.getFullYear() + '-' + (fechaInicio.getMonth() + 1) + '-' + fechaInicio.getDate()+" 15:00:00"
            }

            const fechaTwo ={
                Date:fechaInicio.getFullYear() + '-' + (fechaInicio.getMonth() + 1) + '-' + fechaInicio.getDate()+" 13:00:00"
            }

            const querys  = await pool.query("SELECT Date, ID_Habitaciones FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.ID_Habitaciones= ? AND Lista_Fechas_Reservada.Date = ? AND Proceso = 1 AND Proceso = 1",[habitaciones,ID_Habitaciones,fecha.Date])
                
            const reservatioone = await pool.query("SELECT ID_Habitaciones FROM Reservas WHERE Reservas.Fecha_inicio = ? AND Reservas.ID_Habitaciones = ?  ",[fechaOne.Date,ID_Habitaciones])

            const reservatiotwo = await pool.query("SELECT ID_Habitaciones FROM Reservas WHERE Reservas.Fecha_final = ? AND Reservas.ID_Habitaciones = ?",[fechaTwo.Date,ID_Habitaciones])

            if(reservatioone.length ==1){
                acum.push(1)
            }else if(reservatiotwo.length ==1){
                acum.push(2)
            }
            
            if(querys.length ==1){
                return res.status(401).json({
                    ok:false,
                    msg:"ya esta en uso de la reserva"
                })
            }   
        }


        if(acum.length >=2){
            return res.status(401).json({
                ok:false
            })
        }
        

        var pruebaone=  hasta.split(" ",1).toString()
        var prueba=  desde.split(" ",1).toString()

        const dateOne  = {
            ID_Habitaciones: parseInt(ID_Habitaciones),
            Date:prueba,
            Proceso: 0  
        }

      
        fechaInicio.setDate(fechaInicio.getDate() + 1)
                        
            while(fechaFin.getTime() > fechaInicio.getTime()){
                let fecha;
                
                fechaInicio.setDate(fechaInicio.getDate() + 1);


                    fecha  = {
                        ID_Habitaciones: parseInt(ID_Habitaciones),
                        Date:fechaInicio.getFullYear() + '/' + (fechaInicio.getMonth() + 1) + '/' + fechaInicio.getDate(),
                        Proceso: 1
                    }
        
            }
        
    
        const dateTwo  = {
            ID_Habitaciones: parseInt(ID_Habitaciones),
            Date:pruebaone,
            Proceso: 0
        }

        const newCustomer ={
            Fecha_final:hasta
        }
    
        await pool.query('INSERT INTO Lista_Fechas_Reservada set ?', dateTwo)
    
        await pool.query("UPDATE Reservas set ? WHERE id = ?", [newCustomer, id]);

       res.status(201).json({
        ok:true
       })
        
    } catch (e) {
        console.log("fallo")
        return  res.status(401).json({
             ok:false,
         })
     }
}

const getDetailReservation =async(req, res=response) =>{

    const {id} = req.params
    
    try {   

        const query = await pool.query("SELECT Reservas.Observacion,Canales.Nombre as Canales_Nombre, web_checking.Tipo_persona as tipo_persona, web_checking.ID as id_persona, web_checking.Firma, Reservas.ID_Habitaciones, Habitaciones.ID_Tipo_habitaciones, Habitaciones.Numero, Talla_mascota.Talla, Reservas.Codigo_reserva, Reservas.Adultos, Reservas.Ninos, Reservas.Infantes, Reservas.Fecha_inicio, Reservas.Fecha_final, Reservas.Noches, Reservas.Descuento, Reservas.Placa, web_checking.ID_Tipo_documento, web_checking.Num_documento, web_checking.Nombre, web_checking.Apellido, web_checking.Fecha_nacimiento, web_checking.Celular, web_checking.Correo, web_checking.Ciudad, Tipo_Forma_pago.Nombre as forma_pago, Pagos.Valor as valor_pago, Pagos.Valor_habitacion as valor_habitacion , Pagos.Abono as valor_abono,Pagos.valor_dia_habitacion, Prefijo_number.nombre as nacionalidad  FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Talla_mascota ON Reservas.ID_Talla_mascota = Talla_mascota.ID INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.ID INNER JOIN Canales ON Canales.id= Reservas.ID_Canal INNER JOIN Pagos on Reservas.ID = Pagos.ID_Reserva INNER  join Tipo_Forma_pago on Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID INNER  JOIN  Prefijo_number on web_checking.ID_Prefijo = Prefijo_number.ID  WHERE Reservas.ID = ? ORDER  by web_checking.ID DESC",[id])
        
        if(query.length ==0){
            return  res.status(201).json({
                ok:false,
                msg:"no se encontro ninguna informacion"
            })
        }

        return res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg:"comunicase con el administrador"
        })
    }
}

const postCleanlineRooms =(req, res=response) =>{
}

const getCountry = async(req, res=response) =>{

    const query = await pool.query("SELECT * FROM  Prefijo_number")

    res.status(201).json({
        ok:true,
        query
    })
}


const updateDetailReservation =async(req, res=response) =>{

    const { id } = req.params;

    const data = req.body;
    try {

        await pool.query("UPDATE web_checking set ? WHERE ID = ?", [data, id]);
       res.status(201).json({
            ok:true
       })
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }
}

const updateDetailPagos =async(req, res=response) =>{

    const { id } = req.params;

    const data   = req.body

    try {

        await pool.query("UPDATE Pagos set ? WHERE ID_Reserva = ?", [data, id]);

       res.status(201).json({
            ok:true
       })
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }

}

const getdetailhuespedes =async(req, res=response) =>{

    const { id } = req.params;

    try {
        const link = await pool.query("SELECT Huespedes.ID_Tipo_documento, Huespedes.Correo, Huespedes.Celular, Huespedes.ID as huespedes, Prefijo_number.nombre, Huespedes.Nombre,Huespedes.Apellido,Huespedes.Ciudad,Huespedes.Fecha_nacimiento, Prefijo_number.nombre,Huespedes.ID_Reserva,Huespedes.ID_Tipo_documento,Huespedes.Num_documento, Pagos.Valor_habitacion,Pagos.Abono,Reservas.ID_Habitaciones,Habitaciones.ID_Tipo_habitaciones, Tipo_Forma_pago.Nombre AS nombre_pago from Huespedes INNER JOIN Prefijo_number ON Huespedes.ID_Prefijo = Prefijo_number.ID INNER JOIN Pagos on Huespedes.ID_Reserva = Pagos.ID_Reserva INNER JOIN Reservas ON Huespedes.ID_Reserva = Reservas.ID INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Tipo_Forma_pago ON Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID WHERE Huespedes.ID = ? ORDER by Huespedes.ID DESC", [id]);

       res.status(201).json({
            ok:true,
            link
       })
        
    } catch (error) {
        res.status(401).json({
            ok:false,
            msg:"comuniquese"
        })
    }

}


const postdetailUpdate =async(req, res=response) =>{

    const { id } = req.params;
    const data = req.body

    try {
        await pool.query("UPDATE Huespedes set ? WHERE ID = ?", [data, id]);
        res.status(201).json({
            ok:true
       })
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }
}


const getRoomdetalle =async(req, res=response) =>{

    const { id } = req.params;

    try {
        const avaible =  await pool.query("SELECT ID,Numero  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",[id]) 
       
        res.status(201).json({
            ok:true,
            query:avaible
       })
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }
}

const uploadImage =async(req, res=response) => {

    var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
response = {};
 

    try {
          
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }
}

const insertCartReservation =async(req, res=response) => {

    const {Cart,ID_Reserva,ID_Hoteles} = req.body

    try {
        
        for(let i=0;i<Cart.length;i++){
            let data ={
                ID_Reserva:ID_Reserva,
                Nombre:Cart[i]?.Nombre,
                Precio:Cart[i]?.Precio,
                Cantidad:Cart[i]?.quantity,
                ID_Categoria:Cart[i]?.id_categoria,
                ID_Hoteles
            }

            const id = Cart[i].ID

            let dataone ={
                Cantidad:  Cart[i]?.Cantidad -Cart[i]?.quantity ,
            }
            await pool.query('INSERT INTO  Carrito_reserva  set ?',data) 

            await pool.query('UPDATE Productos set ? WHERE ID = ?',[dataone, id]) 
            
        }
        return res.status(201).json({
            ok:true
        })
        
    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }

}


const getCartReservaction =async(req, res=response) =>{

    const {id}  = req.params

    try {

        const query  =await pool.query("SELECT Carrito_reserva.Nombre as Nombre_producto,Carrito_reserva.ID_Categoria,Carrito_reserva.Cantidad,Carrito_reserva.Precio FROM Carrito_reserva INNER JOIN Tipo_categoria on Carrito_reserva.ID_Categoria = Tipo_categoria.ID WHERE ID_Reserva = ?",id)

        if(query.length ==0){
            return res.status(201).json({
                ok:false
            })
        }

        res.status(201).json({
            ok:true,
            query
        })
        
    } catch (error) {
        return  res.status(401).json({
            ok:false
        })
    }

}


const getDetailChecking =async(req, res=response) =>{

    const {id}  = req.params

    try {

        const query  =await pool.query("SELECT Huespedes.Correo, Huespedes.Celular, Huespedes.ID as huespedes, Prefijo_number.nombre, Huespedes.Nombre,Huespedes.Apellido,Huespedes.Ciudad,Huespedes.Fecha_nacimiento, Prefijo_number.nombre,Huespedes.ID_Reserva,Huespedes.ID_Tipo_documento,Huespedes.Num_documento    from Huespedes INNER JOIN Prefijo_number ON Huespedes.ID_Prefijo = Prefijo_number.ID WHERE ID_Reserva = ? ORDER by Huespedes.ID DESC",[id])

        if(query.length ==0){
            return res.status(201).json({
                ok:false
            })
        }

        res.status(201).json({
            ok:true,
            query
        })
        
    } catch (error) {
        return  res.status(401).json({
            ok:false
        })
    }
}

const handAddHuespe =async(req, res=response) =>{

    const {id} = req.params
    const {huespe,data,dataPay} = req.body


     try {
        
     
        
            const huep ={
                ID_Reserva:id,
                ID_Tipo_documento:huespe.Tipo_documento,   
                ID_Tipo_genero:1,
                Num_documento:huespe.Num_documento,   
                Nombre:huespe.Nombre,
                Apellido:huespe.Apellido,
                Fecha_nacimiento:huespe.Fecha_nacimiento,
                Celular:huespe.Celular,
                Correo:huespe.Correo,
                Ciudad:huespe.Ciudad,
                ID_Prefijo:huespe.Nacionalidad,
            }
    
            const totwo = pool.query('INSERT INTO  Huespedes  set ?',huep)
               
        

        let isEmpty = Object.entries(data).length === 0;
        
        if(!isEmpty){
            await pool.query('UPDATE Reservas set ? WHERE Reservas.ID  = ?',[data, id]) 
        }

        await pool.query("UPDATE Pagos set ? WHERE Pagos.ID_Reserva  = ?", [dataPay, id])

        res.status(201).json({
            ok:true
        })
        
    } catch (error) {
            res.status(401).json({
                ok:false
            })
    }
}

const HuespeCount =async(req, res=response) =>{

    const  {id} = req.params

    try {
        
        const query = await pool.query("SELECT Habitaciones.ID_Tipo_habitaciones,Habitaciones.Numero, Habitaciones.id FROM `Reservas` INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID where Habitaciones.ID_Hotel = ? group by Habitaciones.ID",[id])

        const  queyeOne= await pool.query("SELECT Habitaciones.ID_Tipo_habitaciones,Habitaciones.Numero, Habitaciones.id , Pagos.Valor_habitacion FROM `Reservas` INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID INNER join Pagos on  Pagos.ID_Reserva = Reservas.ID  where Habitaciones.ID_Hotel = ?",[id])

        if(query.length ==0){
            return res.status(401).json({
                ok:false
            })
        }
        
    return res.status(201).json({
        ok:true,
        query   ,
        queyeOne
    })

    } catch (error) {
        
        return res.status(401).json({
            ok:false
        })
    }

}


const handResolution =async(req,res=response) =>{

    try {
        const query = await pool.query("SELECT * FROM Resolucion_pms")

      
        res.status(201).json({
            ok:true,
            query
        })

    } catch (error) {
            res.status(401).json({
                ok:false
            })
    }

}


const handUpdateResoluction =async(req,res=response)=>{

        const {id} = req.params
        const data= req.body
     
    try {   

        const query = await pool.query("UPDATE Resolucion_pms set ? WHERE Resolucion_pms.ID",[data, id])

      
        res.status(201).json({
            ok:true,
            query
        })
        
    } catch (error) {
        res.status(401).json({
            ok:false
        })
    }
}


const handUpdateStatus =async(req,res=response) =>{
    
    const {id} = req.params
    const data= req.body
    
    console.log(data)

        try {

            const query = await pool.query("UPDATE Reservas set ? WHERE Reservas.ID = ?",[data, id])

            return res.status(201).json({
                ok:true
            })

        } catch (error) {
            res.status(401).json({
                ok:false
            })
        }

}




module.exports ={GetRooms,
                validateAvaible,
                insertReservaRecepcion,
                getTypePet
                ,getReserva,
                PruebaGet,
                GetCanales,
                roomAvaible,
                getDetailReservation,
                postCleanlineRooms,        
                getCountry,
                updateDetailReservation,
                updateDetailPagos,
                getdetailhuespedes,
                postdetailUpdate,
                updateDetailReserva,
                getRoomdetalle,
                uploadImage,
                insertCartReservation,
                getCartReservaction,
                getDetailChecking,
                handAddHuespe,
                HuespeCount,
                handResolution,
                handUpdateResoluction,
                handUpdateResoluction,
                handUpdateStatus
            }