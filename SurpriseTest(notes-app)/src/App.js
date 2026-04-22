import React, {useState} from "react";

function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  return (
    <div>
      <h1>Notes App</h1>
      <input
        type="text"
        value={note}
        onChange={(e)=> setNote(e.target.value)}
        placeholder="Enter note"
      />   
      <button onClick={()=>{
        if (note.trim() === "") return;
        if (editIndex !== null) {
          const updatedNotes = [...notes];
          updatedNotes[editIndex] = note;
          setNotes(updatedNotes);
          setEditIndex(null);
        }else {
          setNotes([...notes, note]);
        }
        setNote("");
      }}>
        {editIndex !== null ? "Update" : "Add"}
      </button>
      <ul> 
        {notes.map((n, index) => (
         <li key={index}>
          {n}
          <button onClick={()=> {
            const filtered = note.filter((_, i) => i !== index);
            setNotes(filtered);
          }}>
            Delete
          </button>
          <button onClick={()=> {
            setNote(n);
            setEditIndex(index);
          }}>
            Edit
          </button>
         </li>
        ))}
      </ul>
    </div>
  );
}
export default App;
