const {response, json, query} = require('express');
const { pool } = require('../../database/connection');
const cloudinary = require('cloudinary').v2;

const InsertEventsWebsite =async(req,res=response) =>{

    const { Name, Description, Start_date, End_date, Place, id_hotel,type,ID,image} = req.body;


    
    try {  
        if(type =="insert"){
            const image = req.file; // el archivo de imagen subido
    
            if (!image) {
                return res.status(400).json({ ok: false, msg: 'La imagen es obligatoria' });
            }

        let imageUrl=null
        if (image) {    
            try {
                // subimos la imagen a cloudinary usando la ruta temporal del archivo
                const uploadResult = await cloudinary.uploader.upload(image.path, {
                    folder: 'events',
                    use_filename: true,
                    unique_filename: false,
                    overwrite: true,
                });
    
                imageUrl = uploadResult.secure_url; // url de la imagen subida
                console.log('imagen subida exitosamente:', imageUrl);
    
            } catch (error) {
                console.error('error al subir la imagen:', error);
                return res.status(500).json({
                    ok: false,
                    msg: 'error al subir la imagen',
                });
            }
        }

        
        try {
            // creamos el objeto de datos para insertar en la base de datos
            const data = {
                Name,
                Description,
                Start_date,
                End_date,
                Place,
                id_hotel,
                img_events: imageUrl, // url de la imagen subida a cloudinary
            };

            // insertamos los datos en la base de datos
            await pool.query('INSERT INTO Events set ?', data, (err, result) => {
                if (err) {
                    console.error('error al insertar datos:', err);
                    return res.status(401).json({
                        ok: false,
                        msg: 'error al insertar datos',
                    });
                } else {
                    return res.status(201).json({
                        ok: true,
                        msg: 'evento creado correctamente',
                    });
                }
            });

            } catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'error al crear el evento',
                });
            }
     
    }else if(type=="update"){
        const foundValid =  req.file
        let imageUrl=null
        if (foundValid) {    
            try {
                // subimos la imagen a cloudinary usando la ruta temporal del archivo
                const uploadResult = await cloudinary.uploader.upload(foundValid.path, {
                    folder: 'events',
                    use_filename: true,
                    unique_filename: false,
                    overwrite: true,
                });

                imageUrl = uploadResult.secure_url; // url de la imagen subida
                console.log('imagen subida exitosamente:', imageUrl);

            } catch (error) {
                console.error('error al subir la imagen:', error);
                return res.status(500).json({
                    ok: false,
                    msg: 'error al subir la imagen',
                });
            }
        }else{
            imageUrl = image
        }

        try {
            // creamos el objeto de datos para insertar en la base de datos
            const data = {
                Name,
                Description,
                Start_date,
                End_date,
                Place,
                img_events: imageUrl, // url de la imagen subida a cloudinary
            };

            // insertamos los datos en la base de datos
            await pool.query('UPDATE Events SET ? WHERE ID = ?', [data, ID], (err, result) => {
                if (err) {
                    console.error('Error al actualizar el evento:', err);
                    return res.status(401).json({
                        ok: false,
                        msg: 'Error al actualizar el evento',
                    });
                } else {
                    return res.status(200).json({
                        ok: true,
                        msg: 'Evento actualizado correctamente',
                    });
                }
            });

            } catch (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'error al crear el evento',
                });
            }

        }

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }

}


const getEvents =async(req,res=response) => {

    const {id}  = req.params

    
    try {
        
    const userQuery = await pool.query("SELECT * FROM `Events` WHERE id_hotel = ? ORDER BY `ID` DESC;",[id]);
        
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
   
        const eventDetails = await pool.query("SELECT *  FROM `Events`  WHERE id = ? ", [id]);

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