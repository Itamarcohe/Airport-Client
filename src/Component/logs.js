import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

function Log() {

  const logsRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [flightColors, setFlightColors] = useState({}); 

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl("https://localhost:7188/airport")
      .configureLogging(LogLevel.Information)
      .build();

    conn.on("UpdateLogs", (log) => {
      console.log("Received log:", log);

      setLogs((prevLogs) => [...prevLogs, log]);

      if (!flightColors[log.flight.id]) {
        const newColor = getRandomColor(); 
        setFlightColors((prevColors) => ({
          ...prevColors,
          [log.flight.id]: newColor
        }));
      }

    });

    
    conn.start()
      .then(() => console.log("SignalR connected"))
      .catch(err => console.error("SignalR connection error:", err));

    return () => {
      conn.stop();
    };


  }, [flightColors]); 

      // watch for when new logs are added
      useEffect(() => {
        // bring the last log into view        
        logsRef.current?.lastElementChild?.scrollIntoView()
    }, [logs]);



  const getRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  };

  const getColorForFlight = (flightId) => {
    return flightColors[flightId] || '#000'; 
  };

  const truncateTimestamp = timestamp => timestamp.slice(0, -12);

  return (
<div id="logContainer" ref={logsRef}>
    {logs.map((log, index) => (
        <div key={index} style={{ backgroundColor: getColorForFlight(log.flight.id), border: '1px solid black', marginBottom: '10px', padding: '5px' }}>
            {
            log.out ? (
                <div>
                    Out time: {truncateTimestamp(log.out)} <br />
                     Flight Code: {log.flight.code} From Leg: {log.leg.number}
                      <br />
                </div>
            ) : (
                <div>
                    Flight Code: {log.flight.code} <br />
                    Leg Number: {log.leg.number} <br />
                    In time: {truncateTimestamp(log.in)} <br />
                    Crossing time: {log.leg.crossingTime * 3 / 1000} Seconds <br />
                </div>
            )
            }
        </div>
    ))}
</div>
  );
}

export default Log;
