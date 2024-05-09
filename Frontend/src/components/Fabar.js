import React, { useState } from 'react';
import Popup from 'reactjs-popup';


function Fabar() {
    

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
  }

  const closeModal = () => {
    setIsOpen(false);
  }

  return (
    <div>
      <button onClick={handleClick}>Open Popup</button>
      <Popup open={isOpen} closeOnDocumentClick onClose={closeModal}>
        <div>
          {/* Your popup content here */}
          <p>This is the popup content.</p>
          <button onClick={closeModal}>Close</button>
        </div>
      </Popup>
    </div>
    
  );
}
//   return (
    // <form onSubmit={handleSubmit}>
    //   <h2>Add New Project</h2>
    //   <label>
    //     Sales Order:
    //     <input
    //       type="text"
    //       value={salesOrder}
    //       onChange={(event) => setSalesOrder(event.target.value)}
    //     />
    //   </label>
    //   <label>
    //     Enter Project Name:
    //     <input
    //       type="text"
    //       value={projectName}
    //       onChange={(event) => setProjectName(event.target.value)}
    //     />
    //   </label>
    //   <button type="submit">Save</button>
    //   <p>Total Tasks: {totalTasks}</p>
    // </form>
//   );
}

export default Fabar;