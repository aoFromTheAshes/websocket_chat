// src/components/RoomSelector.tsx
import { useNavigate } from "react-router-dom";

const RoomSelector = () => {
  const navigate = useNavigate();

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoom = e.target.value;
    navigate(`/chat/${selectedRoom}`);
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <label>Choose a room: </label>
      <select onChange={handleRoomChange} defaultValue="room1">
        <option value="room1">Room 1</option>
        <option value="room2">Room 2</option>
        <option value="room3">Room 3</option>
      </select>
    </div>
  );
};

export default RoomSelector;
