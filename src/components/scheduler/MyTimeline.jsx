import React, {useEffect, useState} from "react";
import {CustomMarker, TimelineMarkers} from "react-calendar-timeline";

export function MyTimeline() {
    const [now, setNow] = useState(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() - 0));

    useEffect(() => {
        const id = setInterval(() => setNow(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() - 0)), 10000);
        return () => clearInterval(id);
    }, []);

    return (
        <TimelineMarkers>
            <CustomMarker date={now}>
                {({styles}) => (
                    <>
                        {/* фон слева от линии*/}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: styles.left,
                                backgroundColor: "rgba(0,0,0,0.08)",
                                pointerEvents: "none",
                                zIndex: 91
                            }}
                        />
                        {/* линия */}
                        <div
                            style={{
                                ...styles,
                                width: "2px",
                                backgroundColor: "red",
                                zIndex: 92
                            }}
                        />
                    </>
                )}
            </CustomMarker>
        </TimelineMarkers>
    );
}
