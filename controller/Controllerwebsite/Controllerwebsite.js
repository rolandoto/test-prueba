const {response, json, query} = require('express');
const { pool } = require('../../database/connection');

const InsertEventsWebsite =async(req,res=response) =>{

    const {Name,DescriptionEvent1,DescriptionEvent2,Start_date,End_date,Place,id_hotel,actividades1,actividades2,Finally} = req.body

    try {

        let data = {
            Name: Name,
            DescriptionEvent1: DescriptionEvent1,
            DescriptionEvent2:DescriptionEvent2,
            Start_date:Start_date,
            End_date:End_date,
            Place:Place,
            id_hotel:id_hotel,
            Finally:Finally
        };

    await pool.query('INSERT INTO Events set ?', data, (err, customer) => {
        if(err){
            console.log(err)
            return res.status(401).json({
                    ok:false,
                    msg:"error al insertar datos"
            })
            }else{
                const insertSecondQuery = async() => {
                    const queryResult = await pool.query("SELECT MAX(ID) as max FROM Events");
                    const result = queryResult[0].max;

                    for(let i =0;i<actividades1.length;i++){
                       let dataOne ={
                        Tipo:actividades1[i].tipo,
                        Description:actividades1[i].descripcion,
                        type:actividades1[i].type,
                        Event_id:result
                       }
                       await pool.query('INSERT INTO activities set ?',dataOne)
                    }
                   
                    for(let i =0;i<actividades2.length;i++){
                        let dataOne ={
                         Tipo:actividades2[i].tipo,
                         Description:actividades2[i].descripcion,
                         type:actividades2[i].type,
                         Event_id:result
                        }
                        await pool.query('INSERT INTO activities set ?',dataOne)
                     }
                    
                    return res.status(201).json({
                        ok:true
                    })
                    }  
                
                    insertSecondQuery()
                }
            })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}


const getEvents =async(req,res=response) => {

    const {id}  = req.params

    
    try {
        
    const userQuery = await pool.query("SELECT * FROM `Events` WHERE id_hotel = ?",[id]);
        
    return res.status(201).json({
        ok:true,
        userQuery
    })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}


const getEventsDatail =async(req,res=response) => {

    const {id}  = req.params
    
    try {
   
        const eventDetails = await pool.query("SELECT * FROM `Events` WHERE id = ?", [id]);

        // Obtener las actividades relacionadas con el evento
        const activities = await pool.query("SELECT * FROM `activities` WHERE Event_id = ?", [id])
        // Agrupar actividades por tipo
        const groupedActivities = activities.reduce((acc, activity) => {
          if (!acc[activity.type]) {
            acc[activity.type] = [];
          }
          acc[activity.type].push(activity);
          return acc;
        }, {});
    
        // Agregar las actividades agrupadas al evento
        const userQuery = {
          ...eventDetails[0],
          activities: groupedActivities
        };
    

    return res.status(201).json({
        ok:true,
        userQuery
    })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}



const getRoomHotel =async(req,res=response) => {

    const {id}  = req.params
    
    try {
   
    const userQuery = await pool.query(
            "SELECT rooms.id as idTipoHabitacion,rooms.description, rooms.name as nombre,rooms.price as precio,rooms.price_people as precio_persona,rooms.people as persona,rooms.max_people as max_persona, Habitaciones.ID as id, Habitaciones.ID_Tipo_habitaciones, Habitaciones.ID_Tipo_estados, Habitaciones.Numero as title, ID_estado_habitacion, MAX(RoomOcasionales.Time_ingreso) as Time_ingreso, MAX(RoomOcasionales.Time_salida) as Time_salida, RoomOcasionales.Fecha,rooms_image.url FROM Habitaciones LEFT JOIN RoomOcasionales ON RoomOcasionales.ID_habitacion = Habitaciones.ID AND RoomOcasionales.Fecha = CURDATE() INNER JOIN rooms_image on  rooms_image.id_rooms = Habitaciones.ID_Tipo_habitaciones INNER  JOIN  rooms on  rooms.id  = Habitaciones.ID_Tipo_habitaciones  WHERE Habitaciones.ID_Hotel=? GROUP BY Habitaciones.id;",
            [id])
    


    return res.status(201).json({
        ok:true,
        userQuery
    })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }
}


module.exports={
    InsertEventsWebsite,
    getEvents,
    getEventsDatail,
    getRoomHotel
}