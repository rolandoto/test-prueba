const {response, json, query} = require('express');
const { pool } = require('../database/connection');

const SearchHotels =async(req, res = response) =>{

    async function fetchRoomData(id) {
        const response = await fetch(
          `https://grupo-hoteles.com/api/getTypeRoomsByIDHotel?id_hotel=${id}`,
          {
            method: "post",
            headers: { "Content-type": "application/json" },
          }
        );
        return await response.json();
      }
      
      async function getRoomsAndOccurrences(id, data) {
        const roomMap = new Map();
        let parent = 1;
      
        const rayRoom = await Promise.all(
          data.map(async (room) => {
            const query = await pool.query(
              "SELECT Habitaciones.ID as id, Habitaciones.ID_Tipo_habitaciones, Habitaciones.ID_Tipo_estados, Habitaciones.Numero as title, ID_estado_habitacion, MAX(RoomOcasionales.Time_ingreso) as Time_ingreso, MAX(RoomOcasionales.Time_salida) as Time_salida, RoomOcasionales.Fecha,rooms_image.url FROM Habitaciones LEFT JOIN RoomOcasionales ON RoomOcasionales.ID_habitacion = Habitaciones.ID AND RoomOcasionales.Fecha = CURDATE() INNER JOIN rooms_image on  rooms_image.id_rooms = Habitaciones.ID_Tipo_habitaciones  WHERE ID_Tipo_habitaciones = ? GROUP BY Habitaciones.id",
              [room.id_tipoHabitacion, id]
            );
      
            let isFirstInGroup = true;
      
            return query.map((element) => {
              const idTipoHabitacion = element.ID_Tipo_habitaciones;
      
              const roomObject = {
                title: `${element.title} ${room.nombre}`,
                id: element.id,
                ID_Tipo_estados: element.ID_Tipo_estados,
                ID_Tipo_habitaciones: idTipoHabitacion,
                ID_estado_habiatcion: element.ID_estado_habitacion,
                parent: roomMap.get(idTipoHabitacion),
                root: isFirstInGroup,
                Time_ingreso: element.Time_ingreso,
                Time_salida: element.Time_salida,
                Fecha: element.Fecha,
                Price:room.precio,
                prici_people:room.precio_persona,
                person:room.persona,
                max_people:room.max_persona,
                room_image:element.url
                
              };
      
              if (isFirstInGroup) {
                isFirstInGroup = false;
                parent++;
              }
              return roomObject;
            });
          })
        );
      
        return rayRoom.flat().sort((a, b) => a.ID_Tipo_habitaciones - b.ID_Tipo_habitaciones);
      }
      
      async function getAvailableRooms(pool, flattenedRooms, desde, hasta) {
        const test = await Promise.all(
          flattenedRooms.map(async (room) => {
            const resultado = await pool.query(
              "SELECT COUNT(*) AS Num_Reservas, Reservas.id, Habitaciones.ID_estado_habitacion FROM Reservas INNER JOIN Habitaciones on Habitaciones.ID = Reservas.ID_Habitaciones WHERE ID_Habitaciones = ? AND  Reservas.ID_Tipo_Estados_Habitaciones !=6 and Reservas.ID_Tipo_Estados_Habitaciones !=6  AND  ((Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio >= ? AND Fecha_final <= ?))  ",
              [room.id, desde, desde, hasta, hasta, desde, hasta]
            );
            return resultado.map((element) => {
              if (element.Num_Reservas === 0 && element.ID_estado_habitacion !==2 ) {
                const roomObject = {
                    ID:room.id,
                  title: room.title,
                  Price:room.Price,
                  prici_people:room.prici_people,
                  person:room.person,
                  max_people:room.max_people,
                  room_image:room.room_image
                };
                return roomObject;
              }
              return null;
            });
          })
        );
      
        return test.flat().filter((item) => item !== null);
      }
      
      // Uso de las funciones
      const id = 23;
      
      const desde = "2023-11-15 15:00:00"
      const hasta = "2023-11-16 13:00:00"

      const roomData = await fetchRoomData(id);
      const roomsWithOccurrences = await getRoomsAndOccurrences(id, roomData);
      const availableRooms = await getAvailableRooms(pool, roomsWithOccurrences, desde, hasta);
      
      

     if(availableRooms.length ==0){
       return res.status(401).json({
            ok:false
        })
     }

      res.status(201).json({
        ok:true,
        availableRooms
      })
      
}

module.exports = {SearchHotels}