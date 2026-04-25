// Custom orange marker icon for the map
import L from "leaflet";

const orangeMarker = new L.Icon({
  iconUrl: require("../assets/orange-marker.png"), // path will be fixed in MapPage
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
  className: "custom-orange-marker"
});

export default orangeMarker;
